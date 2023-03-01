import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';

describe('Meow ERC20', () => {
  async function deploy() {
    const [owner, otherAccount] = await ethers.getSigners();

    const MeowFactory = await ethers.getContractFactory('MeowToken');
    const meow = await MeowFactory.deploy('10000');
    await meow.deployed();

    return { meow, owner, otherAccount };
  }

  it('Should mint initial supply', async function () {
    const { meow } = await loadFixture(deploy);
    const decimals: BigNumber = BigNumber.from('10').pow('18');
    expect(await meow.totalSupply()).to.equal(
      BigNumber.from('10000').mul(decimals),
    );
  });

  it('Should mint addition tokens', async function () {
    const { meow, owner } = await loadFixture(deploy);
    const tx = await meow.mint(owner.address, '2');
    await expect(tx)
      .to.emit(meow, 'Transfer')
      .withArgs(ethers.constants.AddressZero, owner.address, '2');
  });
});
