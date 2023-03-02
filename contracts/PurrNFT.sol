// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import './SmartWalletFactory.sol';
import './SmartWallet.sol';

contract PurrNFT is ERC721, Ownable {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;

  event Withdrawal(uint256 totalAmout);
  event AddToWhiteList(IERC20 token);

  struct Accepted {
    IERC20 token;
    uint256 balance;
  }
  // stores all whitelisted tokens
  Accepted[] public whiteList;
  mapping(IERC20 => bool) public isAccepted;

  uint256 public price = 1;

  SmartWalletFactory public immutable smartWalletFactory;
  modifier onlySmartWallet() {
    // make sure caller is smart wallet
    require(smartWalletFactory.isSmartWallet(SmartWallet(msg.sender)));
    _;
  }

  constructor(SmartWalletFactory _factory) ERC721('PurrNFT', 'PUR') {
    smartWalletFactory = _factory;
  }

  /**
   * @dev Allows owner to add tokens to whitelist
   * @param tokens array of ERC20 tokens. Max array length is 40
   */
  function addToWhiteList(IERC20[] calldata tokens) public onlyOwner {
    require(tokens.length <= 40, 'PurrNFT: Too many tokens provided');
    for (uint8 i = 0; i < tokens.length; i++) {
      IERC20 newToken = tokens[i];
      // check if address is already in the whitelist
      if (isAccepted[newToken]) continue;
      // check if address is really a token
      require(
        newToken.totalSupply() > 0,
        'PurrNFT: provide only deployed tokens'
      );
      isAccepted[newToken] = true;
      whiteList.push(Accepted({token: newToken, balance: 0}));
      emit AddToWhiteList(newToken);
    }
  }

  /**
   * @dev Allows owner to set a new NFT price
   * @param _price new NFT price in ERC20 whitelisted tokens
   */
  function setPrice(uint256 _price) public onlyOwner {
    price = _price;
  }

  /**
   * @dev Allows owner to withdraw all ERC20 tokens payed for NFTs
   */
  function withdrawAll(address to) public onlyOwner {
    uint256 totalWithdrawn;
    for (uint256 i = 0; i < whiteList.length; i++) {
      Accepted storage accepted = whiteList[i];
      uint256 balance = accepted.balance;
      if (balance == 0) continue;
      totalWithdrawn += balance;
      accepted.balance = 0;
      accepted.token.transfer(to, balance);
    }
    emit Withdrawal(totalWithdrawn);
  }

  /**
   * @dev Allows any user to buy NFT through a smart wallet.
   */
  function buy() external onlySmartWallet {
    require(
      whiteList.length > 0,
      'PurrNFT: WhiteList is empty. Cannot mint NTFs'
    );
    // transfer `price` from every whitelisted token
    for (uint256 i = 0; i < whiteList.length; i++) {
      Accepted storage accepted = whiteList[i];
      // request transfer approval from the smart wallet
      require(
        SmartWallet(msg.sender).approve(accepted.token, price),
        'PurrNFT: approval declined'
      );
      require(
        accepted.token.transferFrom(msg.sender, address(this), price),
        'PurrNFT: Cannot transfer tokens'
      );
      accepted.balance += price;
    }
    // mint NFT
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(SmartWallet(msg.sender).owner(), tokenId);
  }

  fallback() external {
    revert('PurrNFT: unknown function call');
  }

  receive() external payable {
    revert('PurrNFT: I receive payments in whitelisted ERC20 tokens only');
  }
}
