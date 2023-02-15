<p align="center">
  <a href="http://taraxa.io/" target="blank"><img src="https://taraxa.io/static/taraxa_io/img/taraxa_logo_transparent_dark_bg.png" width="200" alt="Taraxa Logo" /></a>
</p>

  <p align="center">Built with Nest.Js: A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~taraxa_project" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~taraxa_project" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://circleci.com/gh/Taraxa-project/taraxa-platform" target="_blank"><img src="https://img.shields.io/circleci/build/github/Taraxa-project/taraxa-platform/main" alt="CircleCI" /></a>
<a href="https://discord.gg/Sqf9MHD2" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://github.com/Taraxa-project" target="_blank"><img src="https://img.shields.io/github/followers/Taraxa-project?style=social" alt="GitHub Followers" /></a>
  <a href="https://twitter.com/taraxa_project" target="_blank"><img src="https://img.shields.io/twitter/follow/taraxa_project?style=social"></a>
</p>

## Description

Explorer indexer service built using queueing mechanisms. Fetches data from the [Taraxa Node](https://github.com/Taraxa-project/taraxa-node)'s GraphQL endpoints and subscribes to its RPCWs `eth_subscribe` methods.

## Module structure

### Patterns

The application consists of seven modules:

- Connector
- DAG
- Health
- Historical Sync
- Live Sync
- PBFT
- Transaction

#### Services

Each module follows the service pattern: in each of them you'll find a service class that holds the business necessary to complete the target flows.

#### Producers

In modules that implement queueing you'll find producers. Producers are tasked with populating the queues with jobs using the relevant services.

#### Consumers

In the same modules you'll find consumers that fullfill jobs from their target queues via executing service methods in the right circumstances and order. **Note**: **Certain consumers can be producers too**.

## Prerequisites

- Redis.
- Postgres.
- A defined connection to a Taraxa Node.

## Configuring the indexer's behaviour

The indexer can we started in three modes: `producer`, `block-consumer` or `transaction-consumer` mode. To enable/disable different modes you need to set set the `ENABLE_PRODUCER_MODULE` and `ENABLE_TRANSACTION_CONSUMER` env var to `true` or `false`. An example environment setup can be seen at [.env.example](./.env.example).

### Producer mode

In producer mode the indexer runs both the [Historical Sync](https://github.com/Taraxa-project/taraxa-platform/blob/4084eb3670ca1bd3b03f5d911d71441961bb7e4b/services/explorer-indexer/src/modules/historical-sync) as well as subscribes to [Live Sync](https://github.com/Taraxa-project/taraxa-platform/blob/4084eb3670ca1bd3b03f5d911d71441961bb7e4b/services/explorer-indexer/src/modules/live-sync) messages and pushes the relevant information into the configured Redis queue.

Diagrams and detailed description available under the [Producer Documentation](./docs/producer.md).

### Block-consumer mode

In block consuming node the indexer only consumes the Redis queue entries and saves stale PBFT and DAG blocks in the configured POSTGREs database. This process fills the transaction queue.

Diagrams and detailed description available under the [Block consumer Documentation](./docs/block-consumer.md).

### Transaction-consumer mode

In transaction consuming node the indexer only consumes the Redis queue entries of the `configured transactions queue` and saves transaction data in the configured POSTGREs database.

Diagrams and detailed description available under the [Transactio consumer Documentation](./docs/transaction-consumer.md).

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start:dev

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```
