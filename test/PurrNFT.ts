import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { MeowToken, PurrNFT } from '../typechain-types';

describe('Purr NFT', () => {
  let meow: MeowToken;
  let purr: PurrNFT;

  async function deploy(): Promise<[MeowToken, PurrNFT]> {
    const [owner, otherAccount] = await ethers.getSigners();

    const MeowFactory = await ethers.getContractFactory('MeowToken');
    const meowToken = await MeowFactory.deploy('10000');
    await meowToken.deployed();

    const PurrFactory = await ethers.getContractFactory('PurrNFT');
    const purrNFT = await PurrFactory.deploy();
    await purrNFT.deployed();

    return [meowToken, purrNFT];
  }

  before(async () => {
    [meow, purr] = await deploy();
  });

  it('Should whitelist MEO token in PurrNFT', async () => {
    const tx = await purr.addToWhiteListBatch([meow.address]);
    await expect(tx).to.emit(purr, 'WhiteListed').withArgs(meow.address);
  });

  it('should not whitelist any tokens with empty array', async () => {
    const tx = await purr.addToWhiteListBatch([]);
    await expect(tx).not.to.emit(purr, 'WhiteListed');
  });

  it('should not whitelist token second time', async () => {
    const tx = await purr.addToWhiteListBatch([meow.address]);
    await expect(tx).not.to.emit(purr, 'WhiteListed');
  });

  // I am allowing to whitelist any addresses without verification
  // It still won't be possible to buy anything with them
  it('should let whitelist non-ERC20 addresses', async () => {
    const [owner] = await ethers.getSigners();
    const tx = await purr.addToWhiteListBatch([owner.address]);
    await expect(tx).to.emit(purr, 'WhiteListed');
  });

  it('should not be able to buy NFT without approval', async () => {
    const tx = purr.buy(meow.address);
    await expect(tx).to.be.revertedWith('ERC20: insufficient allowance');
  });

  it('buyer should approve Meow transfers for Purr', async () => {
    const [owner] = await ethers.getSigners();
    const tx = meow.approve(purr.address, 1);
    await expect(tx)
      .to.emit(meow, 'Approval')
      .withArgs(owner.address, purr.address, 1);
  });

  it('user should NOT be able to buy NFT with non-ERC20 address', async () => {
    const [owner] = await ethers.getSigners();
    const tx = purr.buy(owner.address);
    await expect(tx).to.be.reverted;
  });

  it('user should buy NFT', async () => {
    const [owner] = await ethers.getSigners();
    const tx = purr.buy(meow.address);
    const tokenId = 0;
    await expect(tx)
      .to.emit(purr, 'Transfer')
      .withArgs(ethers.constants.AddressZero, owner.address, tokenId);
  });

  it('owner should be able to withdraw Meow tokens', async () => {
    const [owner] = await ethers.getSigners();
    const tx = purr.withdrawAll(owner.address);
    await expect(() => tx).to.changeTokenBalances(meow, [owner, purr], [1, -1]);
    await expect(tx).to.emit(purr, 'Withdrawal').withArgs(1);
  });
});
