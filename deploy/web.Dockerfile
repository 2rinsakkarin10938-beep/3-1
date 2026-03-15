FROM caddy:2.10-alpine

COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY index.html /usr/share/caddy/index.html
COPY css /usr/share/caddy/css
COPY js /usr/share/caddy/js
COPY maps /usr/share/caddy/maps

RUN mkdir -p /usr/share/caddy/assets
