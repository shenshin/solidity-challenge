import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { MeowToken, PurrNFT, ERC20 } from '../typechain-types';

describe('Purr NFT', () => {
  let meow1: ERC20;
  let meow2: ERC20;
  let meow3: ERC20;
  let purr: PurrNFT;

  async function deploy(): Promise<[ERC20, ERC20, ERC20, PurrNFT]> {
    const [owner1, owner2, owner3] = await ethers.getSigners();

    const MeowFactory = await ethers.getContractFactory('MeowToken');
    const initialSupply = '10000';
    // 3 team mates deploy 3 ERC20 tokens
    const meowToken1: ERC20 = await MeowFactory.connect(owner1).deploy(
      initialSupply,
    );
    await meowToken1.deployed();
    const meowToken2: ERC20 = await MeowFactory.connect(owner2).deploy(
      initialSupply,
    );
    await meowToken2.deployed();
    const meowToken3: ERC20 = await MeowFactory.connect(owner3).deploy(
      initialSupply,
    );
    await meowToken3.deployed();

    const PurrFactory = await ethers.getContractFactory('PurrNFT');
    const purrNFT = await PurrFactory.deploy();
    await purrNFT.deployed();

    return [meowToken1, meowToken2, meowToken3, purrNFT];
  }

  before(async () => {
    [meow1, meow2, meow3, purr] = await deploy();
  });

  it('Should whitelist MEO tokens in PurrNFT', async () => {
    const tx = await purr.addToWhiteList([
      meow1.address,
      meow2.address,
      meow3.address,
    ]);
    await expect(tx).to.emit(purr, 'AddToWhiteList').withArgs(meow1.address);
    await expect(tx).to.emit(purr, 'AddToWhiteList').withArgs(meow2.address);
    await expect(tx).to.emit(purr, 'AddToWhiteList').withArgs(meow3.address);
  });

  it('Added tokens should be in the whitelist', async () => {
    expect(await purr.isAccepted(meow1.address)).to.be.true;
    expect(await purr.isAccepted(meow2.address)).to.be.true;
    expect(await purr.isAccepted(meow3.address)).to.be.true;
  });

  it('should not whitelist token second time', async () => {
    const tx = await purr.addToWhiteList([meow1.address]);
    await expect(tx).not.to.emit(purr, 'AddToWhiteList');
  });

  it('should not let whitelist non-ERC20 addresses', async () => {
    const [owner] = await ethers.getSigners();
    const tx = purr.addToWhiteList([owner.address]);
    await expect(tx).to.be.reverted;
  });

  it('team mates should exchange their tokens', async () => {
    const [owner1, owner2, owner3] = await ethers.getSigners();
    const tokensToSend = 10;
    const tx1 = await meow2
      .connect(owner2)
      .transfer(owner1.address, tokensToSend);
    await tx1.wait();
    const tx2 = await meow3
      .connect(owner3)
      .transfer(owner1.address, tokensToSend);
    await tx2.wait();
  });

  it('owner1 should now own all tokens', async () => {
    const [owner] = await ethers.getSigners();
    await Promise.all(
      [meow1, meow2, meow3].map(async (token: ERC20) => {
        expect(await token.balanceOf(owner.address)).to.be.greaterThanOrEqual(
          10,
        );
      }),
    );
  });

  it('should not be able to buy NFT without approval', async () => {
    await expect(purr.buy()).to.be.revertedWith(
      'ERC20: insufficient allowance',
    );
  });

  it('buyer should approve Meow transfers for Purr', async () => {
    const [owner] = await ethers.getSigners();
    await Promise.all(
      [meow1, meow2, meow3].map(async (token: ERC20) => {
        const tx = token.connect(owner).approve(purr.address, 1);
        await expect(tx)
          .to.emit(token, 'Approval')
          .withArgs(owner.address, purr.address, 1);
      }),
    );
  });

  it('owner1 should buy NFT', async () => {
    const [owner] = await ethers.getSigners();
    const tx = purr.connect(owner).buy();
    const tokenId = 0;
    await expect(tx)
      .to.emit(purr, 'Transfer')
      .withArgs(ethers.constants.AddressZero, owner.address, tokenId);
  });

  it('owner should be able to withdraw Meow tokens', async () => {
    const [owner] = await ethers.getSigners();
    const tx = purr.withdrawAll(owner.address);
    await Promise.all(
      [meow1, meow2, meow3].map(async (token: ERC20) => {
        await expect(() => tx).to.changeTokenBalances(
          token,
          [owner, purr],
          [1, -1],
        );
      }),
    );
    await expect(tx).to.emit(purr, 'Withdrawal').withArgs(3);
  });

  it('should not withdraw second time', async () => {
    const [owner] = await ethers.getSigners();
    const tx = purr.withdrawAll(owner.address);
    await Promise.all(
      [meow1, meow2, meow3].map(async (token: ERC20) => {
        await expect(() => tx).to.changeTokenBalances(
          token,
          [owner, purr],
          [0, 0],
        );
      }),
    );
    await expect(tx).to.emit(purr, 'Withdrawal').withArgs(0);
  });
});
