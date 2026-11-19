// Vigía — sitio web. No hace falta tocar este archivo: lo editable está en ajustes.js (o usa editor.html).
(function () {
  const DEF = {
    colores: { marca: '#2F80ED', marcaOscuro: '#1E3A8A', acento: '#E11D74', dorado: '#F5B301' },
    fuente: 'Inter', esquinas: 16, secciones: {}, textos: {}, precios: {},
    obrasBeneficasPct: 10, tiendaChrome: '', sitio: 'https://vigiacompras-app.github.io',
    correo: 'vigiacompras.app@gmail.com', redes: {}, blackFriday: '2026-11-27'
  };
  const merge = (a, b) => { const o = Object.assign({}, a); for (const k in (b || {})) o[k] = (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) ? merge(a[k] || {}, b[k]) : b[k]; return o; };
  let S = merge(DEF, window.VIGIA_SITE || {});

  const html = document.documentElement;
  const $$ = s => document.querySelectorAll(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const FACT = {}; // textos de fábrica
  $$('[data-txt] [data-l]').forEach(el => { FACT[el.parentElement.dataset.txt + '_' + el.dataset.l] = el.innerHTML; });
  let lang = 'es', per = 'm';
  try { lang = localStorage.getItem('vigia-lang') || ((navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en'); } catch (e) {}
  const T = (es, en) => lang === 'es' ? es : en;

  // ----- Apariencia -----
  function theme() {
    const c = S.colores, st = html.style;
    st.setProperty('--brand', c.marca); st.setProperty('--brand-d', c.marcaOscuro);
    st.setProperty('--accent', c.acento); st.setProperty('--gold', c.dorado);
    st.setProperty('--r', Math.max(0, Math.min(32, +S.esquinas || 0)) + 'px');
    const f = S.fuente || 'Inter';
    st.setProperty('--font', `'${f}'`);
    if (f !== 'Inter' && !document.getElementById('font-' + f)) {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.id = 'font-' + f;
      l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(f) + ':wght@400;500;600;700;800&display=swap';
      document.head.appendChild(l);
    }
    $$('[data-sec]').forEach(el => { el.hidden = S.secciones[el.dataset.sec] === false; });
    $$('[data-txt]').forEach(box => box.querySelectorAll('[data-l]').forEach(el => {
      const v = (S.textos[box.dataset.txt + '_' + el.dataset.l] || '').trim();
      el.innerHTML = v ? esc(v).replace(/\*([^*]+)\*/g, '<em>$1</em>') : FACT[box.dataset.txt + '_' + el.dataset.l];
    }));
    $$('.firma').forEach(el => { el.textContent = S.textos.firma || 'Santiago'; });
    $$('.price[data-p]').forEach(el => { const p = S.precios[el.dataset.p]; if (p) { el.dataset.m = p[0]; el.dataset.y = p[1]; } });
    $$('.pct').forEach(b => { b.textContent = S.obrasBeneficasPct + ' %'; });
    $$('a.mail').forEach(a => { a.href = 'mailto:' + S.correo; a.textContent = S.correo; });
    const soc = document.getElementById('social');
    if (soc) { const n = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', facebook: 'Facebook' }; soc.innerHTML = Object.entries(S.redes || {}).filter(([, u]) => /^https:\/\//.test(u || '')).map(([k, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${n[k] || k}</a>`).join(''); }
    $$('.store-link').forEach(a => {
      if (S.tiendaChrome) { a.href = S.tiendaChrome; a.target = '_blank'; a.rel = 'noopener'; }
      if (a.closest('.hero, .final, .mbar')) a.querySelectorAll('[data-l]').forEach(s => {
        if (!s.dataset.orig) s.dataset.orig = s.textContent;
        s.textContent = S.tiendaChrome ? s.dataset.orig : (s.dataset.l === 'es' ? 'Muy pronto en Chrome Web Store' : 'Coming soon to the Chrome Web Store');
      });
    });
  }

  function setLang(l) {
    lang = l === 'en' ? 'en' : 'es';
    html.dataset.lang = lang; html.lang = lang;
    $$('[data-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.set === lang)));
    try { localStorage.setItem('vigia-lang', lang); } catch (e) {}
    setPer(per); calc(); promo(); shareLinks();
  }
  $$('[data-set]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.set)));

  // ----- Precios mensual / anual -----
  function money(n) { return 'US$' + (Number.isInteger(+n) ? String(+n) : (+n).toFixed(2)).replace('.', lang === 'es' ? ',' : '.'); }
  function setPer(p) {
    per = p;
    $$('[data-per]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.per === per)));
    const unit = per === 'm' ? T('/mes', '/mo') : T('/año', '/yr');
    $$('.price[data-m]').forEach(el => { el.innerHTML = money(per === 'm' ? el.dataset.m : el.dataset.y) + ` <span class="per">${unit}</span>`; });
  }
  $$('[data-per]').forEach(b => b.addEventListener('click', () => setPer(b.dataset.per)));

  // ----- Calculadora (ejemplo ilustrativo) -----
  const RATE = { COP: 4000, MXN: 18, USD: 1, EUR: 0.92, PEN: 3.7, CLP: 930, ARS: 1000, BRL: 5.4 }; // aproximado
  const DEFS = { COP: 500000, MXN: 2500, USD: 150, EUR: 150, PEN: 500, CLP: 120000, ARS: 150000, BRL: 700 };
  const cur = document.getElementById('cur'), spend = document.getElementById('spend'), pct = document.getElementById('pct');
  try { const g = (navigator.language || '').split('-')[1]; const m = { CO: 'COP', MX: 'MXN', US: 'USD', ES: 'EUR', PE: 'PEN', CL: 'CLP', AR: 'ARS', BR: 'BRL' }[g]; if (m && cur) { cur.value = m; spend.value = DEFS[m]; } } catch (e) {}
  function fmt(n, c) { try { return new Intl.NumberFormat(lang === 'es' ? 'es-CO' : 'en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n); } catch (e) { return c + ' ' + Math.round(n); } }
  function calc() {
    if (!cur) return;
    const c = cur.value, s = Math.max(0, +spend.value || 0), p = +pct.value;
    document.getElementById('pctv').textContent = p + ' %';
    const save = s * 12 * p / 100, plus = ((S.precios.plus || [4.99, 49.9])[1]) * RATE[c];
    document.getElementById('save').textContent = fmt(save, c);
    document.getElementById('roi').textContent = save > plus
      ? T(`Vigía Plus cuesta cerca de ${fmt(plus, c)} al año: el ahorro sería unas ${Math.max(1, Math.round(save / plus))} veces lo que pagas.`, `Vigía Plus costs about ${fmt(plus, c)} a year: savings would be about ${Math.max(1, Math.round(save / plus))}× what you pay.`)
      : T('Con el plan gratis ya tienes nota, descuentos falsos y tiendas dudosas sin pagar nada.', 'With the free plan you already get the score, fake discounts and risky stores at no cost.');
  }
  if (cur) { cur.addEventListener('change', () => { spend.value = DEFS[cur.value]; calc(); }); spend.addEventListener('input', calc); pct.addEventListener('input', calc); }

  // ----- Aviso de Black Friday (solo en las fechas reales) -----
  function promo() {
    const el = document.getElementById('promo'); if (!el) return;
    const bf = new Date(S.blackFriday + 'T00:00:00'), end = new Date(bf.getTime() + 4 * 86400000), now = new Date();
    if (S.secciones.promo === false || now >= end || bf - now > 21 * 86400000) { el.hidden = true; return; }
    el.hidden = false;
    const d = Math.ceil((bf - now) / 86400000);
    el.querySelectorAll('.cd').forEach(s => { s.textContent = d > 1 ? T(`(faltan ${d} días)`, `(${d} days left)`) : d === 1 ? T('(es mañana)', '(tomorrow)') : T('(¡es hoy!)', '(today!)'); });
  }

  // ----- Compartir -----
  function shareLinks() {
    const url = S.tiendaChrome || S.sitio;
    const msg = T('Uso Vigía para saber si un descuento es real y encontrar el mismo producto más barato. Es gratis: ', 'I use Vigía to check if a deal is real and find the same product cheaper. It\'s free: ');
    const e = encodeURIComponent;
    const L = { wa: `https://wa.me/?text=${e(msg + url)}`, fb: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`, x: `https://twitter.com/intent/tweet?text=${e(msg)}&url=${e(url)}`, tg: `https://t.me/share/url?url=${e(url)}&text=${e(msg)}` };
    $$('[data-share]').forEach(a => { if (L[a.dataset.share]) a.href = L[a.dataset.share]; });
  }
  $$('[data-share="copy"]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(S.tiendaChrome || S.sitio); const o = b.innerHTML; b.textContent = T('¡Copiado!', 'Copied!'); setTimeout(() => { b.innerHTML = o; }, 1600); } catch (e) {}
  }));

  // ----- Vista previa en vivo desde editor.html -----
  window.addEventListener('message', ev => {
    if (ev.source !== window.parent || (ev.origin !== location.origin && location.protocol !== 'file:') || !ev.data || ev.data.type !== 'vigia-preview') return;
    S = merge(DEF, ev.data.settings || {}); if (ev.data.lang) lang = ev.data.lang;
    theme(); setLang(lang);
  });

  theme(); setLang(lang);
})();
