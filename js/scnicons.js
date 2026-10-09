/* Ikon kartu skenario pada layar Pilih Skenario. Setiap ikon adalah ilustrasi SVG kecil fasilitas
   yang disimulasikan. SCN_ICONS[id]() mengembalikan string <svg>. Bila id tidak terdaftar, game.js
   memakai ikon bawaan. Semua ikon memakai viewBox 0 0 160 100, cahaya dari kiri atas, dan id
   gradien berawalan id skenario agar tidak bentrok di satu halaman. */
const SCN_ICONS = (() => {
  const O = '#2f3a45'; // warna garis luar
  const R = (x, y, w, h, f, s = 1.2, ex = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${s ? ` stroke="${O}" stroke-width="${s}"` : ''}${ex ? ' ' + ex : ''}/>`;
  const P = (d, f, s = 1.2, ex = '') => `<path d="${d}" fill="${f}"${s ? ` stroke="${O}" stroke-width="${s}" stroke-linejoin="round"` : ''}${ex ? ' ' + ex : ''}/>`;
  const L = (d, c = O, w = 1, ex = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${ex ? ' ' + ex : ''}/>`;
  const C = (cx, cy, r, f, s = 1, ex = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"${s ? ` stroke="${O}" stroke-width="${s}"` : ''}${ex ? ' ' + ex : ''}/>`;
  // pipa: garis luar gelap lalu isi
  const pipe = (d, w = 2.2, c = '#c9d1d8') => L(d, O, w + 1.5) + L(d, c, w);
  // bejana mendatar dengan head elips 2:1
  const hv = (x1, x2, cy, r, f, s = 1.3) => { const h = r / 2; return P(`M${x1 + h} ${cy - r}H${x2 - h}A${h} ${r} 0 0 1 ${x2 - h} ${cy + r}H${x1 + h}A${h} ${r} 0 0 1 ${x1 + h} ${cy - r}Z`, f, s) + L(`M${x1 + h} ${cy - r + 1}V${cy + r - 1}M${x2 - h} ${cy - r + 1}V${cy + r - 1}`, '#7d8893', 0.6); };
  // bejana tegak dengan head elips
  const vv = (cx, y1, y2, r, f, hd = r / 2, s = 1.3) => P(`M${cx - r} ${y1 + hd}A${r} ${hd} 0 0 1 ${cx + r} ${y1 + hd}V${y2 - hd}A${r} ${hd} 0 0 1 ${cx - r} ${y2 - hd}Z`, f, s) + L(`M${cx - r + 1} ${y1 + hd}H${cx + r - 1}M${cx - r + 1} ${y2 - hd}H${cx + r - 1}`, '#7d8893', 0.6);
  const shadow = (cx, rx, cy = 90) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="2.4" fill="#2b3640" opacity=".14"/>`;
  const ground = (x1 = 4, x2 = 156) => L(`M${x1} 90.5H${x2}`, '#a7b1ba', 1.2);
  // rangka kisi (lattice) di antara dua garis sejajar
  const zig = (x1, y1, x2, y2, n, vert) => { let d = ''; for (let i = 0; i <= n; i++) { const t = i / n; d += vert ? `${i ? 'L' : 'M'}${i % 2 ? x2 : x1} ${y1 + (y2 - y1) * t}` : `${i ? 'L' : 'M'}${x1 + (x2 - x1) * t} ${i % 2 ? y2 : y1}`; } return d; };
  const GR = {
    h: ['0 0 0 1', [[0, '#7f8a95'], [0.16, '#e9eef2'], [0.3, '#ffffff'], [0.62, '#b9c3cc'], [1, '#5d6874']]], // silinder mendatar
    v: ['0 0 1 0', [[0, '#7f8a95'], [0.16, '#e9eef2'], [0.3, '#ffffff'], [0.62, '#b9c3cc'], [1, '#5d6874']]], // silinder tegak
    f: ['0 0 0 1', [[0, '#f6f8fa'], [1, '#c9d1d8']]], // muka depan
    s: ['0 0 0 1', [[0, '#a3adb7'], [1, '#6f7a85']]], // muka samping, baja gelap
    w: ['0 0 0 1', [[0, '#b3bdc6'], [0.2, '#ffffff'], [0.65, '#eef2f5'], [1, '#9ba6b1']]], // cat putih
    g: ['0 0 0 1', [[0, '#d7eef9'], [0.5, '#8ec6e4'], [1, '#3d84b3']]], // kaca
    c: ['0 0 0 1', [[0, '#e4e1da'], [1, '#b3aea4']]], // beton
    m: ['0 0 1 0', [[0, '#3c5366'], [0.2, '#9db3c4'], [0.35, '#cbd8e2'], [1, '#2f4456']]], // motor
    j: ['0 0 1 0', [[0, '#6f8494'], [0.16, '#dbe8f0'], [0.3, '#f2f8fb'], [0.62, '#a6bccc'], [1, '#4c6273']]], // jaket pendingin
    d: ['0 0 0 1', [[0, '#55616c'], [0.3, '#2c3640'], [1, '#141a20']]], // membran HDPE
    e: ['0 0 0 1', [[0, '#a89778'], [1, '#7a6b50']]], // tanggul tanah
    p: ['0 0 1 1', [[0, '#4a7fa8'], [0.5, '#24496b'], [1, '#162f47']]], // panel surya
  };
  const grad = (p, k) => { const [c, st] = GR[k]; const [x1, y1, x2, y2] = c.split(' '); return `<linearGradient id="${p}-${k}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st.map(([o, col]) => `<stop offset="${o}" stop-color="${col}"/>`).join('')}</linearGradient>`; };
  const icon = (p, keys, fn) => `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>${keys.map(k => grad(p, k)).join('')}</defs>${fn(k => `url(#${p}-${k})`)}</svg>`;

  return {
    // separator tiga fasa di atas skid, tangki minyak atmosferik di belakang
    separator: () => icon('sep', ['h', 'v', 's'], u => [
      ground(),
      // tangki minyak T-101
      shadow(133, 23),
      P('M113.5 47L133 40.5L152.5 47Z', '#dfe5ea', 1.1),
      R(114, 47, 38, 43.5, u('v'), 1.3),
      L('M114 58H152M114 69H152M114 80H152', '#8f9aa4', 0.6),
      L('M117 88L149 50M117 83L149 45', O, 0.9), L('M121 78.3V83.5M127 71.2V76.4M133 64.1V69.3M139 57V62.2M145 49.9V55.1', O, 0.7),
      // jalur gas ke kompresor dan header flare
      pipe('M68 37.5V24Q68 21.5 70.5 21.5H158', 1.5),
      pipe('M92 40V32.5Q92 29.5 95 29.5H158', 2.2),
      pipe('M24 40V32.5Q24 29.5 21 29.5H2', 2.2),
      // skid dan sadel
      shadow(58, 54),
      R(8, 85.5, 102, 4.5, u('s'), 1.1),
      P('M21 70H35L36.5 85.5H19.5Z', u('s'), 1.1), P('M81 70H95L96.5 85.5H79.5Z', u('s'), 1.1),
      // keluaran air dan minyak dengan LCV
      pipe('M44 72V81H2', 2), pipe('M70 72V81H114', 2),
      R(96.5, 78.5, 7, 5, u('h'), 1), L('M100 78.5V75.5', O, 1.2), P('M95 75.5A5 3.6 0 0 1 105 75.5Z', u('h'), 1),
      // badan separator V-101
      hv(10, 106, 59, 13, u('h')),
      R(4.5, 55, 5.5, 8, u('h'), 1), R(2.5, 53, 2.2, 12, '#c9d1d8', 1),
      R(46, 61, 10, 6, '#eef2f5', 0.8), L('M48 63H54M48 65H52', '#7d8893', 0.6),
      // nozzle atas
      R(21.5, 41, 5, 6, u('v'), 1), R(20, 39.4, 8, 2, '#c9d1d8', 1),
      R(89.5, 41, 5, 6, u('v'), 1), R(88, 39.4, 8, 2, '#c9d1d8', 1),
      // PSV
      R(58, 41.5, 4, 5.5, u('v'), 1), R(56.5, 40, 7, 1.8, '#c9d1d8', 1),
      R(56.8, 34.5, 6.4, 5.5, u('v'), 1), P('M58 34.5L58.8 27H61.2L62 34.5Z', u('v'), 1), R(58.4, 25.4, 3.2, 1.8, '#c9d1d8', 0.9),
      pipe('M63 37.5H66', 1.5),
      // gelas penduga level
      L('M105 52H109.5M104.3 67H109.5', O, 1.6),
      R(109, 48.5, 3.6, 22, '#f4f7f9', 1), R(109.7, 59.5, 2.2, 10.3, '#29abe2', 0),
      R(112.4, 78.5, 1.8, 5, '#c9d1d8', 0.9),
    ].join('')),

    // tangki bullet LPG di atas sadel beton dengan cincin semprot air, truk tangki di loading bay
    lpg: () => icon('lpg', ['w', 'h', 'c', 's', 'g'], u => [
      ground(),
      // tangki bullet V-301 di atas dua sadel beton, dengan cincin pipa water spray
      shadow(52, 50),
      P('M20 70H34L36 90H18Z', u('c'), 1.1), P('M70 70H84L86 90H68Z', u('c'), 1.1),
      pipe('M8 90V43Q8 40 11 40H95', 1.4),
      hv(6, 98, 60, 13, u('w')),
      L('M29 47.5V72.5M52 47.5V72.5M75 47.5V72.5', '#8d98a3', 0.9),
      R(16, 57, 9, 5, '#eef2f5', 0.7),
      // PSV kembar dan nozzle di atas tangki
      R(62, 41, 3.2, 6.5, u('h'), 0.9), R(68, 41, 3.2, 6.5, u('h'), 0.9), R(61.4, 37.5, 4.4, 3.6, u('h'), 0.9), R(67.4, 37.5, 4.4, 3.6, u('h'), 0.9),
      // jalur cair dari dasar tangki ke pompa pengisian lalu ke loading bay
      pipe('M88 72V84H98', 1.8),
      C(101, 84, 4, u('h'), 1), R(97, 87, 8, 3, u('s'), 0.8),
      pipe('M105 84H110V40H122', 1.8),
      // kanopi loading bay
      R(108, 28, 50, 4, u('s'), 1), L('M112 32V90M154 32V90', O, 1.8),
      // lengan pengisian dari kanopi ke truk
      pipe('M122 40L130 50V55', 1.6), C(122, 40, 1.8, '#c9d1d8', 0.9),
      // truk tangki LPG
      shadow(134, 24, 90),
      R(113, 79, 40, 3, '#3b4651', 0.9),
      hv(113, 143, 70, 8, u('w')),
      R(117, 71.5, 22, 1.8, '#29abe2', 0),
      R(126, 59, 6, 3, u('h'), 0.8),
      P('M120 66L122.6 68.6L120 71.2L117.4 68.6Z', '#e0483a', 0.5),
      P('M144 63H151Q154 63 154.6 66L157 72V84H144Z', u('w'), 1.1),
      P('M148.6 65.2H151Q152.6 65.2 153.1 66.8L154.6 71H148.6Z', u('g'), 0.8),
      R(143, 82, 15, 2.5, '#3b4651', 0.8),
      ...[120, 128, 151].map(x => C(x, 85.5, 3.6, '#26303a', 0.9) + C(x, 85.5, 1.4, '#b9c3cc', 0)),
    ].join('')),

    // reaktor batch berjaket dengan agitator, di atas platform baja
    reactor: () => icon('rx', ['v', 's', 'j', 'm', 'h'], u => [
      ground(),
      shadow(84, 60),
      // pagar platform di belakang
      L('M28 38H146M28 44H146', '#6f7a85', 0.9), L('M30 38V50M50 38V50M110 38V50M130 38V50M146 38V50', '#6f7a85', 0.9),
      R(24, 50, 126, 3.2, u('s'), 1),
      R(28, 53, 3, 37, u('s'), 0.9), R(141, 53, 3, 37, u('s'), 0.9),
      L('M31 56L60 88M141 56L112 88', '#7d8893', 0.8),
      // tangga
      L('M14 90V44M20 90V44', O, 1), L('M14 49H20M14 55H20M14 61H20M14 67H20M14 73H20M14 79H20M14 85H20', O, 0.8),
      // pipa air pendingin jaket dan keluaran bawah
      pipe('M64 79Q60 84 54 84H36', 1.8, '#1572a8'),
      pipe('M103 58H120Q123 58 123 61V90', 1.8, '#1572a8'),
      pipe('M84 82V87H100', 1.8), R(81.5, 84, 5, 3.5, u('h'), 0.9),
      // bejana R-201 dan jaket
      vv(84, 25, 82, 20, u('v'), 10),
      P('M61 55H107V72A23 11.5 0 0 1 61 72Z', u('j'), 1.2),
      R(60, 53.5, 48, 3, u('h'), 1),
      // lug penumpu di atas balok platform
      P('M64 42H54V43.6L60 50H64Z', u('s'), 1), P('M104 42H114V43.6L108 50H104Z', u('s'), 1),
      // nozzle jaket
      R(100.5, 56.5, 3, 3, '#c9d1d8', 0.8),
      // penggerak agitator: lantern, gearbox, motor
      R(79, 19.5, 10, 6.5, u('v'), 1),
      R(74, 11.5, 20, 8, u('m'), 1.1), L('M78 11.5V19.5M90 11.5V19.5', '#203242', 0.6),
      R(77.5, 1.5, 13, 10, u('m'), 1.1), L('M77.5 4H90.5M77.5 6.5H90.5M77.5 9H90.5', '#203242', 0.55), R(90.5, 4.5, 3, 4, u('m'), 0.8),
      // cakram pecah dan vent
      R(68, 22, 4, 6.5, u('v'), 0.9), R(66.5, 20.4, 7, 1.6, '#c9d1d8', 0.9), R(66.5, 18.6, 7, 1.6, '#c9d1d8', 0.9),
      pipe('M70 18.6V9Q70 6 67 6H52', 1.4),
      // jalur uap ke kondensor refluks
      pipe('M99 29V16Q99 13 102 13H114', 2),
      hv(113, 150, 13, 5, u('h')), R(149, 6.5, 2, 13, '#c9d1d8', 0.9),
      L('M140 18V38', O, 1.4),
      R(77, 60, 10, 6, '#eef2f5', 0.7),
    ].join('')),

    // kolom distilasi dengan platform dan tangga, kondensor, drum refluks, pompa, reboiler
    distilasi: () => icon('dc', ['v', 'h', 's', 'm'], u => [
      ground(),
      shadow(52, 18), shadow(118, 32),
      // rangka struktur kondensor dan drum refluks
      R(92, 30, 3, 60, u('s'), 0.9), R(143, 30, 3, 60, u('s'), 0.9),
      L('M95 61L143 88M143 61L95 88', '#8d98a3', 0.8),
      R(90, 28.5, 58, 2.6, u('s'), 0.9), R(90, 57.5, 58, 2.6, u('s'), 0.9),
      // platform kolom di belakang
      R(28, 22, 46, 2, u('s'), 0.8), R(28, 45, 46, 2, u('s'), 0.8), R(28, 67, 46, 2, u('s'), 0.8),
      L('M29 22V16H73V22M29 45V39H73V45M29 67V61H73V67', '#6f7a85', 0.8),
      // jalur refluks dari pompa ke puncak kolom
      pipe('M110 80V67H86V17Q86 14 83 14H61', 1.6),
      // kolom C-401
      P('M43.5 80H60.5L62 90H42Z', u('s'), 1.1),
      vv(52, 9, 81, 9, u('v'), 4.5),
      L('M43.6 24H60.4M43.6 34H60.4M43.6 44H60.4M43.6 54H60.4M43.6 64H60.4M43.6 74H60.4', '#9aa5ae', 0.6),
      // tangga berkurungan
      L('M34 90V14M38 90V14', O, 0.9),
      L('M34 18H38M34 22H38M34 26H38M34 30H38M34 34H38M34 38H38M34 42H38M34 46H38M34 50H38M34 54H38M34 58H38M34 62H38M34 66H38M34 70H38M34 74H38M34 78H38M34 82H38M34 86H38', O, 0.6),
      L('M30.5 20V82M30.5 26H34M30.5 36H34M30.5 46H34M30.5 56H34M30.5 66H34M30.5 76H34', O, 0.6),
      // davit dan jalur uap atas
      L('M47 9V3.5H40V6', O, 0.9),
      pipe('M52 9V7Q52 4 55 4H100Q103 4 103 7V18', 2.2),
      // kondensor E-401
      hv(96, 142, 23, 5, u('h')), R(141, 16.5, 2, 13, '#c9d1d8', 0.9),
      pipe('M120 28V43', 1.6),
      // drum refluks V-401
      hv(98, 140, 50, 7, u('h')),
      pipe('M104 57V84H106', 1.6),
      // pompa refluks P-401
      R(103, 87.5, 30, 2.5, u('s'), 0.8),
      C(110, 83.5, 4.2, u('v'), 1), R(115, 80, 15, 7.5, u('m'), 1), L('M118 80V87.5M121 80V87.5M124 80V87.5', '#203242', 0.5),
      // reboiler E-402
      pipe('M61 78H66', 1.8), pipe('M76 74V70Q76 68 74 68H61', 1.8),
      hv(64, 89, 80, 5.5, u('h')), R(88, 74, 2, 12, '#c9d1d8', 0.9),
    ].join('')),

    // boiler PLTU: gedung turbin, galeri konveyor, bunker, boiler dengan drum uap, ESP, cerobong
    boiler: () => icon('bl', ['f', 'h', 'v', 's', 'g', 'c'], u => [
      ground(),
      shadow(80, 70),
      // galeri konveyor batu bara ke bunker
      L('M17 45V60', O, 1.6),
      P('M4 44L54 18V24.5L4 50.5Z', u('f'), 1.1),
      L('M8 47.9L12 41.8L16 43.7L20 37.7L24 39.6L28 33.5L32 35.4L36 29.4L40 31.3L44 25.2L48 27.2', '#8d98a3', 0.7),
      // gedung turbin dan generator
      P('M4 64L24 55L44 64Z', u('s'), 1.1),
      R(4, 64, 40, 26, u('f'), 1.2),
      R(8, 69, 32, 5, u('g'), 0.8), R(22, 78, 10, 12, '#9aa5ae', 0.9),
      L('M12 74V90M17 74V90M37 74V90', '#b9c3cc', 0.6),
      // bunker bay
      R(54, 16, 14, 74, u('f'), 1.2), L('M58 16V90M64 16V90', '#b9c3cc', 0.6),
      R(56, 30, 10, 4, u('g'), 0.6), R(56, 50, 10, 4, u('g'), 0.6),
      // struktur baja boiler
      R(68, 11, 2.5, 79, u('s'), 0.9), R(103.5, 11, 2.5, 79, u('s'), 0.9),
      L('M70.5 32H103.5M70.5 52H103.5M70.5 72H103.5', '#6f7a85', 1.4),
      R(74, 22, 26, 66, u('f'), 1.2),
      L('M77 22V88M80 22V88M83 22V88M86 22V88M89 22V88M92 22V88M95 22V88M98 22V88', '#b9c3cc', 0.5),
      L('M72 21V86M102 21V86', O, 1.6),
      // drum uap dan atap kanopi
      hv(70, 104, 16.5, 4.5, u('h')),
      P('M64 10.5L87 5.5L110 10.5V12H64Z', u('s'), 1),
      // coal mill dan pipa batu bara ke burner
      pipe('M61 78V72Q61 69 64 69H74', 1.6),
      R(55, 78, 12, 12, u('v'), 1.1), P('M55 78L58 74H64L67 78Z', u('v'), 1),
      C(81, 69, 2, '#3b4651', 0.8), C(87, 69, 2, '#3b4651', 0.8), C(93, 69, 2, '#3b4651', 0.8),
      // saluran gas buang ke ESP dan cerobong
      P('M100 24H120V36H113V31H100Z', u('s'), 1),
      R(110, 36, 24, 26, u('f'), 1.2), L('M116 36V62M122 36V62M128 36V62', '#9aa5ae', 0.7),
      P('M110 62H134L130 70H127L122 62L117 70H114Z', u('s'), 1),
      L('M112 70V90M132 70V90', O, 1.4),
      P('M134 41H140V49H134Z', u('s'), 1),
      P('M137 90L140.5 4H148.5L152 90Z', u('v'), 1.2),
      P('M140.2 11H148.8L149 16H140Z', '#d9483b', 0), P('M139.9 21H149.1L149.3 26H139.7Z', '#d9483b', 0),
      R(139.8, 2.6, 9.4, 2, '#8d98a3', 0.9),
    ].join('')),

    // trafo daya terendam minyak di gardu induk dengan gantry baja
    trafo: () => icon('tr', ['f', 'h', 's', 'c', 'v'], u => [
      ground(),
      // gantry kisi
      L(`M10 90V10M16 90V16M144 90V16M150 90V10M10 10H150M16 16H144${zig(10, 88, 16, 16, 12, true)}${zig(150, 88, 144, 16, 12, true)}${zig(16, 10, 144, 16, 20)}`, '#8d98a3', 0.8),
      // rantai isolator dan konduktor
      ...[60, 76, 92].map(x => L(`M${x} 16V27`, '#6f7a85', 0.9) + L(`M${x - 2.6} 18.5H${x + 2.6}M${x - 2.6} 21H${x + 2.6}M${x - 2.6} 23.5H${x + 2.6}M${x - 2.6} 26H${x + 2.6}`, '#5d6874', 1.3) + L(`M${x} 27Q${x + 3} 28.5 ${x} 31`, O, 0.9)),
      shadow(80, 54),
      R(42, 86, 76, 4.5, u('c'), 1),
      // radiator dan kipas ONAF
      L('M50 58H46M50 80H46M110 58H114M110 80H114', O, 1.8),
      R(28, 55, 18, 28, u('s'), 1.1), L('M30.5 56V82M33 56V82M35.5 56V82M38 56V82M40.5 56V82M43 56V82', '#dbe1e6', 0.7),
      R(114, 55, 18, 28, u('s'), 1.1), L('M116.5 56V82M119 56V82M121.5 56V82M124 56V82M126.5 56V82M129 56V82', '#dbe1e6', 0.7),
      C(37, 69, 6, '#3b4651', 1), L('M37 64V74M32 69H42', '#9aa5ae', 1.2), C(123, 69, 6, '#3b4651', 1), L('M123 64V74M118 69H128', '#9aa5ae', 1.2),
      // tangki trafo TR-601
      R(50, 54, 60, 32, u('f'), 1.3), R(48, 51.5, 64, 3, u('h'), 1),
      L('M58 54V86M102 54V86', '#9aa5ae', 0.8),
      R(73, 62, 14, 9, '#f4f6f8', 0.8), L('M75.5 65H84.5M75.5 68H82', '#8d98a3', 0.6),
      // konservator dan relai Buchholz
      L('M106 45V51.5M134 45V55', O, 1.3),
      pipe('M108 45V48.5H100V51.5', 1.3), R(101.5, 46.6, 4, 3.6, u('s'), 0.8),
      hv(102, 140, 40, 5, u('h')),
      // bushing tegangan tinggi
      ...[60, 76, 92].map(x => R(x - 3.5, 47, 7, 4.5, u('s'), 0.9) + P(`M${x - 2} 47V31.5h4V47Z`, u('v'), 0.8) + L(`M${x - 3.6} 33.5H${x + 3.6}M${x - 3.6} 36.5H${x + 3.6}M${x - 3.6} 39.5H${x + 3.6}M${x - 3.6} 42.5H${x + 3.6}M${x - 3.6} 45.5H${x + 3.6}`, '#e4e9ed', 1.6) + L(`M${x - 3.6} 33.5H${x + 3.6}M${x - 3.6} 36.5H${x + 3.6}M${x - 3.6} 39.5H${x + 3.6}M${x - 3.6} 42.5H${x + 3.6}M${x - 3.6} 45.5H${x + 3.6}`, '#5d6874', 0.5, 'transform="translate(0 0.9)"') + R(x - 1.2, 29.5, 2.4, 2.4, '#8d98a3', 0.7)),
    ].join('')),

    // kolam digester tertutup membran HDPE, flare, kontainer gas engine
    biogas: () => icon('bg', ['d', 'e', 'v', 'f', 's', 'h'], u => [
      ground(),
      // bio-scrubber di belakang kontainer
      vv(145, 34, 66, 6.5, u('v'), 3),
      // tanggul dan cover kolam DG-701
      P('M2 86L11 71H95L104 86Z', u('e'), 1.1),
      L('M11 71H95', '#7e9a5b', 1.6),
      P('M9 72.5C17 39 87 39 97 72.5Z', u('d'), 1.3),
      L('M30 72Q31 58 37 49.5M53 72V46.5M76 72Q75 58 69 49.5', '#7a8590', 0.8),
      L('M21 61C30 50 52 46 74 50', '#ffffff', 2, 'opacity=".25"'),
      // pipa gas ke flare dan engine
      pipe('M95 66H120', 2),
      // flare FL-701
      R(106.5, 16, 3.4, 74, u('v'), 1), R(104.6, 59, 7.2, 6, u('s'), 0.9),
      R(105, 12, 6.4, 4.5, u('s'), 1),
      P('M108.2 2.5C111.5 6 111.6 9.4 108.2 12C104.8 9.4 105.2 6 108.2 2.5Z', '#ff9a1f', 0), P('M108.2 6.5C109.8 8.3 109.8 10 108.2 11.6C106.6 10 106.8 8.3 108.2 6.5Z', '#ffd84a', 0),
      // kontainer gas engine GE-701
      shadow(135, 24),
      P('M116 64L122 60H156L150 64Z', '#eef2f5', 1.1),
      P('M150 64L156 60V84.5L150 88.5Z', u('s'), 1.1),
      R(116, 64, 34, 24.5, u('f'), 1.2),
      L('M119 64V88M122 64V88M125 64V88M140 64V88M143 64V88M146 64V88', '#b9c3cc', 0.6),
      R(127.5, 68, 10, 16, u('s'), 0.9), L('M128.5 70.5H136.5M128.5 73H136.5M128.5 75.5H136.5M128.5 78H136.5M128.5 80.5H136.5', '#dbe1e6', 0.7),
      // radiator atap dan peredam knalpot
      P('M132 60L134.5 56H150L147.5 60Z', u('s'), 0.9),
      L('M122 60V44', O, 3.6), L('M122 60V44', '#b9c3cc', 2),
      hv(116, 132, 42, 3, u('h'), 1),
    ].join('')),

    // PLTS: meja panel surya miring dan kontainer baterai dengan unit HVAC
    bess: () => icon('be', ['p', 'f', 's'], u => {
      const pv = (x, y, w, h, k) => P(`M${x + k} ${y}H${x + w + k}L${x + w} ${y + h}H${x}Z`, u('p'), 1) + L(`M${x + k + w / 4} ${y}L${x + w / 4} ${y + h}M${x + k + w / 2} ${y}L${x + w / 2} ${y + h}M${x + k + 3 * w / 4} ${y}L${x + 3 * w / 4} ${y + h}M${x + k / 2} ${y + h / 2}H${x + w + k / 2}`, '#8fb7d6', 0.5) + L(`M${x + 4} ${y + h}V${y + h + 7}M${x + w - 4} ${y + h}V${y + h + 7}`, O, 1.2);
      const box = (x, y, w, h, d) => P(`M${x} ${y}L${x + d} ${y - d * 0.6}H${x + w + d}L${x + w} ${y}Z`, '#f7f9fa', 1.1) + P(`M${x + w} ${y}L${x + w + d} ${y - d * 0.6}V${y + h - d * 0.6}L${x + w} ${y + h}Z`, u('s'), 1.1) + R(x, y, w, h, u('f'), 1.2);
      return [
        ground(),
        // larik panel surya PV-801
        pv(6, 30, 26, 11, 5), pv(36, 30, 26, 11, 5),
        pv(2, 48, 28, 12, 5), pv(34, 48, 28, 12, 5),
        shadow(108, 50),
        // kontainer baterai BT-802 di belakang
        box(90, 50, 54, 26, 10),
        R(130, 55, 10, 13, u('f'), 1), C(135, 59.5, 3, '#3b4651', 0.8), L('M131.5 65H138.5', '#8d98a3', 0.8),
        // kontainer baterai BT-801 di depan
        box(56, 62, 58, 26, 10),
        L('M74 63V87M92 63V87', '#9aa5ae', 0.8), L('M62 64V86M68 64V86M80 64V86M86 64V86', '#b9c3cc', 0.6),
        R(98, 66, 12, 15, u('f'), 1), C(104, 71.5, 3.5, '#3b4651', 0.8), L('M104 68V75M100.5 71.5H107.5', '#8d98a3', 0.7), L('M99.5 78H108.5', '#8d98a3', 0.8),
        P('M77 69L80.5 75H73.5Z', '#f7c948', 0.6),
        R(54, 88, 62, 2, '#5d6874', 0),
      ].join('');
    }),

    // pabrik pakan: silo jagung, bucket elevator, gedung hammer mill, dust collector, kipas dan cerobong
    debu: () => icon('db', ['v', 'h', 'f', 's', 'g'], u => [
      ground(),
      shadow(30, 26), shadow(130, 26),
      // silo belakang
      P('M29 30L40 22L51 30Z', '#dfe5ea', 1.1), R(29, 30, 22, 60, u('v'), 1.2),
      // galeri dari silo ke elevator
      L('M40 21L57 10M40 24.5L57 13.5', O, 0.9), L('M42 22.7L45 21.6L48 18.9L51 17.8L54 15.2', O, 0.6),
      // silo depan SL-901
      P('M3.5 34L18 23L32.5 34Z', '#e6ebef', 1.1), R(16.5, 20.5, 3, 3, '#c9d1d8', 0.8),
      R(4, 34, 28, 56, u('v'), 1.3),
      L('M4 39H32M4 44H32M4 49H32M4 54H32M4 59H32M4 64H32M4 69H32M4 74H32M4 79H32M4 84H32', '#9aa5ae', 0.5),
      L('M11 34V90M25 34V90', '#7d8893', 0.6), R(3.4, 33, 29.2, 2, '#c9d1d8', 0.9),
      // bucket elevator BE-901
      R(55, 12, 3.4, 74, u('s'), 0.9), R(59.4, 12, 3.4, 74, u('s'), 0.9),
      P('M53 12V6.5Q53 3 56.5 3H61.5Q65 3 65 6.5V12Z', u('f'), 1.1), R(65, 5, 6, 4.5, u('v'), 0.8),
      R(52.5, 83, 13, 7, u('f'), 1),
      pipe('M64 11L84 41', 2.2),
      // gedung hammer mill
      P('M66 50L89 39L112 50Z', u('s'), 1.1),
      R(68, 50, 42, 40, u('f'), 1.2),
      L('M73 50V90M78 50V90M98 50V90M103 50V90', '#c4ccd3', 0.6),
      R(72, 55, 34, 5, u('g'), 0.7), R(81, 70, 16, 20, '#a3adb7', 0.9), L('M81 74H97M81 78H97M81 82H97M81 86H97', '#7d8893', 0.6),
      L('M62.8 46H68M62.8 66H68', O, 0.9),
      // saluran aspirasi ke dust collector
      pipe('M103 45V37Q103 34 106 34H117Q120 34 120 37V44', 2.6),
      // dust collector DC-901
      L('M121 60L119 90M139 60L141 90M120.5 66L139.5 80M139.5 66L120.5 80', O, 1.1),
      R(120, 26, 20, 34, u('v'), 1.2), R(119, 22, 22, 5, u('h'), 1),
      L('M118.5 22V16H141.5V22M124 16V22M136 16V22', O, 0.8),
      P('M120 60H140L133 72H127Z', u('v'), 1.1), R(127, 72, 6, 4, u('s'), 0.8),
      R(131, 31, 7, 11, '#f6c445', 0.8), L('M131.6 35L134 32M131.6 39L137.4 32.6M134.6 41.6L137.4 38.4', '#2f3a45', 0.9),
      // kipas FN-901 dan cerobong
      pipe('M141 30H144V74', 2),
      R(149, 16, 5, 62, u('v'), 1), R(148.4, 14.5, 6.2, 2, '#c9d1d8', 0.8),
      P('M144 82A6 6 0 1 1 150 88H144Z', u('v'), 1.1), C(149, 82, 2, '#3b4651', 0.6),
    ].join('')),

    // cold storage: kondensor evaporatif di atap, paket kompresor screw, receiver tekanan tinggi
    amonia: () => icon('am', ['f', 'h', 'v', 's', 'm'], u => [
      ground(),
      shadow(50, 48), shadow(126, 30),
      // gedung cold storage berpanel insulasi
      P('M4 40L12 35H96L88 40Z', '#f7f9fa', 1.1),
      P('M88 40L96 35V85L88 90Z', u('s'), 1.1),
      R(4, 40, 84, 50, u('f'), 1.3),
      L('M10 40V60M16 40V60M22 40V60M28 40V60M34 40V60M40 40V60M46 40V60M52 40V60M58 40V60M64 40V60M70 40V60M76 40V60M82 40V60', '#d3dae0', 0.6),
      R(6, 60, 70, 2.6, '#5d6874', 0.8),
      ...[10, 30, 50].map(x => R(x, 66, 14, 20, '#3b4651', 0.8) + R(x + 2, 68, 10, 18, '#c9d1d8', 0.6) + L(`M${x + 2} 72H${x + 12}M${x + 2} 76H${x + 12}M${x + 2} 80H${x + 12}`, '#8d98a3', 0.5)),
      R(4, 86, 84, 4, '#b9c3cc', 1),
      R(76, 70, 8, 16, '#9aa5ae', 0.8),
      // tanda bahaya NFPA 704 di pintu ruang mesin
      P('M80 54L83 57L80 60L77 57Z', '#1572a8', 0.4), P('M80 54L83 57H77Z', '#e0483a', 0), P('M83 57L80 60L77 57Z', '#ffffff', 0), P('M83 57L80 60V57Z', '#f7c948', 0), P('M80 51L86 57L80 63L74 57Z', 'none', 0.6),
      // kondensor evaporatif E-1001 di atap
      R(36, 20, 36, 16.5, u('f'), 1.2),
      L('M37 28.5H71M37 31H71M37 33.5H71', '#8d98a3', 0.7),
      R(40, 13.5, 12, 6.5, u('v'), 1), R(56, 13.5, 12, 6.5, u('v'), 1),
      L('M39 13.5H53M55 13.5H69', O, 1.4),
      // jalur gas panas dan cairan amonia
      pipe('M142 44V28Q142 25 139 25H72', 1.6),
      pipe('M72 33H96Q99 33 99 36V79H100', 1.6),
      // paket kompresor screw K-1001
      R(100, 70, 54, 3.5, u('s'), 1),
      R(101, 57, 17, 13, u('m'), 1), L('M104 57V70M107 57V70M110 57V70M113 57V70', '#203242', 0.5),
      R(118, 60, 4, 7, u('s'), 0.8),
      P('M122 57H133L135 60V67L133 70H122Z', u('v'), 1.1),
      vv(142, 43, 70, 6, u('v'), 3),
      pipe('M133 60H136', 1.6),
      // receiver tekanan tinggi V-1001
      P('M108 84H118L119 90H107ZM136 84H146L147 90H135Z', u('s'), 1),
      hv(100, 154, 80, 6.5, u('h')),
      R(124, 69, 3, 5, u('v'), 0.8), R(123.2, 66.5, 4.6, 3, u('v'), 0.8),
      R(148, 75, 2.6, 10, '#f4f7f9', 0.7), R(148.5, 80, 1.6, 4.5, '#29abe2', 0),
    ].join('')),

    // gedung komersial 3 lantai dengan restoran di lantai atas, rak LPG, tangki air kebakaran, hidran
    gedung: () => icon('gd', ['g', 'f', 's', 'v', 'h'], u => [
      ground(),
      shadow(68, 48), shadow(139, 18),
      // massa gedung
      P('M108 26L116 21V85L108 90Z', u('s'), 1.1),
      P('M24 26L32 21H116L108 26Z', '#eef2f5', 1.1),
      R(24, 26, 84, 64, u('f'), 1.3),
      R(27, 30, 78, 15, u('g'), 0.8), R(27, 50, 78, 15, u('g'), 0.8), R(27, 70, 78, 20, u('g'), 0.8),
      L('M36.7 30V45M46.5 30V45M56.2 30V45M66 30V45M75.7 30V45M85.5 30V45M95.2 30V45M36.7 50V65M46.5 50V65M56.2 50V65M66 50V65M75.7 50V65M85.5 50V65M95.2 50V65M36.7 70V90M46.5 70V90M85.5 70V90M95.2 70V90', '#e9f0f4', 0.8),
      P('M30 45L42 30H50L38 45ZM58 65L70 50H74L62 65Z', '#ffffff', 0, 'opacity=".35"'),
      L('M109.5 30V44M113.5 28V42M109.5 50V64M113.5 47.5V61.5', '#c4ccd3', 0.7),
      // kanopi restoran dan lobi
      R(20, 23, 92, 3, '#3b4651', 0.8),
      R(54, 67, 26, 2.4, '#3b4651', 0.8), R(58, 74, 18, 16, '#2c4a60', 0.8), L('M67 74V90', '#8ec6e4', 0.7),
      // atap: ruang tangga dan kipas exhaust dapur
      R(34, 15, 16, 8, u('f'), 1),
      R(92, 19, 12, 4, u('s'), 0.9), P('M93.5 19L95.5 11.5H100.5L102.5 19Z', u('v'), 1), R(94.5, 9.5, 7, 2, u('h'), 0.8),
      // pipa tegak LPG dan rak tabung
      L('M22 74V37H27', O, 2.6), L('M22 74V37H27', '#f2c230', 1.2),
      P('M1 70L12 66L23 70Z', u('s'), 1),
      R(2, 70, 20, 20, 'none', 1), L('M2 75H22M2 80H22M2 85H22M7 70V90M12 70V90M17 70V90', '#9aa5ae', 0.5),
      ...[4.5, 10, 15.5].map(x => `<rect x="${x}" y="74" width="4.4" height="15" rx="2" fill="${u('v')}" stroke="${O}" stroke-width=".8"/>` + R(x + 1.4, 72, 1.6, 2, '#5d6874', 0)),
      // tangki air kebakaran TK-201 dan hidran
      P('M124 50L139 43.5L154 50Z', '#e6ebef', 1.1),
      R(124, 50, 30, 40, u('v'), 1.3), L('M124 60H154M124 70H154M124 80H154', '#8f9aa4', 0.6),
      L('M150 90V50M152.6 90V50', O, 0.7), L('M150 55H152.6M150 60H152.6M150 65H152.6M150 70H152.6M150 75H152.6M150 80H152.6M150 85H152.6', O, 0.5),
      R(116, 81, 5, 9, '#d93a2e', 0.9), P('M115.5 81A3 2.4 0 0 1 121.5 81Z', '#d93a2e', 0.9), L('M114 85H123', O, 1.8), L('M114.4 85H122.6', '#d93a2e', 0.9),
      R(102, 84, 5, 3, '#d93a2e', 0.7),
    ].join('')),

    // AMP: cold bin, drum pengering miring dengan burner, hot elevator, menara pencampur, baghouse, cerobong
    amp: () => icon('ap', ['h', 'v', 'f', 's'], u => [
      ground(),
      shadow(78, 74),
      // saluran gas buang dari drum ke baghouse
      pipe('M54 49V28Q54 25 57 25H140', 3),
      // cold bin
      L('M3 58V90M41 58V90M22 58V90M3 64L22 88M41 64L22 88', O, 1.2),
      R(2, 36, 40, 10, u('f'), 1.2), L('M12 36V46M22 36V46M32 36V46', O, 0.9),
      P('M2 46H42L39 56H35L32 46L29 56H25L22 46L19 56H15L12 46L9 56H5Z', u('s'), 1.1),
      R(2, 58, 40, 3.2, '#3b4651', 0.8),
      P('M40 59.5L52 54L53 57L41 62.5Z', '#5d6874', 0.8),
      // drum pengering DR-101 dan burner
      `<g transform="rotate(7 76 56)">`,
      R(50, 49, 52, 14, u('h'), 1.3),
      R(57, 47.4, 4, 17.2, u('s'), 1), R(91, 47.4, 4, 17.2, u('s'), 1), R(74, 48, 3, 16, '#8d98a3', 0.8),
      P('M102 50.5L108 52.5V59.5L102 61.5Z', u('s'), 1), R(108, 52, 9, 8, u('v'), 1),
      `</g>`,
      L('M59 61V90M94 66V90M56 90L62 74M97 90L91 77', O, 1.2),
      // hot elevator HE-101
      P('M99 89L114 12H119.5L104.5 89Z', u('s'), 1),
      // menara pencampur MX-101
      L('M118 52V90M136 52V90M118 60L136 74M136 60L118 74', O, 1.3),
      R(114, 9, 26, 10, u('f'), 1.2), L('M114 9V4.5H140V9M127 4.5V9', O, 0.8),
      R(117, 19, 20, 17, u('f'), 1.2), L('M123.7 19V36M130.3 19V36', '#9aa5ae', 0.7),
      P('M117 36H137L132 42H122Z', u('s'), 1),
      R(119, 43, 16, 8, u('v'), 1.1),
      // baghouse BH-101 dan cerobong
      R(150, 3, 5, 30, u('v'), 1), R(149.4, 2, 6.2, 2, '#c9d1d8', 0.8),
      R(140, 30, 17, 24, u('f'), 1.2), L('M144.2 30V54M148.5 30V54M152.7 30V54', '#9aa5ae', 0.7),
      P('M140 54H157L153 62H151L148.5 56L146 62H144Z', u('s'), 1),
      L('M141 62V90M156 62V90', O, 1.2),
    ].join('')),
  };
})();
