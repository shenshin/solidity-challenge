// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PurrNFT is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct Token {
        bool whiteListed;
        uint256 balance;
    }
    event Withdrawal(uint256 totalAmout);
    event WhiteListed(IERC20 token);
    // allows to find out if a token is in the white list
    mapping(IERC20 => Token) public whiteList;
    // stores all whitelisted tokens to be able to iterate through all of them and withdraw
    IERC20[] private whiteListTokens;

    uint256 public price = 1;

    constructor() ERC721("PurrNFT", "PUR") {}

    /**
     * @dev Allows the owner to add tokens to the whitelist
     * @param tokens array of ERC20 tokens. Max array length is 40
     */
    function addToWhiteListBatch(IERC20[] calldata tokens) external onlyOwner {
        require(tokens.length <= 40, "PurrNFT: Too many tokens provided");
        for (uint8 i = 0; i < tokens.length; i++) {
            // skip if token is already in the list
            if (whiteList[tokens[i]].whiteListed) continue;
            whiteList[tokens[i]].whiteListed = true;
            whiteListTokens.push(tokens[i]);
            emit WhiteListed(tokens[i]);
        }
    }

    /**
     * @dev Allows the owner to set a new NFT price
     * @param _price new NFT price in ERC20 whitelisted tokens
     */
    function setPrice(uint256 _price) external onlyOwner {
        price = _price;
    }

    /**
     * @dev Allows the owner to withdraw all ERC20 tokens payed for NFTs
     */
    function withdrawAll() external onlyOwner {
        uint256 totalWithdrawn;
        for (uint256 i = 0; i < whiteListTokens.length; i++) {
            IERC20 token = whiteListTokens[i];
            Token storage tokenData = whiteList[token];
            // go to the next token if no NFTs were purchased with the current
            if (tokenData.balance == 0) continue;
            bool transferSucceeded = token.transfer(owner(), tokenData.balance);
            // I don't care if the transfer failed. Go to the next token
            if (!transferSucceeded) continue;
            totalWithdrawn += tokenData.balance;
            tokenData.balance = 0;
        }
        emit Withdrawal(totalWithdrawn);
    }

    /**
     * @dev Allows any user to buy NFT for ERC20 tokens from the whitelist.
     * NFT price can be read from `price()` getter
     * @param _token whitelisted ERC20 token owned by a user. User has to
     * set allowance for the NFT s/c to transfer his tokens
     */
    function buy(IERC20 _token) external {
        Token storage token = whiteList[_token];
        // check if token is in the white list
        require(token.whiteListed, "PurrNFT: Unknown token");
        // transfer tokens
        bool transferSucceeded = _token.transferFrom(
            msg.sender,
            address(this),
            price
        );
        require(transferSucceeded, "PurrNFT: Cannot transfer tokens");
        // mint NFT
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        // record balances
        token.balance += price;
    }

    fallback() external {
        revert("PurrNFT: unknown function call");
    }
}
