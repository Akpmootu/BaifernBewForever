/**
 * ==================================================================================
 * คู่มือการเชื่อมต่อแบบฟอร์ม RSVP กับ Google Sheet ด้วย Google Apps Script
 * ==================================================================================
 * 
 * 1. เปิด Google Sheet ลิงก์ของคุณ:
 *    https://docs.google.com/spreadsheets/d/1ISXFERDwGoGXA4JlCcbZs4BIR9vG3ycajDbrmoW-f1Q/edit
 * 
 * 2. ที่แถบเมนูด้านบน คลิกที่: 
 *    "ส่วนขยาย" -> "แอปสคริปต์" (Extensions -> Apps Script)
 * 
 * 3. ลบโค้ดเริ่มต้นที่ระบบให้มาออกทั้งหมด แล้วคัดลอกโค้ด JavaScript ด้านล่างนี้ไปวางแทนที่
 * 
 * 4. คลิกปุ่ม "บันทึกโครงการ" (รูปแผ่นดิสก์สีทอง/เทา)
 * 
 * 5. ทำการติดตั้งแอป (Deployment):
 *    - คลิกปุ่ม "การใช้งานจริง" (Deploy) ด้านขวาบน -> เลือก "การตั้งค่าใช้งานใหม่" (New deployment)
 *    - คลิกปุ่มฟันเฟืองข้างคำว่า "เลือกประเภท" -> เลือก "เว็บแอป" (Web app)
 *    - ตั้งค่าดังนี้:
 *      * คำอธิบาย (Description): RSVP Baifern Bew Wedding
 *      * เรียกใช้งานเป็น (Execute as): ฉัน (อีเมลของคุณ)
 *      * ผู้มีสิทธิ์เข้าถึง (Who has access): ทุกคน (Anyone) -- **สำคัญมาก! ต้องเลือกทุกคนเพื่อให้ส่งฟอร์มได้**
 *    - คลิกปุ่ม "การตั้งค่าใช้งาน" (Deploy)
 *    - หากระบบขอให้สิทธิ์เข้าถึงบัญชี ให้คลิก "ให้สิทธิ์เข้าถึง" (Authorize Access) -> เลือกอีเมลของคุณ -> คลิก "ขั้นสูง" (Advanced) -> คลิก "ไปที่โครงการที่ไม่มีชื่อ (ไม่ปลอดภัย)" (Go to Untitled project (unsafe)) -> คลิก "อนุญาต" (Allow)
 * 
 * 6. คัดลอก "URL ของเว็บแอป" (Web App URL) ที่ได้จากขั้นตอนนี้
 * 
 * 7. นำ URL ที่คัดลอกมาเปิดไฟล์ `app.js` ในโฟลเดอร์ของเครื่องคุณ
 *    - แก้ไขบรรทัดที่ 44:
 *      จากเดิม: let GOOGLE_SHEETS_WEBAPP_URL = "";
 *      แก้เป็น: let GOOGLE_SHEETS_WEBAPP_URL = "URL_ที่คุณคัดลอกมาวางตรงนี้";
 *    - บันทึกไฟล์ `app.js` และทดสอบส่งข้อมูลจริง
 * 
 * ==================================================================================
 * คัดลอกโค้ดด้านล่างนี้ไปวางใน Google Apps Script
 * ==================================================================================
 */

function doPost(e) {
  try {
    // รหัส Google Sheets ID ของคุณ
    var sheetId = '1ISXFERDwGoGXA4JlCcbZs4BIR9vG3ycajDbrmoW-f1Q';
    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheets()[0]; // เลือกแผ่นงานแรกใน Google Sheet
    
    // ตรวจสอบโครงสร้างหัวตาราง (Header) หากยังไม่มี ให้สร้างขึ้นมาโดยอัตโนมัติ
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "วันเวลาที่ส่ง (Timestamp)", 
        "ชื่อผู้เข้าร่วม (Guest Name)", 
        "สถานะการเข้าร่วม (Attendance Status)", 
        "จำนวนผู้ติดตาม (Followers Count)", 
        "ต้องการที่พัก (Need Accommodation)", 
        "วันเช็กอิน (Check-in Date)", 
        "วันเช็กเอาต์ (Check-out Date)", 
        "คำอวยพร (Best Wishes)"
      ]);
      // จัดรูปแบบหัวตารางให้สวยงาม
      sheet.getRange("A1:H1").setFontWeight("bold").setBackground("#FFC857").setFontColor("#2C2623");
    }
    
    // แปลงข้อมูล JSON ที่ส่งมาจากเว็บบอร์ดการ์ดแต่งงาน
    var data = JSON.parse(e.postData.contents);
    
    // แปลงสถานะสำหรับบันทึก
    var statusText = data.status === "attend" ? "ยินดีเข้าร่วมงาน" : "ไม่สะดวกเข้าร่วมงาน";
    var accommodationText = data.need_accommodation ? "ต้องการเข้าพัก" : "ไม่ต้องการที่พัก";
    
    // บันทึกข้อมูลลงแถวใหม่
    sheet.appendRow([
      new Date(),                     // Timestamp
      data.name,                      // Guest Name
      statusText,                     // Attendance Status
      data.followers,                 // Followers Count
      accommodationText,              // Need Accommodation
      data.check_in_date,             // Check-in Date
      data.check_out_date,            // Check-out Date
      data.wishes                     // Best Wishes
    ]);
    
    // ส่งข้อมูลตอบกลับว่าบันทึกสำเร็จ
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch (error) {
    // ส่งข้อมูลตอบกลับกรณีมีข้อผิดพลาด
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
