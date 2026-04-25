"use client";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { VoteResults } from "./VoteResults";
import { useState } from "react";
import toast from "react-hot-toast";

type Proposal = {
  id: bigint;
  name: string;
  voteCount: bigint;
};

export function VotingCard() {
  const { address, isConnected } = useAccount();
  const [pendingVote, setPendingVote] = useState<bigint | null>(null);

  const { data: proposals, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getProposals",
    chainId: baseSepolia.id,
  });

  const { data: hasVoted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "hasVoted",
    args: address ? [address] : undefined,
    chainId: baseSepolia.id,
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "owner",
    chainId: baseSepolia.id,
  });

  const { writeContract, data: txHash } = useWriteContract();

  const { isLoading: isTxPending } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      select: (receipt) => {
        if (receipt.status === "success") {
          refetch();
          setPendingVote(null);
          toast.success("Vote recorded!");
        }
        return receipt;
      },
    },
  });

  const handleVote = (proposalId: bigint) => {
    if (!isConnected) return;
    setPendingVote(proposalId);
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "vote",
        args: [proposalId],
        chainId: baseSepolia.id,
      },
      {
        onError: (err) => {
          toast.error(err.message.slice(0, 80));
          setPendingVote(null);
        },
      }
    );
  };

  const typedProposals = proposals as Proposal[] | undefined;
  const totalVotes =
    typedProposals?.reduce((sum, p) => sum + p.voteCount, 0n) ?? 0n;
  const isOwner =
    owner &&
    address &&
    (owner as string).toLowerCase() === address.toLowerCase();

  return (
    <div className="space-y-6">
      {typedProposals && typedProposals.length > 0 ? (
        <div className="space-y-4">
          {typedProposals.map((proposal) => (
            <VoteResults
              key={proposal.id.toString()}
              proposal={proposal}
              totalVotes={totalVotes}
              hasVoted={!!hasVoted}
              isConnected={isConnected}
              isPending={isTxPending && pendingVote === proposal.id}
              onVote={() => handleVote(proposal.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No proposals yet.</p>
          {isOwner && (
            <p className="text-sm mt-1">Create the first proposal below.</p>
          )}
        </div>
      )}

      {isOwner && <CreateProposalForm onCreated={refetch} />}
    </div>
  );
}

function CreateProposalForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const { writeContract, isPending } = useWriteContract();

  const handleCreate = () => {
    if (!name.trim()) return;
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "createProposal",
        args: [name.trim()],
      },
      {
        onSuccess: () => {
          setName("");
          toast.success("Proposal created!");
          onCreated();
        },
        onError: (err) => toast.error(err.message.slice(0, 80)),
      }
    );
  };

  return (
    <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Create Proposal
      </h3>
      <div className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Proposal name..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#0052FF]"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={isPending || !name.trim()}
          className="bg-[#0052FF] hover:bg-[#003EC4] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {isPending ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
}
