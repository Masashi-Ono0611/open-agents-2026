import { ConnectButtonWrapper } from "@/components/ConnectButton";
import { VotingCard } from "@/components/VotingCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0052FF]" />
            <span className="font-bold text-lg">Simple Voting</span>
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
              Base Sepolia
            </span>
          </div>
          <ConnectButtonWrapper />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Community Voting
          </h1>
          <p className="text-gray-400">
            Cast your vote on Base Sepolia. One address, one vote.
          </p>
        </div>
        <VotingCard />
      </div>
    </main>
  );
}
