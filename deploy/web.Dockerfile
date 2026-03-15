FROM caddy:2.10-alpine

COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY *.html /usr/share/caddy/
COPY css /usr/share/caddy/css
COPY js /usr/share/caddy/js
COPY maps /usr/share/caddy/maps
COPY assets /usr/share/caddy/assets
