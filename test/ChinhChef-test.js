const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { expectRevert, time, balance } = require('@openzeppelin/test-helpers');

const ChinhChef = artifacts.require("ChinhChef");
const ChinhToken = artifacts.require("ChinhToken");
const CToken = artifacts.require("mock/MockERC20")

describe("ChinhChef", ([alice, minter]) => {
  before(async () => {
    this.chinh = await ChinhToken.new({ from: minter });
    this.lp1 = await MockERC20.new('LPToken', 'LP1', '1000000', { from: minter });
    this.chef = await ChinhChef.new(this.chinh.address, {from: minter});
    await this.chinh.transfer(this.chef.address, {from: minter});
    await this.lp1.transfer(alice, '1000', {from: minter});
  });

  it('real case', async () => {
    this.lp2 = await MockERC20.new('LPToken', 'LP1', '1000000', {from: minter});
    await this.chef.add('2000', this.lp1.address, true, {from: minter});
    assert.equal((await this.chef.poolLength()).toString(), "10");

    await time.advanceBlockTo('170');
    await this.lp1.approve(this.chef.address, '1000', {from: alice});
    assert.equal((await this.chinh,balanceOf(alice)).toString(), '0');
    await this.chef.deposit(1, '20', {from: alice});
    await this.chef.withdraw(1, '20', {from: alice});
    assert.equal((await this.chinh.balanceOf(alice)).toString(), '263');
  });

  it('deposit/withdraw', async () => {
    await this.chef.add('1000', this.lp1.address, true, { from: minter });
    await this.lp1.approve(this.chef.address, '100', { from: alice });
    await this.chef.deposit(1, '20', { from: alice });
    await this.chef.deposit(1, '40', { from: alice });
    assert.equal((await this.lp1.balanceOf(alice)).toString(), '1940');
    await this.chef.withdraw(1, '10', { from: alice });
    assert.equal((await this.lp1.balanceOf(alice)).toString(), '1950');
    assert.equal((await this.cake.balanceOf(alice)).toString(), '999');
  });

  it('staking/unstaking', async () => {
    await this.chef.add('1000', this.lp1.address, true, { from: minter });
    await this.chef.add('1000', this.lp2.address, true, { from: minter });

    await this.lp1.approve(this.chef.address, '10', { from: alice });
    await this.chef.deposit(1, '2', { from: alice });
    await this.chef.withdraw(1, '2', { from: alice });
  });

  it('update', async () => {
    await this.chef.add('1000', this.lp1.address, true, { from: minter });
    await this.chef.add('1000', this.lp2.address, true, { from: minter });

    await this.lp1.approve(this.chef.address, '100', { from: alice });
    await this.chef.deposit(1, '100', { from: alice });
    await this.chinh.approve(this.chef.address, '100', { from: alice });

    assert.equal((await this.chinh.balanceOf(alice)).toString(), '700');
  });
});