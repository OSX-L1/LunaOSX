// assets/js/core/formulas.js
(function(){
  const normalizeToMeters = (v) => (Number(v)>=10 ? Number(v)/100 : Number(v)||0);
  window.Formulas = { normalizeToMeters, areaFactor: 1.2 };
})();