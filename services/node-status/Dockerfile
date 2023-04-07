FROM node:16-slim

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV SKIP_PREFLIGHT_CHECK true

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json yarn.lock /app/
COPY packages/taraxa-ui/package.json /app/packages/taraxa-ui/
COPY services/node-status/package.json /app/services/node-status/

RUN yarn install

COPY tsconfig.json /app/

COPY packages/taraxa-ui /app/packages/taraxa-ui
COPY services/node-status /app/services/node-status

RUN SKIP_PREFLIGHT_CHECK=true yarn workspace @taraxa_project/taraxa-ui build
RUN SKIP_PREFLIGHT_CHECK=true yarn workspace @taraxa_project/taraxa-node-status build

CMD ["yarn", "workspace", "@taraxa_project/taraxa-node-status", "start"]