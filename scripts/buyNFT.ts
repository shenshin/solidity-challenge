import { ethers } from 'hardhat';
import { deployments } from '../deployments';
import { SmartWallet } from '../typechain-types';

async function approveApplowance(smartWallet: SmartWallet) {
  const tx = await smartWallet.approveAll(
    deployments.purrNft,
    1,
    deployments.erc20.map((t) => t.address),
  );
  await tx.wait();
  console.log(`Allowance for PurrNFT was approved`);
}

async function buyNft(smartWallet: SmartWallet) {
  const tx = await smartWallet.buyNFT(deployments.purrNft.toLowerCase());
  const receipt = await tx.wait();
  console.log(receipt);
  const purrNFT = await ethers.getContractAt('PurrNFT', deployments.purrNft);
  const [owner] = await ethers.getSigners();
  const filter = purrNFT.filters.Transfer(
    ethers.constants.AddressZero,
    owner.address,
    null,
  );
  const [transfer] = await purrNFT.queryFilter(filter, receipt.blockHash);
  console.log(`Minted NFT with id ${transfer.args.tokenId}`);
}

async function main() {
  const smartWallet = await ethers.getContractAt(
    'SmartWallet',
    deployments.smartWallet.toLowerCase(),
  );
  await approveApplowance(smartWallet);
  await buyNft(smartWallet);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
