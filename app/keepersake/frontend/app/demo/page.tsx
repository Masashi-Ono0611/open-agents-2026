"use client";

import { Header } from "@/components/Header";
import Link from "next/link";

export default function DemoPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold mb-2">60-second judge demo</h1>
        <p className="text-zinc-400 mb-10">
          The fastest way to see a KeeperSake delivered end-to-end.
        </p>

        <ol className="space-y-5">
          <DemoStep
            n={1}
            title="Connect a wallet on Base Sepolia"
            body={
              <>
                Use{" "}
                <a
                  className="underline"
                  href="https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
                  target="_blank"
                  rel="noreferrer"
                >
                  Coinbase&apos;s faucet
                </a>{" "}
                to top up ETH if needed.
              </>
            }
          />
          <DemoStep
            n={2}
            title="Get test USDC"
            body={
              <>
                Grab some Base Sepolia USDC from{" "}
                <a
                  className="underline"
                  href="https://faucet.circle.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Circle&apos;s faucet
                </a>
                {" "}— pick the Base Sepolia network.
              </>
            }
          />
          <DemoStep
            n={3}
            title="Commit a 60-second will"
            body={
              <>
                Set the heir (use a second wallet you control), amount{" "}
                <code>1</code> USDC, write any message, choose{" "}
                <code>60s (demo)</code> as the timeout. Approve + Commit.
              </>
            }
          />
          <DemoStep
            n={4}
            title="Watch the dashboard countdown"
            body={
              <>
                <Link className="underline" href="/dashboard">
                  /dashboard
                </Link>{" "}
                shows the big countdown. Don&apos;t click{" "}
                <code>I&apos;m alive</code>.
              </>
            }
          />
          <DemoStep
            n={5}
            title="At 0s, KeeperHub fires"
            body={
              <>
                The pre-deployed KeeperHub workflow polls{" "}
                <code>silenceOf()</code> every minute. Within ~60s after expiry
                it calls <code>execute()</code> and the USDC moves to your heir.
              </>
            }
          />
          <DemoStep
            n={6}
            title="Open the heir page"
            body={
              <>
                Visit <code>/heir/&lt;your-address&gt;</code> from the heir
                wallet — your final words are now readable, with hash
                verification.
              </>
            }
          />
        </ol>

        <div className="mt-12 border border-zinc-900 rounded-xl bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold mb-2 text-zinc-300">
            Don&apos;t want to wait?
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            <code>execute()</code> is permissionless. From any wallet (including
            the heir), once a KeeperSake is past timeout, anyone can call it
            directly. KeeperHub is the convenience; the contract doesn&apos;t
            depend on it.
          </p>
          <p className="text-xs text-zinc-500">
            For the live judge demo, the workflow polls every 60 seconds, so
            delivery lands within a minute of expiry.
          </p>
        </div>
      </main>
    </>
  );
}

function DemoStep({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm text-zinc-400">
        {n}
      </div>
      <div className="flex-1 pt-1">
        <div className="font-medium text-zinc-200 mb-1">{title}</div>
        <div className="text-sm text-zinc-400 leading-relaxed">{body}</div>
      </div>
    </li>
  );
}
