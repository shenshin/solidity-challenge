# Solidity challenge

We are going to create an NFT with a particular logic for the emission. The user willing to get
a new NFT will need to collect all the erc20 tokens created by each participant of this course
in a smart wallet.

The challenge has 4 modules basic modules
1. Each participant must create their own ERC20 token
  a. They can use the one already created in the course or create a new one. The
  contract cannot have any of the learnt security vulnerabilities*.
  b. They must deploy it to the RSK Testnet and verify the source code**. This will
  allow other participants to guess the answers by reading the source code
2. The group must create the NFT contract
  a. Allows an owner user to whitelist ERC20 tokens
  b. Any user can pay with one unit of each of all the whitelisted ERC20 tokens to
  get a unique NFT
  c. The owner can withdraw the paid tokens to any account
3. The group must deploy the solution in the testnet and whitelist all the tokens. They
will need to choose a participant as the owner.
4. Each participant must get all the tokens and create their NFT

* Some vulnerabilities can be discovered using static analysis tools like Slither. See here
how to run the checks in your repo.

** Verify the source code: after deploying the contract, in the RSK explorer find the tab code
in the contract view. Complete with the compiler info, for the source code submit a flattened