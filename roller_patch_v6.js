
/*! Roller Patch v6 (code-only manual + reliable PDF) */
(function(){
  const $  = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
  function openPrintableDoc(htmlString){
    let win=null; try{ win=window.open('', '_blank', 'noopener,noreferrer'); }catch(e){}
    if(win && win.document){ try{ win.document.open(); win.document.write(htmlString); win.document.close(); return; }catch(e){} }
    const iframe=document.createElement('iframe');
    iframe.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;'; document.body.appendChild(iframe);
    try{
      if('srcdoc' in iframe){ iframe.srcdoc=htmlString; } else { const doc=iframe.contentWindow||iframe.contentDocument; const idoc=doc.document||doc; idoc.open(); idoc.write(htmlString); idoc.close(); }
      iframe.onload=()=>{ try{ (iframe.contentWindow||iframe.contentDocument).print(); }catch(e){} setTimeout(()=>{ try{ iframe.remove(); }catch(_){} }, 2000); };
    }catch(e){ try{ iframe.remove(); }catch(_){} }
  }
  function showPrintableTable(title, columns, rows, total){
    const css = '<style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,"Noto Sans",sans-serif;padding:16px}h1{font-size:18px;margin:0 0 12px 0}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px 8px;font-size:12px}th{background:#f2f5f9;text-align:left}tfoot td{font-weight:700}</style>';
    const thead = '<tr>'+columns.map(c=>`<th>${c}</th>`).join('')+'</tr>';
    const tbody = rows.map(r=>'<tr>'+r.map(c=>`<td>${c}</td>`).join('')+'</tr>').join('');
    const tfoot = `<tr><td colspan="${columns.length-1}" style="text-align:right"><b>รวมทั้งหมด</b></td><td><b>${(Number(total)||0).toLocaleString('en-US',{minimumFractionDigits:2})}</b></td></tr>`;
    openPrintableDoc(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${css}</head><body><h1>${title}</h1><table><thead>${thead}</thead><tbody>${tbody}</tbody><tfoot>${tfoot}</tfoot></table><script>window.onload=()=>setTimeout(()=>window.print(),150);<\/script></body></html>`);
  }
  function showPDF(title, columns, rows, total, filename){
    if (typeof window.showPdfPreview==='function') { try{ window.showPdfPreview(title, columns, rows, total, filename, []); return; }catch(e){} }
    showPrintableTable(title, columns, rows, total);
  }
  async function buildRollerMap(panel){
    try{ if(window.appConfig && appConfig.prices && appConfig.prices.roller){ const m=JSON.parse(JSON.stringify(appConfig.prices.roller)); if(m && Object.keys(m).length) return m; }}catch(e){}
    const tops=$$('select',panel).filter(sel=>!sel.closest('.calculation-row') && !/roller-row-/.test(sel.className));
    if(tops.length<3) return null;
    const [catTop,typeTop,codeTop]=tops;
    const priceDisp=panel.querySelector('#rollerPriceDisplay, #priceDisplay, .price-display');
    const opts=sel=>Array.from(sel.options).map(o=>o.value).filter(v=>v!=='');
    const fire=el=>{ try{ el.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){} };
    const orig={cat:catTop.value,type:typeTop.value,code:codeTop.value};
    const map={};
    for(const cat of opts(catTop)){
      catTop.value=cat; fire(catTop); await new Promise(r=>setTimeout(r,20));
      map[cat]=map[cat]||{};
      const types=opts(typeTop).length?opts(typeTop):[''];
      for(const typ of types){
        typeTop.value=typ; fire(typeTop); await new Promise(r=>setTimeout(r,20));
        const codes=opts(codeTop);
        let price=0; if(priceDisp){ const n=parseFloat(String(priceDisp.textContent||'').replace(/[^0-9.]/g,'')); price=isNaN(n)?0:n; }
        map[cat][typ]={price,codes};
      }
    }
    try{ catTop.value=orig.cat; fire(catTop); typeTop.value=orig.type; fire(typeTop); codeTop.value=orig.code; fire(codeTop); }catch(e){}
    return Object.keys(map).length?map:null;
  }
  function fillSelect(sel,list){ sel.innerHTML=''; (list?.length?list:['']).forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v||'-'; sel.appendChild(o); }); }
  function rollerPanel(){ return document.getElementById('page-roller') || document; }
  function selectorsHTML(mode){
    if(mode==='select'){
      return (`
        <label class="text-sm text-slate-600 md:col-span-2">ประเภท
          <select class="w-full p-2 border rounded-md roller-row-category"></select>
        </label>
        <label class="text-sm text-slate-600 md:col-span-2">รุ่น
          <select class="w-full p-2 border rounded-md roller-row-type"></select>
        </label>
        <label class="text-sm text-slate-600 md:col-span-2">รหัส
          <select class="w-full p-2 border rounded-md roller-row-code"></select>
        </label>`);
    }
    return (`
      <label class="text-sm text-slate-600 md:col-span-3">รหัสสินค้า (พิมพ์)
        <input type="text" class="w-full p-2 border rounded-md roller-row-code-manual" placeholder="เช่น RSP501, RBP-3901">
      </label>
      <div class="md:col-span-3 text-xs text-slate-500 self-center">* ถ้ารหัสไม่พบ จะใช้ราคา/หน่วยจากด้านบนให้</div>`);
  }
  async function setupRoller(){
    const panel=rollerPanel();
    const map=await buildRollerMap(panel);
    const defaultMode=(map && Object.keys(map).length)?'select':'code';
    function decorateRow(row,mode){
      if(row._rollerV6) return; row._rollerV6=true;
      const wrap=document.createElement('div'); wrap.className='grid grid-cols-1 md:grid-cols-6 gap-2 mb-2'; wrap.innerHTML=selectorsHTML(mode);
      const firstGrid=row.querySelector('.grid'); if(firstGrid) row.insertBefore(wrap,firstGrid); else row.prepend(wrap);
      const toggle=document.createElement('button'); toggle.type='button'; toggle.className='px-2 py-1 text-xs rounded border'; toggle.style.margin='4px 0'; toggle.textContent=(mode==='select')?'สลับเป็นโหมดพิมพ์รหัส':'กลับเป็นโหมดตัวเลือก'; row.insertBefore(toggle, wrap.nextSibling);
      function populateSelects(){
        if(!map || !Object.keys(map).length) return;
        const catSel=row.querySelector('.roller-row-category'); const typeSel=row.querySelector('.roller-row-type'); const codeSel=row.querySelector('.roller-row-code');
        const cats=Object.keys(map); fillSelect(catSel,cats);
        const updateType=()=>{ const c=catSel.value; fillSelect(typeSel,map[c]?Object.keys(map[c]):[]); updateCode(); };
        const updateCode=()=>{ const c=catSel.value, t=typeSel.value; fillSelect(codeSel,(map[c]&&map[c][t])?(map[c][t].codes||[]):[]); };
        catSel.onchange=updateType; typeSel.onchange=updateCode; updateType();
      }
      if(mode==='select') populateSelects();
      function findCodeInMap(code){
        if(!map) return null; for(const category of Object.keys(map)){ for(const type of Object.keys(map[category])){ const codes=map[category][type].codes||[]; if(codes.includes(code)) return {category,type,price:Number(map[category][type].price||0)}; } } return null;
      }
      toggle.onclick=()=>{
        const nowIsSelect=!!row.querySelector('.roller-row-category');
        const currentCode=row.querySelector('.roller-row-code')?.value || row.querySelector('.roller-row-code-manual')?.value || '';
        wrap.innerHTML=selectorsHTML(nowIsSelect?'code':'select');
        if(nowIsSelect){
          const manual=row.querySelector('.roller-row-code-manual'); if(currentCode) manual.value=currentCode;
        }else{
          if(!map || !Object.keys(map).length){ alert('ยังไม่พบข้อมูลตัวเลือกจากด้านบน จะคงเป็นโหมดพิมพ์รหัส'); wrap.innerHTML=selectorsHTML('code'); }
          else{ populateSelects(); if(currentCode){ const found=findCodeInMap(currentCode); if(found){ const {category,type}=found; const catSel=row.querySelector('.roller-row-category'); const typeSel=row.querySelector('.roller-row-type'); const codeSel=row.querySelector('.roller-row-code'); catSel.value=category; catSel.dispatchEvent(new Event('change',{bubbles:true})); setTimeout(()=>{ typeSel.value=type; typeSel.dispatchEvent(new Event('change',{bubbles:true})); setTimeout(()=>{ codeSel.value=currentCode; },50); },50); } } }
        }
        toggle.textContent=nowIsSelect?'กลับเป็นโหมดตัวเลือก':'สลับเป็นโหมดพิมพ์รหัส';
      };
    }
    $$('.calculation-row', panel).forEach(r=>decorateRow(r,defaultMode));
    const wrap=panel.querySelector('.rows, #rollerRows, #roller-rows, #page-roller') || panel;
    new MutationObserver(muts=>{ muts.forEach(m=>m.addedNodes && m.addedNodes.forEach(n=>{ if(n.nodeType===1 && n.classList.contains('calculation-row')) decorateRow(n,defaultMode); })); }).observe(wrap,{childList:true,subtree:true});
    function compute(){
      const rows=$$('.calculation-row',panel); if(!rows.length){ alert('กรุณาเพิ่มรายการอย่างน้อย 1 รายการ'); return; }
      let total=0; const items=[]; let ok=true; const topPriceEl=panel.querySelector('#rollerPriceDisplay, #priceDisplay, .price-display'); const topPriceNum=topPriceEl?(parseFloat(String(topPriceEl.textContent||'').replace(/[^0-9.]/g,''))||0):0;
      function findCodeInMap(code){ if(!map) return null; for(const category of Object.keys(map)){ for(const type of Object.keys(map[category])){ const codes=map[category][type].codes||[]; if(codes.includes(code)) return {category,type,price:Number(map[category][type].price||0)}; } } return null; }
      rows.forEach((row,idx)=>{
        const hasSelect=!!row.querySelector('.roller-row-category');
        const w=row.querySelector('.roller-width,[name*="width"]')?.value;
        const h=row.querySelector('.roller-height,[name*="height"]')?.value;
        const qty=parseInt(row.querySelector('.roller-qty,[name*="qty"],[name*="quantity"]')?.value||'0',10);
        const adjust=row.querySelector('.roller-adjust, select[name*="adjust"]')?.value||'';
        let category='', type='', code='', price=0;
        if(hasSelect){ category=row.querySelector('.roller-row-category')?.value||''; type=row.querySelector('.roller-row-type')?.value||''; code=row.querySelector('.roller-row-code')?.value||''; price=(map && map[category] && map[category][type])?Number(map[category][type].price||0):topPriceNum; }
        else{ code=row.querySelector('.roller-row-code-manual')?.value||''; const found=findCodeInMap(code); if(found){ category=found.category; type=found.type; price=found.price; } else { price=topPriceNum; } }
        if(!w || !h || !qty){ ok=false; return; }
        const wM=(parseFloat(String(w).replace(/[^0-9.]/g,''))||0)/100; const hM=(parseFloat(String(h).replace(/[^0-9.]/g,''))||0)/100;
        const itemCost=wM*hM*1.2*Number(price||0)*qty; total+=itemCost; items.push({ no:idx+1, category, type, code, width:w, height:h, qty, adjust, itemCost });
      });
      if(!ok){ alert('กรุณากรอกข้อมูลให้ครบในทุกแถว'); return; }
      window.rollerCalculatedData={ items, totalCost: total }; const addBtn=$('#rollerAddCombinedBtn'); if(addBtn) addBtn.disabled=false; return window.rollerCalculatedData;
    }
    function ensureCombinedUI(){
      if($('#combined-quote-bar')) return;
      const bar=document.createElement('div'); bar.id='combined-quote-bar'; bar.style.cssText='position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;gap:8px;';
      bar.innerHTML=`<button id="combinedViewBtn" class="bg-slate-700 text-white px-3 py-2 rounded-lg shadow">รายการรวม (0)</button><button id="combinedPdfBtn" class="bg-blue-600 text-white px-3 py-2 rounded-lg shadow" disabled>สร้าง PDF รวม</button>`;
      document.body.appendChild(bar);
      const modal=document.createElement('div'); modal.id='combinedModal'; modal.style.cssText='display:none;position:fixed;inset:0;background:rgba(0,0,0,.25);align-items:center;justify-content:center;z-index:10000;';
      modal.innerHTML=`<div style="background:#fff;border-radius:12px;width:min(920px,92vw);max-height:80vh;overflow:auto;padding:16px;"><div class="flex justify-between items-center mb-2"><h3 class="text-lg font-bold">รายการใบเสนอราคารวม</h3><button id="combinedCloseBtn" class="px-2 py-1 rounded border">ปิด</button></div><div id="combinedTable"></div></div>`;
      document.body.appendChild(modal);
      window.combinedItems=window.combinedItems||[];
      function render(){ const tbl=$('#combinedTable'); const btn=$('#combinedViewBtn'); if(btn) btn.textContent=`รายการรวม (${window.combinedItems.length})`; if(!tbl) return; if(!window.combinedItems.length){ tbl.innerHTML='<p class="text-slate-500">ยังไม่มีรายการ</p>'; return; } const rows=window.combinedItems.map((i,idx)=>`<tr><td class="p-1">${idx+1}</td><td class="p-1">${i.category||'-'}</td><td class="p-1">${i.type||'-'}</td><td class="p-1">${i.code||'-'}</td><td class="p-1">${i.width} x ${i.height}</td><td class="p-1">${i.adjust||'-'}</td><td class="p-1">${i.qty}</td><td class="p-1 text-right">${Number(i.itemCost||0).toLocaleString('en-US',{minimumFractionDigits:2})}</td></tr>`).join(''); tbl.innerHTML=`<div class="overflow-x-auto"><table class="min-w-full text-sm"><thead><tr><th class="p-1 text-left">#</th><th class="p-1 text-left">ประเภทสินค้า</th><th class="p-1 text-left">รุ่น</th><th class="p-1 text-left">รหัส</th><th class="p-1 text-left">ขนาด (ซม.)</th><th class="p-1 text-left">การปรับ</th><th class="p-1 text-left">จำนวน</th><th class="p-1 text-right">ราคารวม (บาท)</th></tr></thead><tbody>${rows}</tbody></table></div>`; }
      $('#combinedViewBtn').onclick=()=>{ $('#combinedModal').style.display='flex'; render(); };
      $('#combinedCloseBtn').onclick=()=>{ $('#combinedModal').style.display='none'; };
      $('#combinedPdfBtn').onclick=()=>{ if(!window.combinedItems.length) return; const cols=["ลำดับ","ประเภทสินค้า","รุ่น","รหัส","ขนาด (ซม.)","การปรับ","จำนวน","ราคารวม (บาท)"]; const rows=window.combinedItems.map((i,idx)=>[idx+1,i.category||'-',i.type||'-',i.code||'-',`${i.width} x ${i.height}`,i.adjust||'-',i.qty,Number(i.itemCost||0).toLocaleString('en-US',{minimumFractionDigits:2})]); const total=window.combinedItems.reduce((a,b)=>a+Number(b.itemCost||0),0); showPDF('ใบเสนอราคา (รวมหลายรายการ/หลายประเภท)', cols, rows, total, 'ใบเสนอราคา-รวม.pdf'); };
    }
    function wireCalc(){ const btns=$$('button',panel).filter(b=>/คำนวณ/.test(b.textContent||'')); btns.forEach(btn=>{ if(btn._calcHook) return; btn.addEventListener('click',()=>setTimeout(compute,0)); btn._calcHook=true; }); }
    function wirePdf(){ const pdfBtn=panel.querySelector('#rollerPdfBtn') || $$('button',panel).find(b=>/PDF/.test(b.textContent||'')); if(!pdfBtn || pdfBtn._pdfHook) return; pdfBtn.addEventListener('click',(e)=>{ e.preventDefault(); e.stopImmediatePropagation?.(); const data=compute(); if(!data) return; const cols=["ลำดับ","ประเภท","รุ่น","รหัส","ขนาด (ซม.)","การปรับ","จำนวน","ราคารวม (บาท)"]; const rows=data.items.map(it=>[it.no,it.category||'-',it.type||'-',it.code||'-',`${it.width} x ${it.height}`,it.adjust||'-',it.qty,Number(it.itemCost||0).toLocaleString('en-US',{minimumFractionDigits:2})]); showPDF('ใบเสนอราคา - ม่านม้วน', cols, rows, data.totalCost||0, 'ใบเสนอราคา-ม่านม้วน.pdf'); },{capture:true}); pdfBtn._pdfHook=true; }
    function wireAddCombined(){ ensureCombinedUI(); const pdfBtn=panel.querySelector('#rollerPdfBtn') || $$('button',panel).find(b=>/PDF/.test(b.textContent||'')); if(!pdfBtn) return; if($('#rollerAddCombinedBtn')) return; const add=document.createElement('button'); add.id='rollerAddCombinedBtn'; add.className=pdfBtn.className||'px-3 py-2 rounded border'; add.textContent='เพิ่มลงใบเสนอราคารวม'; add.style.marginLeft='8px'; add.disabled=true; pdfBtn.insertAdjacentElement('afterend',add); add.onclick=()=>{ const data=window.rollerCalculatedData || compute(); if(!data) return; if(!window.combinedItems) window.combinedItems=[]; const push=data.items.map(it=>({category:'ม่านม้วน',type:it.type,code:it.code,width:it.width,height:it.height,qty:it.qty,adjust:it.adjust,itemCost:it.itemCost})); window.combinedItems=window.combinedItems.concat(push); const viewBtn=$('#combinedViewBtn'); const pdfC=$('#combinedPdfBtn'); if(viewBtn) viewBtn.textContent=`รายการรวม (${window.combinedItems.length})`; if(pdfC) pdfC.disabled=window.combinedItems.length===0; alert('เพิ่มลงใบเสนอราคารวมแล้ว'); }; }
    wireCalc(); wirePdf(); wireAddCombined(); setTimeout(()=>{ wireCalc(); wirePdf(); wireAddCombined(); },800);
  }
  function init(){ try{ setupRoller(); }catch(e){ console.error('roller v6 patch error',e); } }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
  setTimeout(init,1500);
})();
