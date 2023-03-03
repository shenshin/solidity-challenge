// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './SmartWallet.sol';

contract SmartWalletFactory {
  // records addresses of all created smart wallets
  mapping(SmartWallet => bool) public isSmartWallet;

  event SmartWalletCreated(SmartWallet wallet);

  /**
   * @dev Creates smart wallet and transfers ownership to the caller
   */
  function createSmartWallet() external {
    SmartWallet newWallet = new SmartWallet();
    isSmartWallet[newWallet] = true;
    emit SmartWalletCreated(newWallet);
  }

  fallback() external {
    revert('SmartWalletFactory: unknown function call');
  }
}
