# Decision Log

โฟลเดอร์นี้เตรียมไว้สำหรับเก็บ architectural decisions หรือ ADR แบบสั้น

ใช้เมื่อ:
- มีหลายทางเลือกและต้องบันทึกเหตุผลที่เลือก
- การตัดสินใจนั้นกระทบโครงสร้างระบบหรือ workflow
- คนที่กลับมาอ่านทีหลังควรเข้าใจว่า tradeoff คืออะไร

## รูปแบบที่แนะนำ

```md
# Decision: ชื่อเรื่อง

## Status
Accepted / Proposed / Superseded

## Context
ปัญหาหรือแรงกดดันที่ต้องตัดสินใจ

## Decision
สรุปสิ่งที่เลือก

## Consequences
ผลดี ผลเสีย สิ่งที่ต้องทำต่อ
```

## ตัวอย่างหัวข้อที่ควรบันทึกในอนาคต

- จะใช้ authoritative server หรือ lockstep
- จะเก็บ room list แบบ in-memory หรือ persistent storage
- จะใช้ sprite atlas แบบรวมไฟล์หรือแยก per class
