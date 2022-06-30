import {ethers} from 'hardhat';
const { expect } = require("chai");

  describe('BearnChef should work', () => {
      it('constructor parameters should be correct', async () => {
          expect(await bearnChef.owner()).is.eq(deployer.address);
          expect(await bearnChef.chinhPerBlock()).is.eq(toWei('0.1'));
          expect(await bearnChef.startBlock()).is.eq(50);
      });

      it('parameters should be correct', async () => {
          expect(await bearnChef.totalAllocPoint()).is.eq(0);
          expect(await bearnChef.poolLength()).is.eq(0);
      });

      it('add', async () => {
          await bearnChef.add(1000, lpToken.address, false, 100);
          expect(await bearnChef.poolLength()).is.eq(1);
          let poolInfo = await bearnChef.poolInfo(0);
          expect(poolInfo.isStarted).is.false;
          expect(poolInfo.lastRewardBlock).is.eq(100);
      });

      it('bob deposit 10 BUSD', async () => {
          await expect(async () => {
              await bearnChef.connect(bob).deposit(0, toWei('10'));
          }).to.changeTokenBalances(lpToken, [bob], [toWei('-10')]);
          await mineBlocks(ethers, 50);
          expect(await bearnChef.pendingBearn(0, bob.address)).is.eq(0);
          await mineBlocks(ethers, 51);
          expect(await getLatestBlockNumber(ethers)).is.eq(109);
          await expect(async () => {
              await bearnChef.connect(bob).withdraw(0, 0);
          }).to.changeTokenBalances(chinhToken, [bob], [toWei('1.0')]);
          await mineBlocks(ethers, 10);
          expect(await bearnChef.pendingBearn(0, bob.address)).is.eq(toWei('1.0'));
      });

      it('bob withdraw 5 BUSD', async () => {
          let _beforeChinh = await chinhToken.balanceOf(bob.address);
          await expect(async () => {
              await bearnChef.connect(bob).withdraw(0, toWei('5'));
          }).to.changeTokenBalances(lpToken, [bob], [toWei('5')]);
          let _afterChinh = await chinhToken.balanceOf(bob.address);
          expect(_afterChinh.sub(_beforeChinh)).is.eq(toWei('1.1'));
      });

      it('bob emergencyWithdraw', async () => {
          await mineBlocks(ethers, 10);
          expect(await bearnChef.pendingBearn(0, bob.address)).is.eq(toWei('1.0'));
          let _beforeChinh = await chinhToken.balanceOf(bob.address);
          await expect(async () => {
              await bearnChef.connect(bob).emergencyWithdraw(0);
          }).to.changeTokenBalances(lpToken, [bob], [toWei('5')]);
          let _afterChinh = await chinhToken.balanceOf(bob.address);
          expect(_afterChinh.sub(_beforeChinh)).is.eq(toWei('0'));
      });
  });