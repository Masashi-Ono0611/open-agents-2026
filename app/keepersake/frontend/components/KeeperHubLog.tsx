"use client";

import { useEffect, useRef, useState } from "react";
import { parseAbiItem } from "viem";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { VAULT_ABI, VAULT_ADDRESS } from "@/lib/contracts";
import { shortAddr } from "@/lib/format";

const POLL_PERIOD = Number(
  process.env.NEXT_PUBLIC_KEEPERHUB_POLL_PERIOD ?? 30
);
const KEEPER_ADDR = (
  process.env.NEXT_PUBLIC_KEEPERHUB_KEEPER_ADDRESS ?? ""
).toLowerCase();

const MAX_ENTRIES = 30;
// Roughly the last 24h on Base Sepolia (2s blocks ≈ 43,200 / day; 50,000 gives
// some headroom). The vault was deployed recently, so we don't need more.
const HISTORY_BLOCK_RANGE = 50_000n;

type EntryKind =
  | "tick" // synthetic — we do not have a public KeeperHub status API yet
  | "heartbeat"
  | "willCommitted"
  | "willRevoked"
  | "delivered";

type Entry = {
  id: string; // tx-log derived for on-chain rows so we can dedupe
  ts: number; // unix seconds
  blockNumber?: bigint; // for sorting on-chain rows; absent for synthetic ticks
  kind: EntryKind;
  message: React.ReactNode;
  txHash?: `0x${string}`;
  isKeeper?: boolean; // true when caller matches KEEPER_ADDR
};

const ICON: Record<EntryKind, string> = {
  tick: "🔵",
  heartbeat: "🩺",
  willCommitted: "📝",
  willRevoked: "🗑️",
  delivered: "💌",
};

const KIND_LABEL: Record<EntryKind, string> = {
  tick: "poll",
  heartbeat: "Heartbeat",
  willCommitted: "WillCommitted",
  willRevoked: "WillRevoked",
  delivered: "KeeperSakeDelivered",
};

const HEARTBEAT_EVENT = parseAbiItem(
  "event Heartbeat(address indexed user, uint64 timestamp)"
);
const WILL_COMMITTED_EVENT = parseAbiItem(
  "event WillCommitted(address indexed user, address indexed heir, address indexed token, uint256 amount, bytes32 willNoteHash, uint64 timeout)"
);
const WILL_REVOKED_EVENT = parseAbiItem(
  "event WillRevoked(address indexed user)"
);
const KEEPER_SAKE_DELIVERED_EVENT = parseAbiItem(
  "event KeeperSakeDelivered(address indexed user, address indexed heir, address indexed caller, address token, uint256 amount, bytes32 willNoteHash)"
);

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function deliveryMessage(args: {
  user: `0x${string}`;
  heir: `0x${string}`;
  caller: `0x${string}`;
}): { node: React.ReactNode; isKeeper: boolean } {
  const isKeeper =
    KEEPER_ADDR !== "" && args.caller.toLowerCase() === KEEPER_ADDR;
  return {
    isKeeper,
    node: (
      <span>
        {isKeeper ? (
          <span className="text-emerald-400 font-medium">KeeperHub</span>
        ) : (
          <span className="text-orange-400 font-medium">
            <span className="font-mono">{shortAddr(args.caller)}</span>
          </span>
        )}{" "}
        delivered for{" "}
        <span className="font-mono">{shortAddr(args.user)}</span> →{" "}
        <span className="font-mono">{shortAddr(args.heir)}</span>
      </span>
    ),
  };
}

