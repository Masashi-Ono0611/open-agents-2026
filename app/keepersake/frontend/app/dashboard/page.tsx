"use client";

import { useEffect, useState } from "react";
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

  const { writeContract, data: hbTx, isPending } = useWriteContract();
  const { isLoading: mining } = useWaitForTransactionReceipt({
    hash: hbTx,
    query: {
      select: (r) => {
        if (r.status === "success") {
          toast.success("You're alive ❤️");
          refetch();
        }
        return r;
      },
    },
  });

  if (!isConnected) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-6 py-20">
          <h1 className="text-3xl font-semibold mb-3">Connect your wallet</h1>
        </main>
      </>
    );
  }

  const w = will as
    | readonly [string, string, bigint, `0x${string}`, bigint, bigint, boolean]
    | undefined;
  const hasWill = w && w[0] !== "0x0000000000000000000000000000000000000000";

  if (!hasWill) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-semibold mb-3">No switch set up yet.</h1>
          <p className="text-zinc-400 mb-6">
            You haven&apos;t committed a will. Nothing will happen if you go silent.
          </p>
          <Link
            href="/setup"
            className="inline-block bg-white text-black hover:bg-zinc-200 font-medium px-5 py-2.5 rounded-lg"
          >
            Set up your switch →
          </Link>
        </main>
      </>
    );
  }

  const [heir, , amount, willNoteHash, timeout, lastHeartbeat, delivered] = w!;
  const elapsed = now - Number(lastHeartbeat);
  const remaining = Number(timeout) - elapsed;
  const expired = remaining <= 0;
  const pct = Math.max(0, Math.min(100, (elapsed / Number(timeout)) * 100));
  const note = !isZeroHash(willNoteHash) ? loadWillNote(willNoteHash) : null;

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
              <span className="text-zinc-500">Delivered — your KeeperSake reached its heir</span>
            ) : expired ? (
              <span className="text-red-400">⚠️ Expired — KeeperHub will deliver soon</span>
            ) : (
              <span>You&apos;re alive.</span>
            )}
          </h1>
        </div>

        <div className="border border-zinc-900 rounded-2xl bg-zinc-950 p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-mono font-semibold tracking-tight mb-2">
              {delivered ? "—" : formatDuration(Math.max(0, remaining))}
            </div>
            <div className="text-sm text-zinc-500">until delivery is allowed</div>
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
            disabled={delivered || isPending || mining}
            onClick={() =>
              writeContract({
                address: VAULT_ADDRESS,
                abi: VAULT_ABI,
                functionName: "heartbeat",
                chainId: baseSepolia.id,
              })
            }
            className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium py-4 rounded-xl text-lg"
          >
            {isPending || mining ? "Beating…" : delivered ? "Cannot heartbeat" : "❤️ I'm alive"}
          </button>
        </div>

        <dl className="border border-zinc-900 rounded-xl bg-zinc-950 divide-y divide-zinc-900 text-sm">
          <Row label="Heir">
            <Link
              href={`/heir/${heir}`}
              className="font-mono text-zinc-200 hover:underline"
            >
              {shortAddr(heir)}
            </Link>
          </Row>
          <Row label="Amount">
            <span className="font-mono text-zinc-200">
              {Number(amount) / 10 ** TOKEN_DECIMALS} {TOKEN_SYMBOL}
            </span>
          </Row>
          <Row label="Timeout">
            <span className="text-zinc-200">{formatDuration(Number(timeout))}</span>
          </Row>
          <Row label="Last heartbeat">
            <span className="text-zinc-200">
              {formatDuration(elapsed)} ago
            </span>
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

        <p className="mt-6 text-xs text-zinc-500 text-center">
          A KeeperHub workflow polls{" "}
          <code className="text-zinc-300">silenceOf({shortAddr(address)})</code>{" "}
          on a schedule. When it exceeds your timeout, it calls{" "}
          <code className="text-zinc-300">execute()</code> on your behalf.
        </p>
      </main>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3.5">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
