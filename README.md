# taraxa-platform

Monorepo containing all the repositories that build up the Taraxa Community site.

## Getting started

The structure of the monorepo is the following:

- Under `packages` you can find all the in-house developed modules used in the different consumer-facing services.
- Under `services` you can find a subfolder for all services being developed for the community site.
- `package.json` and `docker-compose.yml` are your starter places to check out all the commands you can run from root.

### Services

To run all services locally, please execute `yarn && yarn start:platform`. Subsequently, if you want to run in docker, just run `docker-compose up` from root.

#### Claim Backend

The claim backend takes care of everything claim related.
To run only the claim backend either use `yarn claim-start` for development mode or `yarn claim-build` and `yarn claim-start:prod` for production mode.

#### Delegation Backend

The delegation backend takes care of everything related to delegating.
To run only the claim backend either use `yarn delegation-start` for development mode or `yarn delegation-build` and `yarn delegation-start:prod` for production mode.

#### Community Site

The community site is the interaction medium for users, a simple react app that uses the prebuilt reusable components from the `taraxa-ui`.
To run only the community site either use `yarn watch:community` for development mode(it tracks changes in the taraxa-ui compoents and enables hot-reloading too) or `yarn community-build` and `yarn community-start:prod` for production mode.

#### Code management

Linting and code formatting is taken care of by a `husky pre-commit` hook, but in case you want to manually format, you can do so by `yarn lint` and `yarn format`.

#### Environment configuration

Each subsequent service module has it's own `dotenv config files` to inject the running configuration as
well as a central `.env.compose` for the compose script.
