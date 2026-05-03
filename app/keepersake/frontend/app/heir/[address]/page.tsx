"use client";

import { use } from "react";
import { useReadContract } from "wagmi";
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
import { shortAddr } from "@/lib/format";

export default function HeirPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address: userAddr } = use(params);

  const { data: will } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "wills",
    args: [userAddr as `0x${string}`],
    chainId: baseSepolia.id,
    query: { refetchInterval: 5000 },
  });

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
          <h1 className="text-3xl font-semibold mb-3">No will found.</h1>
          <p className="text-zinc-400">
            <code>{shortAddr(userAddr)}</code> hasn&apos;t set up a KeeperSake.
          </p>
        </main>
      </>
    );
  }

  const [heir, , amount, willNoteHash, , , delivered] = w!;
  const note = !isZeroHash(willNoteHash) ? loadWillNote(willNoteHash) : null;
  const noteHashMatches =
    note !== null && hashWillNote(note) === willNoteHash;

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
          From {shortAddr(userAddr)} → To {shortAddr(heir)}
        </p>

        {delivered ? (
          <>
            <h1 className="text-4xl font-semibold mb-4">
              💌 A KeeperSake for you —{" "}
              <span className="font-mono">
                {Number(amount) / 10 ** TOKEN_DECIMALS} {TOKEN_SYMBOL}
              </span>
              .
            </h1>
            <p className="text-zinc-400 mb-10 leading-relaxed">
              KeeperHub delivered it on the sender&apos;s behalf. Your
              inheritance has already landed in your wallet.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-semibold mb-4">
              Pending inheritance:{" "}
              <span className="font-mono">
                {Number(amount) / 10 ** TOKEN_DECIMALS} {TOKEN_SYMBOL}
              </span>
            </h1>
            <p className="text-zinc-400 mb-10 leading-relaxed">
              {shortAddr(userAddr)} is still alive. Their final words are sealed
              behind the keccak hash{" "}
              <code className="text-xs">{willNoteHash}</code>. They become
              readable when the KeeperSake is delivered.
            </p>
          </>
        )}

        <div className="border border-zinc-900 rounded-2xl bg-zinc-950 p-8">
          <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
            Final words
          </div>
          {!delivered ? (
            <p className="italic text-zinc-600">…sealed.</p>
          ) : note ? (
            <>
              <pre className="whitespace-pre-wrap text-zinc-200 text-base leading-relaxed font-serif">
                {note}
              </pre>
              <div className="mt-6 pt-4 border-t border-zinc-900 text-xs">
                {noteHashMatches ? (
                  <span className="text-emerald-400">
                    ✓ Hash verified — note has not been tampered with.
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
              to IPFS.)
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
