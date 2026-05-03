import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const NOTE = "0x" + "ab".repeat(32);
const ONE_USDC = 1_000_000n; // 6 decimals
const HUNDRED_USDC = 100n * ONE_USDC;

describe("SayonaraVault", function () {
  async function deployFixture() {
    const [user, heir, keeper] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockUSDC");
    const token = await Token.deploy();
    const Vault = await ethers.getContractFactory("SayonaraVault");
    const vault = await Vault.deploy();
    await token.connect(user).faucet(); // user gets 100 USDC
    return { vault, token, user, heir, keeper };
  }

  it("commits a will and resets heartbeat", async function () {
    const { vault, token, user, heir } = await deployFixture();
    await token.connect(user).approve(await vault.getAddress(), HUNDRED_USDC);
    await expect(
      vault
        .connect(user)
        .commit(heir.address, await token.getAddress(), HUNDRED_USDC, NOTE, 60)
    )
      .to.emit(vault, "WillCommitted")
      .and.to.emit(vault, "Heartbeat");

    const w = await vault.wills(user.address);
    expect(w.heir).to.equal(heir.address);
    expect(w.amount).to.equal(HUNDRED_USDC);
    expect(w.timeout).to.equal(60);
    expect(w.executed).to.equal(false);
  });

  it("rejects zero heir, self heir, zero amount, zero timeout", async function () {
    const { vault, token, user, heir } = await deployFixture();
    const t = await token.getAddress();
    await expect(
      vault.connect(user).commit(ethers.ZeroAddress, t, ONE_USDC, NOTE, 60)
    ).to.be.revertedWithCustomError(vault, "ZeroHeir");
    await expect(
      vault.connect(user).commit(user.address, t, ONE_USDC, NOTE, 60)
    ).to.be.revertedWithCustomError(vault, "SelfHeir");
    await expect(
      vault.connect(user).commit(heir.address, t, 0, NOTE, 60)
    ).to.be.revertedWithCustomError(vault, "ZeroAmount");
    await expect(
      vault.connect(user).commit(heir.address, t, ONE_USDC, NOTE, 0)
    ).to.be.revertedWithCustomError(vault, "ZeroTimeout");
  });

  it("heartbeat updates lastHeartbeat", async function () {
    const { vault, token, user, heir } = await deployFixture();
    await token.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault
      .connect(user)
      .commit(heir.address, await token.getAddress(), ONE_USDC, NOTE, 60);
    const beforeHb = (await vault.wills(user.address)).lastHeartbeat;
    await time.increase(30);
    await vault.connect(user).heartbeat();
    const afterHb = (await vault.wills(user.address)).lastHeartbeat;
    expect(afterHb).to.be.gt(beforeHb);
  });

  it("execute reverts while still alive", async function () {
    const { vault, token, user, heir, keeper } = await deployFixture();
    await token.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault
      .connect(user)
      .commit(heir.address, await token.getAddress(), ONE_USDC, NOTE, 60);
    await time.increase(30);
    await expect(
      vault.connect(keeper).execute(user.address)
    ).to.be.revertedWithCustomError(vault, "StillAlive");
  });

  it("execute transfers to heir after timeout", async function () {
    const { vault, token, user, heir, keeper } = await deployFixture();
    await token.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault
      .connect(user)
      .commit(heir.address, await token.getAddress(), ONE_USDC, NOTE, 60);
    await time.increase(61);
    await expect(vault.connect(keeper).execute(user.address))
      .to.emit(vault, "Sayonara")
      .withArgs(
        user.address,
        heir.address,
        await token.getAddress(),
        ONE_USDC,
        NOTE
      );
    expect(await token.balanceOf(heir.address)).to.equal(ONE_USDC);
    expect((await vault.wills(user.address)).executed).to.equal(true);
  });

  it("execute can only be called once", async function () {
    const { vault, token, user, heir, keeper } = await deployFixture();
    await token.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault
      .connect(user)
      .commit(heir.address, await token.getAddress(), ONE_USDC, NOTE, 60);
    await time.increase(61);
    await vault.connect(keeper).execute(user.address);
    await expect(
      vault.connect(keeper).execute(user.address)
    ).to.be.revertedWithCustomError(vault, "AlreadyExecuted");
  });

  it("revoke wipes the will", async function () {
    const { vault, token, user, heir } = await deployFixture();
    await token.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault
      .connect(user)
      .commit(heir.address, await token.getAddress(), ONE_USDC, NOTE, 60);
    await vault.connect(user).revoke();
    const w = await vault.wills(user.address);
    expect(w.heir).to.equal(ethers.ZeroAddress);
    expect(w.amount).to.equal(0);
  });

  it("silenceOf and isExpired views work", async function () {
    const { vault, token, user, heir } = await deployFixture();
    expect(await vault.silenceOf(user.address)).to.equal(0);
    expect(await vault.isExpired(user.address)).to.equal(false);
    await token.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault
      .connect(user)
      .commit(heir.address, await token.getAddress(), ONE_USDC, NOTE, 60);
    await time.increase(30);
    expect(await vault.isExpired(user.address)).to.equal(false);
    await time.increase(31);
    expect(await vault.isExpired(user.address)).to.equal(true);
  });
});
