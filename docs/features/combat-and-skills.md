# Combat And Skills

## Movement

ไฟล์หลัก: `js/entities/player.js`, `js/input.js`

พฤติกรรม:
- เดินได้ 8 ทิศ
- diagonal movement ถูก normalize
- กด run เพื่อเพิ่มความเร็ว
- movement resolve แบบแยกแกน X/Y กับ tile collision

## Combat Loop

ทุก frame:
1. อ่าน input
2. update skill cooldowns
3. ใช้ skill ถ้ามี key press
4. ขยับ entity
5. update projectile
6. check hit / damage
7. update visual effects

## Base Skills

อยู่ใน `js/skills/base-skills.js`

### Dash

- เพิ่ม burst movement ชั่วคราว
- ใช้ทิศทางล่าสุดของผู้เล่น

### Strike

- melee hit ระยะใกล้
- ทำ damage รอบตัวในระยะสั้น

### Shield

- ลด damage ชั่วคราว
- ใช้เป็น defensive window

## Special Skills

### Warrior: Ground Slam

ไฟล์: `js/characters/warrior.js`

- AoE รอบตัว
- ทำ damage และ stun

### Mage: Fireball

ไฟล์: `js/characters/mage.js`

- ยิง projectile ระยะไกล
- damage สูงกว่า base strike

### Rogue: Shadow Step

ไฟล์: `js/characters/rogue.js`

- warp ไปใกล้เป้าหมาย
- ทำ burst damage แบบ assassin

## Character Stats

registry อยู่ใน `js/characters/character-data.js`

- Warrior: HP สูง, DEF สูง
- Mage: ATK สูง, HP ต่ำ
- Rogue: เร็วที่สุด, stats กลาง

## Combat Constraints ตอนนี้

- ยังไม่มี hitbox visualization debug mode
- ยังไม่มี team system
- ยังไม่มี target selection ที่ละเอียดสำหรับ melee cone
- damage formula ยังเป็น prototype balance
- respawn system ยังง่ายและไม่มี score state

## ควรทำต่อ

- เพิ่ม animation state machine
- เพิ่ม damage number / floating text
- แยก skill effect data ออกจาก skill logic
- เพิ่ม HUD cooldown icon แบบ sprite จริง
