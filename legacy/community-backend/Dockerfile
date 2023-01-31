FROM node:14
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY legacy/community-backend/package.json legacy/community-backend/yarn.lock /app/

RUN yarn install --frozen-lockfile \
    && yarn cache clean

COPY legacy/community-backend /app
RUN yarn build
ENV NODE_ENV=production
EXPOSE 1337
CMD [ "yarn", "start" ]
