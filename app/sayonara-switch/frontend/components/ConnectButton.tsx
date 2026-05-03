"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectButtonWrapper() {
  return (
    <ConnectButton
      chainStatus="icon"
      showBalance={false}
      accountStatus="avatar"
    />
  );
}
