/* Vigía en la web: herramientas para usar sin instalar nada (también en el celular).
   Usa el mismo motor de la extensión: vigia-tiendas.js (tiendas por país) y vigia-viajes.js (vuelos y hoteles).
   Se configura en ajustes.js → herramientas (o en editor.html). */
(function () {
  'use strict';
  let swDone = false;
  function init() {
  const box = document.getElementById('vtools');
  if (!box) return;
  box.hidden = false;
  const S = window.VIGIA_SITE || {};
  const H = Object.assign({ comparar: true, vuelos: true, hoteles: true, precioReal: true, descuento: true, app: true }, S.herramientas || {});
  // Una página puede mostrar solo algunas herramientas: <div id="vtools" data-only="vuelos,hoteles,real">
  if (box.dataset.only) { const only = box.dataset.only.split(',').map(s => s.trim()); ['comparar', 'vuelos', 'hoteles', 'descuento'].forEach(k => { if (!only.includes(k)) H[k] = false; }); if (!only.includes('real')) H.precioReal = false; H.app = false; }
  const ST = window.VigiaStores, TV = window.VigiaTravel;
  const L = (es, en) => `<span data-l="es">${es}</span><span data-l="en">${en}</span>`;
  const lang = () => document.documentElement.dataset.lang === 'en' ? 'en' : 'es';
  const T = (es, en) => lang() === 'en' ? en : es;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TZ = { 'America/Bogota': 'CO', 'America/Mexico_City': 'MX', 'America/Monterrey': 'MX', 'America/Tijuana': 'MX', 'America/Cancun': 'MX', 'America/Santiago': 'CL', 'America/Lima': 'PE', 'America/Guayaquil': 'EC', 'America/Caracas': 'VE', 'America/Montevideo': 'UY', 'America/Asuncion': 'PY', 'America/La_Paz': 'BO', 'America/Costa_Rica': 'CR', 'America/Panama': 'PA', 'America/Guatemala': 'GT', 'America/El_Salvador': 'SV', 'America/Tegucigalpa': 'HN', 'America/Managua': 'NI', 'America/Santo_Domingo': 'DO', 'America/Puerto_Rico': 'PR', 'America/Sao_Paulo': 'BR', 'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'Europe/Madrid': 'ES', 'Europe/Lisbon': 'PT', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Rome': 'IT', 'Europe/London': 'GB', 'Europe/Amsterdam': 'NL', 'Europe/Zurich': 'CH', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Kolkata': 'IN', 'Asia/Tokyo': 'JP', 'Australia/Sydney': 'AU' };
  function guess() {
    try { const q = new URLSearchParams(location.search).get('pais'); if (q && /^[a-z]{2}$/i.test(q)) return q.toUpperCase(); } catch (e) {}
    try { const v = localStorage.getItem('vigia-pais'); if (v) return v; } catch (e) {}
    try { const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; if (TZ[tz]) return TZ[tz]; if (tz.startsWith('America/Argentina')) return 'AR'; } catch (e) {}
    const l = (navigator.language || '').split('-')[1]; return l && l.length === 2 ? l.toUpperCase() : 'US';
  }
  let country = guess();
  const countries = ST ? ST.countriesWithStores() : [];
  if (countries.length && !countries.includes(country) && !['US'].includes(country)) country = countries.includes('US') ? 'US' : countries[0];
  const cname = c => { try { return new Intl.DisplayNames([lang()], { type: 'region' }).of(c); } catch (e) { return c; } };
  const day = n => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
  const go = list => list.map(l => `<a class="tl" href="${esc(l.url)}" target="_blank" rel="noopener nofollow">${esc(l.name)} <span>↗</span></a>`).join('');

  // ---------- Pestañas ----------
  const TABS = [
    H.comparar && ['comparar', '🛒', L('Comparar un producto', 'Compare a product')],
    H.vuelos && ['vuelos', '✈️', L('Buscar vuelos', 'Search flights')],
    H.hoteles && ['hoteles', '🏨', L('Buscar hoteles', 'Search hotels')],
    H.precioReal && ['real', '🧳', L('Precio real del vuelo', 'Real flight price')],
    H.descuento && ['descuento', '🏷️', L('¿Descuento real?', 'Real discount?')]
  ].filter(Boolean);
  if (!TABS.length) { box.hidden = true; return; }
  const sel = c => `<select class="tsel" data-country>${(countries.length ? countries : [country]).map(x => `<option value="${x}" ${x === country ? 'selected' : ''}>${esc(cname(x))}</option>`).join('')}</select>`;
  const PANES = {
    comparar: `<form class="tform" data-f="comparar"><label>${L('¿Qué quieres comprar? Escribe el producto o pega el enlace', 'What do you want to buy? Type the product or paste the link')}<input name="q" required placeholder="iPhone 15 128GB / https://…" autocomplete="off"></label>
      <label>${L('Tu país', 'Your country')}${sel()}</label><button class="btn">${L('Buscar en todas las tiendas', 'Search every store')}</button></form><div class="tout" data-o="comparar"></div>`,
    vuelos: `<form class="tform grid" data-f="vuelos"><label>${L('Desde', 'From')}<input name="from" required placeholder="BOG / Bogotá"></label><label>${L('Hasta', 'To')}<input name="to" required placeholder="MIA / Miami"></label>
      <label>${L('Ida', 'Depart')}<input name="out" type="date" value="${day(14)}"></label><label>${L('Vuelta (opcional)', 'Return (optional)')}<input name="back" type="date" value="${day(18)}"></label>
      <label>${L('Pasajeros', 'Passengers')}<input name="pax" type="number" min="1" max="9" value="1"></label><label>${L('Tu país', 'Your country')}${sel()}</label><button class="btn">${L('Buscar en todas las páginas', 'Search every site')}</button></form><div class="tout" data-o="vuelos"></div>`,
    hoteles: `<form class="tform grid" data-f="hoteles"><label>${L('Destino', 'Destination')}<input name="dest" required placeholder="Cartagena"></label><label>${L('Llegada', 'Check-in')}<input name="in" type="date" value="${day(14)}"></label>
      <label>${L('Salida', 'Check-out')}<input name="outd" type="date" value="${day(18)}"></label><label>${L('Personas', 'Guests')}<input name="pax" type="number" min="1" max="16" value="2"></label><label>${L('Tu país', 'Your country')}${sel()}</label><button class="btn">${L('Buscar en todas las páginas', 'Search every site')}</button></form><div class="tout" data-o="hoteles"></div>`,
    real: `<p class="hint">${L('Un vuelo barato sin maleta puede salir más caro. Pon las opciones que viste y Vigía te dice cuál sale realmente más barata.', 'A cheap flight without a bag can cost more. Enter the options you saw and Vigía tells you which one is really cheaper.')}</p>
      <form class="tform" data-f="real"><div class="rrows">${[1, 2, 3].map(i => `<div class="rrow"><b>${L('Opción', 'Option')} ${i}</b><label>${L('Tiquete (total)', 'Ticket (total)')}<input name="p${i}" type="number" min="0" step="any" inputmode="decimal"></label><label>${L('Maleta de bodega', 'Checked bag')}<input name="b${i}" type="number" min="0" step="any" inputmode="decimal" placeholder="0 = ${T('incluida', 'included')}"></label><label>${L('Equipaje de mano', 'Carry-on')}<input name="c${i}" type="number" min="0" step="any" inputmode="decimal" placeholder="0"></label></div>`).join('')}</div>
      <label class="inline">${L('Pasajeros', 'Passengers')} <input name="pax" type="number" min="1" max="9" value="1"></label><label class="inline"><input type="checkbox" name="both" checked> ${L('Ida y vuelta (la maleta se paga dos veces)', 'Round trip (bag is paid twice)')}</label><button class="btn">${L('Calcular', 'Calculate')}</button></form><div class="tout" data-o="real"></div>`,
    descuento: `<form class="tform grid" data-f="descuento"><label>${L('Precio "antes" (tachado)', '"Was" price (crossed out)')}<input name="before" type="number" min="0" step="any" inputmode="decimal" required></label><label>${L('Precio ahora', 'Price now')}<input name="now" type="number" min="0" step="any" inputmode="decimal" required></label>
      <label>${L('% de descuento que anuncian (opcional)', 'Advertised % off (optional)')}<input name="pct" type="number" min="0" max="100" step="any" inputmode="decimal"></label><button class="btn">${L('Revisar', 'Check')}</button></form><div class="tout" data-o="descuento"></div>`
  };
  const tg = (S.apps || {}).telegram;
  box.innerHTML = `<div class="ttabs" role="tablist">${TABS.map(([k, ic, lb], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-tab="${k}">${ic} ${lb}</button>`).join('')}</div>
    ${TABS.map(([k], i) => `<div class="tpane" data-pane="${k}" ${i ? 'hidden' : ''}>${PANES[k]}</div>`).join('')}
    <div class="textra">${tg ? `<a class="tl tg" href="${esc(tg)}" target="_blank" rel="noopener">🔔 ${L('Recibe alertas de precio en Telegram', 'Get price alerts on Telegram')}</a>` : ''}${H.app ? `<button type="button" class="tl" data-install hidden>📱 ${L('Instalar Vigía en este celular', 'Install Vigía on this phone')}</button><span class="hint" data-ios hidden>📱 ${L('En iPhone: toca Compartir ⬆️ y luego "Agregar a inicio".', 'On iPhone: tap Share ⬆️ then "Add to Home Screen".')}</span>` : ''}</div>
    <p class="hint">${L('Desde la web, Vigía abre las búsquedas por ti. Para que lea los precios solo y te avise de descuentos falsos, usa la extensión en Chrome.', 'From the web, Vigía opens the searches for you. To read prices automatically and flag fake discounts, use the Chrome extension.')}</p>`;

  box.addEventListener('click', e => {
    const b = e.target.closest('[data-tab]'); if (!b) return;
    box.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    box.querySelectorAll('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== b.dataset.tab; });
  });
  box.addEventListener('change', e => {
    if (e.target.matches('[data-country]')) { country = e.target.value; box.querySelectorAll('[data-country]').forEach(s => { s.value = country; }); try { localStorage.setItem('vigia-pais', country); } catch (er) {} }
  });

  // Del enlace pegado saca las palabras del producto (ej. /iphone-15-128gb-negro/p → "iphone 15 128gb negro")
  function queryFrom(v) {
    v = String(v || '').trim();
    if (!/^https?:\/\//i.test(v)) return v;
    try {
      const u = new URL(v);
      const q = u.searchParams.get('q') || u.searchParams.get('k') || u.searchParams.get('text') || u.searchParams.get('keyword');
      if (q) return q;
      const parts = u.pathname.split('/').filter(Boolean).filter(p => !/^(p|dp|product|producto|productos|item|gp|ip|mla|mco|mlm|mlb|mlc|mpe)$/i.test(p));
      const best = parts.sort((a, b) => b.replace(/[^a-z]/gi, '').length - a.replace(/[^a-z]/gi, '').length)[0] || '';
      return decodeURIComponent(best).replace(/\.(html?|aspx?|php)$/i, '').replace(/\b[A-Z]{2,4}-?\d{6,}\b/g, '').replace(/[-_+]+/g, ' ').replace(/\b\d{7,}\b/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
    } catch (e) { return v; }
  }
  const out = k => box.querySelector(`[data-o="${k}"]`);
  const fmt = n => (Math.round(n * 100) / 100).toLocaleString(lang() === 'en' ? 'en-US' : 'es-CO');

  box.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, k = f.dataset.f, v = n => (f.elements[n] ? String(f.elements[n].value || '').trim() : '');
    if (k === 'comparar') {
      const q = queryFrom(v('q'));
      if (!q || !ST) return;
      const list = ST.storesFor(country).map(s => ({ name: s.name, url: ST.searchUrl(s, q) })).filter(x => x.url);
      list.push({ name: 'Google Shopping', url: ST.googleShoppingUrl ? ST.googleShoppingUrl(q, country) : 'https://www.google.com/search?tbm=shop&q=' + encodeURIComponent(q) });
      out(k).innerHTML = `<p class="hint">${L('Buscando', 'Searching')} <b>${esc(q)}</b> · ${esc(cname(country))}</p><div class="tlinks">${go(list)}</div>`;
    }
    if (k === 'vuelos' && TV) {
      const iata = x => /^[a-z]{3}$/i.test(x) ? x.toUpperCase() : null;
      const a = v('from'), b = v('to');
      const trip = { kind: 'flight', site: 'vigia', from: iata(a), to: iata(b), fromName: iata(a) ? null : a, toName: iata(b) ? null : b, out: v('out') || null, back: v('back') || null, adults: +v('pax') || 1 };
      out(k).innerHTML = `<p class="hint">${L('Abre 2 o 3 y compara. Ojo con la maleta: usa "Precio real del vuelo".', 'Open 2 or 3 and compare. Watch the bag fees: use "Real flight price".')}</p><div class="tlinks">${go(TV.flightLinks(trip, country))}</div>${!trip.from || !trip.to ? `<p class="hint">${L('Tip: con el código del aeropuerto (BOG, MIA, MAD) las páginas abren con tu búsqueda lista.', 'Tip: with the airport code (BOG, MIA, MAD) the sites open with your search ready.')}</p>` : ''}`;
    }
    if (k === 'hoteles' && TV) {
      const ci = v('in'), co = v('outd');
      const trip = { kind: 'stay', site: 'vigia', dest: v('dest'), checkin: ci || null, checkout: co || null, nights: ci && co ? Math.max(1, Math.round((Date.parse(co) - Date.parse(ci)) / 86400000)) : null, adults: +v('pax') || 2 };
      out(k).innerHTML = `<p class="hint">${L('Compara el precio TOTAL con impuestos y tarifas, no solo el de la noche.', 'Compare the TOTAL price with taxes and fees, not just the nightly rate.')}</p><div class="tlinks">${go(TV.links(trip, country))}</div>`;
    }
    if (k === 'real') {
      const pax = Math.max(1, +v('pax') || 1), both = f.elements.both && f.elements.both.checked ? 2 : 1;
      const rows = [1, 2, 3].map(i => ({ i, p: +v('p' + i) || 0, b: +v('b' + i) || 0, c: +v('c' + i) || 0 })).filter(r => r.p > 0).map(r => Object.assign(r, { total: r.p + (r.b + r.c) * pax * both }));
      if (!rows.length) { out(k).innerHTML = `<p class="hint">${L('Escribe al menos el precio de un tiquete.', 'Enter at least one ticket price.')}</p>`; return; }
      const min = Math.min(...rows.map(r => r.total)), cheapTicket = Math.min(...rows.map(r => r.p));
      out(k).innerHTML = `<div class="rres">${rows.sort((a, b) => a.total - b.total).map(r => `<div class="rcard ${r.total === min ? 'win' : ''}"><b>${r.total === min ? '🏆 ' : ''}${L('Opción', 'Option')} ${r.i}</b><span>${L('Precio real', 'Real price')}: <b>${fmt(r.total)}</b></span><small>${L('Tiquete', 'Ticket')} ${fmt(r.p)} + ${L('equipaje', 'bags')} ${fmt(r.total - r.p)}</small>${r.total > min ? `<small>+${fmt(r.total - min)} ${L('más que la mejor', 'more than the best')}</small>` : ''}</div>`).join('')}</div>
        ${rows.find(r => r.total === min).p > cheapTicket ? `<p class="hint">💡 ${L('El tiquete más barato NO es el más barato al sumar la maleta.', 'The cheapest ticket is NOT the cheapest once you add the bag.')}</p>` : ''}`;
    }
    if (k === 'descuento') {
      const b = +v('before'), n = +v('now'), pct = v('pct') === '' ? null : +v('pct');
      if (!(b > 0) || !(n > 0)) return;
      const real = Math.round((1 - n / b) * 1000) / 10;
      const items = [];
      if (real <= 0) items.push(['bad', L('No hay descuento: el precio de ahora es igual o mayor que el "antes".', 'There is no discount: the price now is the same or higher than the "was" price.')]);
      else items.push(['ok', L(`El descuento real es <b>${real}%</b> (ahorras ${fmt(b - n)}).`, `The real discount is <b>${real}%</b> (you save ${fmt(b - n)}).`)]);
      if (pct != null && Math.abs(pct - real) >= 3) items.push(['bad', L(`Anuncian ${pct}%, pero las cuentas dan ${real}%. Ojo: la diferencia no cuadra.`, `They advertise ${pct}%, but the math gives ${real}%. Careful: it doesn't add up.`)]);
      if (real >= 60) items.push(['warn', L('Un descuento tan alto es poco común. Revisa que la tienda sea confiable y que el precio "antes" haya existido de verdad.', 'Such a big discount is rare. Check that the store is trustworthy and that the "was" price really existed.')]);
      items.push(['tip', L('El truco más común: subir el precio unos días antes para luego "rebajarlo". La extensión de Vigía guarda el historial y te lo muestra.', 'The most common trick: raising the price a few days before to then "discount" it. The Vigía extension keeps the price history and shows it to you.')]);
      out(k).innerHTML = `<ul class="dres">${items.map(([c, t]) => `<li class="${c}">${t}</li>`).join('')}</ul>`;
    }
  });

  // ---------- App instalable (celular) ----------
  if (H.app) {
    let deferred = null;
    window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); deferred = ev; const b = box.querySelector('[data-install]'); if (b) b.hidden = false; });
    box.addEventListener('click', async ev => { if (!ev.target.closest('[data-install]') || !deferred) return; deferred.prompt(); try { await deferred.userChoice; } catch (e) {} deferred = null; ev.target.closest('[data-install]').hidden = true; });
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;
    if (ios) { const s = box.querySelector('[data-ios]'); if (s) s.hidden = false; }
    if (!swDone && 'serviceWorker' in navigator && location.protocol === 'https:') { swDone = true; navigator.serviceWorker.register('sw.js').catch(() => {}); }
  }
  // Llega desde el bot de Telegram (app.html?q=producto): la búsqueda queda lista
  try {
    const q0 = new URLSearchParams(location.search).get('q');
    const f0 = box.querySelector('[data-f="comparar"]');
    if (q0 && f0 && !box.dataset.qDone) { box.dataset.qDone = '1'; f0.elements.q.value = q0.slice(0, 200); f0.requestSubmit ? f0.requestSubmit() : f0.dispatchEvent(new Event('submit', { cancelable: true })); }
  } catch (e) {}
  }
  init();
  // Vista previa del editor (editor.html): vuelve a dibujar las herramientas con lo que vas cambiando
  window.addEventListener('message', ev => {
    if (ev.source !== window.parent || (ev.origin !== location.origin && location.protocol !== 'file:') || !ev.data || ev.data.type !== 'vigia-preview') return;
    const st = ev.data.settings || {};
    window.VIGIA_SITE = Object.assign({}, window.VIGIA_SITE, { herramientas: st.herramientas || {}, apps: st.apps || {} });
    const old = document.getElementById('vtools');
    if (old) { const n = old.cloneNode(false); old.replaceWith(n); setTimeout(init, 0); }
  });
})();