export function KeeperHubLog() {
  const publicClient = usePublicClient({ chainId: baseSepolia.id });
  const [entries, setEntries] = useState<Entry[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const tickCounterRef = useRef(0);

  function pushEntry(e: Omit<Entry, "id"> & { id?: string }): void {
    const id = e.id ?? `tick-${++tickCounterRef.current}`;
    if (seenIdsRef.current.has(id)) return;
    seenIdsRef.current.add(id);
    setEntries((prev) => {
      const next = [{ ...e, id }, ...prev];
      next.sort((a, b) => {
        // Newest first by ts. Ties (same block, multiple events) keep insertion.
        return b.ts - a.ts;
      });
      return next.slice(0, MAX_ENTRIES);
    });
  }

  // Pre-load on-chain history so judges who land on the page after delivery
  // still see the keeper's activity. Without this, useWatchContractEvent only
  // surfaces events that happen after mount.
  useEffect(() => {
    if (!publicClient) return;
    let cancelled = false;
    (async () => {
      try {
        const latest = await publicClient.getBlockNumber();
        const fromBlock =
          latest > HISTORY_BLOCK_RANGE ? latest - HISTORY_BLOCK_RANGE : 0n;
        const [delivered, heartbeats, committed, revoked] = await Promise.all([
          publicClient.getLogs({
            address: VAULT_ADDRESS,
            event: KEEPER_SAKE_DELIVERED_EVENT,
            fromBlock,
            toBlock: latest,
          }),
          publicClient.getLogs({
            address: VAULT_ADDRESS,
            event: HEARTBEAT_EVENT,
            fromBlock,
            toBlock: latest,
          }),
          publicClient.getLogs({
            address: VAULT_ADDRESS,
            event: WILL_COMMITTED_EVENT,
            fromBlock,
            toBlock: latest,
          }),
          publicClient.getLogs({
            address: VAULT_ADDRESS,
            event: WILL_REVOKED_EVENT,
            fromBlock,
            toBlock: latest,
          }),
        ]);
        if (cancelled) return;

        // Resolve block timestamps once per unique block number.
        const allLogs = [
          ...delivered.map((l) => ({ kind: "delivered" as const, log: l })),
          ...heartbeats.map((l) => ({ kind: "heartbeat" as const, log: l })),
          ...committed.map((l) => ({ kind: "willCommitted" as const, log: l })),
          ...revoked.map((l) => ({ kind: "willRevoked" as const, log: l })),
        ];
        const blockNumbers = Array.from(
          new Set(allLogs.map((x) => (x.log as { blockNumber: bigint }).blockNumber))
        );
        const blocks = await Promise.all(
          blockNumbers.map((bn) =>
            publicClient.getBlock({ blockNumber: bn })
          )
        );
        if (cancelled) return;
        const blockTs = new Map<string, number>(
          blocks.map((b) => [b.number!.toString(), Number(b.timestamp)])
        );

        for (const { kind, log } of allLogs) {
          const txHash = (log as { transactionHash: `0x${string}` })
            .transactionHash;
          const logIndex = (log as { logIndex: number }).logIndex;
          const blockNumber = (log as { blockNumber: bigint }).blockNumber;
          const ts = blockTs.get(blockNumber.toString()) ?? 0;
          const id = `${txHash}-${logIndex}`;

          if (kind === "delivered") {
            const args = (log as unknown as {
              args: {
                user: `0x${string}`;
                heir: `0x${string}`;
                caller: `0x${string}`;
              };
            }).args;
            const { node, isKeeper } = deliveryMessage(args);
            pushEntry({
              id,
              ts,
              blockNumber,
              kind,
              message: node,
              txHash,
              isKeeper,
            });
          } else if (kind === "heartbeat") {
            const args = (log as unknown as { args: { user: `0x${string}` } })
              .args;
            pushEntry({
              id,
              ts,
              blockNumber,
              kind,
              txHash,
              message: (
                <span>
                  <span className="font-mono">{shortAddr(args.user)}</span>{" "}
                  said they&apos;re alive
                </span>
              ),
            });
          } else if (kind === "willCommitted") {
            const args = (log as unknown as {
              args: { user: `0x${string}`; heir: `0x${string}` };
            }).args;
            pushEntry({
              id,
              ts,
              blockNumber,
              kind,
              txHash,
              message: (
                <span>
                  <span className="font-mono">{shortAddr(args.user)}</span>{" "}
                  committed a KeeperSake to{" "}
                  <span className="font-mono">{shortAddr(args.heir)}</span>
                </span>
              ),
            });
          } else {
            const args = (log as unknown as { args: { user: `0x${string}` } })
              .args;
            pushEntry({
              id,
              ts,
              blockNumber,
              kind,
              txHash,
              message: (
                <span>
                  <span className="font-mono">{shortAddr(args.user)}</span>{" "}
                  revoked their KeeperSake
                </span>
              ),
            });
          }
        }
      } catch (e) {
        console.error("[KeeperHubLog] history fetch failed:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicClient]);

  // Synthetic poll tick — we do not have a public way to confirm KeeperHub
  // actually ran a read step, so this is honestly labeled as a "schedule
  // simulation" in the help text below.
  useEffect(() => {
    const interval = setInterval(() => {
      pushEntry({
        ts: Math.floor(Date.now() / 1000),
        kind: "tick",
        message: (
          <span>
            workflow tick — schedule fires{" "}
            <code className="text-zinc-300">isExpired()</code>
          </span>
        ),
      });
    }, POLL_PERIOD * 1000);
    return () => clearInterval(interval);
  }, []);

  // Real on-chain events (live, after mount) ────────────────────────────────
  useWatchContractEvent({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    eventName: "Heartbeat",
    chainId: baseSepolia.id,
    onLogs(logs) {
      for (const l of logs) {
        const args = (l as unknown as { args: { user: `0x${string}` } }).args;
        const txHash = (l as { transactionHash: `0x${string}` }).transactionHash;
        const logIndex = (l as { logIndex: number }).logIndex;
        pushEntry({
          id: `${txHash}-${logIndex}`,
          ts: Math.floor(Date.now() / 1000),
          kind: "heartbeat",
          txHash,
          message: (
            <span>
              <span className="font-mono">{shortAddr(args.user)}</span> said
              they&apos;re alive
            </span>
          ),
        });
      }
    },
  });

  useWatchContractEvent({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    eventName: "WillCommitted",
    chainId: baseSepolia.id,
    onLogs(logs) {
      for (const l of logs) {
        const args = (l as unknown as {
          args: { user: `0x${string}`; heir: `0x${string}` };
        }).args;
        const txHash = (l as { transactionHash: `0x${string}` }).transactionHash;
        const logIndex = (l as { logIndex: number }).logIndex;
        pushEntry({
          id: `${txHash}-${logIndex}`,
          ts: Math.floor(Date.now() / 1000),
          kind: "willCommitted",
          txHash,
          message: (
            <span>
              <span className="font-mono">{shortAddr(args.user)}</span>{" "}
              committed a KeeperSake to{" "}
              <span className="font-mono">{shortAddr(args.heir)}</span>
            </span>
          ),
        });
      }
    },
  });

  useWatchContractEvent({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    eventName: "WillRevoked",
    chainId: baseSepolia.id,
    onLogs(logs) {
      for (const l of logs) {
        const args = (l as unknown as { args: { user: `0x${string}` } }).args;
        const txHash = (l as { transactionHash: `0x${string}` }).transactionHash;
        const logIndex = (l as { logIndex: number }).logIndex;
        pushEntry({
          id: `${txHash}-${logIndex}`,
          ts: Math.floor(Date.now() / 1000),
          kind: "willRevoked",
          txHash,
          message: (
            <span>
              <span className="font-mono">{shortAddr(args.user)}</span> revoked
              their KeeperSake
            </span>
          ),
        });
      }
    },
  });

  useWatchContractEvent({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    eventName: "KeeperSakeDelivered",
    chainId: baseSepolia.id,
    onLogs(logs) {
      for (const l of logs) {
        const args = (l as unknown as {
          args: {
            user: `0x${string}`;
            heir: `0x${string}`;
            caller: `0x${string}`;
          };
        }).args;
        const txHash = (l as { transactionHash: `0x${string}` }).transactionHash;
        const logIndex = (l as { logIndex: number }).logIndex;
        const { node, isKeeper } = deliveryMessage(args);
        pushEntry({
          id: `${txHash}-${logIndex}`,
          ts: Math.floor(Date.now() / 1000),
          kind: "delivered",
          txHash,
          isKeeper,
          message: node,
        });
      }
    },
  });

  return (
    <div className="border border-zinc-900 rounded-2xl bg-zinc-950 p-5 mb-6">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-sm font-semibold text-zinc-200">
          🍶 Live keeper feed
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">
          {entries.length}/{MAX_ENTRIES}
        </span>
      </div>
      <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
        Poll ticks are simulated at the workflow&apos;s schedule cadence
        ({POLL_PERIOD}s). Heartbeat / commit / revoke / delivery rows are
        real on-chain events on{" "}
        <a
          className="underline hover:text-zinc-300"
          href={`https://sepolia.basescan.org/address/${VAULT_ADDRESS}#events`}
          target="_blank"
          rel="noreferrer"
        >
          KeeperSakeVault
        </a>
        .
      </p>
      {entries.length === 0 ? (
        <div className="text-center text-xs text-zinc-600 py-8 italic">
          Waiting for the next workflow tick…
        </div>
      ) : (
        <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {entries.map((e) => (
            <li
              key={e.id}
              className={`flex items-start gap-2.5 text-xs leading-relaxed font-mono p-2 rounded-md ${
                e.kind === "delivered"
                  ? e.isKeeper
                    ? "bg-emerald-950/30 border border-emerald-900/50"
                    : "bg-orange-950/20 border border-orange-900/40"
                  : ""
              }`}
            >
              <span className="text-zinc-600 shrink-0">
                {formatTime(e.ts)}
              </span>
              <span className="shrink-0">{ICON[e.kind]}</span>
              <span className="shrink-0 text-zinc-500">
                {KIND_LABEL[e.kind]}
              </span>
              <span className="text-zinc-300 flex-1">{e.message}</span>
              {e.txHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${e.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-500 hover:text-zinc-300 shrink-0"
                >
                  ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
