# คู่มือการทำระบบแบบ Online (เชื่อมกันทุกเครื่อง)

ระบบถูกอัปเกรดให้รองรับ **Firebase Realtime Database** ซึ่งเป็นฐานข้อมูลออนไลน์ฟรีจาก Google 

ทำตามขั้นตอนง่ายๆ ดังนี้เพื่อให้เมื่อนำไปฝาก Host หรือส่งลิงก์ให้คนอื่น ข้อมูลจะอัปเดตตรงกันทั้งหมด:

1. สมัคร Gmail และเข้าไปที่ https://firebase.google.com/
2. คลิกปุ่ม **Go to console** (มุมขวาบน)
3. กดปุ่ม **+ Add project** (สร้างโปรเจกต์ใหม่) ตั้งชื่อร้าน เช่น `kong-lor-zing`
4. เมื่อสร้างเสร็จ ที่หน้าหลักให้มองหา **ไอคอนรูป สัญลักษณ์ HTML `</>`** (Web App) แล้วกดตั้งชื่อแอปอะไรก็ได้
5. ระบบจะโชว์โค้ดที่มีหน้าตาแบบนี้:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyB-xxxx",
     authDomain: "xxxx.firebaseapp.com",
     databaseURL: "https://xxxx.firebaseio.com",
     projectId: "xxxx",
     storageBucket: "xxxx.appspot.com",
     messagingSenderId: "123",
     appId: "1:123:web:abc"
   };
   ```
6. ให้ **คัดลอก (Copy)** ข้อมูลบรรทัดที่เป็น `apiKey`, `authDomain`, `databaseURL`, ... 
7. นำไปวาง **ทับในโค้ดบรรทัดขางบนสุด (บรรทัดที่ 8) ที่อยู่ในไฟล์ `app.js` ของระบบเรา**
8. (สำคัญ) ที่เมนูด้านซ้ายใน Firebase ให้เข้าเมนู **Build > Realtime Database** แล้วกด **Create Database**
9. เลือกที่แท็บ **Rules** แล้วเปลี่ยน `false` ให้เป็น `true` ทั้งสองอัน:
   ```javascript
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   กดปุ่ม Publish เป็นอันเสร็จสิ้น! ตอนนี้ถ้าใครเข้าเว็บและจองข้อมูล มันก็จะขึ้นโชว์แบบ Online ทุกเครื่องเลยครับ
