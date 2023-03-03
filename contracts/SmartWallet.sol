// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './PurrNFT.sol';

contract SmartWallet is Ownable {
  constructor() {
    _transferOwnership(tx.origin);
  }

  /**
   * @dev Buys NTF for owned ERC20 tokens
   * @param purrNFT NFT smart contract address
   */
  function buyNFT(PurrNFT purrNFT) public onlyOwner {
    purrNFT.buy();
  }

  /**
   * @dev Approves caller s/c to transfer owned ERC20. This function is intended
   * to be called by Purr NFT s/c, however may be called by any other s/c who
   * needs transfer approval. The tx has to be originated by the smart wallet owner
   * @param token ERC20 tokens to be approved for transfer
   * @param amount ERC20 tokens amount for subsequent transfer
   */
  function approve(IERC20 token, uint256 amount) public returns (bool) {
    require(
      tx.origin == owner(),
      'SmartWallet: tx should be originated by the owner'
    );
    return token.approve(msg.sender, amount);
  }

  fallback() external {
    revert('SmartWallet: unknown function call');
  }
}
