# ติดตั้งบัญชี username/password และ Google Sheets

รุ่นนี้ไม่มี Google login และไม่ใช้ Firebase ไม่ต้องกรอก Script Properties เอง

## ตั้งค่าที่ Code.gs

ต้นไฟล์มีค่าให้แล้ว:

```javascript
var BB_CONFIG = {
  SHEET_ID: '1Jr1oHNkKg3kCP171JEqd6BRlDig6KRDoPDRAI3rgXrA',
  ALLOW_REGISTRATION: true
};
```

เปลี่ยน ALLOW_REGISTRATION เป็น false เมื่อต้องการปิดสมัคร แล้ว deploy เวอร์ชันใหม่ ค่าเดิมใน Script Properties สำหรับ SHEET_ID/ALLOW_REGISTRATION จะไม่ถูกนำมาใช้แล้ว

## ติดตั้งหรืออัปเดต

1. เปิดโปรเจกต์ Apps Script ของคุณ สำรองโค้ดเก่า แล้วนำ Code.gs ใหม่นี้ไปแทนโค้ด Boot & Bloom เดิม ถ้ามีงานอื่นร่วมอยู่ ให้คง routing ของงานนั้นไว้ ห้ามมี doGet/doPost ซ้ำ
2. คงไฟล์ Bcrypt.gs ไว้ด้วย ถ้ายังไม่มี ให้สร้างไฟล์ Script ชื่อ Bcrypt แล้ววางเนื้อหา Bcrypt.gs ทั้งหมด เป็น bcryptjs 3.0.3 พร้อมปรับให้ทำงานแบบ synchronous ใน Apps Script; ดู BCRYPT-LICENSE
3. เลือกฟังก์ชัน setupBootBloom → Run และอนุญาตสิทธิ์ด้วยบัญชีเจ้าของชีต ใช้ V8 runtime
4. ระบบสร้างค่าลับใน Script Properties ชื่อ BB_SESSION_SECRET_V2 โดยอัตโนมัติ ไม่ต้องกรอกหรือคัดลอกค่าลับลงโค้ด Run ซ้ำจะไม่เปลี่ยนค่าที่สร้างแล้ว ไม่ใช้ SESSION_SECRET เดิมที่เคยกรอก
5. ระบบสร้างเฉพาะแท็บ BB_Accounts, BB_Sessions, BB_Saves ถ้ายังไม่มี ไม่ล้างแท็บหรือข้อมูลเดิม คง headers เดิมไว้ รวม googleSub/email เพื่อให้ชีตรุ่นเก่ายังอ่านได้ แต่ไม่มีการเข้าสู่ระบบ Google แล้ว
6. Deploy → Manage deployments → Edit → New version → Deploy ตั้ง Execute as: Me และ Who has access: Anyone เพื่อให้เว็บเรียก API ได้ ข้อมูลส่วนตัวใน API บังคับ session เสมอ ไม่ต้องแชร์ชีตให้นักเรียนเป็น editor
7. เปิด URL /exec ต้องเห็น protocol: boot-bloom-v1 และ ok: true แล้วจึงทดสอบสมัคร/เข้าสู่ระบบจากหน้าเกม

ถ้าขึ้น SETUP ให้ Run setupBootBloom จาก editor แล้วตรวจ Execution log ตรวจสิทธิ์เจ้าของต่อชีต และชื่อ headers ห้ามส่งค่าลับหรือรหัสผ่านในแชต

## ฝั่งเว็บ

URL เดิมตั้งไว้แล้ว หากเปลี่ยน deployment URL ให้คัดลอก .env.example เป็น .env.local แล้วแก้ VITE_APPS_SCRIPT_URL จากนั้น restart dev server หรือ build ใหม่ ไม่ใส่ค่าลับใน VITE_* variables

```powershell
npm install
npm run dev -- --port 5184
```

สมัคร username 3–32 ตัว (a–z, ตัวเลข, จุด, ขีดกลาง, ขีดล่าง) รหัสผ่านอย่างน้อย 10 ตัวและไม่เกิน 72 ไบต์ ภาษาไทยใช้หลายไบต์ Backend เก็บ bcrypt hash cost 12 ไม่เก็บรหัสผ่านดิบ

## เซฟและข้อจำกัด

- BB_Accounts เก็บบัญชี; BB_Sessions เก็บ hash ของ session อายุ 8 ชั่วโมง; BB_Saves เก็บสรุปคะแนน/เหรียญ/ดาวและเซฟ JSON แบ่งสี่เซลล์ แต่ละเซลล์มี prefix j: อย่าแก้ JSON หรือ headers ด้วยมือ
- รอข้อความบันทึกลงชีตแล้วก่อนออกจากระบบ เมื่อเน็ตหลุดมีร่างแยก UID ในเครื่องและปุ่ม retry เมื่อ session หมดอายุให้เลือกเก็บร่างแล้วเข้าสู่ระบบใหม่ด้วยบัญชีเดิม
- เมื่อสองเครื่องแก้ข้อมูลชนกัน ระบบหยุดเขียน ให้ยืนยันก่อนโหลดข้อมูลชีตมาทิ้งร่างในเครื่อง ไม่รวมเหรียญ
- โหมดทดลองเล่นในเครื่องไม่บันทึกชีตและไม่นำเซฟเข้าออนไลน์อัตโนมัติ ไม่กู้หน้าจอ simulation ระหว่างงานที่ยังไม่ส่ง
- session อยู่ sessionStorage; ร่างอยู่ localStorage ไม่เข้ารหัส ออกจากระบบหลังใช้เครื่องส่วนรวม ไม่แชร์ชีตสาธารณะ
- ปิดบัญชีด้วย boolean TRUE ในคอลัมน์ disabled; รหัสผิด 5 ครั้งล็อก 15 นาที และมี rate limit พื้นฐาน
- ตั้ง time trigger รายวันให้ cleanupBootBloomSessions เพื่อลบ session ที่หมดอายุ
- ยังไม่มีหน้าลืมรหัสผ่าน/เปลี่ยนรหัสผ่านหรือย้ายเซฟจากบัญชี Google เดิม ควรสำรองข้อมูลก่อนปรับบัญชี
- เหมาะชั้นเรียนขนาดเล็กตาม quota Apps Script คะแนนยังคำนวณ frontend ไม่ใช่ระบบสอบกันแก้คะแนน

## ตรวจรับหลัง deploy

สมัครบัญชี A/B แล้วทดสอบว่าแยกเซฟกัน เข้า A จากอีกเครื่องต้องเห็นเซฟเดิม ทดสอบตัดเน็ต/retry และข้อมูลชนกันสองหน้าต่าง ต้องอ่าน JSON response ได้จริง ไม่ใช้ no-cors เพื่ออ้างว่าบันทึกสำเร็จ

Codex ทดสอบ backend ด้วย mock Sheets และ bcrypt จริงในเครื่อง ยังไม่ได้ deploy แก้ Apps Script หรือยืนยันการเขียนชีตจริงแทนเจ้าของ
