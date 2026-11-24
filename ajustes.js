// =====================================================================
//  AJUSTES DE LA PÁGINA DE VIGÍA
//  Lo más fácil: abre editor.html, cambia lo que quieras viendo el
//  resultado en vivo, pulsa "Descargar ajustes.js" y súbelo a GitHub
//  reemplazando este archivo. También puedes editarlo aquí mismo en GitHub
//  (lápiz ✏️ → cambiar → "Commit changes"). La página se actualiza en 1–2 min.
// =====================================================================
window.VIGIA_SITE = {
  // Colores (formato #RRGGBB)
  colores: {
    marca: '#2F80ED',        // color principal: botones, enlaces, títulos resaltados
    marcaOscuro: '#1E3A8A',  // degradados y botón al pasar el mouse
    acento: '#E11D74',       // toque de color de "Vigía Comparte"
    dorado: '#F5B301'        // detalles dorados
  },
  fuente: 'Inter',           // Inter, Poppins, Montserrat, Nunito, DM Sans, Plus Jakarta Sans, Outfit
  esquinas: 16,              // redondeo de tarjetas y botones (0 = cuadrado, 28 = muy redondo)

  // Secciones visibles (true = se muestra, false = se oculta)
  secciones: {
    promo: true,        // aviso de Black Friday (solo aparece en las fechas reales)
    cifras: true,       // 62 países · +110 tiendas · 14 idiomas
    problema: true,     // los 3 dolores y la tabla "a ciegas vs. Vigía"
    funciones: true,
    como: true,         // cómo funciona + capturas
    calculadora: true,  // ¿cuánto podrías ahorrar?
    principios: true,
    comparte: true,     // Vigía Comparte (obras benéficas)
    carta: true,        // carta del creador
    herramientas: true, // Vigía en la web: comparar, vuelos, hoteles, precio real y descuentos (sin instalar)
    celular: true,      // Vigía en el celular (Telegram y apps)
    invita: true,       // invita y gana + botones para compartir
    preguntas: true
  },

  // Textos principales (vacío = se usa el texto de fábrica).
  // En el título, lo que pongas entre *asteriscos* sale en el color de marca.
  textos: {
    titulo_es: '',
    titulo_en: '',
    subtitulo_es: '',
    subtitulo_en: '',
    firma: 'Santiago'
  },

  // Precios en USD por región (los mismos de la extensión). La página detecta el país del visitante.
  precios: {
    alto: { esencial: [4.99, 49.9], plus: [9.99, 99.9], familia: [14.99, 149.9], emprendedor: [29, 290], pyme: [59, 590], corporativo: [149, 1490] },
    medio: { esencial: [2.49, 24.9], plus: [4.99, 49.9], familia: [7.49, 74.9], emprendedor: [15, 150], pyme: [29, 290], corporativo: [75, 750] },
    bajo: { esencial: [1.29, 12.9], plus: [2.49, 24.9], familia: [3.79, 37.9], emprendedor: [8, 80], pyme: [15, 150], corporativo: [39, 390] }
  },
  // Países de cada región (código de 2 letras). Los que no estén en ninguna lista pagan "medio".
  regiones: {
    alto: ['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'IE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PT', 'LU', 'AU', 'NZ', 'JP', 'KR', 'SG', 'HK', 'TW', 'AE', 'SA', 'QA', 'KW', 'IL', 'PR', 'IS', 'BH', 'OM'],
    bajo: ['IN', 'ID', 'PH', 'VN', 'TH', 'MY', 'EG', 'NG', 'KE', 'GH', 'ZA', 'MA', 'PK', 'BD', 'LK', 'NP', 'BO', 'NI', 'HN', 'GT', 'SV', 'VE', 'CU', 'HT']
  },

  // Botón "Cómpralo ya" en cada plan: lleva al pago seguro de Polar (plan-región o plan-región-anual)
  compra: {
    activo: true,
    enlaces: {
      'esencial-alto': 'https://buy.polar.sh/polar_cl_EWUpOjpCXF1Rqfh8SgNqH3Gz89nVrpk6XqgRg36VU8A',
      'esencial-alto-anual': 'https://buy.polar.sh/polar_cl_NhyhFA6urhL15SuiP1SvWMIEBHEB8OVVEXzMU0MGSP2',
      'esencial-medio': 'https://buy.polar.sh/polar_cl_zwfx3Ie9ylPsjadvpoyVBRhUn1VNEht7yuqRh2k6krm',
      'esencial-medio-anual': 'https://buy.polar.sh/polar_cl_wwOrfuuM0e7cGjXozqHRek0GpRYNaVGfTVuft1ZJJDr',
      'esencial-bajo': 'https://buy.polar.sh/polar_cl_kPTJc71k7jEr5CdMj6yJfBt1QlzKvxkxZXJv12cU8xZ',
      'esencial-bajo-anual': 'https://buy.polar.sh/polar_cl_Ds4avHSHjilwx3fGAPiWYcgivjCGhDd3lFHV31T7imZ',
      'plus-alto': 'https://buy.polar.sh/polar_cl_i6FxO41VFHA8V7xiUj7rY2ocXpdBtoFEn4g6G2gwnzI',
      'plus-alto-anual': 'https://buy.polar.sh/polar_cl_OLdf9NjFEFGNdgbRuNrrNTvLj6q65xQP9guLq3UphOL',
      'plus-medio': 'https://buy.polar.sh/polar_cl_jSKN5TEkeMcGFHtSfomCf1VNhta7kWeMmou1s22RTxM',
      'plus-medio-anual': 'https://buy.polar.sh/polar_cl_aoYlZDF3GzqH2Klx3Oq5cr8C3J9E3rCh7mocy1oig2d',
      'plus-bajo': 'https://buy.polar.sh/polar_cl_mEsNWPUv95LyTKGL8sJlk0WJ6QiaULdvsOQt81N0zr8',
      'plus-bajo-anual': 'https://buy.polar.sh/polar_cl_1MrjxlS7fa5Dr4J4vbbYf0EwaPjlJXZ6gSxDl1Nk5FL',
      'familia-alto': 'https://buy.polar.sh/polar_cl_Ss4wwDrGlrXGbvlfw4xSG0q91VAKbj3bSztvO1nOZ98',
      'familia-alto-anual': 'https://buy.polar.sh/polar_cl_QDKXSL4ApuVLuM3sZwndwdMA4LL6h9gcV1ZuE0g0dht',
      'familia-medio': 'https://buy.polar.sh/polar_cl_mfbcvEfSzvGeYx0Go36Snuasbj9tQlsWXVc3o2LDoDU',
      'familia-medio-anual': 'https://buy.polar.sh/polar_cl_2Ta3V1Yx4wRD2ng9IjWy3iAVWPabKqHC4gXJV0LpNIc',
      'familia-bajo': 'https://buy.polar.sh/polar_cl_qoe7pWjEWHEpDxuuaS8kZXTgBToWsNZ2D56oF0e4ZqN',
      'familia-bajo-anual': 'https://buy.polar.sh/polar_cl_FcSkjLp1GjusrZUzK9SAXCgFd632BQq25GjBn037Kfl',
      'emprendedor-alto': 'https://buy.polar.sh/polar_cl_h0aGdHnMLrihkdgtHAe345D1VhME5icyzVqoO0iFovz',
      'emprendedor-alto-anual': 'https://buy.polar.sh/polar_cl_ohcbZ6Eh5JFxzBtSram95psFqRGMsYybXiFQs13QvqD',
      'emprendedor-medio': 'https://buy.polar.sh/polar_cl_K3InDf38ZR682V6x4RIgXY9ZR8wYMYjNXRHQC3QVEDa',
      'emprendedor-medio-anual': 'https://buy.polar.sh/polar_cl_fIT5fpnrs96AKkVoygBfwj3ndU354xvPfrGw40c7KkL',
      'emprendedor-bajo': 'https://buy.polar.sh/polar_cl_J9OA9YtcduyDbeqP8SN2kQpucU9jmQcxdWQyp0LbvsG',
      'emprendedor-bajo-anual': 'https://buy.polar.sh/polar_cl_y6WFWRgbWaPOSvzbBQT9soaxx5tLz5t4Ol9rS1X5kF0',
      'pyme-alto': 'https://buy.polar.sh/polar_cl_hX6sIlPvAnTQLt1bpr8W3iq1RPVTUCP7EpTYT3rivu4',
      'pyme-alto-anual': 'https://buy.polar.sh/polar_cl_yFxN5GCzZpQoMM14x9cvZh71fcmSko3Emri0o1gfuX1',
      'pyme-medio': 'https://buy.polar.sh/polar_cl_NwrWFhkENaYPfJ1NpjPfH5n56GDvvezUFHVRD01Me7i',
      'pyme-medio-anual': 'https://buy.polar.sh/polar_cl_CvWpwWCJkDK7DkBTYAsRNZJGF7pQD7YFkNSLh3bcrNx',
      'pyme-bajo': 'https://buy.polar.sh/polar_cl_1NkBtLqOWNnaAHqCks3R146FEzOLlYV1K3I5E0vx4ao',
      'pyme-bajo-anual': 'https://buy.polar.sh/polar_cl_SBVqj8QDLWTBEQDkmMK8AjBkxubL5fDAbqOG34ELhzc',
      'corporativo-alto': 'https://buy.polar.sh/polar_cl_gIURF0kE6NAIyzUSCmAJ1Ses6v1QIsKgUtBzT2MwxID',
      'corporativo-alto-anual': 'https://buy.polar.sh/polar_cl_VpTbk4jGjGQh9YX3QGS1gUFz2lS9F44alGPk544khBQ',
      'corporativo-medio': 'https://buy.polar.sh/polar_cl_l3PfoTc3FJGPGAnVa3yqJ9jF6zjbqkdxZB58o2wN7SF',
      'corporativo-medio-anual': 'https://buy.polar.sh/polar_cl_IBymKrMjjWYV3elUXZGdspwEiUPT207hwxT29418k23',
      'corporativo-bajo': 'https://buy.polar.sh/polar_cl_mvEPEGhfUXLCNhkGG3R9Bah70cuhldy4J6qgC3IGSaf',
      'corporativo-bajo-anual': 'https://buy.polar.sh/polar_cl_rQgk1m8CoZoV3WsShnqYPOItQvLlodcYq3hKh18Yv7m'
    }
  },

  // Herramientas de Vigía en la web (sección "Úsalo ya" y la app del celular app.html). true = se muestra
  herramientas: { comparar: true, vuelos: true, hoteles: true, precioReal: true, descuento: true, app: true },

  // Vigía en el celular. Si un enlace está vacío, el botón dice "Muy pronto".
  apps: {
    telegram: 'https://t.me/VigiaComprasBot',   // bot de alertas
    android: '',                                  // enlace de Google Play (cuando exista)
    ios: ''                                       // enlace de App Store (cuando exista)
  },

  // Datos generales
  obrasBeneficasPct: 10,                         // % de ganancias de Premium para obras benéficas
  tiendaChrome: 'https://chromewebstore.google.com/detail/mgohniechhonhcphkncfinadfdncldnc', // enlace de Vigía en la Chrome Web Store (cuando esté publicada)
  sitio: 'https://vigiacompras.com',             // dirección de esta página
  correo: 'soporte@vigiacompras.com',            // correo de soporte
  redes: { instagram: '', tiktok: '', youtube: '', facebook: '' },
  blackFriday: '2026-11-27'
};
