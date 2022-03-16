FROM node:15.9.0-alpine@sha256:cc297dd721c188677e2aa5cca41986b8ac4b3486b68adcda42b5ae6b3feaea75 AS build

ARG NODE_ENV=prod

RUN apk --no-cache add --update \
    --virtual .build_deps \
    build-base git python

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile \
    && yarn cache clean

COPY . ./
RUN ENV=prod yarn build

# Production image
# Make sure you always lock to the correct sha256
# Failure to do this might result in using a different image
# Tags are not 100% reliable

FROM node:15.9.0-alpine@sha256:cc297dd721c188677e2aa5cca41986b8ac4b3486b68adcda42b5ae6b3feaea75 AS release

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

RUN touch .env

COPY package.json /app/package.json
COPY --from=build /usr/src/app/node_modules /app/node_modules
COPY --from=build /usr/src/app/dist /app/dist

CMD [ "yarn", "start:prod" ]
