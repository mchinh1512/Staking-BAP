var Token = artifacts.require("FixedSupplyToken");
module.exports = function(deployer) {
  deployer.deploy(Token);
};