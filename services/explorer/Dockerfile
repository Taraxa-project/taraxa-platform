# build environment
FROM node:16-alpine as build

RUN apk --no-cache add --update python3 make g++\
    --virtual .build_deps \
    build-base

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json yarn.lock /app/
COPY services/explorer/package.json /app/services/explorer/
COPY packages/taraxa-ui/package.json /app/packages/taraxa-ui/

RUN yarn install

COPY . /app
RUN SKIP_PREFLIGHT_CHECK=true yarn workspace @taraxa_project/taraxa-ui build
RUN SKIP_PREFLIGHT_CHECK=true yarn workspace @taraxa_project/explorer build

# nginx
FROM nginx:1.18-alpine

COPY services/explorer/docker-files/nginx.conf /etc/nginx/conf.d/default.conf
COPY services/explorer/docker-files/entrypoint.sh /entrypoint.sh

COPY --from=build /app/services/explorer/build /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
