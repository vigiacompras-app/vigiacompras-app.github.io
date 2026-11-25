/* Vigía — Viajes: lee destino, fechas y huéspedes en Airbnb, Booking, Expedia, Hotels.com, Vrbo y Despegar,
   calcula el precio real por noche y arma la misma búsqueda en las otras plataformas. Funciones puras. */
(function (root) {
  'use strict';
  const DAY = 86400000;
  const SITES = [
    { id: 'airbnb', name: 'Airbnb', match: /(^|\.)airbnb\.[a-z.]+$/ },
    { id: 'booking', name: 'Booking.com', match: /(^|\.)booking\.com$/ },
    { id: 'expedia', name: 'Expedia', match: /(^|\.)expedia\.[a-z.]+$/ },
    { id: 'hotels', name: 'Hotels.com', match: /(^|\.)hotels\.com$/ },
    { id: 'vrbo', name: 'Vrbo', match: /(^|\.)vrbo\.com$/ },
    { id: 'despegar', name: 'Despegar', match: /(^|\.)(despegar\.[a-z.]+|decolar\.com)$/ },
    { id: 'agoda', name: 'Agoda', match: /(^|\.)agoda\.com$/ },
    // Plataformas grandes en otras regiones del mundo
    { id: 'tripcom', name: 'Trip.com', match: /(^|\.)(trip\.com|ctrip\.com)$/ },
    { id: 'traveloka', name: 'Traveloka', match: /(^|\.)traveloka\.com$/ },
    { id: 'makemytrip', name: 'MakeMyTrip', match: /(^|\.)makemytrip\.com$/ },
    { id: 'goibibo', name: 'Goibibo', match: /(^|\.)goibibo\.com$/ },
    { id: 'rakutentravel', name: '楽天トラベル', match: /^travel\.rakuten\.(co\.jp|com)$/ },
    { id: 'jalan', name: 'じゃらん', match: /(^|\.)jalan\.net$/ },
    { id: 'yanolja', name: 'Yanolja', match: /(^|\.)yanolja\.com$/ },
    { id: 'ostrovok', name: 'Ostrovok', match: /(^|\.)ostrovok\.ru$/ },
    { id: 'almosafer', name: 'Almosafer', match: /(^|\.)almosafer\.com$/ },
    { id: 'wego', name: 'Wego', match: /(^|\.)wego\.[a-z.]+$/ },
    { id: 'wotif', name: 'Wotif', match: /(^|\.)wotif\.com(\.au)?$/ },
    { id: 'priceline', name: 'Priceline', match: /(^|\.)priceline\.com$/ },
    { id: 'hostelworld', name: 'Hostelworld', match: /(^|\.)hostelworld\.com$/ },
    { id: 'trivago', name: 'trivago', match: /(^|\.)trivago\.[a-z.]+$/ }
  ];
  // Plataformas que la gente más usa en cada país (además de las globales). [nombre, dirección, tipo: s=hospedaje, f=vuelos, b=ambos]
  // Plataformas regionales. Cuarto valor: plantilla con la búsqueda ya llena.
  // Marcadores: {dest} {in} {out} {nights} {adults} {from} {to} {out_dmy} {back_dmy} {out_d.m.y} {back_d.m.y} {out_ddmm} {back_ddmm} {out_dd/mm/yyyy}
  // Sin plantilla (o si falta un dato), se abre la página principal y se marca como "home".
  const TRIP_S = 'https://www.trip.com/hotels/list?keyword={dest}&checkin={in}&checkout={out}&adult={adults}&crn=1';
  const TRIP_F = 'https://www.trip.com/flights/showfarefirst?dcity={from_l}&acity={to_l}&ddate={depart}&rdate={back}&triptype={tt}&quantity={adults}';
  const TVK_F = 'https://www.traveloka.com/en-en/flight/fullsearch?ap={from}.{to}&dt={out_d-m-y}.{back_d-m-y_or_NA}&ps={adults}.0.0&sc=ECONOMY';
  const REGIONAL = {
    JP: [['楽天トラベル', 'https://travel.rakuten.co.jp/', 's', 'https://kw.travel.rakuten.co.jp/keyword/Search.do?f_query={dest}'], ['じゃらん', 'https://www.jalan.net/', 's', 'https://www.jalan.net/uw/uwp2011/uww2011init.do?keyword={dest}'], ['Trip.com', 'https://www.trip.com/', 's', TRIP_S], ['Trip.com', 'https://www.trip.com/flights/', 'f', TRIP_F]],
    KR: [['Yanolja', 'https://www.yanolja.com/', 's', 'https://www.yanolja.com/search/{dest}'], ['Trip.com', 'https://www.trip.com/', 's', TRIP_S], ['Trip.com', 'https://www.trip.com/flights/', 'f', TRIP_F]],
    CN: [['携程 Ctrip', 'https://www.ctrip.com/', 's', TRIP_S.replace('www.trip.com', 'hotels.ctrip.com')], ['飞猪 Fliggy', 'https://www.fliggy.com/', 'b'], ['Trip.com', 'https://www.trip.com/flights/', 'f', TRIP_F]],
    TW: [['Trip.com', 'https://www.trip.com/', 's', TRIP_S], ['Trip.com', 'https://www.trip.com/flights/', 'f', TRIP_F]], HK: [['Trip.com', 'https://www.trip.com/', 's', TRIP_S], ['Trip.com', 'https://www.trip.com/flights/', 'f', TRIP_F]],
    IN: [['MakeMyTrip', 'https://www.makemytrip.com/hotels/', 's'], ['MakeMyTrip', 'https://www.makemytrip.com/flights/', 'f', 'https://www.makemytrip.com/flight/search?itinerary={from}-{to}-{out_dd/mm/yyyy}{mmt_back}&tripType={ow_rt}&paxType=A-{adults}_C-0_I-0&intl=false&cabinClass=E'], ['Goibibo', 'https://www.goibibo.com/', 'b'], ['ixigo', 'https://www.ixigo.com/', 'f', 'https://www.ixigo.com/search/result/flight?from={from}&to={to}&date={out_ddmmyyyy}&returnDate={back_ddmmyyyy}&adults={adults}&children=0&infants=0&class=e']],
    ID: [['Traveloka', 'https://www.traveloka.com/', 's'], ['Traveloka', 'https://www.traveloka.com/', 'f', TVK_F], ['tiket.com', 'https://www.tiket.com/', 'b']],
    TH: [['Traveloka', 'https://www.traveloka.com/', 's'], ['Traveloka', 'https://www.traveloka.com/', 'f', TVK_F]], VN: [['Traveloka', 'https://www.traveloka.com/', 's'], ['Traveloka', 'https://www.traveloka.com/', 'f', TVK_F]], PH: [['Traveloka', 'https://www.traveloka.com/', 's'], ['Traveloka', 'https://www.traveloka.com/', 'f', TVK_F]],
    MY: [['Traveloka', 'https://www.traveloka.com/', 's'], ['Traveloka', 'https://www.traveloka.com/', 'f', TVK_F]], SG: [['Traveloka', 'https://www.traveloka.com/', 's'], ['Traveloka', 'https://www.traveloka.com/', 'f', TVK_F], ['Trip.com', 'https://www.trip.com/', 's', TRIP_S]],
    AE: [['Wego', 'https://www.wego.ae/', 'b'], ['Almosafer', 'https://www.almosafer.com/', 'b']], SA: [['Almosafer', 'https://www.almosafer.com/', 'b'], ['Wego', 'https://www.wego.com/', 'b']],
    EG: [['Wego', 'https://www.wego.com/', 'b']], TR: [['Enuygun', 'https://www.enuygun.com/', 'b'], ['Obilet', 'https://www.obilet.com/', 'f']],
    RU: [['Ostrovok', 'https://ostrovok.ru/', 's'], ['Aviasales', 'https://www.aviasales.ru/', 'f', 'https://www.aviasales.ru/search/{from}{out_ddmm}{to}{back_ddmm}{adults}']],
    ES: [['eDreams', 'https://www.edreams.es/', 'f', 'https://www.edreams.es/travel/#results/type={ed_type};from={from};to={to};dep={depart};ret={back};adults={adults};children=0;infants=0'], ['Rumbo', 'https://www.rumbo.es/', 'b']], IT: [['eDreams', 'https://www.edreams.it/', 'f', 'https://www.edreams.it/travel/#results/type={ed_type};from={from};to={to};dep={depart};ret={back};adults={adults};children=0;infants=0'], ['lastminute', 'https://www.lastminute.com/', 'b']],
    FR: [['Opodo', 'https://www.opodo.fr/', 'f', 'https://www.opodo.fr/travel/#results/type={ed_type};from={from};to={to};dep={depart};ret={back};adults={adults};children=0;infants=0'], ['lastminute', 'https://www.lastminute.com/', 'b']], DE: [['Opodo', 'https://www.opodo.de/', 'f', 'https://www.opodo.de/travel/#results/type={ed_type};from={from};to={to};dep={depart};ret={back};adults={adults};children=0;infants=0'], ['CHECK24', 'https://www.check24.de/reise/', 'b']],
    GB: [['lastminute', 'https://www.lastminute.com/', 'b'], ['Opodo', 'https://www.opodo.co.uk/', 'f', 'https://www.opodo.co.uk/travel/#results/type={ed_type};from={from};to={to};dep={depart};ret={back};adults={adults};children=0;infants=0']], PT: [['eDreams', 'https://www.edreams.pt/', 'f', 'https://www.edreams.pt/travel/#results/type={ed_type};from={from};to={to};dep={depart};ret={back};adults={adults};children=0;infants=0']],
    US: [['Priceline', 'https://www.priceline.com/', 'b'], ['Hopper', 'https://hopper.com/', 'b']], CA: [['Priceline', 'https://www.priceline.com/', 'b'], ['FlightHub', 'https://www.flighthub.com/', 'f']],
    AU: [['Webjet', 'https://www.webjet.com.au/', 'f'], ['Wotif', 'https://www.wotif.com/', 's', 'https://www.wotif.com/Hotel-Search?destination={dest}&startDate={in}&endDate={out}&adults={adults}']], NZ: [['Webjet', 'https://www.webjet.co.nz/', 'f']],
    ZA: [['Travelstart', 'https://www.travelstart.co.za/', 'f']], NG: [['Travelstart', 'https://www.travelstart.com.ng/', 'f'], ['Wakanow', 'https://www.wakanow.com/', 'b']], KE: [['Travelstart', 'https://www.travelstart.co.ke/', 'f']],
    BR: [['123milhas', 'https://123milhas.com/', 'f']], MX: [['Volaris', 'https://www.volaris.com/', 'f'], ['Viva Aerobus', 'https://www.vivaaerobus.com/', 'f']],
    CO: [['TiquetesBaratos', 'https://www.tiquetesbaratos.com/', 'f'], ['Avianca', 'https://www.avianca.com/', 'f'], ['LATAM', 'https://www.latamairlines.com/co/es', 'f'], ['Wingo', 'https://www.wingo.com/', 'f'], ['JetSMART', 'https://jetsmart.com/co/es/', 'f'], ['Aviatur', 'https://www.aviatur.com/', 'b']], AR: [['Aerolíneas Argentinas', 'https://www.aerolineas.com.ar/', 'f']],
    CL: [['JetSMART', 'https://jetsmart.com/', 'f']], PE: [['LATAM', 'https://www.latamairlines.com/', 'f']]
  };
  const dmy = (d, sep) => d ? [d.slice(8, 10), d.slice(5, 7), d.slice(0, 4)].join(sep) : '';
  /** Variables de la búsqueda para llenar plantillas. */
  function vars(trip) {
    const v = {};
    if (!trip) return v;
    if (trip.kind === 'flight') {
      const o = trip.out || '', b = trip.back || '';
      Object.assign(v, {
        from: trip.from || '', to: trip.to || '', from_l: (trip.from || '').toLowerCase(), to_l: (trip.to || '').toLowerCase(),
        depart: o, back: b, adults: trip.adults || 1,
        'out_dd/mm/yyyy': dmy(o, '/'), out_ddmmyyyy: dmy(o, ''), back_ddmmyyyy: dmy(b, ''),
        'out_d-m-y': dmy(o, '-'), 'back_d-m-y_or_NA': b ? dmy(b, '-') : 'NA',
        out_ddmm: o ? o.slice(8, 10) + o.slice(5, 7) : '', back_ddmm: b ? b.slice(8, 10) + b.slice(5, 7) : '',
        tt: b ? 'rt' : 'ow', ow_rt: b ? 'R' : 'O', ed_type: b ? 'R' : 'O',
        mmt_back: b ? `_${trip.to}-${trip.from}-${dmy(b, '/')}` : ''
      });
      v._need = ['from', 'to', 'depart'];
    } else {
      Object.assign(v, { dest: trip.dest || '', in: trip.checkin || '', out: trip.checkout || '', nights: trip.nights || 1, adults: trip.adults || 2 });
      v._need = ['dest'];
    }
    return v;
  }
  /** Llena una plantilla. Devuelve null si falta algún dato imprescindible. */
  function fill(tpl, trip) {
    const v = vars(trip);
    if (!tpl || (v._need || []).some(k => !v[k])) return null;
    const used = (tpl.match(/\{[^}]+\}/g) || []).map(x => x.slice(1, -1));
    if (used.some(k => !(k in v))) return null;
    return tpl.replace(/\{([^}]+)\}/g, (m, k) => {
      const val = String(v[k]);
      return k === 'dest' ? encodeURIComponent(val) : val;
    });
  }
  /** Plataformas regionales del país. extra: las que agrega el dueño, {CO: [[nombre, inicio, tipo, plantilla]]}. */
  function regional(country, kind, trip, extra) {
    const own = (extra && Array.isArray(extra[country]) ? extra[country] : []).filter(x => Array.isArray(x) && x[0] && x[1]);
    const ownNames = new Set(own.map(x => x[0] + '|' + (x[2] || 'b')));
    const all = own.concat((REGIONAL[country] || []).filter(x => !ownNames.has(x[0] + '|' + x[2])));
    const seen = new Set();
    return all.filter(x => (x[2] || 'b') === 'b' || x[2] === kind).map(x => {
      const deep = trip && x[3] ? fill(x[3], trip) : null;
      return { id: 'r-' + (String(x[0]).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '') || 'x'), name: x[0], url: deep || x[1], regional: true, home: !deep };
    }).filter(x => !seen.has(x.id) && seen.add(x.id));
  }
  const DESPEGAR = { CO: 'despegar.com.co', MX: 'despegar.com.mx', AR: 'despegar.com.ar', CL: 'despegar.cl', PE: 'despegar.com.pe', UY: 'despegar.com.uy', EC: 'despegar.com.ec', BR: 'decolar.com', CR: 'despegar.co.cr', PA: 'despegar.com.pa' };
  const isoDate = s => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || '')); return m ? `${m[1]}-${m[2]}-${m[3]}` : null; };
  const clean = s => String(s || '').replace(/--/g, ', ').replace(/[-_+]+/g, ' ').replace(/\s*~\s*/g, ', ').replace(/\s+/g, ' ').replace(/\s+,/g, ',').trim();

  function siteOf(host) { return SITES.find(s => s.match.test(String(host || '').toLowerCase())) || null; }

  /** Lee el viaje de la página. doc es opcional (para el destino si no viene en la dirección). */
  function detect(href, doc) {
    let u;
    try { u = new URL(href); } catch (e) { return null; }
    const site = siteOf(u.hostname);
    if (!site) return null;
    const q = k => u.searchParams.get(k);
    const first = (...ks) => { for (const k of ks) { const v = q(k); if (v) return v; } return null; };
    const checkin = isoDate(first('checkin', 'check_in', 'chkin', 'startDate', 'd1', 'checkIn'));
    const checkout = isoDate(first('checkout', 'check_out', 'chkout', 'endDate', 'd2', 'checkOut'));
    let dest = first('ss', 'destination', 'query', 'q', 'city', 'textToSearch');
    if (!dest && site.id === 'airbnb') { const m = /\/s\/([^/]+)\//.exec(u.pathname); if (m) dest = decodeURIComponent(m[1]); }
    if (!dest && doc) dest = destFromDoc(doc);
    const adults = parseInt(first('adults', 'group_adults', 'adultsCount', 'guests') || '0', 10) || null;
    const children = parseInt(first('children', 'group_children') || '0', 10) || 0;
    const nights = checkin && checkout ? Math.round((Date.parse(checkout) - Date.parse(checkin)) / DAY) : null;
    if (!dest && !checkin) return null;
    const kind = /\/rooms\/|\/hotel\/|Hotel-Information|\/h\d+|\/property\//i.test(u.pathname + u.search) ? 'stay' : 'search';
    return { site: site.id, siteName: site.name, dest: dest ? clean(dest).slice(0, 80) : null, checkin, checkout, nights: nights > 0 && nights < 120 ? nights : null, adults, children, kind };
  }
  function destFromDoc(doc) {
    try {
      for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
        const txt = s.textContent || '';
        const m = /"addressLocality"\s*:\s*"([^"]{2,60})"/.exec(txt);
        if (m) return m[1];
      }
      const og = doc.querySelector('meta[property="og:title"]');
      for (const title of [(og && og.getAttribute('content')) || '', doc.title || '']) {
        const m = /\b(?:en|in|em|à|a|cerca de|near|perto de)\s+([A-ZÁÉÍÓÚÑ][^·|,\-–★\d:]{2,40})/.exec(title);
        if (m && !/^(Airbnb|Booking|Expedia|Vrbo)\b/i.test(m[1])) return m[1].trim();
      }
    } catch (e) {}
    return null;
  }
  /** Busca el precio total de la estadía en el texto de la página ("Total", "Precio total", "Total price"). */
  function totalFromText(text) {
    const m = /(?:^|\n|\s)(?:total(?: price| a pagar| antes de impuestos| before taxes| com impostos)?|precio total|preço total|prix total|gesamtpreis)\s*:?\s*\n?\s*((?:[A-Z]{0,3}\s?[$€£¥₹R]{1,2}|[A-Z]{3})\s?[\d.,\s]{2,15}\d)/i.exec(String(text || ''));
    if (!m) return null;
    let raw = m[1].replace(/[^\d.,]/g, '');
    if (/[.,]\d{3}([.,]|$)/.test(raw) && !/[.,]\d{1,2}$/.test(raw)) raw = raw.replace(/[.,]/g, '');
    else raw = raw.replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.');
    const v = parseFloat(raw);
    return isFinite(v) && v > 0 ? v : null;
  }
  function perNight(trip, total) {
    if (!trip || !total || !trip.nights) return null;
    const guests = (trip.adults || 0) + (trip.children || 0);
    return { night: total / trip.nights, person: guests ? total / trip.nights / guests : null };
  }
  /** La misma búsqueda (destino, fechas, huéspedes) en las otras plataformas. */
  function links(trip, country, extra) {
    if (!trip || !trip.dest) return [];
    const d = encodeURIComponent(trip.dest), ci = trip.checkin || '', co = trip.checkout || '', ad = trip.adults || 2;
    const dates = ci && co;
    const out = [
      { id: 'booking', name: 'Booking.com', url: `https://www.booking.com/searchresults.html?ss=${d}${dates ? `&checkin=${ci}&checkout=${co}` : ''}&group_adults=${ad}&no_rooms=1` },
      { id: 'airbnb', name: 'Airbnb', url: `https://www.airbnb.com/s/${d}/homes?${dates ? `checkin=${ci}&checkout=${co}&` : ''}adults=${ad}` },
      { id: 'expedia', name: 'Expedia', url: `https://www.expedia.com/Hotel-Search?destination=${d}${dates ? `&startDate=${ci}&endDate=${co}` : ''}&adults=${ad}` },
      { id: 'hotels', name: 'Hotels.com', url: `https://www.hotels.com/Hotel-Search?destination=${d}${dates ? `&startDate=${ci}&endDate=${co}` : ''}&adults=${ad}` },
      { id: 'vrbo', name: 'Vrbo', url: `https://www.vrbo.com/search?destination=${d}${dates ? `&startDate=${ci}&endDate=${co}` : ''}&adults=${ad}` },
      { id: 'agoda', name: 'Agoda', url: `https://www.agoda.com/search?textToSearch=${d}${dates ? `&checkIn=${ci}&los=${trip.nights || 1}` : ''}&adults=${ad}&rooms=1` }
    ];
    const dsp = DESPEGAR[country];
    if (dsp) out.splice(2, 0, { id: 'despegar', name: dsp === 'decolar.com' ? 'Decolar' : 'Despegar', url: `https://www.${dsp}/hoteles/`, home: true });
    out.push({ id: 'google', name: 'Google Hotels', url: `https://www.google.com/travel/search?q=${encodeURIComponent('hotels ' + trip.dest)}` });
    return out.concat(regional(country, 's', Object.assign({ kind: 'stay' }, trip, { kind: 'stay' }), extra)).filter(x => x.id !== trip.site && !(x.regional && x.name === trip.siteName));
  }

  // ---------- Vuelos ----------
  const FLY = [
    { id: 'gflights', name: 'Google Flights', match: /(^|\.)google\.[a-z.]+$/, path: /^\/travel\/flights/ },
    { id: 'skyscanner', name: 'Skyscanner', match: /(^|\.)skyscanner\.[a-z.]+$/ },
    { id: 'kayak', name: 'Kayak', match: /(^|\.)kayak\.[a-z.]+$/ },
    { id: 'momondo', name: 'Momondo', match: /(^|\.)momondo\.[a-z.]+$/ },
    { id: 'expedia', name: 'Expedia', match: /(^|\.)expedia\.[a-z.]+$/, path: /flight/i },
    { id: 'despegar', name: 'Despegar', match: /(^|\.)(despegar\.[a-z.]+|decolar\.com)$/, path: /flight|vuelo|voo/i },
    { id: 'avianca', name: 'Avianca', match: /(^|\.)avianca\.com$/ },
    { id: 'latam', name: 'LATAM', match: /(^|\.)latamairlines\.com$/ },
    { id: 'kiwi', name: 'Kiwi.com', match: /(^|\.)kiwi\.com$/ },
    { id: 'wingo', name: 'Wingo', match: /(^|\.)wingo\.com$/ },
    { id: 'jetsmart', name: 'JetSMART', match: /(^|\.)jetsmart\.com$/ },
    { id: 'volaris', name: 'Volaris', match: /(^|\.)volaris\.com$/ },
    { id: 'vivaaerobus', name: 'Viva Aerobus', match: /(^|\.)vivaaerobus\.com$/ },
    { id: 'copa', name: 'Copa Airlines', match: /(^|\.)copaair\.com$/ },
    { id: 'aeromexico', name: 'Aeroméxico', match: /(^|\.)aeromexico\.com$/ },
    { id: 'gol', name: 'GOL', match: /(^|\.)voegol\.com\.br$/ },
    { id: 'azul', name: 'Azul', match: /(^|\.)voeazul\.com\.br$/ },
    { id: 'tripcom', name: 'Trip.com', match: /(^|\.)trip\.com$/, path: /flight/i },
    { id: 'edreams', name: 'eDreams', match: /(^|\.)(edreams|opodo)\.[a-z.]+$/ },
    { id: 'aviasales', name: 'Aviasales', match: /(^|\.)aviasales\.[a-z.]+$/ },
    { id: 'makemytrip', name: 'MakeMyTrip', match: /(^|\.)makemytrip\.com$/, path: /flight/i },
    { id: 'traveloka', name: 'Traveloka', match: /(^|\.)traveloka\.com$/, path: /flight/i },
    { id: 'wego', name: 'Wego', match: /(^|\.)wego\.[a-z.]+$/, path: /flight/i },
    { id: 'webjet', name: 'Webjet', match: /(^|\.)webjet\.[a-z.]+$/ },
    { id: 'priceline', name: 'Priceline', match: /(^|\.)priceline\.com$/, path: /flight|\/m\/fly/i },
    { id: 'aa', name: 'American Airlines', match: /(^|\.)aa\.com$/ },
    { id: 'delta', name: 'Delta', match: /(^|\.)delta\.com$/ },
    { id: 'united', name: 'United', match: /(^|\.)united\.com$/ },
    { id: 'iberia', name: 'Iberia', match: /(^|\.)iberia\.com$/ },
    { id: 'aircanada', name: 'Air Canada', match: /(^|\.)aircanada\.com$/ },
    { id: 'alaska', name: 'Alaska Airlines', match: /(^|\.)alaskaair\.com$/ },
    { id: 'jal', name: 'JAL', match: /(^|\.)jal\.co(\.jp|m)$/ },
    { id: 'ana', name: 'ANA', match: /(^|\.)ana\.co\.jp$/ },
    { id: 'emirates', name: 'Emirates', match: /(^|\.)emirates\.com$/ },
    { id: 'turkish', name: 'Turkish Airlines', match: /(^|\.)turkishairlines\.com$/ },
    { id: 'ryanair', name: 'Ryanair', match: /(^|\.)ryanair\.com$/ },
    { id: 'easyjet', name: 'easyJet', match: /(^|\.)easyjet\.com$/ },
    // 1.0: más plataformas de Latinoamérica
    { id: 'tiquetesbaratos', name: 'TiquetesBaratos', match: /(^|\.)tiquetesbaratos\.com$/ },
    { id: 'aviatur', name: 'Aviatur', match: /(^|\.)aviatur\.com$/, path: /vuelo|flight|aereo/i },
    { id: 'viajala', name: 'Viajala', match: /(^|\.)viajala\.[a-z.]+$/ },
    { id: 'almundo', name: 'Almundo', match: /(^|\.)almundo\.[a-z.]+$/, path: /vuelo|flight/i },
    { id: 'skyairline', name: 'SKY Airline', match: /(^|\.)skyairline\.com$/ },
    { id: 'arajet', name: 'Arajet', match: /(^|\.)arajet\.com$/ },
    { id: 'satena', name: 'Satena', match: /(^|\.)satena\.com$/ },
    { id: 'clic', name: 'Clic', match: /(^|\.)clicair\.co$/ },
    { id: 'rift', name: 'Rift', match: /(^|\.)rift\.co$/, path: /^\/flights\// },
    // 1.0: buscadores de vuelos del mundo (como Rift)
    { id: 'skiplagged', name: 'Skiplagged', match: /(^|\.)skiplagged\.com$/, path: /flight/i },
    { id: 'hopper', name: 'Hopper', match: /(^|\.)hopper\.com$/, path: /flight/i },
    { id: 'cheapflights', name: 'Cheapflights', match: /(^|\.)cheapflights\.[a-z.]+$/, path: /flight/i },
    { id: 'cheapoair', name: 'CheapOair', match: /(^|\.)cheapoair\.[a-z.]+$/, path: /flight|air/i },
    { id: 'orbitz', name: 'Orbitz', match: /(^|\.)orbitz\.com$/, path: /flight/i },
    { id: 'travelocity', name: 'Travelocity', match: /(^|\.)travelocity\.[a-z.]+$/, path: /flight/i },
    { id: 'hotwire', name: 'Hotwire', match: /(^|\.)hotwire\.com$/, path: /flight/i },
    { id: 'flightnetwork', name: 'FlightNetwork', match: /(^|\.)flightnetwork\.com$/ },
    { id: 'bookingfly', name: 'Booking.com Vuelos', match: /(^|\.)flights\.booking\.com$/ },
    { id: 'agodafly', name: 'Agoda Vuelos', match: /(^|\.)agoda\.com$/, path: /flight/i },
    { id: 'turismocity', name: 'Turismocity', match: /(^|\.)turismocity\.[a-z.]+$/, path: /vuelo|pasaje|passagen|flight|resultados/i },
    { id: 'pricetravel', name: 'PriceTravel', match: /(^|\.)pricetravel\.[a-z.]+$/, path: /vuelo|flight/i },
    { id: 'maxmilhas', name: 'MaxMilhas', match: /(^|\.)maxmilhas\.com\.br$/ },
    { id: 'jetcost', name: 'Jetcost', match: /(^|\.)jetcost\.[a-z.]+$/, path: /vuelo|flight|vol|flug|vo/i },
    { id: 'liligo', name: 'Liligo', match: /(^|\.)liligo\.[a-z.]+$/, path: /vuelo|flight|vol|flug|vo/i },
    { id: 'lastminute', name: 'lastminute.com', match: /(^|\.)lastminute\.[a-z.]+$/, path: /flight|vol|vuelo|flug/i },
    { id: 'gotogate', name: 'Gotogate / Mytrip', match: /(^|\.)(gotogate|mytrip|flightnetwork|trip\.ru)\.[a-z.]+$/ },
    { id: 'idealo', name: 'idealo Flüge', match: /(^|\.)idealo\.[a-z.]+$/, path: /flug|vol|vuelo|flight|voli/i },
    { id: 'check24', name: 'CHECK24 Flüge', match: /(^|\.)flug\.check24\.de$/ },
    { id: 'cleartrip', name: 'Cleartrip', match: /(^|\.)cleartrip\.[a-z.]+$/, path: /flight/i },
    { id: 'ixigo', name: 'ixigo', match: /(^|\.)ixigo\.com$/, path: /flight|search\/result/i },
    { id: 'goibibo', name: 'Goibibo', match: /(^|\.)goibibo\.com$/, path: /flight/i },
    { id: 'yatra', name: 'Yatra', match: /(^|\.)yatra\.com$/, path: /flight|air/i },
    { id: 'tiket', name: 'tiket.com', match: /(^|\.)tiket\.com$/, path: /pesawat|flight/i },
    { id: 'almosafer', name: 'Almosafer', match: /(^|\.)almosafer\.com$/, path: /flight/i },
    { id: 'rehlat', name: 'Rehlat', match: /(^|\.)rehlat\.[a-z.]+$/, path: /flight/i },
    { id: 'travelstart', name: 'Travelstart', match: /(^|\.)travelstart\.[a-z.]+$/, path: /flight|search/i },
    { id: 'flightcentre', name: 'Flight Centre', match: /(^|\.)flightcentre\.[a-z.]+$/, path: /flight/i },
    { id: 'skyticket', name: 'skyticket', match: /(^|\.)skyticket\.(jp|com)$/ }
  ];
  // 1.0: aerolíneas de bajo costo: en la tarifa más barata normalmente solo va el artículo personal
  const LOWCOST = new Set(['wingo', 'jetsmart', 'volaris', 'vivaaerobus', 'ryanair', 'easyjet', 'skyairline', 'arajet', 'clic']);
  const LOWCOST_TXT = /\b(wingo|jetsmart|jet smart|volaris|viva ?aerobus|ryanair|easyjet|sky airline|arajet|clic air)\b/i;
  function flySiteOf(host, path) {
    const h = String(host || '').toLowerCase();
    return FLY.find(s => s.match.test(h) && (!s.path || s.path.test(path || ''))) || null;
  }
  const IATA = /^[A-Z]{3}$/;
  const yymmdd = s => { const m = /^(\d{2})(\d{2})(\d{2})$/.exec(s || ''); return m ? `20${m[1]}-${m[2]}-${m[3]}` : null; };
  const anyDate = s => { s = String(s || ''); const iso = isoDate(s); if (iso) return iso; const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s); if (us) return `${us[3]}-${us[1].padStart(2, '0')}-${us[2].padStart(2, '0')}`; return yymmdd(s); };
  /** Lee un vuelo: origen y destino (códigos IATA), fechas y pasajeros. */
  function detectFlight(href, doc) {
    let u;
    try { u = new URL(href); } catch (e) { return null; }
    const site = flySiteOf(u.hostname, u.pathname);
    if (!site) return null;
    const q = k => u.searchParams.get(k);
    const P = u.pathname;
    let from = null, to = null, out = null, back = null, adults = null, m;
    if ((m = /\/flights\/([a-z]{3})\/([a-z]{3})\/(\d{6})(?:\/(\d{6}))?/i.exec(P))) { from = m[1]; to = m[2]; out = yymmdd(m[3]); back = yymmdd(m[4]); adults = +q('adultsv2') || +q('adults') || null; } // Skyscanner
    else if ((m = /\/flights\/([A-Z]{3})(?:,[A-Z]{3})*-([A-Z]{3})(?:,[A-Z]{3})*\/(\d{4}-\d{2}-\d{2})(?:\/(\d{4}-\d{2}-\d{2}))?(?:\/(\d+)adults)?/i.exec(P))) { from = m[1]; to = m[2]; out = m[3]; back = m[4] || null; adults = +m[5] || null; } // Kayak, Momondo
    else if ((m = /\/(?:roundtrip|oneway)\/([A-Z]{3})\/([A-Z]{3})\/(\d{4}-\d{2}-\d{2})(?:\/(\d{4}-\d{2}-\d{2}))?\/(\d+)/i.exec(P))) { from = m[1]; to = m[2]; out = m[3]; back = m[4] || null; adults = +m[5] || null; } // Despegar
    else if (q('leg1')) { const l1 = q('leg1'), l2 = q('leg2') || ''; from = (/from:([^,]+)/.exec(l1) || [])[1]; to = (/to:([^,]+)/.exec(l1) || [])[1]; out = anyDate((/departure:([^,T]+)/.exec(l1) || [])[1]); back = anyDate((/departure:([^,T]+)/.exec(l2) || [])[1]); adults = +((/adults:(\d+)/.exec(q('passengers') || '') || [])[1]) || null; } // Expedia
    else {
      from = q('origin') || q('from') || q('originCode') || q('departure') || q('o1') || q('ori') || q('startingFromAirport') || q('originAirport');
      to = q('destination') || q('to') || q('destinationCode') || q('arrival') || q('d1') || q('dest') || q('returningFromAirport') || q('destinationAirport');
      out = anyDate(q('outbound') || q('departureDate') || q('depart') || q('date') || q('outboundDate') || q('dd1') || q('startDate') || q('startingFromDateTime'));
      back = anyDate(q('inbound') || q('returnDate') || q('return') || q('inboundDate') || q('dd2') || q('endDate') || q('returningFromDateTime'));
      adults = +(q('adults') || q('adt') || q('ADT') || q('passengers')) || null;
    }
    const norm = x => { const c = String(x || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3); return IATA.test(c) ? c : null; };
    from = norm(from); to = norm(to);
    let fromName = null, toName = null;
    if (!from && !to && doc) {
      const tt = doc.title || '';
      const t = /\b([A-Z]{3})\s*(?:→|->|–|-|a|to|para)\s*([A-Z]{3})\b/.exec(tt);
      if (t) { from = t[1]; to = t[2]; }
      else { const n = /(?:vuelos? (?:de|desde)\s+|flights? from\s+|voos? de\s+)?([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ .'-]{1,30}?)\s+(?:a|to|para|→|–)\s+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ .'-]{1,30}?)\s*(?:\||-|·|$)/.exec(tt); if (n) { fromName = n[1].trim(); toName = n[2].trim(); } }
    }
    if (!from && !to && !fromName && !out) return { kind: 'flight', site: site.id, siteName: site.name, from: null, to: null, out: null, back: null, adults: null, empty: true };
    return { kind: 'flight', site: site.id, siteName: site.name, from, to, fromName, toName, out, back, adults, roundtrip: !!back };
  }
  const DESP_FLY = DESPEGAR;
  /** El mismo vuelo en otros buscadores y aerolíneas. */
  function flightLinks(f, country, extra) {
    if (!f) return [];
    if (!f.from || !f.to) {
      // Sin códigos de aeropuerto: Google Flights entiende ciudades; el resto, a su buscador
      const dsp0 = DESP_FLY[country];
      const base = [
        f.fromName && f.toName ? { id: 'gflights', name: 'Google Flights', url: `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${f.fromName} to ${f.toName}${f.out ? ' on ' + f.out : ''}${f.back ? ' through ' + f.back : ''}`)}` } : { id: 'gflights', name: 'Google Flights', url: 'https://www.google.com/travel/flights', home: true },
        dsp0 ? { id: 'despegar', name: dsp0 === 'decolar.com' ? 'Decolar' : 'Despegar', url: `https://www.${dsp0}/vuelos/`, home: true } : null,
        { id: 'skyscanner', name: 'Skyscanner', url: 'https://www.skyscanner.com/', home: true },
        { id: 'kayak', name: 'Kayak', url: 'https://www.kayak.com/flights', home: true },
        { id: 'expedia', name: 'Expedia', url: 'https://www.expedia.com/Flights', home: true }
      ];
      return base.filter(x => x && x.id !== f.site);
    }
    const a = f.adults || 1, F = f.from, T = f.to, o = f.out, b = f.back;
    const yy = d => d ? d.slice(2).replace(/-/g, '') : '';
    const list = [
      { id: 'gflights', name: 'Google Flights', url: `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${F} to ${T}${o ? ' on ' + o : ''}${b ? ' through ' + b : ''}`)}` },
      { id: 'skyscanner', name: 'Skyscanner', url: `https://www.skyscanner.com/transport/flights/${F.toLowerCase()}/${T.toLowerCase()}/${o ? yy(o) + '/' : ''}${b ? yy(b) + '/' : ''}?adultsv2=${a}` },
      { id: 'kayak', name: 'Kayak', url: `https://www.kayak.com/flights/${F}-${T}/${o || ''}${b ? '/' + b : ''}${a > 1 ? '/' + a + 'adults' : ''}` },
      { id: 'expedia', name: 'Expedia', url: `https://www.expedia.com/Flights-Search?trip=${b ? 'roundtrip' : 'oneway'}&leg1=from:${F},to:${T}${o ? ',departure:' + o.slice(5, 7) + '/' + o.slice(8) + '/' + o.slice(0, 4) + 'TANYT' : ''}${b ? '&leg2=from:' + T + ',to:' + F + ',departure:' + b.slice(5, 7) + '/' + b.slice(8) + '/' + b.slice(0, 4) + 'TANYT' : ''}&passengers=adults:${a}&mode=search` },
      { id: 'momondo', name: 'Momondo', url: `https://www.momondo.com/flight-search/${F}-${T}/${o || ''}${b ? '/' + b : ''}` }
    ];
    const dsp = DESP_FLY[country];
    if (dsp && o) list.splice(1, 0, { id: 'despegar', name: dsp === 'decolar.com' ? 'Decolar' : 'Despegar', url: `https://www.${dsp}/shop/flights/results/${b ? 'roundtrip' : 'oneway'}/${F}/${T}/${o}${b ? '/' + b : ''}/${a}/0/0` });
    return list.concat(regional(country, 'f', f, extra)).filter(x => x.id !== f.site && !(x.regional && x.name === f.siteName));
  }

  // ---------- 1.0: qué incluye el vuelo (equipaje) y el precio más bajo que se ve ----------
  const num = raw => {
    raw = String(raw).replace(/[^\d.,]/g, '');
    if (/[.,]\d{3}([.,]|$)/.test(raw) && !/[.,]\d{1,2}$/.test(raw)) raw = raw.replace(/[.,]/g, '');
    else raw = raw.replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.');
    const v = parseFloat(raw); return isFinite(v) ? v : null;
  };
  /** Precio más bajo que muestra una página de vuelos ("desde"). Ignora cargos pequeños sueltos. */
  function flightPriceFromText(text) {
    const re = /(?:US\$|COP|MXN|ARS|CLP|PEN|BRL|USD|EUR|R\$|S\/|\$|€|£)\s?(\d{1,3}(?:[.,\s]\d{3})+(?:[.,]\d{1,2})?|\d{2,7}(?:[.,]\d{1,2})?)/g;
    const vals = []; let m;
    const t = String(text || '').slice(0, 80000);
    while ((m = re.exec(t)) && vals.length < 400) { const v = num(m[1]); if (v && v > 0) vals.push(v); }
    if (vals.length < 2) return null;
    const sorted = vals.slice().sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const ok = sorted.filter(v => v >= median * 0.25);
    return ok.length ? ok[0] : null;
  }
  /** Lee de la página lo que dice sobre equipaje. Por tarifa no se puede asegurar, así que se informa lo que la página menciona:
   *  seen = la página lo menciona · kg = peso que indica · no = alguna tarifa dice que NO lo incluye. */
  function fareInfo(text, siteId) {
    const t = String(text || '').slice(0, 80000).toLowerCase().replace(/\s+/g, ' ');
    const kgAround = re => {
      const g = new RegExp(re.source, 'g'); let m, best = null;
      while ((m = g.exec(t))) {
        const after = /^[^.;|]{0,45}?(\d{1,2})\s?kg/.exec(t.slice(m.index + m[0].length, m.index + m[0].length + 60));
        const before = /(\d{1,2})\s?kg[^.;|\d]{0,25}$/.exec(t.slice(Math.max(0, m.index - 30), m.index));
        const k = after || before;
        if (k) { best = +k[1]; break; }
      }
      return best;
    };
    const PERSONAL = /art[ií]culo personal|personal item|bolso de mano|item pessoal|bolsa pessoal|objet personnel|persönlicher gegenstand/;
    const CARRY = /(?:equipaje|maleta|valija) de (?:mano|cabina)|carry[- ]?on|cabin bag|bagagem de m[aã]o|bagage cabine|handgep[aä]ck/;
    const CHECKED = /(?:equipaje|maleta|valija) (?:de |en )?(?:bodega|facturad[oa]|documentad[oa]|registrad[oa])|checked bag|hold bag|bagagem despachada|bagage en soute|aufgabegep[aä]ck/;
    const NO_CHECKED = /(?:no incluye|sin) (?:equipaje|maleta) (?:de |en )?(?:bodega|facturad|documentad)|checked bags? (?:is |are )?not included|no checked bag|bagagem despachada n[aã]o inclu/;
    const NO_CARRY = /(?:no incluye|sin) (?:equipaje|maleta) de (?:mano|cabina)|carry[- ]?on (?:is )?not included|no carry[- ]?on|bagagem de m[aã]o n[aã]o inclu/;
    const ONLY_PERSONAL = /solo (?:incluye )?(?:un )?art[ií]culo personal|personal item only|only (?:a |one )?personal item|apenas (?:um )?item pessoal/;
    const fix = (kg, lo, hi) => kg && kg >= lo && kg <= hi ? kg : null;
    const out = {
      personal: { seen: PERSONAL.test(t), kg: fix(kgAround(PERSONAL), 2, 12) },
      carry: { seen: CARRY.test(t), kg: fix(kgAround(CARRY), 5, 23), no: NO_CARRY.test(t) || ONLY_PERSONAL.test(t) },
      checked: { seen: CHECKED.test(t), kg: fix(kgAround(CHECKED), 15, 32), no: NO_CHECKED.test(t) || ONLY_PERSONAL.test(t) },
      lowcost: LOWCOST.has(siteId) || LOWCOST_TXT.test(t)
    };
    out.any = out.personal.seen || out.carry.seen || out.checked.seen;
    return out;
  }


  // ---------- 1.0: la lista de vuelos de la página (tipo Rift): aerolínea, horarios, duración, escalas y precio ----------
  const AIRLINES = /\b(Avianca|LATAM|American(?: Airlines)?|United|Delta|Copa(?: Airlines)?|Wingo|JetSMART|JetBlue|Spirit|Frontier|Southwest|Alaska|Iberia|Air Europa|Aerom[eé]xico|Volaris|Viva ?Aerobus|Satena|Clic|Arajet|Emirates|Turkish(?: Airlines)?|Lufthansa|Air France|KLM|British Airways|GOL|Azul|SKY(?: Airline)?|Air Canada|Qatar Airways|Etihad|Aerol[ií]neas Argentinas|Flybondi|Paranair|Boliviana|Conviasa|Laser|Plus Ultra|TAP(?: Air Portugal)?|Vueling|Ryanair|easyJet|Interjet|Avior|Estelar|Sky High|Condor|Edelweiss|Swiss|ITA Airways|Aeroitalia)\b/gi;
  const CODE_RE = /\b(COP|MXN|ARS|CLP|PEN|BRL|USD|EUR|GBP|CAD|AUD|UYU|PYG|BOB|CRC|GTQ|DOP|JPY|KRW|INR|AED|SAR|CHF|SEK|NOK|DKK)\b/;
  // "$ 1.979.952", "COP 1,979,952" y también con la moneda al final ("2.157.870 COP", Google Vuelos; "49,99 €")
  const PRICE_RE = /(?:US\$|COP|MXN|ARS|CLP|PEN|BRL|USD|EUR|GBP|R\$|S\/|\$|€|£)\s?(\d{1,3}(?:[.,\s]\d{3})+(?:[.,]\d{1,2})?|\d{2,7}(?:[.,]\d{1,2})?)|(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?|\d{2,7}(?:[.,]\d{1,2})?)\s?(?:COP|MXN|ARS|CLP|PEN|BRL|USD|EUR|GBP|€)\b/;
  const TIME_RE = /\b([01]?\d|2[0-3]):([0-5]\d)(?:\s*(a\.?\s?m\.?|p\.?\s?m\.?))?/gi;
  const DUR_RE = /\b(\d{1,2})\s?h(?:rs?|oras?)?\s?(?:(\d{1,2})\s?m(?:in)?)?\b/gi;
  const STOP_RE = /\b(directo|direct[oa]?|nonstop|non-stop|sin escalas|sem escalas|direto)\b|\b(\d)\s*(?:escalas?|stops?|paradas?)\b/gi;
  const hhmm = (h, m, ap) => { h = +h; ap = String(ap || '').toLowerCase().replace(/[^ap]/g, ''); if (ap === 'p' && h < 12) h += 12; if (ap === 'a' && h === 12) h = 0; return String(h).padStart(2, '0') + ':' + m; };
  function parseFlightCard(el) {
    const text = String(el.innerText || el.textContent || '').replace(/ /g, ' ');
    const pm = PRICE_RE.exec(text); if (!pm) return null;
    const price = num(pm[1] || pm[2]); if (!price) return null;
    const cm = CODE_RE.exec(pm[0]) || CODE_RE.exec(text);
    const times = []; let m; TIME_RE.lastIndex = 0;
    while ((m = TIME_RE.exec(text)) && times.length < 8) times.push(hhmm(m[1], m[2], m[3]));
    if (times.length < 2) return null;
    const durs = []; DUR_RE.lastIndex = 0;
    while ((m = DUR_RE.exec(text)) && durs.length < 4) { const v = (+m[1]) * 60 + (+m[2] || 0); if (v >= 20 && v <= 72 * 60) durs.push(v); }
    const stops = []; STOP_RE.lastIndex = 0;
    while ((m = STOP_RE.exec(text)) && stops.length < 4) stops.push(m[1] ? 0 : +m[2]);
    const air = [];
    el.querySelectorAll && el.querySelectorAll('img[alt]').forEach(i => { const a = (i.getAttribute('alt') || '').trim(); if (a && a.length < 40 && !/logo$|^icon|vigía/i.test(a) && !air.includes(a)) air.push(a); });
    if (!air.length) { AIRLINES.lastIndex = 0; while ((m = AIRLINES.exec(text)) && air.length < 4) if (!air.includes(m[1])) air.push(m[1]); }
    const legs = [];
    for (let i = 0; i + 1 < times.length && legs.length < 2; i += 2) legs.push({ d: times[i], a: times[i + 1], dur: durs[legs.length] != null ? durs[legs.length] : null, stops: stops[legs.length] != null ? stops[legs.length] : null });
    const pick = (el.getAttribute && (el.getAttribute('data-pick') || '')) || '';
    const best = /best|mejor|top/i.test(pick) || /^\s*(mejor|best|recomendad[oa]|melhor)\b/i.test(text);
    return { air: air.slice(0, 3), legs, price, cur: cm ? cm[1] : null, siteBest: best };
  }
  /** Las opciones de vuelo que muestra la página (hasta 25). Cada tarjeta = el elemento más pequeño que tiene precio y al menos 2 horas. */
  function flightOptions(doc) {
    if (!doc || !doc.body) return [];
    const nodes = doc.body.querySelectorAll('li, article, div, a, section');
    const cand = [];
    for (let i = 0; i < nodes.length && i < 8000 && cand.length < 400; i++) {
      const el = nodes[i]; const tx = el.innerText || '';
      if (tx.length < 25 || tx.length > 1200) continue;
      if (!PRICE_RE.test(tx)) continue;
      TIME_RE.lastIndex = 0; let n = 0; while (TIME_RE.exec(tx) && n < 2) n++;
      if (n >= 2) cand.push(el);
    }
    const cards = cand.filter(c => !cand.some(d => d !== c && c.contains(d)));
    const out = [], seen = new Set();
    cards.forEach(c => {
      if (out.length >= 25) return;
      // Si el logo de la aerolínea quedó afuera, mira un nivel arriba
      let o = parseFlightCard(c);
      if (o && !o.air.length && c.parentElement && (c.parentElement.innerText || '').length < 1400) { const up = parseFlightCard(c.parentElement); if (up && up.air.length) o.air = up.air; }
      if (!o) return;
      const k = o.air.join('+') + '|' + o.legs.map(l => l.d + l.a).join('|') + '|' + o.price;
      if (seen.has(k)) return; seen.add(k); out.push(o);
    });
    return out.length >= 2 ? out : [];
  }
  /** Ordena las opciones: Mejor (precio + duración + escalas), y marca la más barata y la más rápida. */
  function rankFlights(list) {
    const L = (list || []).filter(o => o && o.price > 0);
    if (!L.length) return [];
    const durOf = o => { const d = o.legs.map(l => l.dur).filter(v => v != null); return d.length ? d.reduce((a, b) => a + b, 0) : null; };
    const stopsOf = o => o.legs.reduce((a, l) => a + (l.stops || 0), 0);
    const minP = Math.min(...L.map(o => o.price));
    const ds = L.map(durOf).filter(v => v != null); const minD = ds.length ? Math.min(...ds) : null;
    const scored = L.map(o => { const d = durOf(o); return Object.assign({}, o, { dur: d, stops: stopsOf(o), score: o.price / minP + 0.12 * stopsOf(o) + (d != null && minD ? (d / minD - 1) * 0.35 : 0.1) }); });
    scored.sort((a, b) => a.score - b.score);
    const cheap = scored.reduce((a, b) => b.price < a.price ? b : a);
    const fast = ds.length ? scored.filter(o => o.dur != null).reduce((a, b) => b.dur < a.dur || (b.dur === a.dur && b.price < a.price) ? b : a) : null;
    return scored.map((o, i) => Object.assign(o, { best: i === 0, cheapest: o === cheap, fastest: o === fast }));
  }

  const api = { REGIONAL, regional, fill, SITES, FLY, siteOf, flySiteOf, detect, detectFlight, flightLinks, totalFromText, perNight, links, fareInfo, flightPriceFromText, LOWCOST, flightOptions, parseFlightCard, rankFlights };
  root.VigiaTravel = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
