(function () {
  const $ = id => document.getElementById(id);
  const ORIG = JSON.parse(JSON.stringify(window.VIGIA_SITE || {}));
  const SECS = { promo: 'Aviso de Black Friday', cifras: 'Cifras (países, tiendas, idiomas)', problema: 'El problema y tabla comparativa', funciones: 'Funciones', como: 'Cómo funciona y capturas', calculadora: 'Calculadora de ahorro', principios: 'Nuestros principios', comparte: 'Vigía Comparte (obras benéficas)', carta: 'Carta del creador', invita: 'Invita y gana', preguntas: 'Preguntas frecuentes' };
  const PLANS = { esencial: 'Esencial', plus: 'Plus', familia: 'Familia', emprendedor: 'Emprendedor', pyme: 'Pyme', corporativo: 'Corporativo' };
  let lang = 'es';
  $('secs').innerHTML = Object.entries(SECS).map(([k, l]) => `<label><input type="checkbox" data-sec="${k}"> ${l}</label>`).join('');
  $('prs').innerHTML = Object.entries(PLANS).map(([k, l]) => `<span>${l}</span><input type="number" step="0.01" min="0" data-pm="${k}"><input type="number" step="0.01" min="0" data-py="${k}">`).join('');

  function fill(S) {
    const c = S.colores || {};
    ['marca', 'marcaOscuro', 'acento', 'dorado'].forEach(k => { $('c_' + k).value = c[k] || '#2F80ED'; });
    $('fuente').value = S.fuente || 'Inter'; $('esquinas').value = S.esquinas ?? 16;
    const t = S.textos || {}; ['titulo_es', 'titulo_en', 'subtitulo_es', 'subtitulo_en', 'firma'].forEach(k => { $(k).value = t[k] || ''; });
    document.querySelectorAll('[data-sec]').forEach(i => { i.checked = (S.secciones || {})[i.dataset.sec] !== false; });
    const p = S.precios || {}; Object.keys(PLANS).forEach(k => { const v = p[k] || ['', '']; document.querySelector(`[data-pm="${k}"]`).value = v[0]; document.querySelector(`[data-py="${k}"]`).value = v[1]; });
    ['obrasBeneficasPct', 'tiendaChrome', 'sitio', 'correo', 'blackFriday'].forEach(k => { $(k).value = S[k] ?? ''; });
    const r = S.redes || {}; ['instagram', 'tiktok', 'youtube', 'facebook'].forEach(k => { $('r_' + k).value = r[k] || ''; });
  }
  function read() {
    const S = { colores: {}, secciones: {}, textos: {}, precios: {}, redes: {} };
    ['marca', 'marcaOscuro', 'acento', 'dorado'].forEach(k => { S.colores[k] = $('c_' + k).value; });
    S.fuente = $('fuente').value; S.esquinas = +$('esquinas').value;
    document.querySelectorAll('[data-sec]').forEach(i => { S.secciones[i.dataset.sec] = i.checked; });
    ['titulo_es', 'titulo_en', 'subtitulo_es', 'subtitulo_en', 'firma'].forEach(k => { S.textos[k] = $(k).value.trim(); });
    Object.keys(PLANS).forEach(k => { S.precios[k] = [+document.querySelector(`[data-pm="${k}"]`).value || 0, +document.querySelector(`[data-py="${k}"]`).value || 0]; });
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
    const pr = Object.entries(S.precios).map(([k, v]) => `${k}: [${v[0]}, ${v[1]}]`).join(', ');
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
  precios: { ${pr} },
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
