// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import "./SafeToken.sol";

contract SafeTokenFactory is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private tokens;

    address payable private feeAddress;
    uint256 private feeAmount;

    constructor (address payable _feeAddress, uint256 _feeAmount) {
        feeAddress = _feeAddress;
        feeAmount = _feeAmount;
    }

    function setFee(uint256 newFee) external onlyOwner {
        feeAmount = newFee;
    }

    function getFee() external view returns (uint256) {
        return feeAmount;
    }

    function mintToken(
        string memory _name, 
        string memory _symbol, 
        uint256 _supply,
        uint8 _decimals
    ) public payable {
        require(msg.value == feeAmount, "not enough to pay fee");
        payable(feeAddress).transfer(feeAmount);

        SafeToken newToken = new SafeToken(_name, _symbol, _supply, _decimals);
        tokens.add(address(newToken));
        uint256 tokenBalance = newToken.balanceOf(address(this));
        newToken.transfer(_msgSender(), tokenBalance);
    }

    function getTokensLength() external view returns (uint) {
        return tokens.length();
    }

    function getTokenAtIndex(uint index) external view returns (address) {
        return tokens.at(index);
    }
}