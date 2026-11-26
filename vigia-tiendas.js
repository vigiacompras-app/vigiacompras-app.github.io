/*
 * Vigía — Tiendas donde buscar al comparar, por país y globales.
 * {q} = búsqueda codificada, {dash} = búsqueda con guiones (Mercado Libre, AliExpress).
 * Para añadir una tienda basta con agregar una línea aquí.
 */
(function (root) {
  'use strict';

  const ML = { CO: 'com.co', MX: 'com.mx', AR: 'com.ar', CL: 'cl', PE: 'com.pe', UY: 'com.uy', EC: 'com.ec', VE: 'com.ve', BO: 'com.bo', PY: 'com.py', CR: 'co.cr', DO: 'com.do', PA: 'com.pa', GT: 'com.gt', HN: 'com.hn', NI: 'com.ni', SV: 'com.sv' };
  const AMAZON = { US: 'com', MX: 'com.mx', BR: 'com.br', CA: 'ca', ES: 'es', GB: 'co.uk', DE: 'de', FR: 'fr', IT: 'it', NL: 'nl', JP: 'co.jp', IN: 'in', AU: 'com.au', SG: 'sg', AE: 'ae', SA: 'sa', TR: 'com.tr', SE: 'se', PL: 'pl', BE: 'com.be', EG: 'eg' };

  // Tiendas locales por país (las más usadas en cada uno): [nombre, plantilla de búsqueda]
  // El dueño puede agregar o quitar tiendas desde su ventana (configuración "stores"), sin publicar otra versión.
  const SHOPEE = { BR: 'shopee.com.br', SG: 'shopee.sg', PH: 'shopee.ph', MY: 'shopee.com.my', TH: 'shopee.co.th', VN: 'shopee.vn', ID: 'shopee.co.id', TW: 'shopee.tw' };
  const LAZADA = { SG: 'lazada.sg', PH: 'lazada.com.ph', MY: 'lazada.com.my', TH: 'lazada.co.th', VN: 'lazada.vn', ID: 'lazada.co.id' };
  const JUMIA = { NG: 'jumia.com.ng', KE: 'jumia.co.ke', EG: 'jumia.com.eg', MA: 'jumia.ma', GH: 'jumia.com.gh', CI: 'jumia.ci', SN: 'jumia.sn', UG: 'jumia.ug', TN: 'jumia.com.tn', DZ: 'jumia.dz' };
  const NOON = { AE: 'uae-en', SA: 'saudi-en', EG: 'egypt-en' };
  const LOCAL = {
    CO: [['Alkosto', 'https://www.alkosto.com/search?text={q}'], ['Ktronix', 'https://www.ktronix.com/search?text={q}'],
      ['Éxito', 'https://www.exito.com/s?q={q}'], ['Falabella', 'https://www.falabella.com.co/falabella-co/search?Ntt={q}'],
      ['Olímpica', 'https://www.olimpica.com/{q}?_q={q}&map=ft'], ['Homecenter', 'https://www.homecenter.com.co/homecenter-co/search?Ntt={q}'],
      ['Panamericana', 'https://www.panamericana.com.co/{q}?_q={q}&map=ft'], ['Jumbo', 'https://www.tiendasjumbo.co/{q}?_q={q}&map=ft']],
    MX: [['Liverpool', 'https://www.liverpool.com.mx/tienda?s={q}'], ['Walmart', 'https://www.walmart.com.mx/search?q={q}'],
      ['Coppel', 'https://www.coppel.com/SearchDisplay?searchTerm={q}'], ['Elektra', 'https://www.elektra.com.mx/{q}?_q={q}&map=ft'],
      ['Home Depot', 'https://www.homedepot.com.mx/s/{q}'], ['Soriana', 'https://www.soriana.com/buscar?q={q}'],
      ['Office Depot', 'https://www.officedepot.com.mx/officedepot/en/search/?text={q}']],
    CL: [['Falabella', 'https://www.falabella.com/falabella-cl/search?Ntt={q}'], ['Paris', 'https://www.paris.cl/search/?q={q}'],
      ['Ripley', 'https://simple.ripley.cl/search/{q}'], ['Lider', 'https://www.lider.cl/search?q={q}'], ['Hites', 'https://www.hites.com/search?q={q}'],
      ['PC Factory', 'https://www.pcfactory.cl/buscar?valor={q}'], ['Sodimac', 'https://sodimac.falabella.com/sodimac-cl/search?Ntt={q}']],
    PE: [['Falabella', 'https://www.falabella.com.pe/falabella-pe/search?Ntt={q}'], ['Ripley', 'https://simple.ripley.com.pe/search/{q}'],
      ['Oechsle', 'https://www.oechsle.pe/{q}?_q={q}&map=ft'], ['Plaza Vea', 'https://www.plazavea.com.pe/{q}?_q={q}&map=ft'],
      ['Promart', 'https://www.promart.pe/{q}?_q={q}&map=ft'], ['Hiraoka', 'https://hiraoka.com.pe/catalogsearch/result/?q={q}']],
    AR: [['Frávega', 'https://www.fravega.com/l/?keyword={q}'], ['Musimundo', 'https://www.musimundo.com/search?text={q}'],
      ['Carrefour', 'https://www.carrefour.com.ar/{q}?_q={q}&map=ft'], ['Cetrogar', 'https://www.cetrogar.com.ar/catalogsearch/result/?q={q}'],
      ['Naldo', 'https://www.naldo.com.ar/{q}?_q={q}&map=ft']],
    EC: [['De Prati', 'https://www.deprati.com.ec/search?text={q}'], ['Comandato', 'https://www.comandato.com/{q}?_q={q}&map=ft']],
    UY: [['Tienda Inglesa', 'https://www.tiendainglesa.com.uy/supermercado/busqueda?0,0,{q},0']],
    PA: [['Panafoto', 'https://www.panafoto.com/search?q={q}']],
    CR: [['Gollo', 'https://www.gollo.com/catalogsearch/result/?q={q}']],
    BR: [['Magalu', 'https://www.magazineluiza.com.br/busca/{q}/'], ['Americanas', 'https://www.americanas.com.br/busca/{q}'],
      ['Casas Bahia', 'https://www.casasbahia.com.br/{dash}/b'], ['KaBuM!', 'https://www.kabum.com.br/busca/{dash}'],
      ['Carrefour', 'https://www.carrefour.com.br/busca/{q}']],
    US: [['Walmart', 'https://www.walmart.com/search?q={q}'], ['Best Buy', 'https://www.bestbuy.com/site/searchpage.jsp?st={q}'],
      ['Target', 'https://www.target.com/s?searchTerm={q}'], ['Home Depot', 'https://www.homedepot.com/s/{q}'],
      ['Costco', 'https://www.costco.com/CatalogSearch?keyword={q}'], ['Newegg', 'https://www.newegg.com/p/pl?d={q}'],
      ["Lowe's", 'https://www.lowes.com/search?searchTerm={q}']],
    CA: [['Best Buy', 'https://www.bestbuy.ca/en-ca/search?search={q}'], ['Walmart', 'https://www.walmart.ca/en/search?q={q}'],
      ['Canadian Tire', 'https://www.canadiantire.ca/en/search-results.html?q={q}'], ['Costco', 'https://www.costco.ca/CatalogSearch?keyword={q}']],
    ES: [['El Corte Inglés', 'https://www.elcorteingles.es/search/?s={q}'], ['MediaMarkt', 'https://www.mediamarkt.es/es/search.html?query={q}'],
      ['PcComponentes', 'https://www.pccomponentes.com/buscar/?query={q}'], ['Fnac', 'https://www.fnac.es/SearchResult/ResultList.aspx?Search={q}'],
      ['Worten', 'https://www.worten.es/search?query={q}'], ['Carrefour', 'https://www.carrefour.es/?q={q}'], ['Leroy Merlin', 'https://www.leroymerlin.es/search?q={q}']],
    PT: [['Worten', 'https://www.worten.pt/search?query={q}'], ['Fnac', 'https://www.fnac.pt/SearchResult/ResultList.aspx?Search={q}'], ['Continente', 'https://www.continente.pt/pesquisa/?q={q}']],
    GB: [['Argos', 'https://www.argos.co.uk/search/{q}/'], ['Currys', 'https://www.currys.co.uk/search?q={q}'],
      ['John Lewis', 'https://www.johnlewis.com/search?search-term={q}'], ['Very', 'https://www.very.co.uk/search/{q}'], ['AO', 'https://ao.com/search?search={q}']],
    IE: [['Harvey Norman', 'https://www.harveynorman.ie/catalogsearch/result/?q={q}'], ['Currys', 'https://www.currys.ie/search?q={q}']],
    DE: [['Otto', 'https://www.otto.de/suche/{q}/'], ['MediaMarkt', 'https://www.mediamarkt.de/de/search.html?query={q}'],
      ['Saturn', 'https://www.saturn.de/de/search.html?query={q}'], ['Kaufland', 'https://www.kaufland.de/s/?search_value={q}']],
    AT: [['MediaMarkt', 'https://www.mediamarkt.at/de/search.html?query={q}'], ['Otto', 'https://www.otto.at/suche/{q}/']],
    CH: [['Digitec', 'https://www.digitec.ch/de/search?q={q}'], ['Galaxus', 'https://www.galaxus.ch/de/search?q={q}']],
    FR: [['Fnac', 'https://www.fnac.com/SearchResult/ResultList.aspx?Search={q}'], ['Cdiscount', 'https://www.cdiscount.com/search/10/{q}.html'],
      ['Darty', 'https://www.darty.com/nav/recherche?text={q}'], ['Boulanger', 'https://www.boulanger.com/resultats?tr={q}']],
    IT: [['MediaWorld', 'https://www.mediaworld.it/it/search.html?query={q}'], ['Unieuro', 'https://www.unieuro.it/online/?q={q}'],
      ['Euronics', 'https://www.euronics.it/search?q={q}']],
    NL: [['Bol', 'https://www.bol.com/nl/nl/s/?searchtext={q}'], ['Coolblue', 'https://www.coolblue.nl/zoeken?query={q}'], ['MediaMarkt', 'https://www.mediamarkt.nl/nl/search.html?query={q}']],
    BE: [['Bol', 'https://www.bol.com/be/nl/s/?searchtext={q}'], ['Coolblue', 'https://www.coolblue.be/nl/zoeken?query={q}']],
    PL: [['Allegro', 'https://allegro.pl/listing?string={q}'], ['Media Expert', 'https://www.mediaexpert.pl/search?query[querystring]={q}'], ['x-kom', 'https://www.x-kom.pl/szukaj?q={q}']],
    SE: [['Elgiganten', 'https://www.elgiganten.se/search?q={q}'], ['NetOnNet', 'https://www.netonnet.se/search?query={q}']],
    TR: [['Trendyol', 'https://www.trendyol.com/sr?q={q}'], ['Hepsiburada', 'https://www.hepsiburada.com/ara?q={q}']],
    RU: [['Ozon', 'https://www.ozon.ru/search/?text={q}'], ['Wildberries', 'https://www.wildberries.ru/catalog/0/search.aspx?search={q}']],
    IN: [['Flipkart', 'https://www.flipkart.com/search?q={q}'], ['Croma', 'https://www.croma.com/searchB?q={q}'], ['Reliance Digital', 'https://www.reliancedigital.in/search?q={q}']],
    JP: [['Rakuten', 'https://search.rakuten.co.jp/search/mall/{q}/'], ['Yahoo!ショッピング', 'https://shopping.yahoo.co.jp/search?p={q}'], ['Yodobashi', 'https://www.yodobashi.com/?word={q}']],
    KR: [['Coupang', 'https://www.coupang.com/np/search?q={q}'], ['Gmarket', 'https://browse.gmarket.co.kr/search?keyword={q}']],
    CN: [['JD', 'https://search.jd.com/Search?keyword={q}'], ['Taobao', 'https://s.taobao.com/search?q={q}']],
    AU: [['JB Hi-Fi', 'https://www.jbhifi.com.au/search?query={q}'], ['Harvey Norman', 'https://www.harveynorman.com.au/search?q={q}'],
      ['Kmart', 'https://www.kmart.com.au/search/?searchTerm={q}'], ['Big W', 'https://www.bigw.com.au/search?text={q}']],
    NZ: [['Noel Leeming', 'https://www.noelleeming.co.nz/search?q={q}'], ['The Warehouse', 'https://www.thewarehouse.co.nz/search?q={q}']],
    ZA: [['Takealot', 'https://www.takealot.com/all?qsearch={q}'], ['Makro', 'https://www.makro.co.za/search/?text={q}']],
    NG: [['Konga', 'https://www.konga.com/search?search={q}']],
    SA: [['Jarir', 'https://www.jarir.com/sa-en/catalogsearch/result/?q={q}']],
    IL: [['KSP', 'https://ksp.co.il/web/search?q={q}']]
  };
  // Mercados que se repiten en varios países
  Object.entries(SHOPEE).forEach(([c, h]) => (LOCAL[c] = LOCAL[c] || []).push(['Shopee', `https://${h}/search?keyword={q}`]));
  Object.entries(LAZADA).forEach(([c, h]) => (LOCAL[c] = LOCAL[c] || []).push(['Lazada', `https://www.${h}/catalog/?q={q}`]));
  Object.entries(JUMIA).forEach(([c, h]) => (LOCAL[c] = LOCAL[c] || []).push(['Jumia', `https://www.${h}/catalog/?q={q}`]));
  Object.entries(NOON).forEach(([c, h]) => (LOCAL[c] = LOCAL[c] || []).push(['noon', `https://www.noon.com/${h}/search/?q={q}`]));

  // Tiendas globales (envían a casi todo el mundo)
  const GLOBAL = [
    ['AliExpress', 'https://www.aliexpress.com/w/wholesale-{dash}.html'],
    ['Temu', 'https://www.temu.com/search_result.html?search_key={q}'],
    ['eBay', 'https://www.ebay.com/sch/i.html?_nkw={q}'],
    ['Shein', 'https://www.shein.com/pdsearch/{q}/']
  ];

  /** Lista de tiendas a consultar para un país. */
  function storesFor(country, currency, extra) {
    const out = [];
    const mine = (extra && extra[country]) || {};
    const removed = new Set((mine.remove || []).map(x => String(x).toLowerCase()));
    if (ML[country]) {
      const br = country === 'BR';
      out.push({ id: 'ml', name: br ? 'Mercado Livre' : 'Mercado Libre', currency, local: true,
        url: br ? 'https://lista.mercadolivre.com.br/{dash}' : `https://listado.mercadolibre.${ML[country]}/{dash}` });
    } else if (country === 'BR') {
      out.push({ id: 'ml', name: 'Mercado Livre', currency, local: true, url: 'https://lista.mercadolivre.com.br/{dash}' });
    }
    const ok = (name, url) => name && /^https:\/\/[^\s]+\{(q|dash)\}/.test(String(url || '')) && !removed.has(String(name).toLowerCase());
    const seen = new Set();
    // Las tiendas del dueño van primero: si tienen el mismo nombre que una incluida, la reemplazan (así se corrige una dirección)
    [].concat(mine.add || [], LOCAL[country] || []).forEach(([name, url]) => {
      const id = String(name).toLowerCase().replace(/\W/g, '') || 'tienda';
      if (!ok(name, url) || seen.has(id)) return;
      seen.add(id); out.push({ id, name: String(name).slice(0, 40), url, currency, local: true });
    });
    const amz = AMAZON[country];
    if (!removed.has('amazon')) out.push({ id: 'amazon', name: amz ? 'Amazon' : 'Amazon (EE. UU.)', url: `https://www.amazon.${amz || 'com'}/s?k={q}`, currency: amz ? currency : 'USD', local: !!amz });
    GLOBAL.filter(([name]) => !removed.has(name.toLowerCase())).forEach(([name, url]) => out.push({ id: name.toLowerCase(), name, url, currency: null, local: false }));
    return out;
  }

  const COLORS = /^(negro|negra|blanco|blanca|azul|rojo|roja|verde|gris|plata|plateado|dorado|rosado|rosa|morado|amarillo|black|white|blue|red|green|gray|grey|silver|gold|pink|purple|yellow|preto|branco|cinza|azul|vermelho|graphite|grafito|midnight|starlight)$/i;
  const FILLER = new Set(['de', 'la', 'el', 'los', 'las', 'en', 'con', 'para', 'por', 'y', 'e', 'o', 'the', 'and', 'with', 'for', 'of', 'new', 'nuevo', 'nueva', 'original', 'originales', 'envio', 'envío', 'gratis', 'free', 'shipping', 'oferta', 'sale', 'promo', 'color', 'unidad', 'un', 'una', 'a', 'do', 'da', 'com', 'para', 'sem',
    // 1.0.1: palabras de venta que ensucian la búsqueda ("SUPER OFERTA… envío gratis!!")
    'super', 'súper', 'mega', 'hot', 'promocion', 'promoción', 'promo', 'descuento', 'ofertas', 'liquidacion', 'liquidación', 'remate', 'barato', 'baratos', 'precio', 'solo', 'hoy', 'ya', 'disponible', 'disponibles', 'stock', 'entrega', 'inmediata', 'envios', 'envíos', 'domicilio', 'nacional', 'garantia', 'garantía', 'deal', 'deals', 'best', 'seller', 'top', 'venta', 'vendo', 'nuevos', 'nuevas', 'originals']);

  /** Convierte el nombre del producto en una búsqueda corta y precisa. */
  // Códigos de modelo ("9557", "BABNT9557", "SM-A155M"): las tiendas casi nunca los encuentran en una búsqueda
  const CODE = w => /\d/.test(w) && (/^[\d.,]+$/.test(w) || /[a-z]/i.test(w)) && w.length >= 4 && !/^\d+(gb|tb|mb|mah|w|v|hz|mm|cm|ml|l|kg|g|"|pulgadas)$/i.test(w);
  function words(product) {
    const ws = String(product.name || '')
      // 1.0.1: fuera emojis, #etiquetas, @cuentas, precios, porcentajes, "2x1" y signos de exclamación
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, ' ')
      .replace(/[#@][\p{L}\d_]+/gu, ' ')
      .replace(/(?:US\$|R\$|S\/|[$€£¥₹])\s?\d[\d.,]*|\b\d{1,3}\s?%|\b\d\s?x\s?\d\b|[!¡?¿*~]+/gi, ' ')
      .replace(/[|,;:()\[\]{}"“”/\\+]+/g, ' ')
      .split(/\s+/)
      .filter(w => w && !FILLER.has(w.toLowerCase()) && !COLORS.test(w) && !/^-+$/.test(w));
    if (product.brand && !ws.some(w => w.toLowerCase() === String(product.brand).toLowerCase())) ws.unshift(product.brand);
    return ws;
  }
  /** Búsqueda principal: marca + modelo, sin códigos, máximo 6 palabras (las tiendas encuentran más así). */
  function buildQuery(product) {
    const ws = words(product);
    const plain = ws.filter(w => !CODE(w));
    return (plain.length >= 2 ? plain : ws).slice(0, 6).join(' ');
  }
  /** Búsqueda de respaldo, más corta (3 palabras), por si la principal no encuentra nada. */
  function altQuery(product) {
    const ws = words(product).filter(w => !CODE(w));
    const q = ws.slice(0, 3).join(' ');
    return q && q !== buildQuery(product) ? q : null;
  }

  // Tiendas con búsqueda pública (VTEX): responden con los productos sin abrir ninguna página
  const VTEX = /(^|\.)(exito\.com|olimpica\.com|carulla\.com|jumbocolombia\.com|tiendasjumbo\.co|panamericana\.com\.co|coppel\.com|elektra\.com\.mx|walmart\.com\.mx|carrefour\.com\.br|carrefour\.com\.ar|naldo\.com\.ar|paris\.cl|plazavea\.com\.pe|oechsle\.pe|promart\.pe|comandato\.com)$/i;
  function apiUrl(store, query) {
    try {
      const u = new URL(searchUrl(store, 'x'));
      if (!VTEX.test(u.hostname)) return null;
      return u.origin + '/api/catalog_system/pub/products/search?ft=' + encodeURIComponent(query) + '&_from=0&_to=11';
    } catch (e) { return null; }
  }
  function searchUrl(store, query) {
    const q = encodeURIComponent(query);
    const dash = encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'));
    return store.url.split('{q}').join(q).split('{dash}').join(dash);
  }

  // 1.0: enlace seguro a un resultado. Nunca al inicio de la tienda:
  //  · tiendas VTEX (Éxito…): las direcciones de vendedores en "tienda.<dominio>" redirigen al inicio; se usa el dominio principal
  //  · si el enlace es el inicio (o no hay), se abre la búsqueda de ese producto en la tienda
  function fixLink(url, searchPageUrl, query) {
    let u = null, base = null;
    try { u = new URL(url); } catch (e) {}
    try { base = new URL(searchPageUrl); } catch (e) {}
    if (u && base && u.hostname !== base.hostname) {
      const dom = h => h.split('.').slice(-2).join('.');
      const same = dom(u.hostname) === dom(base.hostname) || u.hostname.endsWith('.' + base.hostname.replace(/^www\./, ''));
      if (same && VTEX.test(base.hostname) && /\/p\/?$/.test(u.pathname)) { u.hostname = base.hostname; u.protocol = base.protocol; }
    }
    const home = !u || /^\/?(index\.html?)?$/i.test(u.pathname) && !u.search;
    if (home) return base ? (/\{q\}|\{dash\}/.test(searchPageUrl) && query ? searchUrl({ url: searchPageUrl }, query) : base.href) : url;
    return u.href;
  }

  function googleShoppingUrl(query, country) {
    return `https://www.google.com/search?tbm=shop&gl=${(country || 'us').toLowerCase()}&q=${encodeURIComponent(query)}`;
  }

  const countriesWithStores = () => Object.keys(LOCAL).concat(Object.keys(ML)).filter((c, i, a) => a.indexOf(c) === i).sort();
  const api = { LOCAL, countriesWithStores, storesFor, buildQuery, altQuery, apiUrl, searchUrl, googleShoppingUrl, fixLink, VTEX };
  root.VigiaStores = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
