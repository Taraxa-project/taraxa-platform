# build environment
FROM node:16.18.1-alpine as build

RUN apk --no-cache add --update python3 make g++\
    --virtual .build_deps \
    build-base

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json yarn.lock ./
COPY packages/explorer-shared/package.json ./packages/explorer-shared/
COPY services/explorer-indexer/package.json ./services/explorer-indexer/

RUN yarn install --frozen-lockfile \
    && yarn cache clean

COPY tsconfig.json ./
COPY .prettierignore ./
COPY .prettierrc.js ./
COPY .eslintignore ./
COPY .eslintrc.js ./
COPY packages/explorer-shared ./packages/explorer-shared
COPY services/explorer-indexer ./services/explorer-indexer

RUN yarn workspace @taraxa_project/explorer-shared build
RUN yarn workspace @taraxa_project/explorer-indexer build

FROM node:16.18.1-alpine AS release

WORKDIR /app

RUN touch .env

COPY package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/explorer-shared/package.json ./packages/explorer-shared/
COPY --from=build /app/packages/explorer-shared/node_modules ./packages/explorer-shared/node_modules
COPY --from=build /app/packages/explorer-shared/lib ./packages/explorer-shared/lib
COPY --from=build /app/services/explorer-indexer/package.json ./services/explorer-indexer/
COPY --from=build /app/services/explorer-indexer/node_modules ./services/explorer-indexer/node_modules
COPY --from=build /app/services/explorer-indexer/dist ./services/explorer-indexer/dist

CMD [ "yarn", "workspace", "@taraxa_project/explorer-indexer", "start:prod"]
