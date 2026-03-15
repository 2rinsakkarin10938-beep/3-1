# File Map

ไฟล์นี้เป็น quick reference สำหรับตอบคำถามว่า "ถ้าจะเปลี่ยนเรื่องนี้ ควรเริ่มดูไฟล์ไหน"

## Entry And Shell

- `package.json`: Vite frontend scripts และ dependencies
- `vite.config.js`: Vite config และ copy plugin สำหรับ runtime directories
- `index.html`: entry point และ layout หลักของหน้า
- `css/game.css`: custom pixel-art styling ที่ทับบน Tailwind utility

## App Flow

- `js/main.js`: app state, screen manager, room lifecycle, game start/stop

## UI Screens

- `js/ui/lobby.js`: หน้า lobby หลัก
- `js/ui/character-create.js`: เลือก class และตั้งชื่อ
- `js/ui/room-create.js`: สร้างห้อง
- `js/ui/room-join.js`: เข้าร่วมห้องจาก room list
- `js/ui/room-waiting.js`: waiting room, ready state, add local guest
- `js/ui/settings.js`: audio และ key bindings

## Game Runtime

- `js/game.js`: fixed timestep loop, runtime wiring, HUD refresh
- `js/renderer.js`: canvas render order
- `js/camera.js`: viewport follow logic
- `js/input.js`: keyboard tracking และ action bindings
- `js/asset-loader.js`: image manifest และ image loading

## Gameplay Domain

### Entities

- `js/entities/entity.js`: base entity
- `js/entities/player.js`: player movement, HP, status, skill trigger
- `js/entities/projectile.js`: ranged projectile update/hit logic

### Characters

- `js/characters/character-data.js`: stat registry และ skill loadout
- `js/characters/warrior.js`: warrior special
- `js/characters/mage.js`: mage special
- `js/characters/rogue.js`: rogue special

### Skills

- `js/skills/skill.js`: base skill contract
- `js/skills/base-skills.js`: dash, strike, shield
- `js/skills/skill-effects.js`: temporary VFX data

### World

- `js/world/tilemap.js`: map load, collision query, tile draw
- `js/world/collision.js`: AABB helper

### Networking

- `js/net/local-adapter.js`: local same-screen adapter
- `js/net/ws-adapter.js`: placeholder for future WebSocket adapter
- `server/server.js`: ElysiaJS HTTP + websocket room server
- `server/package.json`: server runtime/dependency manifest

## Data

- `maps/arena.json`: current arena map definition

## Deploy

- `docker-compose.yml`: production stack definition
- `deploy/Caddyfile`: domain routing, static serving, reverse proxy
- `deploy/Caddyfile.host.example`: ตัวอย่าง Caddy บน VPS host
- `deploy/web.Dockerfile`: Vite build + Caddy runtime image
- `deploy/server.Dockerfile`: Bun/Elysia server image

## ถ้าจะเปลี่ยนเรื่องไหน ดูที่ไหน

- เปลี่ยน flow ของหน้าจอ: `js/main.js`, `js/ui/*`
- เปลี่ยนคีย์บอร์ด: `js/input.js`, `js/ui/settings.js`
- เปลี่ยน skill balance: `js/skills/*`, `js/characters/*`
- เปลี่ยน stat/class: `js/characters/character-data.js`
- เปลี่ยน collision/map: `js/world/tilemap.js`, `maps/arena.json`
- เปลี่ยน HUD ในเกม: `js/game.js`
