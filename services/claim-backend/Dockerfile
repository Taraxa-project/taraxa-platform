FROM node:16.10.0-alpine AS build

RUN apk --no-cache add --update \
    --virtual python git build-base

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json yarn.lock ./
COPY services/claim-backend/package.json /app/services/claim-backend/

RUN yarn install --frozen-lockfile \
    && yarn cache clean

COPY . /app
RUN yarn workspace @taraxa_project/taraxa-claim-backend build

# Production image
# Make sure you always lock to the correct sha256
# Failure to do this might result in using a different image
# Tags are not 100% reliable

FROM node:16.10.0-alpine AS release

WORKDIR /app

RUN touch .env

COPY package.json /app/package.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/services/claim-backend/package.json /app/services/claim-backend/
COPY --from=build /app/services/claim-backend/node_modules /app/services/claim-backend/node_modules
COPY --from=build /app/services/claim-backend/dist /app/services/claim-backend/dist

CMD ["yarn", "workspace", "@taraxa_project/taraxa-claim-backend", "start"]