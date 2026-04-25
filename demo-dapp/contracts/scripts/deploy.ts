import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
  const contract = await SimpleVoting.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("SimpleVoting deployed to:", address);

  console.log("Creating initial proposals...");
  await (await contract.createProposal("Build a DeFi protocol")).wait();
  await (await contract.createProposal("Launch an NFT collection")).wait();
  await (await contract.createProposal("Create a DAO")).wait();

  console.log(`Done! Update frontend/lib/contract.ts with: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
