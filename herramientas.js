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
  // ---------- 1.0.2: tiendas aliadas (afiliados). Nunca cambian el orden: solo agregan el código al enlace y se avisa. ----------
  const AF = S.afiliados || {};
  const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch (e) { return ''; } };
  const fits = (h, d) => { d = String(d || '').replace(/^www\./, '').toLowerCase(); return !!d && (h === d || h.endsWith('.' + d)); };
  function affUrl(url) {
    const h = hostOf(url);
    if (!h) return { url, aff: false };
    try {
      const amz = Object.entries(AF.amazon || {}).find(([d, tag]) => tag && h === String(d).replace(/^www\./, '').toLowerCase());
      if (amz) { const u = new URL(url); u.searchParams.set('tag', String(amz[1]).trim()); return { url: u.href, aff: true }; }
      const w = (AF.tiendas || []).find(x => Array.isArray(x) && x[1] && /^https:\/\//.test(x[1]) && x[1].includes('{url}') && fits(h, x[0]));
      if (w) return { url: w[1].split('{url}').join(encodeURIComponent(url)), aff: true };
    } catch (e) {}
    return { url, aff: false };
  }
  const avMarker = () => { const m = String(AF.aviasales || '').replace(/[^\w]/g, ''); return m ? m + '.web' : ''; };
  const go = list => {
    const rows = list.map(l => Object.assign({}, l, l.aff ? {} : affUrl(l.url)));
    const links = rows.map(l => `<a class="tl${l.aff ? ' aff' : ''}" href="${esc(l.url)}" target="_blank" rel="noopener ${l.aff ? 'sponsored' : 'nofollow'}">${esc(l.name)}${l.aff ? ` <i title="${esc(T('Tienda aliada', 'Partner store'))}">🤝</i>` : ''} <span>↗</span></a>`).join('');
    const amz = rows.some(r => r.aff && /(^|\.)amazon\./.test(hostOf(r.url)));
    return `<div class="tlinks">${links}</div>` + (rows.some(r => r.aff) ? `<p class="hint aff-note">🤝 ${L('Tienda aliada: si compras ahí, Vigía puede recibir una pequeña comisión, sin costo extra para ti. Nunca cambia el orden ni los precios que te mostramos.', 'Partner store: if you buy there, Vigía may earn a small commission at no extra cost to you. It never changes the order or the prices we show you.')}${amz ? ' ' + L('Como Afiliado de Amazon, Vigía obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables.', 'As an Amazon Associate, Vigía earns from qualifying purchases.') : ''}</p>` : '');
  };

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
    vuelos: `<form class="tform grid" data-f="vuelos"><div class="ttype" role="group" aria-label="${T('Tipo de viaje', 'Trip type')}"><button type="button" class="tl" data-ttype="one" aria-pressed="false">➡️ ${L('Solo ida', 'One way')}</button><button type="button" class="tl on" data-ttype="round" aria-pressed="true">🔁 ${L('Ida y vuelta', 'Round trip')}</button></div>
      <label class="apl">${L('Desde', 'From')}<input name="from" required placeholder="${T('Ciudad o código', 'City or code')}" autocomplete="off" data-ap></label><label class="apl">${L('Hasta', 'To')}<input name="to" required placeholder="${T('Ej.: Miami o MIA', 'E.g. Miami or MIA')}" autocomplete="off" data-ap></label>
      <label>${L('Ida', 'Depart')}<input name="out" type="date" value="${day(14)}"></label><label data-back>${L('Vuelta', 'Return')}<input name="back" type="date" value="${day(18)}"></label>
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
      return decodeURIComponent(best).replace(/\.(html?|aspx?|php)$/i, '').replace(/_JM$/i, '').replace(/\b[A-Z]{2,4}-?\d{6,}\b/g, '').replace(/[-_+]+/g, ' ').replace(/\b\d{7,}\b/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
    } catch (e) { return v; }
  }
  const out = k => box.querySelector(`[data-o="${k}"]`);
  // ---------- 1.1: herramientas con resultados dentro de la web (servidor de Vigía) ----------
  const SRV = Object.assign({ url: 'https://iawhorusinrnkxmnsnwi.supabase.co', key: 'sb_publishable_G3nkWdS47XaIoVmHOXAPnw_dzUQzyX_' }, S.servidor || {});
  const webId = () => { try { let v = localStorage.getItem('vigia-web-id'); if (!v) { v = 'web-' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36); localStorage.setItem('vigia-web-id', v); } return v; } catch (e) { return 'web-anon-' + Date.now().toString(36); } };
  async function srv(action, body) {
    try {
      const ctl = new AbortController(); setTimeout(() => ctl.abort(), 12000);
      const r = await fetch(SRV.url.replace(/\/$/, '') + '/functions/v1/vigia-notify', { method: 'POST', signal: ctl.signal, headers: { apikey: SRV.key, 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ action, install: webId(), lang: lang() }, body)) });
      return await r.json();
    } catch (e) { return null; }
  }
  const usd = n => '$' + Math.round(n).toLocaleString(lang() === 'en' ? 'en-US' : 'es-CO') + ' USD';
  // Calendario de precios de un mes (Aviasales): cada día con su precio más bajo; el más barato resaltado
  async function calendar(trip, month) {
    const o = out('vuelos'), slot = o && o.querySelector('[data-cal]');
    if (!slot) return;
    slot.innerHTML = `<p class="hint">⏳ ${L('Buscando los días más baratos…', 'Finding the cheapest days…')}</p>`;
    const r = await srv('tp_calendar', { from: trip.from, to: trip.to, month });
    if (!slot.isConnected) return;
    const [y, m] = month.split('-').map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1)), days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7), next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const title = (() => { try { return new Intl.DateTimeFormat(lang() === 'en' ? 'en-US' : 'es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first); } catch (e) { return month; } })();
    const D = (r && r.ok && r.days) || {};
    const prices = Object.values(D).map(x => x.p), min = prices.length ? Math.min(...prices) : null;
    const today = new Date().toISOString().slice(0, 10);
    const wd = (lang() === 'en' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['L', 'M', 'M', 'J', 'V', 'S', 'D']).map(x => `<b class="cal-h">${x}</b>`).join('');
    let cells = '';
    for (let i = 0; i < (first.getUTCDay() + 6) % 7; i++) cells += '<span></span>';
    for (let d = 1; d <= days; d++) {
      const iso = `${month}-${String(d).padStart(2, '0')}`, x = D[iso];
      if (!x || iso < today) { cells += `<span class="cal-d${iso < today ? ' past' : ''}"><i>${d}</i></span>`; continue; }
      const url = TV.aviasalesUrl(Object.assign({}, trip, { out: iso, back: null }), avMarker());
      cells += `<a class="cal-d${x.p === min ? ' best' : ''}" href="${esc(url)}" target="_blank" rel="noopener ${avMarker() ? 'sponsored' : 'nofollow'}" title="${esc(iso + (x.t === 0 ? ' · ' + T('directo', 'nonstop') : ' · ' + x.t + ' ' + T('escala(s)', 'stop(s)')))}"><i>${d}</i><b>${esc('$' + Math.round(x.p))}</b></a>`;
    }
    slot.innerHTML = `<div class="cal"><div class="cal-top"><button type="button" class="tl" data-cal-go="${prev}" ${prev < thisMonth ? 'disabled' : ''}>‹</button><b>${esc(title)} · ${esc(trip.from)} → ${esc(trip.to)}</b><button type="button" class="tl" data-cal-go="${next}">›</button></div>
      ${prices.length ? `<div class="cal-g">${wd}${cells}</div><p class="hint">✈️ ${L(`Día más barato desde <b>${usd(min)}</b> por persona, solo ida. Toca un día para verlo en Aviasales 🤝. Precios que vieron otros viajeros en los últimos días; pueden cambiar.`, `Cheapest day from <b>${usd(min)}</b> per person, one way. Tap a day to see it on Aviasales 🤝. Prices other travelers saw recently; they may change.`)}</p>`
        : `<p class="hint">${L('Aún no hay precios guardados para esta ruta en este mes. Prueba el mes siguiente o usa los enlaces de arriba.', 'No saved prices for this route this month yet. Try next month or use the links above.')}</p>`}</div>`;
    slot.dataset.trip = JSON.stringify(trip);
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-cal-go]');
    if (!b) return;
    const slot = b.closest('[data-cal]');
    try { calendar(JSON.parse(slot.dataset.trip), b.dataset.calGo); } catch (er) {}
  });
  // "Pega un enlace": lee el producto en el servidor y compara con su nombre real
  async function readLink(url, k) {
    out(k).innerHTML = `<p class="hint">⏳ ${L('Leyendo el producto…', 'Reading the product…')}</p>`;
    const r = await srv('read_link', { url });
    if (!(r && r.ok && r.q)) return null;
    // Quita el nombre de la tienda ("Amazon.com: …", "… | Falabella") y descarta páginas que no son un producto
    const shop = /^(amazon(\.com)?(\.[a-z]{2})?|mercado ?libre|falabella|walmart|ebay|aliexpress|temu|shein|exito|éxito|alkosto|linio|liverpool|best ?buy|target|coppel)$/i;
    const clean = s => String(s || '').replace(/^\s*(amazon(\.com)?(\.[a-z]{2})?|walmart\.com|ebay)\s*[:|\-–]\s*/i, '').replace(/\s*[|\-–]\s*(amazon|mercado ?libre|falabella|walmart|ebay|aliexpress|temu|shein|éxito|exito|alkosto|liverpool)[^|\-–]*$/i, '').trim();
    r.name = clean(r.name); r.q = clean(r.q).split(/\s+/).slice(0, 8).join(' ');
    if (r.q.length < 3 || shop.test(r.q)) return null;
    return r;
  }
  const fmt = n => (Math.round(n * 100) / 100).toLocaleString(lang() === 'en' ? 'en-US' : 'es-CO');
  // ---------- Buscador de aeropuertos: escribes la ciudad y eliges de la lista (lista local, sin servicios externos) ----------
  const AP = (() => {
    let list = window.VigiaAeropuertos || null, loading = null;
    const fold = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const load = () => { if (list || loading) return loading || Promise.resolve(); loading = new Promise(res => { const sc = document.createElement('script'); sc.src = 'aeropuertos.js'; sc.onload = () => { list = (window.VigiaAeropuertos || []).map(a => ({ c: a[0], city: a[1], name: a[2], cc: a[3], big: a[4], k: fold(a[0] + ' ' + a[1] + ' ' + a[2] + ' ' + (a[5] || '')), kc: fold(a[1]) })); res(); }; sc.onerror = () => { loading = null; res(); }; document.head.appendChild(sc); }); return loading; };
    let dn = null; const country = cc => { try { dn = dn || new Intl.DisplayNames([lang() === 'en' ? 'en' : 'es'], { type: 'region' }); return dn.of(cc); } catch (e) { return cc; } };
    const find = (q, n) => {
      if (!Array.isArray(list)) return [];
      const f = fold(q); if (f.length < 2) return [];
      const words = f.split(/\s+/);
      const sc = a => { if (a.c.toLowerCase() === f) return 0; if (a.kc === f) return 1; if (a.kc.startsWith(f)) return 2; if (words.every(w => a.k.includes(w))) return 3; return 9; };
      return list.map(a => [sc(a), a]).filter(x => x[0] < 9).sort((x, y) => x[0] - y[0] || y[1].big - x[1].big || x[1].city.localeCompare(y[1].city)).slice(0, n || 8).map(x => x[1]);
    };
    // Si escribió una ciudad sin elegir de la lista: usa el aeropuerto principal solo cuando la coincidencia es clara
    const best = q => { const r = find(q, 2); if (!r.length) return null; const f = fold(q); return (r[0].kc === f || r[0].c.toLowerCase() === f) ? r[0].c : null; };
    const label = a => `${a.city} (${a.c})`;
    return { load, find, best, label, country };
  })();
  function apClose(inp) { const ul = inp && inp.parentNode.querySelector('.apl-list'); if (ul) ul.remove(); inp && inp.setAttribute('aria-expanded', 'false'); }
  function apShow(inp) {
    const r = AP.find(inp.value, 8); let ul = inp.parentNode.querySelector('.apl-list');
    if (!r.length) { apClose(inp); return; }
    if (!ul) { ul = document.createElement('ul'); ul.className = 'apl-list'; ul.setAttribute('role', 'listbox'); inp.parentNode.appendChild(ul); }
    ul.innerHTML = r.map((a, i) => `<li role="option" data-apc="${esc(a.c)}" data-apl="${esc(AP.label(a))}"${i === 0 ? ' class="on"' : ''}><b>${esc(a.city)} <span>${esc(a.c)}</span></b><small>${esc(a.name)} · ${esc(AP.country(a.cc))}</small></li>`).join('');
    inp.setAttribute('aria-expanded', 'true');
  }
  const apPick = (inp, li) => { inp.value = li.dataset.apl; apClose(inp); };
  box.addEventListener('focusin', e => { if (e.target.matches('[data-ap]')) AP.load(); });
  box.addEventListener('input', e => { const inp = e.target; if (!inp.matches('[data-ap]')) return; AP.load().then(() => { if (document.activeElement === inp) apShow(inp); }); });
  box.addEventListener('keydown', e => {
    const inp = e.target; if (!inp.matches('[data-ap]')) return;
    const ul = inp.parentNode.querySelector('.apl-list'); if (!ul) return;
    const items = [...ul.children], i = items.findIndex(x => x.classList.contains('on'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const j = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((x, k) => x.classList.toggle('on', k === j)); }
    else if (e.key === 'Enter' && i >= 0) { e.preventDefault(); apPick(inp, items[i]); }
    else if (e.key === 'Escape') apClose(inp);
  });
  box.addEventListener('pointerdown', e => { const li = e.target.closest('.apl-list li'); if (!li) return; e.preventDefault(); apPick(li.closest('label').querySelector('[data-ap]'), li); });
  box.addEventListener('focusout', e => { if (e.target.matches('[data-ap]')) setTimeout(() => apClose(e.target), 150); });
  // Solo ida / Ida y vuelta
  const setTrip = (f, t) => { f.dataset.trip = t; f.querySelectorAll('[data-ttype]').forEach(b => { const on = b.dataset.ttype === t; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); const bk = f.querySelector('[data-back]'); if (bk) bk.hidden = t === 'one'; };
  box.addEventListener('click', e => { const b = e.target.closest('[data-ttype]'); if (b) setTrip(b.closest('form'), b.dataset.ttype); });

  box.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, k = f.dataset.f, v = n => (f.elements[n] ? String(f.elements[n].value || '').trim() : '');
    if (k === 'comparar') {
      const raw = v('q');
      const show = (q, prod) => {
        const list = ST.storesFor(country).map(s => ({ name: s.name, url: ST.searchUrl(s, q) })).filter(x => x.url);
        list.push({ name: 'Google Shopping', url: ST.googleShoppingUrl ? ST.googleShoppingUrl(q, country) : 'https://www.google.com/search?tbm=shop&q=' + encodeURIComponent(q) });
        const card = prod ? `<div class="pcard"><span>📦</span><div><b>${esc(prod.name)}</b>${prod.price ? `<small>${L('Precio en esa página', 'Price on that page')}: <b>${esc(prod.price.toLocaleString(lang() === 'en' ? 'en-US' : 'es-CO'))}${prod.currency ? ' ' + esc(prod.currency) : ''}</b></small>` : ''}<small>${L('Compáralo abajo en otras tiendas de', 'Compare it below in other stores in')} ${esc(cname(country))} ${L('(mira el precio TOTAL con envío)', '(check the TOTAL price with shipping)')}</small></div></div>` : '';
        out(k).innerHTML = `${card}<p class="hint">${L('Buscando', 'Searching')} <b>${esc(q)}</b> · ${esc(cname(country))}</p>${go(list)}`;
      };
      if (!ST || !raw) return;
      if (/^(https?:\/\/|www\.)/i.test(raw)) { readLink(raw, k).then(r => { const q = r ? r.q : queryFrom(raw); if (q) show(q, r); else out(k).innerHTML = `<p class="hint">${L('No pude leer ese enlace. Escribe el nombre del producto.', 'I could not read that link. Type the product name.')}</p>`; }); return; }
      show(raw, null);
    }
    if (k === 'vuelos' && TV) {
      const iata = x => { const m = String(x || '').match(/\(([A-Z]{3})\)\s*$/) || String(x || '').trim().match(/^([a-z]{3})$/i); return m ? m[1].toUpperCase() : (AP.best(x) || null); };
      const a = v('from'), b = v('to');
      const trip = { kind: 'flight', site: 'vigia', from: iata(a), to: iata(b), fromName: iata(a) ? null : a, toName: iata(b) ? null : b, out: v('out') || null, back: (f.dataset.trip === 'one' ? null : v('back') || null), adults: +v('pax') || 1 };
      out(k).innerHTML = `<p class="hint">${L('Abre 2 o 3 y compara. Ojo con la maleta: usa "Precio real del vuelo".', 'Open 2 or 3 and compare. Watch the bag fees: use "Real flight price".')}</p>${go((avMarker() && TV.aviasalesUrl ? [{ name: 'Aviasales', url: TV.aviasalesUrl(trip, avMarker()), aff: true }] : []).concat(TV.flightLinks(trip, country)))}${!trip.from || !trip.to ? `<p class="hint">${L('Tip: con el código del aeropuerto (BOG, MIA, MAD) las páginas abren con tu búsqueda lista y ves el calendario de días baratos.', 'Tip: with the airport code (BOG, MIA, MAD) the sites open with your search ready and you see the cheap-days calendar.')}</p>` : '<div data-cal></div>'}`;
      if (trip.from && trip.to && TV.aviasalesUrl) {
        const m0 = (trip.out || '').slice(0, 7), now = new Date().toISOString().slice(0, 7);
        calendar(trip, /^\d{4}-\d{2}$/.test(m0) && m0 >= now ? m0 : now);
      }
    }
    if (k === 'hoteles' && TV) {
      const ci = v('in'), co = v('outd');
      const trip = { kind: 'stay', site: 'vigia', dest: v('dest'), checkin: ci || null, checkout: co || null, nights: ci && co ? Math.max(1, Math.round((Date.parse(co) - Date.parse(ci)) / 86400000)) : null, adults: +v('pax') || 2 };
      out(k).innerHTML = `<p class="hint">${L('Compara el precio TOTAL con impuestos y tarifas, no solo el de la noche.', 'Compare the TOTAL price with taxes and fees, not just the nightly rate.')}</p>${go(TV.links(trip, country))}`;
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
  // 1.0.2: llega desde el bot con un vuelo (app.html?vuelo=BOG-MIA-2026-12-15): abre la pestaña de vuelos con la búsqueda lista
  try {
    const v0 = new URLSearchParams(location.search).get('vuelo');
    const tabV = box.querySelector('[data-tab="vuelos"]'), fv = box.querySelector('[data-f="vuelos"]');
    if (v0 && tabV && fv && !box.dataset.vDone) {
      box.dataset.vDone = '1'; tabV.click();
      const m = /^([A-Za-z]{3})-([A-Za-z]{3})(?:-(\d{4}-\d{2}-\d{2}))?$/.exec(v0.trim());
      if (m) {
        fv.elements.from.value = m[1].toUpperCase(); fv.elements.to.value = m[2].toUpperCase();
        if (m[3]) { fv.elements.out.value = m[3]; fv.elements.back.value = ''; setTrip(fv, 'one'); }
        fv.requestSubmit ? fv.requestSubmit() : fv.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    }
  } catch (e) {}
  }
  init();
  // Vista previa del editor (editor.html): vuelve a dibujar las herramientas con lo que vas cambiando
  window.addEventListener('message', ev => {
    if (ev.source !== window.parent || (ev.origin !== location.origin && location.protocol !== 'file:') || !ev.data || ev.data.type !== 'vigia-preview') return;
    const st = ev.data.settings || {};
    window.VIGIA_SITE = Object.assign({}, window.VIGIA_SITE, { herramientas: st.herramientas || {}, apps: st.apps || {}, afiliados: st.afiliados || {} });
    const old = document.getElementById('vtools');
    if (old) { const n = old.cloneNode(false); old.replaceWith(n); setTimeout(init, 0); }
  });
})();
