FROM node:14
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json yarn.lock /app/
COPY services/community-backend/package.json /app/services/community-backend/

RUN yarn install

COPY . /app
RUN yarn workspace @taraxa_project/taraxa-community-backend build
ENV NODE_ENV=production
EXPOSE 1337
CMD [ "yarn", "start" ]
