FROM node:16.10.0-alpine AS build

RUN apk --no-cache add --update \
    python3 git build-base

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json yarn.lock ./
COPY services/faucet/package.json /app/services/faucet/

COPY package.json yarn.lock /app/
COPY services/faucet/package.json /app/services/faucet/

RUN yarn install --frozen-lockfile \
    && yarn cache clean

COPY . /app
RUN yarn workspace @taraxa_project/faucet build

# Production image
# Make sure you always lock to the correct sha256
# Failure to do this might result in using a different image
# Tags are not 100% reliable

FROM node:16.10.0-alpine AS release

WORKDIR /app

RUN touch .env

COPY package.json /app/package.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/services/faucet/package.json /app/services/faucet/
COPY --from=build /app/services/faucet/node_modules /app/services/faucet/node_modules
COPY --from=build /app/services/faucet/dist /app/services/faucet/dist

CMD ["yarn", "workspace", "@taraxa_project/faucet", "start:prod"]
