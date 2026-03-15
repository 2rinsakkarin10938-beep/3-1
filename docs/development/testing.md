# Testing

## เป้าหมาย

โปรเจกต์นี้ยังไม่มี automated test suite เต็มรูปแบบ ดังนั้นตอนนี้ใช้:
- syntax validation
- manual browser checks
- focused regression checks เวลาปรับ gameplay/UI

## Baseline Checks

### 1. Syntax

```bash
bash -lc 'for f in $(find js server -name "*.js" | sort); do node --check "$f" || exit 1; done'
```

### 2. Open In Browser

เช็ก flow หลัก:
1. เข้า Lobby
2. สร้างตัวละคร
3. สร้างห้อง
4. กด ready ให้ครบ
5. เริ่มเกม
6. ขยับและใช้ skill

## Regression Checklist

### ถ้าแก้ UI flow

- ปุ่ม back ทุกหน้ากลับได้ถูกที่
- character info ใน lobby update หลัง save
- settings save แล้วกลับมาเปิดใหม่ยังอยู่

### ถ้าแก้ room flow

- room create แล้วเข้าหน้ารอทันที
- join room แล้ว host player ถูกเติมเข้า room ถ้ายังไม่มี
- start game เปิดได้เฉพาะตอนทุกคน ready

### ถ้าแก้ gameplay

- movement 8 ทิศยัง normalize
- ชนกำแพงแล้วไม่ทะลุ
- dash/strike/shield/special ยัง trigger ได้
- projectile ชนผู้เล่นและกำแพงถูกต้อง

## Proposed Next Step

เมื่อโปรเจกต์เริ่มนิ่งขึ้น ควรเพิ่ม:
- unit test สำหรับ pure helpers เช่น collision, state serialization
- smoke test สำหรับ screen flow
- deterministic simulation test บางส่วนของ combat loop
