pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ChinhToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Chinh Token", "Chinh") {
        _mint(msg.sender, initialSupply);
    }
}