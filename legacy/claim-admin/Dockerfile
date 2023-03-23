# build environment
FROM node:14 as build

# Default replace vars for entrypoint
# Should be removed after we able to configure at runtime
ARG REACT_APP_BASE_URL=REACT_APP_BASE_URL_STRING_REPLACE

WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn install
COPY . /app
RUN yarn build

# nginx
FROM nginx:1.18-alpine

COPY docker-files/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-files/entrypoint.sh /entrypoint.sh

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
