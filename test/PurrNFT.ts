import { expect } from 'chai';
import { ethers } from 'hardhat';
import {
  SmartWallet,
  SmartWalletFactory,
  PurrNFT,
  ERC20,
} from '../typechain-types';

describe('Purr NFT', () => {
  let meow1: ERC20;
  let meow2: ERC20;
  let meow3: ERC20;
  let purr: PurrNFT;
  let swFactory: SmartWalletFactory;
  let smartWallet: SmartWallet;

  async function deploy(): Promise<
    [ERC20, ERC20, ERC20, SmartWalletFactory, PurrNFT]
  > {
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

    const SwfFactory = await ethers.getContractFactory('SmartWalletFactory');
    const swf = await SwfFactory.deploy();
    await swf.deployed();

    const PurrFactory = await ethers.getContractFactory('PurrNFT');
    const purrNFT = await PurrFactory.deploy(swf.address);
    await purrNFT.deployed();

    return [meowToken1, meowToken2, meowToken3, swf, purrNFT];
  }

  before(async () => {
    [meow1, meow2, meow3, swFactory, purr] = await deploy();
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

  it('owner1 should create smart wallet', async () => {
    const tx = await swFactory.createSmartWallet();
    const rec = await tx.wait();
    const event = rec.events?.find(
      (event) => event.event === 'SmartWalletCreated',
    );
    smartWallet = await ethers.getContractAt(
      'SmartWallet',
      event?.args?.wallet,
    );
    expect(await swFactory.isSmartWallet(smartWallet.address)).to.be.true;
  });

  it('team mates should send tokens to the smart wallet', async () => {
    const [owner1, owner2, owner3] = await ethers.getSigners();
    const tokensToSend = 10;
    const tx1 = await meow1
      .connect(owner1)
      .transfer(smartWallet.address, tokensToSend);
    await expect(tx1).to.emit(meow1, 'Transfer');
    const tx2 = await meow2
      .connect(owner2)
      .transfer(smartWallet.address, tokensToSend);
    await expect(tx2).to.emit(meow2, 'Transfer');
    const tx3 = await meow3
      .connect(owner3)
      .transfer(smartWallet.address, tokensToSend);
    await expect(tx3).to.emit(meow3, 'Transfer');
  });

  it('smartwallet should now own every kind of tokens', async () => {
    await Promise.all(
      [meow1, meow2, meow3].map(async (token: ERC20) => {
        expect(await token.balanceOf(smartWallet.address)).to.be.equal(10);
      }),
    );
  });

  it('smart wallet should approve allowance for PurrNFT', async () => {
    const tx = smartWallet.approveAll(
      purr.address,
      1,
      [meow1, meow2, meow3].map((t) => t.address),
    );
    await expect(tx).to.emit(meow1, 'Approval');
    await expect(tx).to.emit(meow2, 'Approval');
    await expect(tx).to.emit(meow3, 'Approval');
  });

  it('owner1 should not be able to buy NFT directly', async () => {
    const [owner] = await ethers.getSigners();
    const tx = purr.connect(owner).buy();
    await expect(tx).to.be.reverted;
  });

  it('smart wallet should be able to buy NFT', async () => {
    const [owner] = await ethers.getSigners();
    const tx = await smartWallet.buyNFT(purr.address);
    const rec = await tx.wait();
    const filter = purr.filters.Transfer(
      ethers.constants.AddressZero,
      owner.address,
      null,
    );
    const [transfer] = await purr.queryFilter(filter, rec.blockHash);
    expect(transfer.args.tokenId).to.equal(0);
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
  });
});
