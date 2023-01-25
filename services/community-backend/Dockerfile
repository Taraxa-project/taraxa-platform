FROM node:12.20
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build
ENV NODE_ENV=production
EXPOSE 1337
CMD [ "yarn", "start" ]
