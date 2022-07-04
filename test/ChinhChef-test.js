const { ethers } = require("hardhat");
const { expect } = require("chai");


describe("ChinhChef-test", function () {
  let chinhChef;
  let chinhToken;
  let cToken;

  let ChinhChef;
  let ChinhToken;
  let CToken;

  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    [owner,addr1, addr2, ...addrs] = await ethers.getSigners();

    ChinhChef = await ethers.getContractFactory("ChinhChef");
    ChinhToken = await ethers.getContractFactory("ChinhToken");
    CToken = await ethers.getContractFactory("CToken");

    chinhChef = await ChinhChef.deploy(100, 19245600);
    chinhToken = await ChinhToken.deploy();
    cToken = await CToken.deploy();
    await cToken.transfer(addr1.address, 2000);
  });

  describe("ChinhChef should work", function () {
    it ("constructor parameters should be correct", async function () {
      expect(await chinhChef.chinhPerBlock()).to.equal(100);
      expect(await chinhChef.startBlock()).to.equal(19245600);
    });

    it("add", async function () {
      await chinhChef.add(100, chinhToken.address, cToken.address, false, 100);
      expect(await chinhChef.poolLength()).to.equal(1);
    });

    it("deposit", async function () {
      await chinhChef.add(100, chinhToken.address, cToken.address, false, 100);
      await (await cToken.connect(addr1).approve(chinhChef.address, 1000));
      await chinhChef.connect(addr1).deposit(0, 100);
      expect(await cToken.balanceOf(addr1.address)).to.equal(1900);
    });

    it("withdraw", async function () {
      await chinhChef.add(100, chinhToken.address, cToken.address, false, 100);
      await (await cToken.connect(addr1).approve(chinhChef.address, 1000));
      await chinhChef.connect(addr1).deposit(0, 100);
      await chinhChef.connect(addr1).withdraw(0, 10);
      expect(await cToken.balanceOf(addr1.address)).to.equal(1910);
    });
  });
});