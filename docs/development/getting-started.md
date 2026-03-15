# Getting Started

## Quick Start

### แบบง่ายสุด

เปิด `index.html` ใน browser

### แบบแนะนำ

รัน static server จาก root ของโปรเจกต์ เช่น:

```bash
python3 -m http.server
```

แล้วเปิด browser ไปที่:

```text
http://localhost:8000
```

## Server Quick Start

online/server scaffold ใช้ Bun + ElysiaJS

```bash
cd server
bun install
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

## Syntax Check

ใช้คำสั่งนี้เพื่อตรวจ syntax ของ JS ทั้งหมด:

```bash
bash -lc 'for f in $(find js server -name "*.js" | sort); do node --check "$f" || exit 1; done'
```

## จุดที่ควรรู้

- map ใช้ `fetch()` แต่มี fallback map ฝังในโค้ด
- asset image ตอนนี้ optional เพราะ renderer วาด fallback shapes ได้
- project ยังไม่มี bundler หรือ package manager
- ฝั่ง server ใช้ package manager/runtime ของ Bun แยกจากหน้า client

## เมื่อเพิ่ม feature ใหม่

- ถ้าแตะ gameplay loop ให้แก้ `docs/features/combat-and-skills.md`
- ถ้าเปลี่ยน flow ของหน้าจอ ให้แก้ `docs/features/ui-flow.md`
- ถ้าเปลี่ยน save format ให้แก้ `docs/architecture/state-and-storage.md`
- ถ้ามี tradeoff สำคัญ ให้สร้าง decision note ใน `docs/decisions/`
