// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';

contract MeowToken is ERC20, Ownable, ERC165 {
  constructor(uint256 initialSupply) ERC20('MeowToken', 'MEO') {
    _mint(msg.sender, initialSupply * 10 ** decimals());
  }

  function mint(address to, uint256 supply) external onlyOwner {
    _mint(to, supply);
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override returns (bool) {
    return
      interfaceId == type(IERC20).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  fallback() external {
    revert('MeowToken: unknown function call');
  }
}
