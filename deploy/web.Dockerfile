FROM node:24-alpine AS build

WORKDIR /app

COPY package.json ./package.json
COPY vite.config.js ./vite.config.js
RUN npm install

COPY index.html ./index.html
COPY css ./css
COPY js ./js
COPY maps ./maps
COPY assets ./assets

RUN npm run build

FROM caddy:2.10-alpine

COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy
