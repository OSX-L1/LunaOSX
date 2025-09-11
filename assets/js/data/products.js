// assets/js/data/products.js
// ตั้งค่า Google Sheets สำหรับ "มู่ลี่อลูมิเนียม": sheet1 (ธรรมดา), sheet2 (โซ่วน)
window.appConfig = window.appConfig || {};
window.appConfig.sheets = window.appConfig.sheets || {};
window.appConfig.sheets.alu = {
  apiV4Normal: { spreadsheetId: "1l_2uDKEY8MCp7B0yrzGlg-DyiPvej7gnu0vQIoykmbg", range: "sheet1!A:Z", apiKey: "AIzaSyCiqmvbS4nSA_P7HPds4Hf5PpzkWGCTTIY" },
  apiV4Zo:     { spreadsheetId: "1l_2uDKEY8MCp7B0yrzGlg-DyiPvej7gnu0vQIoykmbg", range: "sheet2!A:Z", apiKey: "AIzaSyCiqmvbS4nSA_P7HPds4Hf5PpzkWGCTTIY" }
};