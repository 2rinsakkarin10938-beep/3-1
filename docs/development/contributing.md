# Contributing

## หลักการทำงานกับ repo นี้

- เปลี่ยนเท่าที่จำเป็นต่อ milestone ปัจจุบัน
- รักษา module boundaries ให้ชัด
- อัปเดต docs พร้อม code change เสมอถ้า contract หรือ flow เปลี่ยน

## แนวทางแก้ไขโค้ด

### UI

- เพิ่ม screen ใหม่ใน `js/ui/`
- ให้ screen ใช้ contract เดิม `init/render/show/hide`
- ผูก state ผ่าน `app` object ก่อน จนกว่าจะจำเป็นต้องมี state manager จริง

### Gameplay

- logic ที่ใช้ซ้ำหลาย class ควรอยู่ใน `js/skills/` หรือ `js/world/`
- logic เฉพาะ class ให้อยู่ใน `js/characters/`
- อย่าเอา DOM logic ไปผสมใน entity class

### Data

- ถ้าเปลี่ยน shape ของ persisted state ให้ update `docs/architecture/state-and-storage.md`
- ถ้าเปลี่ยน map format ให้ update docs ที่เกี่ยวข้องทันที

## เมื่อเพิ่ม feature ใหม่

ควรทำอย่างน้อย:
1. update code
2. update docs ที่กระทบ
3. run syntax check
4. run browser smoke test

## Commit Scope ที่ดี

- แยก UI flow กับ gameplay ถ้าเป็นคนละ concern
- แยก balance tweak ออกจาก architecture refactor
- ถ้ามี decision สำคัญ ให้เพิ่ม ADR ใน `docs/decisions/`
