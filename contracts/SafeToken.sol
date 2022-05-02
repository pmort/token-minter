// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract SafeToken is ERC20 {
    
    uint8 private decimals_;

    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _supply,
        uint8 _decimals
    ) ERC20(_name, _symbol) {
        _mint(_msgSender(), _supply);
        decimals_ = _decimals;
    }

    function decimals() public view virtual override returns (uint8) {
        return decimals_;
    }

    function burn(uint256 amount) public virtual {
        _burn(_msgSender(), amount);
    }
}