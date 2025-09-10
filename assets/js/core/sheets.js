// assets/js/core/sheets.js
(function(){
  function normalizeHeader(h){
    return String(h||'').trim().toLowerCase().replace(/\s+/g,' ').replace(/\s/g,'_')
  }
  async function fetchApiV4({ spreadsheetId, range, apiKey }){
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
    const res = await fetch(url, { cache:'no-store' });
    if(!res.ok) throw new Error('API v4 fetch failed: '+res.status);
    const data = await res.json();
    const [headers, ...values] = data.values || [];
    const H = (headers||[]).map(normalizeHeader);
    return (values||[]).map(row => {
      const obj = {}; H.forEach((h,i)=> obj[h] = (row[i]||'').toString().trim()); return obj;
    });
  }
  function buildCodePriceMap(rows){
    // พยายามเดาชื่อหัวคอลัมน์ที่เป็นโค้ด/ราคา
    const get = (o, keys) => {
      const ks = Object.keys(o);
      for(const k of ks){
        const nk = normalizeHeader(k);
        if(keys.some(x => nk.includes(x))) return o[k];
      }
      return '';
    };
    const map = {}; // code -> price
    for(const r of rows){
      const code = get(r, ['code','sku','รหัส']);
      const priceStr = get(r, ['ราคา','price']);
      const price = Number(String(priceStr).replace(/[^\d.]/g,''))||0;
      if(code) map[code] = price;
    }
    return map;
  }
  window.Sheets = { fetchApiV4, buildCodePriceMap };
})();