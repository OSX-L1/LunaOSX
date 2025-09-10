// assets/js/core/formulas.js
(function(){
  const normalizeToMeters = (v) => (Number(v)>=10 ? Number(v)/100 : Number(v)||0);
  const calculatePvcHeight = (h) => { // สำหรับฉากกั้นแอร์
    const levels = [2.0,2.2,2.4,2.6,2.8,3.0,3.3,3.5,3.7];
    for(const L of levels){ if(h <= L+0.01) return L; }
    return h;
  };
  window.Formulas = { normalizeToMeters, calculatePvcHeight, areaFactor: 1.2 };
})();