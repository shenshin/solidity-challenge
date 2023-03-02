// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './SmartWallet.sol';

contract SmartWalletFactory {
  mapping(SmartWallet => bool) public isSmartWallet;

  event SmartWalletCreated(SmartWallet wallet);

  function createSmartWallet() external {
    SmartWallet newWallet = new SmartWallet();
    isSmartWallet[newWallet] = true;
    emit SmartWalletCreated(newWallet);
  }

  fallback() external {
    revert('SmartWalletFactory: unknown function call');
  }
}
