// assets/js/core/pdf.js
(function(){
  function showTable(title, cols, rows, total, filename){
    const w = window.open('', '_blank');
    const html = `<!doctype html><html><head><meta charset="utf-8">
      <title>${title}</title>
      <style>
        body{font-family:Tahoma,Arial;margin:20px}
        h1{font-size:18px}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid #999;padding:6px 8px;font-size:12px}
        tfoot td{font-weight:bold}
      </style>
    </head><body>
      <h1>${title}</h1>
      <table>
        <thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        <tfoot><tr><td colspan="${cols.length-1}">รวม</td><td>${(Number(total)||0).toLocaleString('en-US',{minimumFractionDigits:2})}</td></tr></tfoot>
      </table>
      <script>window.onload=function(){setTimeout(()=>window.print(),250)}</script>
    </body></html>`;
    w.document.open(); w.document.write(html); w.document.close();
  }
  window.PDF = { showTable };
})();