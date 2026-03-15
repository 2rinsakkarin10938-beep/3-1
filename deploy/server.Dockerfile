FROM oven/bun:1 AS deps

WORKDIR /app/server
COPY server/package.json ./
RUN bun install

FROM oven/bun:1

WORKDIR /app/server
COPY --from=deps /app/server/node_modules ./node_modules
COPY server/package.json ./package.json
COPY server/server.js ./server.js

EXPOSE 3000

CMD ["bun", "run", "start"]
