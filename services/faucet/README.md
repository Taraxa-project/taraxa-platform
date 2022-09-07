# Taraxa Explorer

The faucet drips 1,5,10 or 50 TARA tokens on the designed test network for each address.
In the initial implementation the delimiting period is one week for requests.

## Env var explanator

- `SERVER_PORT`: port of the process to be exposed at.
- `DB_HOST`: database host name. -`DB_PORT`: database port number.
- `DB_USER`: user to connect to the DB with.
- `DB_PASSWORD`: user PW.
- `DB_NAME`: DB name to connect to.
- `PROVIDER`: the chosen network's RPC URL. Can be WSS too.
- `ERC20_CONTRACT_ADDRESS`: the chosen token's address on the chosen network.
- `PRIVATE_SIGNING_KEY`: holder wallet privkey.
- `MAX_DRIP_PER_WEEK`: maximum drip per address per week.

Source of funds:

- _addresses(1) - TARA Wallet Address - Internal wallet that holds TARA Tokens_

- _addresses(2) - TARA private Signing Wallet - Internal wallet that we use to generate the signatures for the Claim smart contract_

## Security

The backend app stores the [private key](https://github.com/Taraxa-project/faucet/blob/main/.env.example#L9) for the signing wallet. This key is sensitive as anyone with access to the key can spend the TARA tokens destined to end up in tester's wallets. Currently we read it from an env var and that gets set in the Kubernetes cluster via a secret.

## Installation

```bash
yarn
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```
