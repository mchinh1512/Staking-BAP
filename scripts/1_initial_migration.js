var Token = artifacts.require("ChinhToken");

module.exports = function(deployer) {
  deployer.deploy(Token);
};
