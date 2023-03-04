import { ethers } from 'hardhat';
import { deployments } from '../deployments';

async function main() {
  await Promise.all(
    deployments.erc20.map(async (token) => {
      const erc20 = await ethers.getContractAt(
        'ERC20',
        token.address.toLowerCase(),
      );
      const totalSupply = await erc20.totalSupply();
      console.log(`
      address: ${token.address}
      owner: ${token.owner}
      supply: ${totalSupply}

      `);
    }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
