import { ethers } from "hardhat";

// Circle's official USDC on Base Sepolia. Faucet: https://faucet.circle.com/
const BASE_SEPOLIA_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Vault = await ethers.getContractFactory("SayonaraVault");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("SayonaraVault deployed to:", vaultAddress);
  console.log("Using existing Base Sepolia USDC:", BASE_SEPOLIA_USDC);

  console.log("\nUpdate frontend/lib/contracts.ts with:");
  console.log(`  export const VAULT_ADDRESS = "${vaultAddress}" as const;`);
  console.log(`  export const TOKEN_ADDRESS = "${BASE_SEPOLIA_USDC}" as const;`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
