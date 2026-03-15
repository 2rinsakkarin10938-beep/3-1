# Glossary

## Lobby

หน้าตั้งต้นของแอป ใช้เข้าสู่ flow อื่นทั้งหมด

## Screen

UI module หนึ่งหน้า ที่มี `init/render/show/hide`

## Waiting Room

หน้ารอก่อนเริ่มเกม ใช้จัดการ ready state และ player list

## Local Guest

ผู้เล่นเพิ่มในเครื่องเดียวกันที่ไม่ใช่ host หลัก

## Input Profile

ชุด mapping ของปุ่มควบคุม เช่น `player1`, `player2`

## Runtime State

state ที่ใช้ระหว่าง game loop และไม่ถูก persist ตรงลง `localStorage`

## Persisted State

state ที่เก็บข้าม session เช่น character, rooms, settings

## Adapter

ชั้นกลางที่แยก game logic ออกจาก transport หรือรูปแบบ sync

## Fixed Timestep

รูปแบบ update loop ที่ใช้ delta คงที่ เช่น `1/60` วินาทีต่อรอบ update

## Fallback Map

map ที่ฝังอยู่ในโค้ด ใช้เมื่อโหลด `maps/arena.json` ไม่สำเร็จ
