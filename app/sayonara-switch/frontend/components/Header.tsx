"use client";

import Link from "next/link";
import { ConnectButtonWrapper } from "./ConnectButton";

export function Header() {
  return (
    <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-2xl">⚰️</span>
          <span className="font-semibold tracking-tight">
            Sayonara Switch
          </span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded-full">
            Base Sepolia
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/setup"
            className="px-3 py-1.5 rounded-md hover:bg-zinc-900 text-zinc-300"
          >
            Setup
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-md hover:bg-zinc-900 text-zinc-300"
          >
            Dashboard
          </Link>
          <Link
            href="/demo"
            className="px-3 py-1.5 rounded-md hover:bg-zinc-900 text-zinc-300"
          >
            Demo
          </Link>
          <div className="ml-2">
            <ConnectButtonWrapper />
          </div>
        </nav>
      </div>
    </header>
  );
}
