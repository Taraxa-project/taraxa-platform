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

Explorer backend API serving the [Taraxa Explorer](https://github.com/Taraxa-project/taraxa-platform/tree/develop/services/explorer) with indexed data from the [Explorer Indexer](https://github.com/Taraxa-project/taraxa-platform/tree/develop/services/explorer-indexer).

## Routes

### Address

Main route: `/address/[hash]` where the hash is the public key of the address.

- GET `/stats` to retrieve the [`StatsReponse`](https://github.com/Taraxa-project/taraxa-platform/blob/4084eb3670ca1bd3b03f5d911d71441961bb7e4b/services/explorer-api/src/modules/address/responses/Stats.response.ts#L1) for the provided address.
- GET `/blocks` to retrieve the [`BlocksCount`](https://github.com/Taraxa-project/taraxa-platform/blob/4084eb3670ca1bd3b03f5d911d71441961bb7e4b/services/explorer-api/src/modules/address/responses/BlocksCount.response.ts#L1) for the provided address.
- GET `/dags` to retrieve the DAGs produced by the provided address.
- GET `/pbfts` to retrieve the PBFTs produced by the provided address.
- GET `/transactions` to retrieve the Transactions initiated by the provided address.
- GET `/details` to retrivei cumulative data about the address and its holdings: [`AddressDetails`](https://github.com/Taraxa-project/taraxa-platform/blob/4084eb3670ca1bd3b03f5d911d71441961bb7e4b/services/explorer-api/src/modules/address/responses/AddressDetails.response.ts#L1)

### Health

To obtain the service status of the `Explorer API` do a GET request to `/health`. This will return whether:

- The Database connection is alive.
- The storage used by the process is adequate.
- The Heap used by the process is adequate.
- The RSS memory used by the process is adequate.

### Node

To obtian the list of nodes currently known by the Explorer do a GEt request to `/nodes`.
**Note**: This returns a paginated response.

### PBFT

Main route: `/pbft`.

- GET `/total-this-week` to return the number of blocks produced this week.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
