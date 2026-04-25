"use client";

type Proposal = {
  id: bigint;
  name: string;
  voteCount: bigint;
};

interface VoteResultsProps {
  proposal: Proposal;
  totalVotes: bigint;
  hasVoted: boolean;
  isConnected: boolean;
  isPending: boolean;
  onVote: () => void;
}

export function VoteResults({
  proposal,
  totalVotes,
  hasVoted,
  isConnected,
  isPending,
  onVote,
}: VoteResultsProps) {
  const percentage =
    totalVotes > 0n ? Number((proposal.voteCount * 100n) / totalVotes) : 0;

  const canVote = isConnected && !hasVoted;

  return (
    <div className="border border-gray-800 rounded-xl p-5 bg-gray-900 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-white">{proposal.name}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {proposal.voteCount.toString()} vote
            {proposal.voteCount !== 1n ? "s" : ""}
          </span>
          <button
            onClick={onVote}
            disabled={!canVote || isPending}
            className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${
              canVote && !isPending
                ? "bg-[#0052FF] hover:bg-[#003EC4] text-white"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isPending
              ? "Voting..."
              : hasVoted
              ? "Voted"
              : !isConnected
              ? "Connect"
              : "Vote"}
          </button>
        </div>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0052FF] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1.5 text-right">
        <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}
