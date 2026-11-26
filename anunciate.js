/* Vigía — "Tiendas aliadas hoy": se arma solo con los códigos de ajustes.js (afiliados) y la lista "aliadas". */
(function () {
  'use strict';
  const S = window.VIGIA_SITE || {}, A = S.afiliados || {};
  const names = [];
  if (String(A.aviasales || '').trim()) names.push('Aviasales (vuelos)');
  Object.entries(A.amazon || {}).forEach(([d, t]) => { if (t) names.push('Amazon (' + d.replace(/^amazon\./, '.') + ')'); });
  (A.tiendas || []).forEach(x => { if (Array.isArray(x) && x[0]) names.push(String(x[0]).replace(/^www\./, '')); });
  (S.aliadas || []).forEach(n => { if (n && !names.includes(n)) names.push(String(n)); });
  if (!names.length) return;
  document.querySelectorAll('[data-allies]').forEach(p => { p.classList.remove('muted'); p.textContent = names.join(' · '); });
})();
