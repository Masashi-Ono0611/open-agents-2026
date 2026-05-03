import { keccak256, toBytes, toHex } from "viem";

const STORAGE_PREFIX = "keepersake-will-note-";

export function hashWillNote(text: string): `0x${string}` {
  return keccak256(toBytes(text));
}

// Demo storage: plain localStorage indexed by hash. Production would pin to IPFS
// and set a CID-derived hash on-chain. The contract only stores the hash either way.
export function saveWillNote(text: string): `0x${string}` {
  const hash = hashWillNote(text);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_PREFIX + hash, text);
  }
  return hash;
}

export function loadWillNote(hash: `0x${string}`): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_PREFIX + hash);
}

export function isZeroHash(hash: string): boolean {
  return (
    hash ===
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  );
}

export { toHex };
