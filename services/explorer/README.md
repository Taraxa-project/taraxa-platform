# Getting started with Exploring Taraxa

<p align="center">
  <a href="http://taraxa.io/" target="blank"><img src="https://taraxa.io/static/taraxa_io/img/taraxa_logo_transparent_dark_bg.png" width="200" alt="Taraxa Logo" /></a>
</p>

<a href="https://www.npmjs.com/~taraxa_project" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~taraxa_project" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://circleci.com/gh/Taraxa-project/taraxa-platform" target="_blank"><img src="https://img.shields.io/circleci/build/github/Taraxa-project/taraxa-platform/main" alt="CircleCI" /></a>
<a href="https://discord.gg/Sqf9MHD2" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://github.com/Taraxa-project" target="_blank"><img src="https://img.shields.io/github/followers/Taraxa-project?style=social" alt="GitHub Followers" /></a>
<a href="https://twitter.com/taraxa_project" target="_blank"><img src="https://img.shields.io/twitter/follow/taraxa_project?style=social"></a>

The current version of the Explorer is an [`EIP-3091`](https://eips.ethereum.org/EIPS/eip-3091) compatible. To browse through our data take a look at the standard.

## Currently supported routes

- `block` to obtian both DAG and PBFT data.
- `block/[hash]` to obtain DAG data based on its hash.
- `dag` to obtain cumulative DAG data.
- `pbft/[indetifier]` where `[identifier]` can be either the `PBFT period` or its `hash` to obtain PBFT data(similar to ETH blocks).
- `tx` to obtain cumulative Transaction data.
- `tx/[hash]` to obtain Transaction data based on its hash.
- `address/[account]` to obtain address specific data based on its hash.
- `node` to access the nodes page.
- **Note**: Any other route reroutes to root.

## Dependencies

The Explorer is dependent on the following Taraxa specific packages:

- `@taraxa_project/explorer-shared` for types and interfaces + util methods.
- `@taraxa_project/taraxa-ui` for reusable components and styling.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
