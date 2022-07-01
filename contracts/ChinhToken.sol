pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ChinhToken is ERC20 {
    uint256 initialSupply = 1000000;

    constructor() ERC20("ChinhToken", "Chinh") {
        _mint(msg.sender, initialSupply);
    }
}