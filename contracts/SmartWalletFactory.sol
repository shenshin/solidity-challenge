// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import './SmartWallet.sol';

contract SmartWalletFactory {
  // records addresses of all created smart wallets
  mapping(SmartWallet => bool) public isSmartWallet;

  event SmartWalletCreated(SmartWallet indexed wallet);

  /**
   * @dev Creates smart wallet and transfers ownership to the caller
   */
  function createSmartWallet() external {
    SmartWallet newWallet = new SmartWallet(msg.sender);
    isSmartWallet[newWallet] = true;
    emit SmartWalletCreated(newWallet);
  }

  fallback() external {
    revert('SmartWalletFactory: unknown function call');
  }
}
