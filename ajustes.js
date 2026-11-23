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

  // Precios en USD (los que se muestran en la página)
  precios: {
    esencial: [2.49, 24.90], plus: [4.99, 49.90], familia: [7.49, 74.90],
    emprendedor: [15, 150], pyme: [29, 290], corporativo: [75, 750]
  },

  // Datos generales
  obrasBeneficasPct: 10,                         // % de ganancias de Premium para obras benéficas
  tiendaChrome: 'https://chromewebstore.google.com/detail/mgohniechhonhcphkncfinadfdncldnc',                              // enlace de Vigía en la Chrome Web Store (cuando esté publicada)
  sitio: 'https://vigiacompras.com',             // dirección de esta página
  correo: 'soporte@vigiacompras.com',            // correo de soporte
  redes: { instagram: '', tiktok: '', youtube: '', facebook: '' },
  blackFriday: '2026-11-27'
};
