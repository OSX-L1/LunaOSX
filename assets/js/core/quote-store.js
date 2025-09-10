// assets/js/core/quote-store.js
(function(){
  const store = [];
  function add(items){ if(Array.isArray(items)) store.push(...items); }
  function list(){ return [...store]; }
  function clear(){ store.length = 0; }
  window.CombinedQuote = { add, list, clear };
})();