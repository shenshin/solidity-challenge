import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import { mnemonic } from './.secret.json';

/* const accounts = {
  mnemonic,
  path: "m/44'/60'/0'/0",
}; */

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  networks: {
    hardhat: {
      // accounts,
    },
    rskmainnet: {
      chainId: 30,
      url: 'https://public-node.rsk.co/',
      // accounts,
    },
    rsktestnet: {
      chainId: 31,
      url: 'https://public-node.testnet.rsk.co/',
      // accounts,
    },
  },
};

export default config;
