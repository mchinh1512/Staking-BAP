var Token = artifacts.require("ChinhToken");
contract('ChinhToken', function(accounts) {
  it("should assert true", function() {
    var token;
    return Token.deployed().then(function(instance){
     token = instance;
     return token.totalSupply.call();
    }).then(function(result){
     assert.equal(result.toNumber(), initialSupply, 'total supply is wrong');
    })
  });
});