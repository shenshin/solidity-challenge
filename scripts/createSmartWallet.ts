import { ethers } from 'hardhat';

const swFactoryAddress = '0x784a5a87F4F0bF107B6eE815a5840D7Afc964480';

async function main() {
  const smartWalletFactory = await ethers.getContractAt(
    'SmartWalletFactory',
    swFactoryAddress.toLowerCase(),
  );
  const tx = await smartWalletFactory.createSmartWallet();
  const receipt = await tx.wait();
  const event = receipt.events?.find(
    (event) => event.event === 'SmartWalletCreated',
  );
  console.log(`SmartWallet was deployed at ${event?.args?.wallet}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
