// assets/js/pages/alu.js
window.Pages = window.Pages || {};
window.Pages.alu = (function(){
  function init(root){
    const page = root.querySelector('[data-page-root="alu"]');
    const rowsEl = page.querySelector('#aluRows');
    const addRowBtn = page.querySelector('#aluAddRow');
    const calcBtn = page.querySelector('#aluCalc');
    const totalEl = page.querySelector('#aluTotal');
    const addToQuoteBtn = page.querySelector('#aluAddToQuote');
    const createPdfBtn = page.querySelector('#aluCreatePdf');

    const conf = (window.appConfig?.sheets?.alu) || {};
    let normalMap = {}, zoMap = {};
    let codes = [];

    function rowHTML(){
      return (`
        <div class="col-3"><select class="row-code"></select></div>
        <div class="col-3"><input type="number" step="any" class="row-width"  placeholder="กว้าง (ซม.)" value="50"></div>
        <div class="col-3"><input type="number" step="any" class="row-height" placeholder="สูง (ซม.)" value="50"></div>
        <div class="col-2"><input type="number" step="1" class="row-qty" value="1" placeholder="จำนวน"></div>
        <div class="col-1" style="text-align:right"><button class="btn btn-danger del-row">ลบ</button></div>
      `);
    }

    function fillCodes(sel){
      sel.innerHTML = '';
      (codes.length?codes:['']).forEach(c => {
        const o=document.createElement('option'); o.value=c; o.textContent=c||'-'; sel.appendChild(o);
      });
    }

    function buildRow(){
      const wrap = document.createElement('div');
      wrap.className = 'grid grid-12';
      wrap.innerHTML = rowHTML();
      rowsEl.appendChild(wrap);

      const codeSel = wrap.querySelector('.row-code');
      fillCodes(codeSel);
      wrap.querySelector('.del-row').addEventListener('click', ()=>wrap.remove());
    }

    function compute(){
      const rows = Array.from(rowsEl.children);
      if(!rows.length){ alert('กรุณาเพิ่มรายการ'); return null; }
      let totalNormal=0, totalZo=0;
      const items=[];
      for(const [i,wrap] of rows.entries()){
        const code = wrap.querySelector('.row-code').value || '';
        const wcm  = parseFloat(wrap.querySelector('.row-width').value||'0');
        const hcm  = parseFloat(wrap.querySelector('.row-height').value||'0');
        const qty  = parseInt(wrap.querySelector('.row-qty').value||'0',10);
        if(!code || !wcm || !hcm || !qty) continue;
        const W = window.Formulas.normalizeToMeters(wcm);
        const H = window.Formulas.normalizeToMeters(hcm);
        const area = Math.max(0.01, W*H);

        const unitNormal = Number(normalMap[code]||0);
        const unitZo     = Number(zoMap[code]||0);
        const priceNormal = area * unitNormal * qty;
        const priceZo     = area * unitZo * qty;

        totalNormal += priceNormal; totalZo += priceZo;
        items.push({ no:i+1, code, width:wcm, height:hcm, qty, priceNormal, priceZo });
      }
      totalEl.textContent = `รวม (ธรรมดา): ฿${totalNormal.toLocaleString('en-US',{minimumFractionDigits:2})} | รวม (โซ่วน): ฿${totalZo.toLocaleString('en-US',{minimumFractionDigits:2})}`;
      return { items, totalNormal, totalZo };
    }

    function exportPDF(){
      const data = compute(); if(!data) return;
      const cols = ['ลำดับ','รหัส','ขนาด (ซม.)','จำนวน','ธรรมดา (บาท)','โซ่วน (บาท)'];
      const rows = data.items.map(it => [
        it.no, it.code, `${it.width} x ${it.height}`, it.qty,
        Number(it.priceNormal||0).toLocaleString('en-US',{minimumFractionDigits:2}),
        Number(it.priceZo||0).toLocaleString('en-US',{minimumFractionDigits:2})
      ]);
      window.PDF.showTable('ใบเสนอราคา - มู่ลี่อลูมิเนียม (Google Sheets)', cols, rows, data.totalNormal||0, 'ใบเสนอราคา-มู่ลี่อลูมิเนียม.pdf');
    }

    function addToCombined(){
      const data = compute(); if(!data) return;
      const push = data.items.map(it => ({
        category:'มู่ลี่อลูมิเนียม', type:'-', code:it.code,
        width: it.width, height: it.height, qty: it.qty,
        adjust: `โซ่วน: ฿${Number(it.priceZo||0).toLocaleString('en-US',{minimumFractionDigits:2})}`,
        itemCost: it.priceNormal
      }));
      window.CombinedQuote.add(push);
      alert('เพิ่มลงใบเสนอราคารวมแล้ว');
    }

    async function initData(){
      try{
        const [rowsN, rowsZ] = await Promise.all([
          window.Sheets.fetchApiV4(conf.apiV4Normal),
          window.Sheets.fetchApiV4(conf.apiV4Zo)
        ]);
        normalMap = window.Sheets.buildCodePriceMap(rowsN);
        zoMap     = window.Sheets.buildCodePriceMap(rowsZ);
        codes = Array.from(new Set([...Object.keys(normalMap), ...Object.keys(zoMap)]));
      }catch(err){
        console.error('โหลด Google Sheets ไม่สำเร็จ', err);
        alert('โหลดข้อมูลจาก Google Sheets ไม่สำเร็จ โปรดตรวจสอบสิทธิ์/คีย์/ชื่อชีต');
      }
      buildRow();
    }

    addRowBtn.addEventListener('click', buildRow);
    calcBtn.addEventListener('click', compute);
    createPdfBtn.addEventListener('click', exportPDF);
    addToQuoteBtn.addEventListener('click', addToCombined);
    initData();
  }
  return { init };
})();