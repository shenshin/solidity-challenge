// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './PurrNFT.sol';

contract SmartWallet is Ownable {
  constructor() {
    _transferOwnership(tx.origin);
  }

  function buyNFT(
    PurrNFT purrNFT,
    uint256 amount,
    IERC20[] calldata tokens
  ) public onlyOwner {
    require(tokens.length <= 40, 'SmartWallet: Too many tokens provided');
    for (uint256 i = 0; i < tokens.length; i++) {
      IERC20 token = tokens[i];
      token.transferFrom(msg.sender, address(this), amount);
      token.approve(address(purrNFT), amount);
    }
    purrNFT.buy();
  }

  fallback() external {
    revert('SmartWallet: unknown function call');
  }
}
