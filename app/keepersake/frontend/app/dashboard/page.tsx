"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import toast from "react-hot-toast";
import Link from "next/link";
import { Header } from "@/components/Header";
import { KeeperHubStatus } from "@/components/KeeperHubStatus";
import {
  VAULT_ABI,
  VAULT_ADDRESS,
  TOKEN_DECIMALS,
  TOKEN_SYMBOL,
} from "@/lib/contracts";
import { formatDuration, shortAddr } from "@/lib/format";
import { loadWillNote, isZeroHash } from "@/lib/willNote";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: will, refetch } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "wills",
    args: address ? [address] : undefined,
    chainId: baseSepolia.id,
    query: { refetchInterval: 5000 },
  });

  // Heartbeat ────────────────────────────────────────────────────────────────
  const { writeContract: writeHeartbeat, data: hbTx, isPending: hbPending } =
    useWriteContract();
  const { isLoading: hbMining, isSuccess: hbSuccess } =
    useWaitForTransactionReceipt({ hash: hbTx });

  // Snapshot the on-chain lastHeartbeat at click; poll until it strictly
  // advances; toast + countdown reset on the same render.
  const snapshotHbRef = useRef<bigint | null>(null);
  const [pendingHb, setPendingHb] = useState(false);

  const willData = will as
    | readonly [string, string, bigint, `0x${string}`, bigint, bigint, boolean]
    | undefined;
  const lastHeartbeatOnChain = willData?.[5];

  const onHeartbeatClick = useCallback(() => {
    if (lastHeartbeatOnChain !== undefined) {
      snapshotHbRef.current = lastHeartbeatOnChain;
    }
    setPendingHb(true);
    writeHeartbeat({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "heartbeat",
      chainId: baseSepolia.id,
    });
  }, [lastHeartbeatOnChain, writeHeartbeat]);

  useEffect(() => {
    if (!pendingHb || !hbSuccess) return;
    refetch();
    const interval = setInterval(() => refetch(), 500);
    return () => clearInterval(interval);
  }, [hbSuccess, pendingHb, refetch]);

  useEffect(() => {
    if (
      !pendingHb ||
      lastHeartbeatOnChain === undefined ||
      snapshotHbRef.current === null
    )
      return;
    if (lastHeartbeatOnChain > snapshotHbRef.current) {
      toast.success("You're alive ❤️");
      snapshotHbRef.current = lastHeartbeatOnChain;
      setPendingHb(false);
    }
  }, [lastHeartbeatOnChain, pendingHb]);

  // Revoke ──────────────────────────────────────────────────────────────────
  const { writeContract: writeRevoke, data: revokeTx, isPending: revokePending } =
    useWriteContract();
  const { isLoading: revokeMining, isSuccess: revokeSuccess } =
    useWaitForTransactionReceipt({ hash: revokeTx });

  useEffect(() => {
    if (revokeSuccess) {
      toast.success("Revoked. Your will is gone.");
      refetch();
    }
  }, [revokeSuccess, refetch]);

  const onRevokeClick = useCallback(() => {
    if (
      !window.confirm(
        "Revoke this KeeperSake? Your heir gets nothing. Your USDC stays in your wallet. This cannot be undone."
      )
    )
      return;
    writeRevoke({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "revoke",
      chainId: baseSepolia.id,
    });
  }, [writeRevoke]);

  // Render guards ────────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-semibold mb-3">Connect your wallet</h1>
          <p className="text-zinc-400">
            We need to read your address before we can show your KeeperSake.
          </p>
        </main>
      </>
    );
  }

  const hasWill =
    willData && willData[0] !== "0x0000000000000000000000000000000000000000";

  if (!hasWill) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-semibold mb-3">
            No KeeperSake set up yet.
          </h1>
          <p className="text-zinc-400 mb-6">
            You haven&apos;t committed a will. Nothing will happen if you go
            silent.
          </p>
          <Link
            href="/setup"
            className="inline-block bg-white text-black hover:bg-zinc-200 font-medium px-5 py-2.5 rounded-lg"
          >
            Set up your KeeperSake →
          </Link>
        </main>
      </>
    );
  }

  const [heir, , amount, willNoteHash, timeout, lastHeartbeat, delivered] =
    willData!;
  const elapsed = now - Number(lastHeartbeat);
  const remaining = Number(timeout) - elapsed;
  const expired = remaining <= 0;
  const pct = Math.max(0, Math.min(100, (elapsed / Number(timeout)) * 100));
  const note = !isZeroHash(willNoteHash) ? loadWillNote(willNoteHash) : null;

  const heirShareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/heir/${address}` : "";

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
            Your KeeperSake
          </p>
          <h1 className="text-3xl font-semibold">
            {delivered ? (
              <span className="text-zinc-500">
                Delivered — your KeeperSake reached its heir
              </span>
            ) : expired ? (
              <span className="text-red-400">
                ⚠️ Expired — KeeperHub will deliver soon
              </span>
            ) : (
              <span>You&apos;re alive.</span>
            )}
          </h1>
        </div>

        {/* Countdown + heartbeat */}
        <div className="border border-zinc-900 rounded-2xl bg-zinc-950 p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-mono font-semibold tracking-tight mb-2">
              {delivered ? "—" : formatDuration(Math.max(0, remaining))}
            </div>
            <div className="text-sm text-zinc-500">
              until delivery is allowed
            </div>
          </div>

          <div className="h-2 bg-zinc-900 rounded-full overflow-hidden mb-8">
            <div
              className={`h-full transition-all duration-500 ${
                delivered
                  ? "bg-zinc-700"
                  : expired
                  ? "bg-red-500"
                  : pct > 75
                  ? "bg-yellow-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <button
            disabled={delivered || hbPending || hbMining || pendingHb}
            onClick={onHeartbeatClick}
            className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium py-4 rounded-xl text-lg"
          >
            {hbPending || hbMining || pendingHb
              ? "Beating…"
              : delivered
              ? "Cannot heartbeat"
              : "❤️ I'm alive"}
          </button>
        </div>

        <KeeperHubStatus />

        {/* Will details */}
        <dl className="border border-zinc-900 rounded-xl bg-zinc-950 divide-y divide-zinc-900 text-sm mb-6">
          <Row label="Heir">
            <span className="font-mono text-zinc-200">{shortAddr(heir)}</span>
          </Row>
          <Row label="Amount">
            <span className="font-mono text-zinc-200">
              {Number(amount) / 10 ** TOKEN_DECIMALS} {TOKEN_SYMBOL}
            </span>
          </Row>
          <Row label="Timeout">
            <span className="text-zinc-200">
              {formatDuration(Number(timeout))}
            </span>
          </Row>
          <Row label="Last heartbeat">
            <span className="text-zinc-200">{formatDuration(elapsed)} ago</span>
          </Row>
          <Row label="Will note hash">
            <span className="font-mono text-xs text-zinc-400 truncate max-w-[260px]">
              {willNoteHash}
            </span>
          </Row>
          {note && (
            <Row label="Final words">
              <pre className="whitespace-pre-wrap text-zinc-300 text-xs leading-relaxed">
                {note}
              </pre>
            </Row>
          )}
        </dl>

        {/* Share link to heir */}
        {!delivered && (
          <div className="border border-zinc-900 rounded-xl bg-zinc-950 p-5 mb-6">
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Send this to your heir
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={heirShareUrl}
                onClick={(e) => e.currentTarget.select()}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 font-mono text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(heirShareUrl);
                  toast.success("Copied");
                }}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 rounded-md whitespace-nowrap"
              >
                📋 Copy
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
              Bookmark it for them. After delivery they can read your final
              words there with cryptographic hash verification.
            </p>
          </div>
        )}

        {/* Danger zone */}
        {!delivered && (
          <details className="border border-zinc-900 rounded-xl bg-zinc-950 p-5">
            <summary className="text-xs uppercase tracking-widest text-zinc-500 cursor-pointer select-none">
              Danger zone
            </summary>
            <div className="mt-4">
              <p className="text-sm text-zinc-400 mb-3 leading-relaxed">
                Revoking deletes the will. Your heir gets nothing. Your USDC
                stays in your wallet. Use this if you committed by mistake or
                want to change the heir / amount.
              </p>
              <button
                disabled={revokePending || revokeMining}
                onClick={onRevokeClick}
                className="text-sm border border-red-900 text-red-400 hover:bg-red-950/50 disabled:opacity-40 disabled:cursor-not-allowed font-medium px-4 py-2 rounded-md"
              >
                {revokePending || revokeMining
                  ? "Revoking…"
                  : "🛑 Revoke this KeeperSake"}
              </button>
            </div>
          </details>
        )}
      </main>
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3.5">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
