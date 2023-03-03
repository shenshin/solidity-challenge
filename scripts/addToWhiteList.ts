import { ethers } from 'hardhat';
import { tokens } from '../erc20Deployments';

const purrNftAddress = '0x3C744E6F8173aba2CE0D46B4d1A3dFE0909f58e4';

async function main() {
  const purrNft = await ethers.getContractAt(
    'PurrNFT',
    purrNftAddress.toLowerCase(),
  );
  const tokenAddresses: string[] = tokens.map((t) => t.address.toLowerCase());
  const tx = await purrNft.addToWhiteList(tokenAddresses);
  const receipt = await tx.wait();
  console.log(`White list was updated. Tx hash: ${receipt.transactionHash}`);
  await Promise.all(
    tokens.map(async (token) => {
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
