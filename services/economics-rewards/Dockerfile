# build environment
FROM node:16.18.1-alpine as build

RUN apk --no-cache add --update python3 make g++\
    --virtual .build_deps \
    build-base

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json yarn.lock ./
COPY services/economics-rewards/package.json ./services/economics-rewards/

RUN yarn install --frozen-lockfile \
    && yarn cache clean

COPY services/economics-rewards ./services/economics-rewards
RUN yarn workspace @taraxa_project/economics-rewards build

FROM node:16.18.1-alpine AS release

WORKDIR /app

RUN touch .env

COPY package.json /app/package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/economics-rewards/package.json ./services/economics-rewards/
COPY --from=build /app/services/economics-rewards/node_modules ./services/economics-rewards/node_modules
COPY --from=build /app/services/economics-rewards/bin ./services/economics-rewards/bin

CMD [ "yarn", "workspace", "@taraxa_project/economics-rewards", "start:prod"]
