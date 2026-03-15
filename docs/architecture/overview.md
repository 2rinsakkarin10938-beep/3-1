# Architecture Overview

## เป้าหมาย

โปรเจกต์นี้เป็น browser game prototype ที่เน้น:
- เริ่มพัฒนาและ build ได้เร็วด้วย Vite
- แยก UI flow ออกจาก game loop
- รองรับ local multiplayer ก่อน แล้วค่อยต่อยอด online multiplayer
- ใช้โมดูล Vanilla JS แบบตรงไปตรงมา อ่านง่าย และ debug ง่าย

## Runtime Layers

### 1. App / Screen Layer

ไฟล์หลัก: `js/main.js`

หน้าที่:
- โหลด state จาก `localStorage`
- สร้าง screen objects
- สลับหน้าจอด้วย `showScreen(name)`
- สร้าง room state สำหรับ session ปัจจุบัน
- เริ่มและหยุด `Game`

### 2. UI Screen Layer

ไฟล์หลักอยู่ใน `js/ui/`

แต่ละ screen มี pattern เดียวกัน:
- `init(root)`
- `render()`
- `show()`
- `hide()`

ข้อดี:
- ไม่มี framework dependency
- state ชัดเจน เพราะทุก screen รับ `app` object เดียวกัน
- ง่ายต่อการ refactor ไป state manager ภายหลัง

### 3. Game Runtime Layer

ไฟล์หลัก: `js/game.js`

รับผิดชอบ:
- load assets และ map
- setup input manager
- สร้าง players จาก room state
- fixed timestep update
- draw ผ่าน renderer
- sync HUD

### 4. Domain Layer

แยกเป็นโฟลเดอร์ย่อย:
- `js/entities/`: entity runtime objects
- `js/characters/`: class definitions และ special skills
- `js/skills/`: reusable skill logic
- `js/world/`: tilemap และ collision
- `js/net/`: adapter abstraction สำหรับ multiplayer

### 5. Server Layer

ไฟล์หลัก: `server/server.js`

หน้าที่:
- expose room APIs ผ่าน ElysiaJS
- เก็บ room state แบบ in-memory สำหรับ prototype
- เปิด websocket endpoint สำหรับ room events
- เป็นฐานสำหรับ online multiplayer phase

## Rendering Flow

ลำดับการวาด:
1. clear canvas
2. draw tilemap background
3. sort entities ตามแกน Y
4. draw players และ projectiles
5. draw skill effects
6. draw foreground/grid overlay

ตอนนี้ renderer ใช้ simple pixel shapes เป็นหลัก และไม่ผูกกับ sprite sheet เต็มรูปแบบแล้ว เพื่อให้ milestone แรกเล่นได้ก่อน

## Design Decisions ปัจจุบัน

- ใช้ `localStorage` แทน backend จริงใน phase แรก
- map โหลดผ่าน `fetch()` และมี embedded fallback ถ้า load ไม่สำเร็จ
- local multiplayer ใช้ adapter เดียวกับที่เตรียมไว้สำหรับ online mode
- HUD render เป็น HTML แยกจาก canvas เพื่อ iterate UI ได้เร็ว
- server scaffold ใช้ ElysiaJS บน Bun เพื่อให้ HTTP + WebSocket อยู่ใน runtime เดียวกัน
- frontend ใช้ Vite แต่ยังคง code structure แบบ Vanilla JS modules

## ขอบเขตที่ยังไม่เสร็จ

- sprite animation จริง
- sound system
- online sync ผ่าน WebSocket
- authoritative server model
- room discovery จริงจาก network
