import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleVoting", function () {
  async function deployFixture() {
    const [owner, voter1, voter2] = await ethers.getSigners();
    const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
    const contract = await SimpleVoting.deploy();
    return { contract, owner, voter1, voter2 };
  }

  it("deploys with owner set", async function () {
    const { contract, owner } = await deployFixture();
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("owner can create proposals", async function () {
    const { contract } = await deployFixture();
    await contract.createProposal("Option A");
    const proposals = await contract.getProposals();
    expect(proposals.length).to.equal(1);
    expect(proposals[0].name).to.equal("Option A");
  });

  it("rejects non-owner creating proposals", async function () {
    const { contract, voter1 } = await deployFixture();
    await expect(
      contract.connect(voter1).createProposal("Option A")
    ).to.be.revertedWith("Not owner");
  });

  it("allows voting once per address", async function () {
    const { contract, voter1 } = await deployFixture();
    await contract.createProposal("Option A");
    await contract.connect(voter1).vote(0);
    const proposals = await contract.getProposals();
    expect(proposals[0].voteCount).to.equal(1n);
  });

  it("rejects double voting", async function () {
    const { contract, voter1 } = await deployFixture();
    await contract.createProposal("Option A");
    await contract.connect(voter1).vote(0);
    await expect(
      contract.connect(voter1).vote(0)
    ).to.be.revertedWith("Already voted");
  });

  it("multiple voters can vote on different proposals", async function () {
    const { contract, voter1, voter2 } = await deployFixture();
    await contract.createProposal("Option A");
    await contract.createProposal("Option B");
    await contract.connect(voter1).vote(0);
    await contract.connect(voter2).vote(1);
    const proposals = await contract.getProposals();
    expect(proposals[0].voteCount).to.equal(1n);
    expect(proposals[1].voteCount).to.equal(1n);
  });
});
