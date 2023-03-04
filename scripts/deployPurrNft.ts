import { ethers } from 'hardhat';

async function main() {
  const SwfFactory = await ethers.getContractFactory('SmartWalletFactory');
  const swf = await SwfFactory.deploy();
  await swf.deployed();
  console.log(`SmartWallet Factory was deployed to ${swf.address}`);

  const PurrFactory = await ethers.getContractFactory('PurrNFT');
  const purrNFT = await PurrFactory.deploy(swf.address);
  await purrNFT.deployed();
  console.log(`PurrNFT was deployed to ${purrNFT.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
