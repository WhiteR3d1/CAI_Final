# บัญชีและ Google Sheets — 23 ตุลาคม 2026

## ข้อสรุปล่าสุดจากผู้ใช้
ไม่ใช้ Firebase และเอา Google login ออก ใช้เฉพาะ username/password ให้ตั้งค่าชีตและการสมัครใน Code.gs

## การออกแบบ
BB_CONFIG ต้น Code.gs กำหนด SHEET_ID และ ALLOW_REGISTRATION ส่วนค่าลับไม่ฝังในซอร์ส: setupBootBloom สร้าง BB_SESSION_SECRET_V2 ใน Script Properties อัตโนมัติและคงค่าเมื่อเรียกซ้ำ ไม่อ่าน SESSION_SECRET เดิม

คง schema ชีตเดิมเพื่อไม่ทำข้อมูลหาย ใช้ bcrypt cost 12, session 8 ชั่วโมง, ตรวจเจ้าของจาก session, LockService + revision + request ID, เก็บสรุปและ JSON แบ่งเซลล์ในแถวเดียว หน้าเว็บโหลดก่อนเปิดเกม แยกร่างตาม UID และหยุดเมื่อ conflict

Google frontend library, ปุ่ม และ backend OAuth ถูกนำออก ไม่มีการรวมบัญชี/ย้ายเซฟ Google เดิมอัตโนมัติ

คะแนนยังคำนวณ frontend ไม่ใช่ระบบสอบกันแก้คะแนน ทดสอบในเครื่องได้ แต่การเชื่อมชีตจริงรอเจ้าของติดตั้งและ deploy
