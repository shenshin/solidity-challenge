// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './PurrNFT.sol';

contract SmartWallet is Ownable {
  constructor(address newOwner) {
    _transferOwnership(newOwner);
  }

  /**
   * @dev Buys NTF for owned ERC20 tokens
   */
  function buyNFT(PurrNFT nft) public onlyOwner {
    nft.buy();
  }

  /**
   * @dev Sets allowance for `to` to spend `amount` of each token from `tokens`
   */
  function approveAll(
    address to,
    uint256 amount,
    IERC20[] calldata tokens
  ) public onlyOwner {
    for (uint256 i = 0; i < tokens.length; i++) {
      require(
        tokens[i].approve(to, amount),
        'SmartWallet: unable to set allowance'
      );
    }
  }

  fallback() external {
    revert('SmartWallet: unknown function call');
  }
}
