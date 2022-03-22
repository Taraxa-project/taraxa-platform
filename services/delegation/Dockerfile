# build environment
FROM node:14-alpine as build

RUN apk --no-cache add --update python3 make g++\
    --virtual .build_deps \
    build-base

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json yarn.lock ./

COPY package.json yarn.lock /app/
COPY services/delegation/package.json /app/services/delegation/

RUN yarn install --frozen-lockfile \
    && yarn cache clean

COPY . /app
RUN yarn run delegation-build

FROM node:14-alpine AS release

WORKDIR /app

RUN touch .env

COPY package.json /app/package.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/services/delegation/package.json /app/services/delegation/
COPY --from=build /app/services/delegation/node_modules /app/services/delegation/node_modules
COPY --from=build /app/services/delegation/dist /app/services/delegation/dist

CMD [ "yarn", "run", "delegation-start:prod"]