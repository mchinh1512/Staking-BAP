const hre = require("hardhat");

async function main() {

  const ChinhChef = await hre.ethers.getContractFactory("ChinhChef");
  console.log('Deploying ChinhChef...');
  const token = await ChinhChef.deploy('1000000');

  await token.deployed();
  console.log("ChinhChef deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });