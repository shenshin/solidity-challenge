// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

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

  constructor() ERC721('PurrNFT', 'PUR') {}

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
   * @dev Allows any user to buy NFT for ERC20 tokens from the whitelist.
   */
  function buy() external {
    // transfer `price` from every whitelisted token
    for (uint256 i = 0; i < whiteList.length; i++) {
      Accepted storage accepted = whiteList[i];
      bool transferSucceeded = accepted.token.transferFrom(
        msg.sender,
        address(this),
        price
      );
      require(transferSucceeded, 'PurrNFT: Cannot transfer tokens');
      accepted.balance += price;
    }
    // mint NFT
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(msg.sender, tokenId);
  }

  fallback() external {
    revert('PurrNFT: unknown function call');
  }

  receive() external payable {
    revert('PurrNFT: I receive payments in whitelisted ERC20 tokens only');
  }
}
