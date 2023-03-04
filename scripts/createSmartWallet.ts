import { ethers } from 'hardhat';
import { deployments } from '../deployments';

async function main() {
  const smartWalletFactory = await ethers.getContractAt(
    'SmartWalletFactory',
    deployments.smartWalletFactory.toLowerCase(),
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
