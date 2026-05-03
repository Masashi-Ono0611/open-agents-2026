"use client";

import { useEffect, useState } from "react";
import { useWatchContractEvent } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { VAULT_ABI, VAULT_ADDRESS } from "@/lib/contracts";
import { shortAddr } from "@/lib/format";

// The KeeperHub workflow polls `isExpired()` on this cadence (seconds).
// Match docs/keeperhub-workflow.md (schedule trigger). Override with
// NEXT_PUBLIC_KEEPERHUB_POLL_PERIOD if your workflow uses a different one.
const POLL_PERIOD = Number(
  process.env.NEXT_PUBLIC_KEEPERHUB_POLL_PERIOD ?? 60
);

type DeliveryEvent = {
  user: `0x${string}`;
  txHash: `0x${string}`;
  seenAt: number;
};

export function KeeperHubStatus() {
  const workflowUrl = process.env.NEXT_PUBLIC_KEEPERHUB_WORKFLOW_URL;
  const configured = Boolean(workflowUrl);

  // Visual heartbeat for the keeper's polling cadence
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(
      () => setTick((t) => (t + 1) % POLL_PERIOD),
      1000
    );
    return () => clearInterval(i);
  }, []);
  const nextPollIn = POLL_PERIOD - tick;
  const pct = (tick / POLL_PERIOD) * 100;

  // Listen for any delivery the keeper makes on this vault, in real time.
  // This is the on-chain proof that *something* (KeeperHub or a fallback
  // caller) is actually firing execute() — it doesn't lie even if the
  // KeeperHub backend has nothing to say.
  const [lastDelivery, setLastDelivery] = useState<DeliveryEvent | null>(null);
  useWatchContractEvent({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    eventName: "KeeperSakeDelivered",
    chainId: baseSepolia.id,
    onLogs(logs) {
      const latest = logs[logs.length - 1];
      if (!latest) return;
      const args = (latest as unknown as { args: { user: `0x${string}` } }).args;
      setLastDelivery({
        user: args.user,
        txHash: (latest as { transactionHash: `0x${string}` }).transactionHash,
        seenAt: Math.floor(Date.now() / 1000),
      });
    },
  });

  return (
    <div className="border border-zinc-900 rounded-2xl bg-gradient-to-br from-emerald-950/20 to-zinc-950 p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                configured ? "bg-emerald-500 animate-ping" : "bg-yellow-500"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                configured ? "bg-emerald-500" : "bg-yellow-500"
              }`}
            />
          </span>
          <span className="font-medium text-sm">
            {configured ? "KeeperHub — watching" : "KeeperHub — not configured"}
          </span>
        </div>
        {configured && (
          <a
            href={workflowUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-emerald-400 hover:underline"
          >
            View workflow ↗
          </a>
        )}
      </div>

      <div className="text-xs text-zinc-400 mb-4 leading-relaxed">
        {configured ? (
          <>
            The workflow polls{" "}
            <code className="text-zinc-300">isExpired()</code> every{" "}
            {POLL_PERIOD}s and calls{" "}
            <code className="text-zinc-300">execute()</code> the moment a
            will expires.
          </>
        ) : (
          <>
            Set <code>NEXT_PUBLIC_KEEPERHUB_WORKFLOW_URL</code> in{" "}
            <code>.env.local</code> after generating a workflow. The contract
            is permissionless, so any wallet can still call{" "}
            <code>execute()</code> directly — KeeperHub is just the polite
            default.
          </>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Next scheduled check</span>
          <span className="font-mono text-zinc-300">in {nextPollIn}s</span>
        </div>
        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {lastDelivery && (
        <div className="mt-4 pt-3 border-t border-zinc-900 text-xs flex items-baseline gap-2">
          <span className="text-emerald-400">✓</span>
          <span className="text-zinc-400">
            Last delivery for{" "}
            <a
              href={`https://sepolia.basescan.org/tx/${lastDelivery.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-200 underline font-mono"
            >
              {shortAddr(lastDelivery.user)}
            </a>
          </span>
        </div>
      )}
    </div>
  );
}
