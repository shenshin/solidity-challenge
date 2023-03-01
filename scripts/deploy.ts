import { ethers } from 'hardhat';

async function main() {
  const MeowFactory = await ethers.getContractFactory('MeowToken');
  const meow = await MeowFactory.deploy(10000);
  await meow.deployed();
  console.log(`Meow was deployed to ${meow.address}`);
  const PurrFactory = await ethers.getContractFactory('PurrNFT');
  const purr = await PurrFactory.deploy();
  await purr.deployed();
  console.log(`PurrNFT was deployed to ${purr.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
