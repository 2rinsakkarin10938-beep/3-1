# Deployment

## ปัญหาที่เจอ

error `no configuration file provided: not found` เกิดจาก workflow เรียก `docker compose` แต่ใน repo ยังไม่มี `docker-compose.yml`

ตอนนี้แก้แล้วโดยเพิ่ม:
- `docker-compose.yml`
- `deploy/Caddyfile`
- `deploy/web.Dockerfile`
- `deploy/server.Dockerfile`

## Stack

### web

- ใช้ Caddy
- serve static frontend
- terminate TLS ให้อัตโนมัติเมื่อ domain ชี้มาถูกต้อง
- reverse proxy `/api/*` และ `/ws/*` ไป service `server`

### server

- ใช้ Bun + ElysiaJS
- ฟังที่ `0.0.0.0:3000`

## สิ่งที่ต้องมีบน VPS

- Docker และ Docker Compose
- port `80` และ `443` เปิด
- DNS `gamev1.apichart.dev` ชี้มาที่เครื่อง

## Workflow Runtime Assumptions

workflow ที่ `.github/workflows/deploy.yml` จะ:
1. clone/pull repo ไปที่ `~/gamev1`
2. export `PROJECT_NAME` และ `APP_DOMAIN`
3. run `docker compose build --no-cache`
4. run `docker compose up -d`

## Verification หลัง deploy

เช็กอย่างน้อย:
- `https://gamev1.apichart.dev`
- `https://gamev1.apichart.dev/health`
- `docker compose ps`
- `docker compose logs -f`

## ถ้า deploy ยังไม่ขึ้น

ตรวจตามลำดับนี้:
1. DNS ชี้ IP ถูกหรือยัง
2. firewall เปิด `80/443` หรือยัง
3. Caddy ขอ certificate สำเร็จหรือไม่
4. container `server` ขึ้นหรือ crash
5. `CORS_ORIGIN` ตรงกับ domain หรือไม่
