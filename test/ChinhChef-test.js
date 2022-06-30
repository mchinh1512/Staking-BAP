const { ethers } = require("hardhat");
const { expect } = require("chai");

describe('ChinhChef should work', () => {
  it('constructor parameters should be correct', async () => {
    expect(await chinhChef.owner()).is.eq(deployer.address);
    expect(await chinhChef.chinhPerBlock()).is.eq(toWei('0.1'));
    expect(await chinhChef.startBlock()).is.eq(50);
  });

  it('parameters should be correct', async () => {
    expect(await chinhChef.totalAllocPoint()).is.eq(0);
    expect(await chinhChef.poolLength()).is.eq(0);
  });

  it('add', async () => {
    await chinhChef.add(1000, lpToken.address, false, 100);
    expect(await chinhChef.poolLength()).is.eq(1);
    let poolInfo = await chinhChef.poolInfo(0);
    expect(poolInfo.isStarted).is.false;
    expect(poolInfo.lastRewardBlock).is.eq(100);
  });

  it('bob deposit 10 BUSD', async () => {
    await expect(async () => {
      await chinhChef.connect(bob).deposit(0, toWei('10'));
    }).to.changeTokenBalances(lpToken, [bob], [toWei('-10')]);
    await mineBlocks(ethers, 50);
    expect(await chinhChef.pendingChinh(0, bob.address)).is.eq(0);
    await mineBlocks(ethers, 51);
    expect(await getLatestBlockNumber(ethers)).is.eq(109);
    await expect(async () => {
      await chinhChef.connect(bob).withdraw(0, 0);
    }).to.changeTokenBalances(chinhToken, [bob], [toWei('1.0')]);
    await mineBlocks(ethers, 10);
    expect(await chinhChef.pendingChinh(0, bob.address)).is.eq(toWei('1.0'));
  });

  it('bob withdraw 5 BUSD', async () => {
    let _beforeChinh = await chinhToken.balanceOf(bob.address);
    await expect(async () => {
      await chinhChef.connect(bob).withdraw(0, toWei('5'));
    }).to.changeTokenBalances(lpToken, [bob], [toWei('5')]);
    let _afterChinh = await chinhToken.balanceOf(bob.address);
    expect(_afterChinh.sub(_beforeChinh)).is.eq(toWei('1.1'));
  });

  it('bob emergencyWithdraw', async () => {
    await mineBlocks(ethers, 10);
    expect(await chinhChef.pendingChinh(0, bob.address)).is.eq(toWei('1.0'));
    let _beforeChinh = await chinhToken.balanceOf(bob.address);
    await expect(async () => {
      await chinhChef.connect(bob).emergencyWithdraw(0);
    }).to.changeTokenBalances(lpToken, [bob], [toWei('5')]);
    let _afterChinh = await chinhToken.balanceOf(bob.address);
    expect(_afterChinh.sub(_beforeChinh)).is.eq(toWei('0'));
  });
});