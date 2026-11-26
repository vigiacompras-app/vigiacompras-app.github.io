/* Vigía — Página de Black Friday. Las categorías se editan en ajustes.js → ofertasBF (o en editor.html).
   Los enlaces de Amazon llevan tu código de afiliado (ajustes.js → afiliados.amazon) y se marcan con 🤝. */
(function () {
  'use strict';
  const S = window.VIGIA_SITE || {}, A = S.afiliados || {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = (es, en) => `<span data-l="es">${es}</span><span data-l="en">${en}</span>`;
  const DEF = [
    ['🎧', 'Audífonos', 'Headphones', 'wireless headphones'], ['💻', 'Portátiles', 'Laptops', 'laptop'], ['📺', 'Televisores', 'TVs', 'smart tv'],
    ['📱', 'Celulares y tablets', 'Phones & tablets', 'unlocked smartphone'], ['⌚', 'Relojes inteligentes', 'Smartwatches', 'smartwatch'],
    ['🎮', 'Videojuegos', 'Gaming', 'video games'], ['🏠', 'Casa inteligente', 'Smart home', 'smart home'], ['🍳', 'Cocina', 'Kitchen', 'air fryer'],
    ['🧸', 'Juguetes', 'Toys', 'toys'], ['👟', 'Tenis y deporte', 'Sneakers & sports', 'running shoes'], ['💄', 'Belleza', 'Beauty', 'skin care'], ['📚', 'Kindle y libros', 'Kindle & books', 'kindle']
  ];
  const cats = Array.isArray(S.ofertasBF) && S.ofertasBF.length ? S.ofertasBF : DEF;
  const tag = String((A.amazon || {})['amazon.com'] || '').replace(/[^\w-]/g, '');
  const amz = (path, q) => { const u = new URL('https://www.amazon.com' + path); if (q) u.searchParams.set('k', q); if (tag) u.searchParams.set('tag', tag); return u.href; };
  const ally = tag ? ' 🤝' : '';
  const rel = tag ? 'noopener sponsored' : 'noopener nofollow';
  const box = document.querySelector('[data-bf-cats]');
  if (box) box.innerHTML = cats.map(c => `<a class="bf-cat" href="${esc(amz('/s', c[3]))}" target="_blank" rel="${rel}"><span class="ic">${esc(c[0])}</span>${L(esc(c[1]), esc(c[2] || c[1]))}<small>Amazon${ally}</small></a>`).join('');
  const hubs = document.querySelector('[data-bf-hubs]');
  if (hubs) hubs.innerHTML = `<a class="tl" href="${esc(amz('/blackfriday'))}" target="_blank" rel="${rel}">${L('Todas las ofertas de Black Friday', 'All Black Friday deals')}${ally} <span>↗</span></a><a class="tl" href="${esc(amz('/deals'))}" target="_blank" rel="${rel}">${L('Ofertas del día', "Today's deals")}${ally} <span>↗</span></a>`;
  const note = document.querySelector('[data-bf-note]');
  if (note && tag) note.innerHTML = '🤝 ' + L('Tienda aliada: si compras desde estos enlaces, Vigía puede recibir una pequeña comisión, sin costo extra para ti. Como Afiliado de Amazon, Vigía obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables.', 'Partner store: if you buy through these links, Vigía may earn a small commission at no extra cost to you. As an Amazon Associate, Vigía earns from qualifying purchases.');
  const mk = String(A.aviasales || '').replace(/[^\w]/g, '');
  const fly = document.querySelector('[data-bf-fly]');
  if (fly) fly.innerHTML = (mk ? `<a class="btn" href="https://www.aviasales.com/?marker=${mk}.bf" target="_blank" rel="noopener sponsored">✈️ ${L('Buscar vuelos en Aviasales', 'Search flights on Aviasales')} 🤝</a>` : '') + `<a class="btn ghost" href="app.html?vuelo=1">${L('Comparar en todas las páginas', 'Compare every site')}</a>`;
  const tg = document.querySelector('[data-tg]');
  if (tg && /^https:\/\/t\.me\//.test(S.canalOfertas || '')) tg.href = S.canalOfertas;
  const when = document.querySelector('[data-bf-when]');
  if (when) {
    const bf = new Date((S.blackFriday || '2026-11-27') + 'T00:00:00'), d = Math.ceil((bf - new Date()) / 86400000);
    when.innerHTML = d > 1 ? L(`FALTAN ${d} DÍAS`, `${d} DAYS LEFT`) : d === 1 ? L('ES MAÑANA', 'TOMORROW') : d > -4 ? L('¡ES HOY!', 'IT’S ON!') : L('CYBER WEEK', 'CYBER WEEK');
  }
})();
