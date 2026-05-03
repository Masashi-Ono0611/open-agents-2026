"use client";

import { use, useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import toast from "react-hot-toast";
import { baseSepolia } from "wagmi/chains";
import Link from "next/link";
import { Header } from "@/components/Header";
import {
  VAULT_ABI,
  VAULT_ADDRESS,
  TOKEN_DECIMALS,
  TOKEN_SYMBOL,
} from "@/lib/contracts";
import { loadWillNote, hashWillNote, isZeroHash } from "@/lib/willNote";
import { formatDuration, shortAddr } from "@/lib/format";

export default function HeirPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address: senderAddr } = use(params);
  const { address: connectedAddr } = useAccount();

  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: will, refetch } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "wills",
    args: [senderAddr as `0x${string}`],
    chainId: baseSepolia.id,
    query: { refetchInterval: 5000 },
  });

  // Permissionless execute() — anyone (the heir, a stranger) can trigger
  // delivery once the will is past timeout. This page exposes that fact as
  // a button so the heir doesn't have to know KeeperHub exists.
  const { writeContract: writeExecute, data: execTx, isPending: execPending } =
    useWriteContract();
  const { isLoading: execMining, isSuccess: execSuccess } =
    useWaitForTransactionReceipt({ hash: execTx });

  useEffect(() => {
    if (execSuccess) {
      toast.success("Delivered ✓");
      refetch();
    }
  }, [execSuccess, refetch]);

  const onTriggerDelivery = useCallback(() => {
    writeExecute({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "execute",
      args: [senderAddr as `0x${string}`],
      chainId: baseSepolia.id,
    });
  }, [senderAddr, writeExecute]);

  const w = will as
    | readonly [string, string, bigint, `0x${string}`, bigint, bigint, boolean]
    | undefined;
  const hasWill =
    w && w[0] !== "0x0000000000000000000000000000000000000000";

  if (!hasWill) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-semibold mb-3">
            No KeeperSake found.
          </h1>
          <p className="text-zinc-400">
            <code>{shortAddr(senderAddr)}</code> hasn&apos;t set one up — or
            already revoked it.
          </p>
        </main>
      </>
    );
  }

  const [heir, , amount, willNoteHash, timeout, lastHeartbeat, delivered] = w!;
  const elapsed = now - Number(lastHeartbeat);
  const remaining = Number(timeout) - elapsed;
  const expired = remaining <= 0;
  const note = !isZeroHash(willNoteHash) ? loadWillNote(willNoteHash) : null;
  const noteHashMatches =
    note !== null && hashWillNote(note) === willNoteHash;

  // Is the visiting wallet the named heir?
  const youAreTheHeir =
    connectedAddr !== undefined &&
    connectedAddr.toLowerCase() === heir.toLowerCase();

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
          A KeeperSake from{" "}
          <span className="font-mono normal-case text-zinc-300">
            {shortAddr(senderAddr)}
          </span>{" "}
          → for{" "}
          <span className="font-mono normal-case text-zinc-300">
            {shortAddr(heir)}
          </span>
        </p>

        {delivered ? (
          <>
            <h1 className="text-4xl font-semibold mb-4">
              💌 Delivered —{" "}
              <span className="font-mono">
                {Number(amount) / 10 ** TOKEN_DECIMALS} {TOKEN_SYMBOL}
              </span>
            </h1>
            <p className="text-zinc-400 mb-10 leading-relaxed">
              KeeperHub fired <code>execute()</code> on the sender&apos;s
              behalf. The USDC has already landed in the heir&apos;s wallet.
              The final words below are now public.
            </p>
          </>
        ) : expired ? (
          <>
            <h1 className="text-4xl font-semibold mb-4">
              ⏰ Awaiting delivery —{" "}
              <span className="font-mono">
                {Number(amount) / 10 ** TOKEN_DECIMALS} {TOKEN_SYMBOL}
              </span>
            </h1>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              The sender went silent past their{" "}
              {formatDuration(Number(timeout))} timeout. The KeeperHub
              workflow will call <code>execute()</code> on its next scheduled
              tick — typically within 60 seconds.
            </p>
            <div className="mb-10 border border-zinc-900 rounded-xl bg-zinc-950 p-5">
              <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
                Don&apos;t want to wait?
              </div>
              <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                <code>execute()</code> is permissionless — anyone, including
                the heir, can trigger delivery directly. Costs only the gas
                for one tx.
              </p>
              <button
                disabled={execPending || execMining}
                onClick={onTriggerDelivery}
                className="bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium px-5 py-2.5 rounded-lg"
              >
                {execPending || execMining
                  ? "Delivering…"
                  : "👉 Trigger delivery now"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-semibold mb-4">
              Pending —{" "}
              <span className="font-mono">
                {Number(amount) / 10 ** TOKEN_DECIMALS} {TOKEN_SYMBOL}
              </span>
            </h1>
            <p className="text-zinc-400 mb-10 leading-relaxed">
              {shortAddr(senderAddr)} is still alive — last heartbeat was{" "}
              {formatDuration(elapsed)} ago. Delivery becomes possible in{" "}
              <span className="font-mono text-zinc-200">
                {formatDuration(Math.max(0, remaining))}
              </span>{" "}
              of continued silence.
            </p>
          </>
        )}

        {/* Heir context banner */}
        {connectedAddr !== undefined && !youAreTheHeir && (
          <div className="mb-6 border border-yellow-900/60 rounded-xl bg-yellow-950/20 px-5 py-4 text-sm text-yellow-200/90 leading-relaxed">
            👀 You&apos;re viewing this page as{" "}
            <span className="font-mono">{shortAddr(connectedAddr)}</span>, but
            the named heir is{" "}
            <span className="font-mono">{shortAddr(heir)}</span>. You can read
            the public details, but only the heir will receive the USDC on
            delivery.
          </div>
        )}
        {youAreTheHeir && (
          <div className="mb-6 border border-emerald-900/60 rounded-xl bg-emerald-950/20 px-5 py-4 text-sm text-emerald-200/90 leading-relaxed">
            ✓ You are the named heir for this KeeperSake.
          </div>
        )}

        <div className="border border-zinc-900 rounded-2xl bg-zinc-950 p-8">
          <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
            Final words
          </div>
          {!delivered ? (
            <p className="italic text-zinc-600">
              …sealed. Become readable on delivery.
            </p>
          ) : note ? (
            <>
              <pre className="whitespace-pre-wrap text-zinc-200 text-base leading-relaxed font-serif">
                {note}
              </pre>
              <div className="mt-6 pt-4 border-t border-zinc-900 text-xs">
                {noteHashMatches ? (
                  <span className="text-emerald-400">
                    ✓ Hash verified — note has not been tampered with since
                    commit time.
                  </span>
                ) : (
                  <span className="text-red-400">
                    ✗ Hash mismatch — note may have been altered.
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="italic text-zinc-500">
              Note not available locally. (In production these would be pinned
              to IPFS so any heir, on any device, could read them.)
            </p>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← KeeperSake
          </Link>
        </div>
      </main>
    </>
  );
}
