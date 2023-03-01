import { ethers } from 'hardhat';

async function main() {
  const MeowFactory = await ethers.getContractFactory('MeowToken');
  const meow = await MeowFactory.deploy(10000);
  await meow.deployed();
  console.log(`Meow was deployed to ${meow.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
