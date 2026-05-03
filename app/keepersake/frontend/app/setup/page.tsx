"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { parseUnits, isAddress } from "viem";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import {
  VAULT_ABI,
  VAULT_ADDRESS,
  TOKEN_ABI,
  TOKEN_ADDRESS,
  TOKEN_DECIMALS,
  TOKEN_SYMBOL,
} from "@/lib/contracts";
import { saveWillNote } from "@/lib/willNote";

const TIMEOUT_PRESETS = [
  { label: "30s (demo)", seconds: 30 },
  { label: "30d (real)", seconds: 30 * 86400 },
];

export default function SetupPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [heir, setHeir] = useState("");
  const [amount, setAmount] = useState("1");
  const [note, setNote] = useState(
    "To my heir,\n\nIf you are reading this, I am gone. The bag is yours. Use it well.\n\n— me"
  );
  const [timeout, setTimeoutSec] = useState(30);
  const [step, setStep] = useState<"form" | "approve" | "commit" | "done">("form");

  const { data: allowance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, VAULT_ADDRESS] : undefined,
    chainId: baseSepolia.id,
    query: { refetchInterval: 3000 },
  });

  const { data: balance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: baseSepolia.id,
    query: { refetchInterval: 3000 },
  });

  const { writeContract: writeApprove, data: approveTx, isPending: approving } = useWriteContract();
  const { isLoading: approveMining, isSuccess: approveSuccess } =
    useWaitForTransactionReceipt({ hash: approveTx });

  const { writeContract: writeCommit, data: commitTx, isPending: committing } = useWriteContract();
  const { isLoading: commitMining, isSuccess: commitSuccess } =
    useWaitForTransactionReceipt({ hash: commitTx });

  useEffect(() => {
    if (approveSuccess) {
      toast.success("Approved");
      setStep("commit");
    }
  }, [approveSuccess]);

  useEffect(() => {
    if (commitSuccess) {
      toast.success("Will committed. Stay alive.");
      setStep("done");
      const t = window.setTimeout(() => router.push("/dashboard"), 1500);
      return () => window.clearTimeout(t);
    }
  }, [commitSuccess, router]);

  const amountWei = (() => {
    try {
      return parseUnits(amount || "0", TOKEN_DECIMALS);
    } catch {
      return 0n;
    }
  })();

  const heirIsSelf =
    isAddress(heir) && heir.toLowerCase() === address?.toLowerCase();
  const heirIsVault =
    isAddress(heir) && heir.toLowerCase() === VAULT_ADDRESS.toLowerCase();
  const heirValid = isAddress(heir) && !heirIsSelf && !heirIsVault;
  const amountValid = amountWei > 0n && (balance === undefined || amountWei <= (balance as bigint));
  const noteValid = note.trim().length > 0;
  const formValid = heirValid && amountValid && noteValid;
  const needsApproval = !allowance || (allowance as bigint) < amountWei;

  const handleApprove = () => {
    setStep("approve");
    writeApprove({
      address: TOKEN_ADDRESS,
      abi: TOKEN_ABI,
      functionName: "approve",
      args: [VAULT_ADDRESS, amountWei],
      chainId: baseSepolia.id,
    });
  };

  const handleCommit = () => {
    const willHash = saveWillNote(note);
    writeCommit({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "commit",
      args: [
        heir as `0x${string}`,
        TOKEN_ADDRESS,
        amountWei,
        willHash,
        BigInt(timeout),
      ],
      chainId: baseSepolia.id,
    });
  };

  if (!isConnected) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-6 py-20">
          <h1 className="text-3xl font-semibold mb-3">Connect your wallet</h1>
          <p className="text-zinc-400">
            We need to read your address before we can write your will.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold mb-2">Set up your KeeperSake</h1>
        <p className="text-zinc-400 mb-10">
          Funds stay in your wallet — the vault only gets an allowance.
        </p>

        <div className="space-y-6">
          <Field label="Heir's wallet">
            <input
              value={heir}
              onChange={(e) => setHeir(e.target.value)}
              placeholder="0x… (a wallet you trust — spouse, kid, second wallet)"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-zinc-600"
            />
            {heir && !heirValid && (
              <p className="text-xs text-red-400 mt-1.5">
                {!isAddress(heir)
                  ? "Not a valid address"
                  : heirIsVault
                  ? "Heir cannot be the vault contract — funds would be locked forever"
                  : "Heir cannot be yourself"}
              </p>
            )}
          </Field>

          <Field
            label={`Amount (${TOKEN_SYMBOL})`}
            hint={
              balance !== undefined
                ? `Balance: ${Number(balance) / 10 ** TOKEN_DECIMALS}`
                : undefined
            }
          >
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-zinc-600"
            />
            <p className="text-xs text-zinc-500 mt-1.5">
              No test {TOKEN_SYMBOL}?{" "}
              <a
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-zinc-300"
              >
                Circle faucet ↗
              </a>
            </p>
          </Field>

          <Field label="Final words">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder="A message your heir reads on delivery."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:border-zinc-600"
            />
          </Field>

          <Field
            label="Inactivity timeout"
            hint="silence before delivery"
          >
            <div className="flex gap-2 flex-wrap">
              {TIMEOUT_PRESETS.map((p) => (
                <button
                  key={p.seconds}
                  onClick={() => setTimeoutSec(p.seconds)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    timeout === p.seconds
                      ? "border-white bg-white text-black"
                      : "border-zinc-800 hover:border-zinc-600 text-zinc-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-10 border-t border-zinc-900 pt-6 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Step{" "}
            <span className="text-zinc-300">
              {step === "form" || step === "approve"
                ? needsApproval
                  ? "1 of 2"
                  : "2 of 2"
                : "2 of 2"}
            </span>
          </div>
          {needsApproval ? (
            <button
              disabled={!formValid || approving || approveMining}
              onClick={handleApprove}
              className="bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium px-6 py-3 rounded-lg"
            >
              {approving || approveMining ? "Approving…" : `Approve ${TOKEN_SYMBOL}`}
            </button>
          ) : (
            <button
              disabled={!formValid || committing || commitMining}
              onClick={handleCommit}
              className="bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium px-6 py-3 rounded-lg"
            >
              {committing || commitMining ? "Committing…" : "Commit will →"}
            </button>
          )}
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm text-zinc-300 font-medium">{label}</label>
        {hint && <span className="text-xs text-zinc-500">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
