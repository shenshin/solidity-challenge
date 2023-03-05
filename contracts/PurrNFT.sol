// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import './SmartWalletFactory.sol';
import './SmartWallet.sol';

contract PurrNFT is ERC721, Ownable, ReentrancyGuard {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;

  event AddToWhiteList(IERC20 indexed token);
  event PriceSet(uint256 indexed newPrice);

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
   * @param newPrice new NFT price in ERC20 whitelisted tokens
   */
  function setPrice(uint256 newPrice) public onlyOwner {
    price = newPrice;
    emit PriceSet(newPrice);
  }

  event TransferFailed(uint256 amount, address to);
  /**
   * @dev Allows owner to withdraw all ERC20 tokens payed for NFTs
   */
  function withdrawAll(address to) public onlyOwner nonReentrant {
    for (uint256 i = 0; i < whiteList.length; i++) {
      Accepted storage accepted = whiteList[i];
      uint256 balance = accepted.balance;
      if (balance == 0) continue;
      accepted.balance = 0;
      try accepted.token.transfer(to, balance) {
        
      } catch  {
        emit TransferFailed(balance, to);
      }
      /* require(
        accepted.token.transfer(to, balance),
        'PurrNFT: Cannot transfer tokens'
      ); */
    }
  }

  /**
   * @dev Allows any user to buy NFT through a smart wallet.
   */
  function buy() external onlySmartWallet nonReentrant {
    require(
      whiteList.length > 0,
      'PurrNFT: WhiteList is empty. Cannot mint NTFs'
    );
    // transfer `price` from every whitelisted token
    for (uint256 i = 0; i < whiteList.length; i++) {
      Accepted storage accepted = whiteList[i];
      accepted.balance += price;
      require(
        accepted.token.transferFrom(msg.sender, address(this), price),
        'PurrNFT: Cannot transfer tokens'
      );
    }
    // mint NFT
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(SmartWallet(msg.sender).owner(), tokenId);
  }

  fallback() external {
    revert('PurrNFT: unknown function call');
  }
}
