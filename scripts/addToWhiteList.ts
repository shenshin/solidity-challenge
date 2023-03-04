import { ethers } from 'hardhat';
import { deployments } from '../deployments';

async function main() {
  const purrNft = await ethers.getContractAt(
    'PurrNFT',
    deployments.purrNft.toLowerCase(),
  );
  const tokenAddresses: string[] = deployments.erc20.map((t) =>
    t.address.toLowerCase(),
  );
  const tx = await purrNft.addToWhiteList(tokenAddresses);
  const receipt = await tx.wait();
  console.log(`White list was updated. Tx hash: ${receipt.transactionHash}`);
  await Promise.all(
    deployments.erc20.map(async (token) => {
      console.log(`
    token owner: ${token.owner}
    address: ${token.address}
    whitelisted: ${await purrNft.isAccepted(token.address.toLowerCase())}
    `);
    }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
