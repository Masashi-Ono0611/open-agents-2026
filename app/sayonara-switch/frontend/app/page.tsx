import Link from "next/link";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-sm text-zinc-500 uppercase tracking-widest mb-4">
          For the post-AI economy
        </p>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
          The dead man&apos;s switch,
          <br />
          for crypto.
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mb-10 leading-relaxed">
          Commit your USDC to an heir. Tap{" "}
          <span className="text-zinc-200">&quot;I&apos;m alive&quot;</span> to
          reset the timer. If you go silent past your timeout, a KeeperHub
          workflow runs <span className="font-mono text-zinc-200">execute()</span>{" "}
          for you and your heir inherits — automatically, on-chain, no lawyer.
        </p>

        <div className="flex flex-wrap gap-3 mb-16">
          <Link
            href="/setup"
            className="bg-white text-black hover:bg-zinc-200 font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Set up your switch →
          </Link>
          <Link
            href="/demo"
            className="border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-medium px-6 py-3 rounded-lg transition-colors"
          >
            See a 60-second demo
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <Step
            n="1"
            title="Commit"
            body="Pick an heir, an amount, write your final words. The vault holds nothing — just an ERC-20 allowance."
          />
          <Step
            n="2"
            title="Heartbeat"
            body="Tap a button whenever you&apos;re alive. The timer resets. Skip a few cycles? Nothing happens — yet."
          />
          <Step
            n="3"
            title="Sayonara"
            body="Past timeout, KeeperHub calls execute(). USDC moves to your heir. Your final words become readable."
          />
        </div>

        <div className="mt-16 border-t border-zinc-900 pt-8 text-xs text-zinc-500 leading-relaxed">
          <p className="mb-2">
            <span className="text-zinc-300">How it works.</span> A
            <span className="font-mono text-zinc-300"> SayonaraVault</span>{" "}
            contract on Base Sepolia stores your last heartbeat. A KeeperHub
            workflow — generated from natural language by Claude via the
            <span className="font-mono text-zinc-300"> ai_generate_workflow</span>{" "}
            MCP tool — reads it on a schedule, and calls{" "}
            <span className="font-mono text-zinc-300">execute(user)</span>{" "}
            whenever the silence exceeds your timeout. Your final words are
            pinned off-chain; only the keccak hash lives on-chain.
          </p>
          <p>
            Built for{" "}
            <a
              href="https://ethglobal.com/events/openagents/prizes/keeperhub"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-zinc-300"
            >
              ETHGlobal Open Agents — KeeperHub track
            </a>
            .
          </p>
        </div>
      </main>
    </>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="border border-zinc-900 rounded-xl p-5 bg-zinc-950">
      <div className="text-xs text-zinc-500 mb-2">Step {n}</div>
      <div className="font-medium mb-1.5">{title}</div>
      <div className="text-sm text-zinc-400 leading-relaxed">{body}</div>
    </div>
  );
}
