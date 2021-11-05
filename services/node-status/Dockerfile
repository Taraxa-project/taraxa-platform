FROM node:14-slim

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV SKIP_PREFLIGHT_CHECK true

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json yarn.lock /app/
COPY services/node-status/package.json /app/services/node-status/
COPY packages/taraxa-ui/package.json /app/packages/taraxa-ui/

RUN yarn install

COPY . /app

RUN yarn workspace @taraxa_project/taraxa-ui build
RUN yarn workspace @taraxa_project/taraxa-node-status build

CMD ["yarn", "workspace", "@taraxa_project/taraxa-node-status", "start"]