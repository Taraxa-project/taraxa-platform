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

Explorer indexer service built with event-driven architecture. Fetches data from the [Taraxa Node](https://github.com/Taraxa-project/taraxa-node)'s GraphQL endpoints and subscribes to its RPCWs `eth_subscribe` methods.

## Prerequisites

- Redis.
- Postgres.
- A defined connection to a Taraxa Node.

## Configuring the indexer's behaviour

The indexer can we started in two modes: `producer` or `worker mode`. To enable/disable producer mode via setting the `ENABLE_PRODUCER_MODULE` env var to `true` or `false`. An example environment setup can be seen at [.env.example](./.env.example).

### Producer mode

In producer mode the indexer runs both the [Historical Sync](https://github.com/Taraxa-project/taraxa-platform/blob/4084eb3670ca1bd3b03f5d911d71441961bb7e4b/services/explorer-indexer/src/modules/historical-sync) as well as subscribes to [Live Sync](https://github.com/Taraxa-project/taraxa-platform/blob/4084eb3670ca1bd3b03f5d911d71441961bb7e4b/services/explorer-indexer/src/modules/live-sync) messages and pushes the relevant information into the configured Redis queue. As this would be too low of a workload for a constantly running service it is also consuming them.

### Worker mode

In worker node the indexer only consumes the Redis queue entries and saves them in the configured POSTGREs database.

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

## Test

```bash
# unit tests
$ yarn test

# test coverage
$ yarn test:cov
```
