(function () {
  const $ = id => document.getElementById(id);
  const ORIG = JSON.parse(JSON.stringify(window.VIGIA_SITE || {}));
  const SECS = { promo: 'Aviso de Black Friday', cifras: 'Cifras (países, tiendas, idiomas)', problema: 'El problema y tabla comparativa', funciones: 'Funciones', como: 'Cómo funciona y capturas', calculadora: 'Calculadora de ahorro', principios: 'Nuestros principios', comparte: 'Vigía Comparte (obras benéficas)', carta: 'Carta del creador', herramientas: 'Úsalo ya: herramientas de Vigía en la web', celular: 'Vigía en el celular (Telegram y apps)', invita: 'Invita y gana', preguntas: 'Preguntas frecuentes' };
  const TOOLS = { comparar: 'Comparar un producto', vuelos: 'Buscar vuelos', hoteles: 'Buscar hoteles', precioReal: 'Precio real del vuelo (maletas)', descuento: '¿Descuento real?', app: 'Botón «Instalar Vigía en el celular»' };
  const PLANS = { esencial: 'Esencial', plus: 'Plus', familia: 'Familia', emprendedor: 'Emprendedor', pyme: 'Pyme', corporativo: 'Corporativo' };
  let lang = 'es';
  $('secs').innerHTML = Object.entries(SECS).map(([k, l]) => `<label><input type="checkbox" data-sec="${k}"> ${l}</label>`).join('');
  $('tools').innerHTML = Object.entries(TOOLS).map(([k, l]) => `<label><input type="checkbox" data-tool="${k}"> ${l}</label>`).join('');
  $('prs').innerHTML = Object.entries(PLANS).map(([k, l]) => `<span>${l}</span><input type="number" step="0.01" min="0" data-pm="${k}"><input type="number" step="0.01" min="0" data-py="${k}">`).join('');
  $('lks').innerHTML = Object.entries(PLANS).map(([k, l]) => `<label>${l} · mensual <input type="url" data-lm="${k}" placeholder="https://buy.polar.sh/…"></label><label>${l} · anual <input type="url" data-ly="${k}" placeholder="https://buy.polar.sh/…"></label>`).join('');
  // Precios y enlaces de las tres regiones (el formulario muestra una a la vez)
  let PR = { alto: {}, medio: {}, bajo: {} }, LK = {}, REG = 'medio';
  function normPrices(p) {
    p = p || {};
    if (p.alto || p.medio || p.bajo) return { alto: { ...(p.alto || {}) }, medio: { ...(p.medio || {}) }, bajo: { ...(p.bajo || {}) } };
    return { alto: {}, medio: { ...p }, bajo: {} }; // formato antiguo: un solo precio
  }
  function showRegion() {
    Object.keys(PLANS).forEach(k => {
      const v = PR[REG][k] || ['', ''];
      document.querySelector(`[data-pm="${k}"]`).value = v[0]; document.querySelector(`[data-py="${k}"]`).value = v[1];
      document.querySelector(`[data-lm="${k}"]`).value = LK[`${k}-${REG}`] || ''; document.querySelector(`[data-ly="${k}"]`).value = LK[`${k}-${REG}-anual`] || '';
    });
  }
  function keepRegion() {
    Object.keys(PLANS).forEach(k => {
      PR[REG][k] = [+document.querySelector(`[data-pm="${k}"]`).value || 0, +document.querySelector(`[data-py="${k}"]`).value || 0];
      LK[`${k}-${REG}`] = document.querySelector(`[data-lm="${k}"]`).value.trim(); LK[`${k}-${REG}-anual`] = document.querySelector(`[data-ly="${k}"]`).value.trim();
    });
  }
  $('reg').addEventListener('change', () => { keepRegion(); REG = $('reg').value; showRegion(); $('pv').src = 'index.html?region=' + REG + '#precios'; });
  const list = v => String(v || '').toUpperCase().split(/[^A-Z]+/).filter(x => x.length === 2);

  function fill(S) {
    const c = S.colores || {};
    ['marca', 'marcaOscuro', 'acento', 'dorado'].forEach(k => { $('c_' + k).value = c[k] || '#2F80ED'; });
    $('fuente').value = S.fuente || 'Inter'; $('esquinas').value = S.esquinas ?? 16;
    const t = S.textos || {}; ['titulo_es', 'titulo_en', 'subtitulo_es', 'subtitulo_en', 'firma'].forEach(k => { $(k).value = t[k] || ''; });
    document.querySelectorAll('[data-sec]').forEach(i => { i.checked = (S.secciones || {})[i.dataset.sec] !== false; });
    PR = normPrices(S.precios); LK = { ...((S.compra || {}).enlaces || {}) }; showRegion();
    $('compra_on').checked = !S.compra || S.compra.activo !== false;
    const rg = S.regiones || {}; $('reg_alto').value = (rg.alto || []).join(', '); $('reg_bajo').value = (rg.bajo || []).join(', ');
    const af = S.afiliados || {}; $('af_aviasales').value = af.aviasales || '';
    $('af_amazon').value = Object.entries(af.amazon || {}).map(([d, t]) => d + ' | ' + (t || '')).join('\n');
    $('af_tiendas').value = (af.tiendas || []).map(x => x[0] + ' | ' + x[1]).join('\n');
    $('af_aliadas').value = (S.aliadas || []).join('\n');
    $('canalOfertas').value = S.canalOfertas || '';
    $('af_bf').value = (S.ofertasBF || []).map(x => x.join(' | ')).join('\n');
    const ap = S.apps || {}; ['telegram', 'android', 'ios'].forEach(k => { $('a_' + k).value = ap[k] || ''; });
    document.querySelectorAll('[data-tool]').forEach(i => { i.checked = (S.herramientas || {})[i.dataset.tool] !== false; });
    ['obrasBeneficasPct', 'tiendaChrome', 'sitio', 'correo', 'blackFriday'].forEach(k => { $(k).value = S[k] ?? ''; });
    const r = S.redes || {}; ['instagram', 'tiktok', 'youtube', 'facebook'].forEach(k => { $('r_' + k).value = r[k] || ''; });
  }
  function read() {
    const S = { colores: {}, secciones: {}, textos: {}, precios: {}, redes: {} };
    ['marca', 'marcaOscuro', 'acento', 'dorado'].forEach(k => { S.colores[k] = $('c_' + k).value; });
    S.fuente = $('fuente').value; S.esquinas = +$('esquinas').value;
    document.querySelectorAll('[data-sec]').forEach(i => { S.secciones[i.dataset.sec] = i.checked; });
    ['titulo_es', 'titulo_en', 'subtitulo_es', 'subtitulo_en', 'firma'].forEach(k => { S.textos[k] = $(k).value.trim(); });
    keepRegion(); S.precios = JSON.parse(JSON.stringify(PR));
    S.compra = { activo: $('compra_on').checked, enlaces: { ...LK } };
    S.regiones = { alto: list($('reg_alto').value), bajo: list($('reg_bajo').value) };
    const pairs = v => v.split('\n').map(l => l.split('|').map(x => x.trim())).filter(x => x[0] && x.length > 1);
    S.afiliados = { aviasales: $('af_aviasales').value.replace(/[^\w]/g, ''), amazon: {}, tiendas: pairs($('af_tiendas').value).filter(x => /^https:\/\//.test(x[1]) && x[1].includes('{url}')).map(x => [x[0].replace(/^https?:\/\//, '').replace(/\/.*$/, ''), x[1]]) };
    pairs($('af_amazon').value).forEach(([d, t]) => { const dom = d.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''); if (/^amazon\.[a-z.]+$/.test(dom)) S.afiliados.amazon[dom] = t.replace(/[^\w-]/g, ''); });
    S.canalOfertas = /^https:\/\/t\.me\//.test($('canalOfertas').value.trim()) ? $('canalOfertas').value.trim() : '';
    S.ofertasBF = $('af_bf').value.split('\n').map(l => l.split('|').map(x => x.trim())).filter(x => x.length >= 4 && x[1] && x[3]).slice(0, 24).map(x => x.slice(0, 4));
    S.aliadas = $('af_aliadas').value.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 40);
    S.apps = {}; ['telegram', 'android', 'ios'].forEach(k => { S.apps[k] = $('a_' + k).value.trim(); });
    S.herramientas = {}; document.querySelectorAll('[data-tool]').forEach(i => { S.herramientas[i.dataset.tool] = i.checked; });
    S.obrasBeneficasPct = Math.max(0, Math.min(100, +$('obrasBeneficasPct').value || 0));
    ['tiendaChrome', 'sitio', 'correo', 'blackFriday'].forEach(k => { S[k] = $(k).value.trim(); });
    ['instagram', 'tiktok', 'youtube', 'facebook'].forEach(k => { S.redes[k] = $('r_' + k).value.trim(); });
    return S;
  }
  function send() {
    $('esqv').textContent = $('esquinas').value + ' px';
    try { $('pv').contentWindow.postMessage({ type: 'vigia-preview', settings: read(), lang }, location.protocol === 'file:' ? '*' : location.origin); } catch (e) {}
  }
  function fileText(S) {
    const J = v => JSON.stringify(v);
    const sec = Object.entries(S.secciones).map(([k, v]) => `    ${k}: ${v}`).join(',\n');
    const tierTxt = t => '{ ' + Object.entries(S.precios[t] || {}).map(([k, v]) => `${k}: [${v[0]}, ${v[1]}]`).join(', ') + ' }';
    const lk = Object.entries(S.compra.enlaces).filter(([, v]) => v).map(([k, v]) => `      ${J(k)}: ${J(v)}`).join(',\n');
    return `// =====================================================================
//  AJUSTES DE LA PÁGINA DE VIGÍA — creado con editor.html el ${new Date().toLocaleString('es-CO')}
//  Súbelo a GitHub reemplazando ajustes.js. La página se actualiza en 1–2 minutos.
// =====================================================================
window.VIGIA_SITE = {
  colores: { marca: ${J(S.colores.marca)}, marcaOscuro: ${J(S.colores.marcaOscuro)}, acento: ${J(S.colores.acento)}, dorado: ${J(S.colores.dorado)} },
  fuente: ${J(S.fuente)},
  esquinas: ${S.esquinas},
  secciones: {
${sec}
  },
  textos: {
    titulo_es: ${J(S.textos.titulo_es)},
    titulo_en: ${J(S.textos.titulo_en)},
    subtitulo_es: ${J(S.textos.subtitulo_es)},
    subtitulo_en: ${J(S.textos.subtitulo_en)},
    firma: ${J(S.textos.firma)}
  },
  precios: {
    alto: ${tierTxt('alto')},
    medio: ${tierTxt('medio')},
    bajo: ${tierTxt('bajo')}
  },
  regiones: {
    alto: ${J(S.regiones.alto)},
    bajo: ${J(S.regiones.bajo)}
  },
  compra: {
    activo: ${S.compra.activo},
    enlaces: {
${lk}
    }
  },
  herramientas: { ${Object.entries(S.herramientas).map(([k, v]) => k + ': ' + v).join(', ')} },
  afiliados: { aviasales: ${J(S.afiliados.aviasales)}, amazon: ${J(S.afiliados.amazon)}, tiendas: ${J(S.afiliados.tiendas)} },
  aliadas: ${J(S.aliadas)},
  ofertasBF: ${J(S.ofertasBF)},
  canalOfertas: ${J(S.canalOfertas)},
  apps: { telegram: ${J(S.apps.telegram)}, android: ${J(S.apps.android)}, ios: ${J(S.apps.ios)} },
  obrasBeneficasPct: ${S.obrasBeneficasPct},
  tiendaChrome: ${J(S.tiendaChrome)},
  sitio: ${J(S.sitio)},
  correo: ${J(S.correo)},
  redes: { instagram: ${J(S.redes.instagram)}, tiktok: ${J(S.redes.tiktok)}, youtube: ${J(S.redes.youtube)}, facebook: ${J(S.redes.facebook)} },
  blackFriday: ${J(S.blackFriday)}
};
`;
  }
  function toast(m) { const o = $('ok'); o.textContent = m; o.style.display = 'block'; setTimeout(() => { o.style.display = 'none'; }, 4000); }

  document.querySelector('aside').addEventListener('input', send);
  document.querySelector('aside').addEventListener('change', send);
  document.querySelectorAll('[data-pal]').forEach(b => b.addEventListener('click', () => { const [a, d, c, g] = b.dataset.pal.split(','); $('c_marca').value = a; $('c_marcaOscuro').value = d; $('c_acento').value = c; $('c_dorado').value = g; send(); }));
  document.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('[data-w]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); $('pv').style.width = b.dataset.w; }));
  document.querySelectorAll('[data-lg]').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lg; document.querySelectorAll('[data-lg]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); send(); }));
  $('pv').addEventListener('load', send);
  $('dl').addEventListener('click', () => {
    const blob = new Blob([fileText(read())], { type: 'text/javascript' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ajustes.js'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Listo. Ahora en GitHub: abre el repositorio → "Add file" → "Upload files" → arrastra ajustes.js → "Commit changes".');
  });
  $('cp').addEventListener('click', async () => { try { await navigator.clipboard.writeText(fileText(read())); toast('Copiado. En GitHub abre ajustes.js → lápiz ✏️ → borra todo, pega y "Commit changes".'); } catch (e) {} });
  $('rs').addEventListener('click', () => { fill(ORIG); send(); toast('Volviste a lo que está publicado.'); });
  fill(ORIG); send();
})();
