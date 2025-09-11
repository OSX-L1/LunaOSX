// assets/js/router.js
(function(){
  const app = document.getElementById('app');
  const tabs = Array.from(document.querySelectorAll('.nav-tab'));
  const Pages = window.Pages || (window.Pages = {});

  const routes = {
    'alu':    { html: 'pages/alu.html',    init: () => Pages.alu?.init(app) },
    'air':    { html: 'pages/air.html',    init: () => Pages.air?.init(app) },
    'wood':   { html: 'pages/wood.html',   init: () => Pages.wood?.init(app) },
    'rail':   { html: 'pages/rail.html',   init: () => Pages.rail?.init(app) },
    'roller': { html: 'pages/roller.html', init: () => Pages.roller?.init(app) },
  };

  async function load(page){
    const route = routes[page]; if(!route) return;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.page===page));
    const res = await fetch(route.html, { cache:'no-store' });
    const html = await res.text();
    app.innerHTML = html;
    route.init();
  }

  tabs.forEach(btn => btn.addEventListener('click', () => load(btn.dataset.page)));
  load('alu'); // default
})();