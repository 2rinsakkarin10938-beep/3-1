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

- ใช้ Caddy serve static multi-page frontend โดย copy source files ตรงเข้า image
- ไม่มี SPA fallback ไป `index.html`
- ฟังผ่าน HTTP ภายใน container
- reverse proxy `/api/*` และ `/ws/*` ไป service `server`

### server

- ใช้ Bun + ElysiaJS
- ฟังที่ `0.0.0.0:3000`

## สิ่งที่ต้องมีบน VPS

- Docker และ Docker Compose
- reverse proxy หลักบนเครื่อง เช่น Nginx/Caddy ที่รับ `80/443`
- DNS `gamev1.apichart.dev` ชี้มาที่เครื่อง

## Host Caddy Config

ถ้าเครื่องหลักใช้ Caddy ให้เพิ่ม site block นี้ใน `/etc/caddy/Caddyfile`

```caddyfile
gamev1.apichart.dev {
  encode zstd gzip
  reverse_proxy 127.0.0.1:8080
}
```

ตัวอย่างไฟล์อยู่ที่ `deploy/Caddyfile.host.example`

หลังแก้แล้วให้รัน:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## Workflow Runtime Assumptions

workflow ที่ `.github/workflows/deploy.yml` จะ:
1. clone/pull repo ไปที่ `~/gamev1`
2. export `PROJECT_NAME` และ `APP_DOMAIN`
3. bind หน้าเว็บไว้ที่ `127.0.0.1:8080`
4. run `docker compose up -d --build --force-recreate --remove-orphans`

## Verification หลัง deploy

เช็กอย่างน้อย:
- `https://gamev1.apichart.dev`
- `https://gamev1.apichart.dev/health`
- `curl http://127.0.0.1:8080/health`
- `docker compose ps`
- `docker compose logs -f`

## ถ้า deploy ยังไม่ขึ้น

ตรวจตามลำดับนี้:
1. DNS ชี้ IP ถูกหรือยัง
2. reverse proxy หลักชี้มาที่ `127.0.0.1:8080` หรือยัง
3. firewall เปิด `80/443` หรือยัง
4. container `server` ขึ้นหรือ crash
5. `CORS_ORIGIN` ตรงกับ domain หรือไม่
