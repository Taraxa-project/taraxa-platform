# Taraxa Claim Admin Service

## Description

The Claim application allows users from our community to claim TARA tokens they got by participating in public sales or by submitting bounties on our community site.

The main part of the application is a [smart contract](https://github.com/Taraxa-project/tara-erc20/blob/main/contracts/Claim.sol) that's currently deployed to the Ethereum network but, in the future, this contract will also be deployed on the Taraxa network.

The smart contract has an allowance from one of our *addresses(1)* to spend TARA tokens.

A user, with the help of our frontend application, will call this contract with some valid values and a signature from one of our private *accounts(2)*.

After the user sends the transaction to the blockchain, a method in the [backend app](https://github.com/Taraxa-project/taraxa-claim-backend) checks if the claim was succesful and marks it in the database.

The backend app is also responsible for managing the *rewards* that users get. With the help of another frontend app, the admin panel (this app), users and their rewards are added to the database.

The interaction between the apps looks something like this:

Admin app (this) *--adds data-->* Backend App *--reads data-->* Frontend App


Notes:

- *addresses(1) - TARA Wallet Address - Internal wallet that holds TARA Tokens*

- *addresses(2) - TARA private Signing Wallet - Internal wallet that we use to generate the signatures for the Claim smart contract*

## Installation

```bash
$ yarn
```

## Running the app

```bash
# development
$ yarn run start

# build
$ yarn run build
```

