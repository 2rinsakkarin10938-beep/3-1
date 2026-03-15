# Getting Started

## Quick Start

### แบบง่ายสุด

ติดตั้ง dependency ก่อนครั้งแรก:

```bash
cd server && bun install && cd ..
npm install
```

จากนั้นรัน frontend + server พร้อมกันจาก root ของโปรเจกต์:

```bash
npm run dev
```

แล้วเปิด browser ไปที่:

```text
http://localhost:5173
```

ถ้าต้องการรันเฉพาะ frontend:

```bash
npm run dev:web
```

## Server Quick Start

online/server scaffold ใช้ Bun + ElysiaJS

```bash
cd server
bun run dev
```

ค่าตั้งต้น:
- HTTP server: `http://localhost:3000`
- health check: `GET /health`
- room websocket: `ws://localhost:3000/ws/rooms/:roomId`

## Production Deploy Shape

ตอนนี้ repo มี runtime deploy ครบขั้นต่ำ:
- `docker-compose.yml`
- `deploy/Caddyfile`
- `deploy/web.Dockerfile`
- `deploy/server.Dockerfile`

แนวทาง:
- Caddy ใน container serve แอปผ่าน HTTP ภายใน
- static frontend ถูก serve จาก container `web`
- `/api/*` และ `/ws/*` ถูก proxy ไปที่ Elysia server
- host reverse proxy บน VPS ควรส่ง `gamev1.apichart.dev` มาที่ `127.0.0.1:8080`

## Flow ที่ควรทดสอบ

1. เปิดแอปแล้วต้องเห็น Lobby
2. สร้างตัวละครและกลับมาเห็นข้อมูลใน Lobby
3. เข้า Create Room แล้วสร้างห้องสำเร็จ
4. ใน Waiting Room กด Ready ให้ครบทุกคน
5. Start Game แล้ว canvas ต้องแสดงขึ้น
6. ขยับ player, วิ่ง, ใช้ skill ได้
7. เปลี่ยนภาษาใน Settings แล้ว UI/HUD สลับ ไทย/อังกฤษ ได้

## Syntax Check

ใช้คำสั่งนี้เพื่อตรวจ syntax ของ JS ทั้งหมด:

```bash
bash -lc 'for f in $(find js server -name "*.js" | sort); do node --check "$f" || exit 1; done'
```

## จุดที่ควรรู้

- map ใช้ `fetch()` แต่มี fallback map ฝังในโค้ด
- asset image ตอนนี้ optional เพราะ renderer วาด fallback shapes ได้
- frontend ใช้ Vite และ root `package.json`
- ฝั่ง server ใช้ package manager/runtime ของ Bun แยกจากหน้า client

## เมื่อเพิ่ม feature ใหม่

- ถ้าแตะ gameplay loop ให้แก้ `docs/features/combat-and-skills.md`
- ถ้าเปลี่ยน flow ของหน้าจอ ให้แก้ `docs/features/ui-flow.md`
- ถ้าเปลี่ยน save format ให้แก้ `docs/architecture/state-and-storage.md`
- ถ้ามี tradeoff สำคัญ ให้สร้าง decision note ใน `docs/decisions/`
