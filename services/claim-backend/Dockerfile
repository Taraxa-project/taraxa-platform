FROM node:16.13.1-alpine@sha256:a7cab437ba7f3cd405cf6d6446a0e944aabd7d5c4573fc24f93ab85cbc0f0a70 AS build

ARG NODE_ENV=prod

RUN apk --no-cache add --update \
    --virtual python git build-base

WORKDIR /app

COPY package.json yarn.lock ./

COPY package.json yarn.lock /app/
COPY services/claim-backend/package.json /app/services/claim-backend/

RUN yarn install --frozen-lockfile \
    && yarn cache clean

COPY . ./
RUN yarn workspace @taraxa_project/taraxa-claim-backend build

# Production image
# Make sure you always lock to the correct sha256
# Failure to do this might result in using a different image
# Tags are not 100% reliable

FROM node:16.13.1-alpine@sha256:a7cab437ba7f3cd405cf6d6446a0e944aabd7d5c4573fc24f93ab85cbc0f0a70 AS release

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

RUN touch .env

COPY package.json /app/package.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/services/claim-backend/package.json /app/services/claim-backend/
COPY --from=build /app/services/claim-backend/node_modules /app/services/claim-backend/node_modules
COPY --from=build /app/services/claim-backend/dist /app/services/claim-backend/dist

CMD ["yarn", "workspace", "@taraxa_project/taraxa-claim-backend", "start"]
