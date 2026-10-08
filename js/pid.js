/* =====================================================================
   PID: penggambar P&ID berbasis SVG.
   Peralatan digambar sebagai baja silver dengan gradien dan bayangan
   (kesan tiga dimensi), aksen biru muda, isi cairan dinamis, lapisan
   efek insiden, dan lencana escalation factor.
   ===================================================================== */
const PID = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const VB_W = 1000, VB_H = 560;

  /* Standar warna jalur proses, sama untuk semua misi. Warna menunjukkan kategori bahan, sedangkan pola
     membedakan bahan di dalam kategori yang sama: cable untuk kabel daya, dash untuk pelepasan darurat,
     stripe untuk garis putih di tengah pipa, dan dot untuk butiran padatan curah. Garis putus-putus pada
     pipa yang diberi dashed menandai jalur yang hanya dipakai sesekali. */
  const FLUID_CATS = {
    power: { c: '#f2b705', name: 'Listrik' },
    water: { c: '#1e6fd9', name: 'Air' },
    steam: { c: '#8e9ba8', name: 'Uap air' },
    gas: { c: '#8b5a2b', name: 'Gas dan uap mudah terbakar' },
    toxic: { c: '#d32f2f', name: 'Gas dan uap beracun' },
    relief: { c: '#d32f2f', name: 'Pelepasan darurat ke flare' },
    fire: { c: '#c62828', name: 'Air pemadam kebakaran' },
    flam: { c: '#ef7d00', name: 'Cairan mudah terbakar' },
    chem: { c: '#7e57c2', name: 'Bahan kimia cair berbahaya' },
    air: { c: '#3fa34d', name: 'Udara' },
    solid: { c: '#c49a5a', name: 'Padatan curah' },
    flue: { c: '#4a5560', name: 'Gas buang' },
    hot: { c: '#c2185b', name: 'Fluida panas' },
  };
  const FLUIDS = {
    power:   { cat: 'power', pat: 'cable', name: 'Kabel daya listrik' },
    water:   { cat: 'water', name: 'Air proses' },
    cw:      { cat: 'water', name: 'Air pendingin' },
    steam:   { cat: 'steam', name: 'Uap air' },
    gas:     { cat: 'gas', name: 'Gas atau uap hidrokarbon' },
    toxic:   { cat: 'toxic', name: 'Gas beracun' },
    flare:   { cat: 'relief', pat: 'dash', name: 'Header flare' },
    fw:      { cat: 'fire', pat: 'stripe', name: 'Air pemadam kebakaran' },
    oil:     { cat: 'flam', name: 'Minyak' },
    lpg:     { cat: 'flam', name: 'LPG cair' },
    product: { cat: 'flam', name: 'Produk cair' },
    mix:     { cat: 'flam', pat: 'stripe', name: 'Fluida sumur (minyak, gas, dan air)' },
    chem:    { cat: 'chem', name: 'Monomer dan pelarut' },
    nh3:     { cat: 'chem', name: 'Amonia cair' },
    air:     { cat: 'air', name: 'Udara' },
    bulk:    { cat: 'solid', pat: 'dot', name: 'Material curah' },
    coal:    { cat: 'solid', pat: 'dot', name: 'Serbuk batu bara dan udara primer' },
    agg:     { cat: 'solid', pat: 'dot', name: 'Agregat batuan' },
    flue:    { cat: 'flue', name: 'Gas buang' },
    hotoil:  { cat: 'hot', name: 'Oli termal' },
    asphalt: { cat: 'hot', pat: 'stripe', name: 'Aspal panas' },
  };
  Object.keys(FLUIDS).forEach(k => { const f = FLUIDS[k]; f.c = FLUID_CATS[f.cat].c; f.catName = FLUID_CATS[f.cat].name; f.pat = f.pat || 'solid'; });

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) {
      if (attrs[k] === undefined || attrs[k] === null) continue;
      e.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(e);
    return e;
  }
  function text(parent, x, y, str, attrs) {
    const t = el('text', Object.assign({ x, y, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, attrs || {}), parent);
    t.textContent = str;
    return t;
  }
  function label(parent, x, y, str, size, extra) {
    return text(parent, x, y, str, Object.assign({ class: 'eq-label', 'font-size': size || 12, 'font-weight': 800, fill: '#1f2a35' }, extra || {}));
  }
  function grad(defs, id, stops, opts) {
    const o = opts || {};
    const g = el(o.radial ? 'radialGradient' : 'linearGradient', Object.assign({ id }, o.attrs || {}), defs);
    stops.forEach(s => el('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] }, g));
    return g;
  }

  function makeDefs(svg) {
    const d = el('defs', null, svg);
    const steel = [[0, '#fbfcfd'], [0.16, '#e7ecf0'], [0.42, '#bec8d0'], [0.68, '#929eaa'], [0.88, '#6d7985'], [1, '#535e69']];
    grad(d, 'gSteelV', steel, { attrs: { x1: 0, y1: 0, x2: 1, y2: 0 } });
    grad(d, 'gSteelH', steel, { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gSteelTop', [[0, '#ffffff'], [1, '#c5cdd4']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gSteelR', [[0, '#ffffff'], [0.35, '#dde3e8'], [0.75, '#97a3ae'], [1, '#5c6773']], { radial: true, attrs: { cx: 0.35, cy: 0.3, r: 0.8 } });
    grad(d, 'gValve', [[0, '#ffffff'], [0.5, '#b9c3cc'], [1, '#56616c']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gBlue', [[0, '#d6f2fd'], [0.45, '#5cc6ef'], [1, '#1572a8']], { attrs: { x1: 0, y1: 0, x2: 1, y2: 0 } });
    grad(d, 'gBlueV', [[0, '#d6f2fd'], [0.45, '#5cc6ef'], [1, '#1572a8']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gDark', [[0, '#5a6672'], [1, '#1d262e']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gLiquid', [[0, '#8fdcf7', 0.55], [1, '#1572a8', 0.72]], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gBulk', [[0, '#e8cf8f', 0.85], [1, '#b8914a', 0.9]], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gBubble', [[0, '#ffffff'], [0.55, '#e4e9ed'], [1, '#9ba7b2']], { radial: true, attrs: { cx: 0.35, cy: 0.3, r: 0.85 } });
    grad(d, 'gFlame', [[0, '#ff3d00'], [0.55, '#ff9100'], [1, '#ffee58']], { attrs: { x1: 0, y1: 1, x2: 0, y2: 0 } });
    grad(d, 'gMuster', [[0, '#e8f5e9'], [0.5, '#66bb6a'], [1, '#2e7d32']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gGlass', [[0, '#ffffff', 0.6], [0.45, '#ffffff', 0.04], [1, '#000000', 0.12]], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gGrid', [[0, '#f7f9fb'], [1, '#e6ebf0']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gHeat', [[0, '#ff3d00', 0.75], [0.5, '#ff6d00', 0.35], [1, '#ff6d00', 0]], { radial: true });
    grad(d, 'gToxic', [[0, '#cddc39', 0.95], [0.55, '#afb42b', 0.62], [1, '#827717', 0]], { radial: true });
    grad(d, 'gVapor', [[0, '#8796a3', 0.9], [0.55, '#a7b4bf', 0.6], [1, '#c3cdd5', 0]], { radial: true });
    grad(d, 'gSmoke', [[0, '#4b5560', 0.75], [1, '#4b5560', 0]], { radial: true });
    grad(d, 'gBlast', [[0, '#ffffff'], [0.25, '#fff59d'], [0.55, '#ffb300'], [0.8, '#ff5722', 0.8], [1, '#d84315', 0]], { radial: true });
    grad(d, 'gSpill', [[0, '#3e3029', 0.95], [1, '#2a211c', 0.6]], { radial: true });
    grad(d, 'gScorch', [[0, '#1d1a18', 0.7], [1, '#1d1a18', 0]], { radial: true });
    grad(d, 'gDust', [[0, '#c9a46a', 0.9], [0.55, '#d8bd8f', 0.6], [1, '#e6d3b0', 0]], { radial: true });
    grad(d, 'gArc', [[0, '#ffffff', 0.95], [0.35, '#fff59d', 0.75], [0.7, '#4fc3f7', 0.35], [1, '#4fc3f7', 0]], { radial: true });
    grad(d, 'gPV', [[0, '#4d74a3'], [0.45, '#1f3b5b'], [1, '#0f2133']], { attrs: { x1: 0, y1: 0, x2: 1, y2: 1 } });
    grad(d, 'gMembrane', [[0, '#5a6672'], [0.35, '#2b333b'], [1, '#0f1418']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gEarth', [[0, '#b7ab9b'], [1, '#8f8374']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gPome', [[0, '#7a6a52', 0.9], [1, '#4c4134', 0.95]], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    const f = el('filter', { id: 'fShadow', x: '-20%', y: '-20%', width: '140%', height: '150%' }, d);
    el('feDropShadow', { dx: 0, dy: 3, stdDeviation: 2.5, 'flood-color': '#0b1015', 'flood-opacity': 0.35 }, f);
    const f2 = el('filter', { id: 'fGlow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, d);
    el('feGaussianBlur', { stdDeviation: 3, result: 'b' }, f2);
    const m = el('feMerge', null, f2);
    el('feMergeNode', { in: 'b' }, m); el('feMergeNode', { in: 'SourceGraphic' }, m);
    const fh = el('filter', { id: 'fHot', x: '-40%', y: '-40%', width: '180%', height: '180%' }, d);
    el('feDropShadow', { dx: 0, dy: 0, stdDeviation: 4, 'flood-color': '#ff5722', 'flood-opacity': 0.95 }, fh);
    el('feDropShadow', { dx: 0, dy: 0, stdDeviation: 10, 'flood-color': '#ff3d00', 'flood-opacity': 0.6 }, fh);
    const f3 = el('filter', { id: 'fSoft', x: '-20%', y: '-20%', width: '140%', height: '150%' }, d);
    el('feDropShadow', { dx: 0, dy: 1.5, stdDeviation: 1.2, 'flood-color': '#0b1015', 'flood-opacity': 0.3 }, f3);
    const mk = el('marker', { id: 'mArrow', viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 16, markerHeight: 16, markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse' }, d);
    el('path', { d: 'M0,0 L10,5 L0,10 Z', fill: '#2b3640' }, mk);
    const pat = el('pattern', { id: 'pGrid', width: 25, height: 25, patternUnits: 'userSpaceOnUse' }, d);
    el('path', { d: 'M25 0 L0 0 0 25', fill: 'none', stroke: '#d3e2ec', 'stroke-width': 0.6 }, pat);
    return d;
  }

  /* ---------- isi cairan (level) ---------- */
  function addLevel(g, e, ctx, shapeTag, shapeAttrs, extra) {
    const id = 'clip-' + e.id.replace(/[^a-zA-Z0-9]/g, '');
    const cp = el('clipPath', { id }, ctx.defs);
    el(shapeTag, shapeAttrs, cp);
    const lg = el('g', { 'clip-path': `url(#${id})`, class: 'liquid' }, g);
    const bulk = e.levelFill === 'bulk';
    const rect = el('rect', { x: e.x - 2, y: e.y + e.h, width: e.w + 4, height: 0, fill: bulk ? 'url(#gBulk)' : 'url(#gLiquid)' }, lg);
    const surf = el('rect', { x: e.x - 2, y: e.y + e.h, width: e.w + 4, height: 2, fill: bulk ? '#f6e7bf' : '#e8f8ff', opacity: 0.85 }, lg);
    ctx.levels[e.id] = { rect, surf, y0: e.y, h: e.h, extra: extra || 0 };
  }

  /* ---------- simbol peralatan ---------- */
  function drawVessel(g, e, ctx) {
    const horiz = e.orient === 'h';
    const r = horiz ? e.h / 2 : e.w / 2;
    if (horiz) {
      [e.x + 40, e.x + e.w - 72].forEach(sx => el('path', { d: `M${sx} ${e.y + e.h - 12} h32 l6 24 h-44 z`, fill: 'url(#gDark)', stroke: '#1d262e', 'stroke-width': 1 }, g));
    } else {
      el('path', { d: `M${e.x + 10} ${e.y + e.h - 6} l-10 20 M${e.x + e.w - 10} ${e.y + e.h - 6} l10 20`, stroke: '#2b3640', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    }
    const body = { x: e.x, y: e.y, width: e.w, height: e.h, rx: r, ry: r };
    el('rect', Object.assign({ fill: horiz ? 'url(#gSteelH)' : 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, body), g);
    if (e.level) addLevel(g, e, ctx, 'rect', body);
    if (horiz) {
      [e.x + r, e.x + e.w - r].forEach(sx => el('line', { x1: sx, y1: e.y + 2, x2: sx, y2: e.y + e.h - 2, stroke: '#5d6874', 'stroke-width': 1.2, opacity: 0.55 }, g));
      el('rect', { x: e.x + r * 0.7, y: e.y + e.h * 0.8, width: e.w - r * 1.4, height: 4, fill: '#29abe2', opacity: 0.9 }, g);
      el('rect', { x: e.x + r * 0.5, y: e.y + 6, width: e.w - r, height: 6, rx: 3, fill: '#fff', opacity: 0.75 }, g);
    } else {
      el('rect', { x: e.x + 8, y: e.y + r * 0.6, width: 7, height: e.h - r * 1.2, rx: 3.5, fill: '#fff', opacity: 0.6 }, g);
    }
    label(g, e.x + e.w / 2, e.y + e.h / 2 + 2, e.id, e.w < 60 ? 11 : e.w < 90 ? 14 : 18);
  }
  function drawReactor(g, e, ctx) {
    const r = 36;
    el('path', { d: `M${e.x + 20} ${e.y + e.h - 6} l-10 22 M${e.x + e.w - 20} ${e.y + e.h - 6} l10 22`, stroke: '#2b3640', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    el('rect', { x: e.x - 10, y: e.y + 30, width: e.w + 20, height: e.h - 40, rx: r + 10, fill: 'url(#gBlue)', opacity: 0.55, stroke: '#1572a8', 'stroke-width': 2, filter: 'url(#fShadow)' }, g);
    const body = { x: e.x, y: e.y, width: e.w, height: e.h, rx: r, ry: r };
    el('rect', Object.assign({ fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 2.4, filter: 'url(#fShadow)' }, body), g);
    if (e.level) addLevel(g, e, ctx, 'rect', body);
    const cx = e.x + e.w / 2 + 25;
    el('line', { x1: cx, y1: e.y - 10, x2: cx, y2: e.y + e.h - 50, stroke: '#2b3640', 'stroke-width': 4 }, g);
    el('path', { d: `M${cx - 30} ${e.y + e.h - 50} h60 M${cx - 22} ${e.y + e.h - 90} h44`, stroke: '#2b3640', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    el('rect', { x: e.x + 10, y: e.y + 30, width: 8, height: e.h - 60, rx: 4, fill: '#fff', opacity: 0.6 }, g);
    label(g, e.x + e.w / 2 - 20, e.y + e.h / 2, e.id, 18);
  }
  function drawTank(g, e, ctx) {
    const ry = 12, cx = e.x + e.w / 2;
    el('ellipse', { cx, cy: e.y + e.h + 5, rx: e.w / 2 + 8, ry: ry + 4, fill: '#0b1015', opacity: 0.15 }, g);
    const bodyD = `M${e.x} ${e.y} V${e.y + e.h} A${e.w / 2} ${ry} 0 0 0 ${e.x + e.w} ${e.y + e.h} V${e.y} Z`;
    el('path', { d: bodyD, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    if (e.level) addLevel(g, e, ctx, 'path', { d: bodyD }, ry);
    [0.38, 0.7].forEach(fr => el('path', { d: `M${e.x} ${e.y + e.h * fr} A${e.w / 2} ${ry} 0 0 0 ${e.x + e.w} ${e.y + e.h * fr}`, fill: 'none', stroke: '#5d6874', 'stroke-width': 1, opacity: 0.5 }, g));
    el('path', { d: `M${e.x} ${e.y + 16} A${e.w / 2} ${ry} 0 0 0 ${e.x + e.w} ${e.y + 16}`, fill: 'none', stroke: '#29abe2', 'stroke-width': 4 }, g);
    el('ellipse', { cx, cy: e.y, rx: e.w / 2, ry, fill: 'url(#gSteelTop)', stroke: '#3b4651', 'stroke-width': 2.2 }, g);
    el('ellipse', { cx: cx - e.w * 0.12, cy: e.y - 2, rx: e.w * 0.22, ry: ry * 0.35, fill: '#fff', opacity: 0.75 }, g);
    el('rect', { x: e.x + 9, y: e.y + 22, width: 7, height: e.h - 30, rx: 3.5, fill: '#fff', opacity: 0.55 }, g);
    label(g, cx, e.y + e.h / 2 + 6, e.id, 17);
  }
  function drawPump(g, e) {
    el('rect', { x: e.x - 16, y: e.y + 14, width: 32, height: 12, rx: 2, fill: 'url(#gDark)' }, g);
    el('circle', { cx: e.x, cy: e.y, r: 22, fill: 'url(#gSteelR)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    const sd = e.dir === 'left' ? -1 : 1;
    el('path', { d: `M${e.x - 10 * sd} ${e.y - 12} L${e.x + 15 * sd} ${e.y} L${e.x - 10 * sd} ${e.y + 12} Z`, fill: '#29abe2', stroke: '#1572a8', 'stroke-width': 1.2 }, g);
    el('circle', { cx: e.x - 7, cy: e.y - 8, r: 6, fill: '#fff', opacity: 0.55 }, g);
    label(g, e.x, e.y + 40, e.id, 12);
  }
  function drawCompressor(g, e) {
    el('circle', { cx: e.x, cy: e.y, r: 28, fill: 'url(#gSteelR)', stroke: '#3b4651', 'stroke-width': 2.4, filter: 'url(#fShadow)' }, g);
    el('path', { d: `M${e.x - 18} ${e.y - 14} L${e.x - 18} ${e.y + 14} L${e.x + 18} ${e.y + 6} L${e.x + 18} ${e.y - 6} Z`, fill: '#2b3640', stroke: '#29abe2', 'stroke-width': 2 }, g);
    el('circle', { cx: e.x - 9, cy: e.y - 10, r: 7, fill: '#fff', opacity: 0.5 }, g);
    label(g, e.x, e.y + 44, e.id, 12);
  }
  function drawHx(g, e) {
    el('circle', { cx: e.x, cy: e.y, r: 28, fill: 'url(#gSteelR)', stroke: '#3b4651', 'stroke-width': 2.4, filter: 'url(#fShadow)' }, g);
    el('path', { d: `M${e.x - 26} ${e.y} l10 -10 l10 20 l10 -20 l10 20 l6 -10`, fill: 'none', stroke: '#1e9bd7', 'stroke-width': 3.2, 'stroke-linejoin': 'round' }, g);
    el('circle', { cx: e.x - 9, cy: e.y - 10, r: 7, fill: '#fff', opacity: 0.5 }, g);
    label(g, e.x, e.y + 44, e.id, 12);
  }
  function drawValve(g, e) {
    const s = 12;
    const ctrl = e.sub === 'control';
    el('path', { d: `M${e.x - s} ${e.y - s} L${e.x + s} ${e.y + s} L${e.x + s} ${e.y - s} L${e.x - s} ${e.y + s} Z`, fill: 'url(#gValve)', stroke: '#2b3640', 'stroke-width': 2, filter: 'url(#fSoft)' }, g);
    if (ctrl) {
      el('line', { x1: e.x, y1: e.y, x2: e.x, y2: e.y - 22, stroke: '#2b3640', 'stroke-width': 2 }, g);
      el('path', { d: `M${e.x - 12} ${e.y - 22} a12 12 0 0 1 24 0 z`, fill: 'url(#gBlueV)', stroke: '#2b3640', 'stroke-width': 2 }, g);
      if (e.tag) {
        const bx = e.x + 30, by = e.y - 32;
        el('path', { d: `M${e.x} ${e.y - 30} L${bx - 12} ${by}`, stroke: '#2b3640', 'stroke-width': 1.2, 'stroke-dasharray': '3 2', fill: 'none' }, g);
        el('circle', { cx: bx, cy: by, r: 12, fill: '#ffffff', stroke: '#1565a6', 'stroke-width': 1.8, filter: 'url(#fSoft)' }, g);
        el('line', { x1: bx - 12, y1: by, x2: bx + 12, y2: by, stroke: '#1565a6', 'stroke-width': 1 }, g);
        text(g, bx, by - 4, e.tag, { 'font-size': 7.5, 'font-weight': 800, fill: '#1565a6' });
        text(g, bx, by + 5.5, e.id.split('-')[1] || '', { 'font-size': 7, 'font-weight': 700, fill: '#1565a6' });
      }
    } else {
      el('line', { x1: e.x, y1: e.y, x2: e.x, y2: e.y - 16, stroke: '#2b3640', 'stroke-width': 2 }, g);
      el('rect', { x: e.x - 10, y: e.y - 20, width: 20, height: 5, rx: 2, fill: '#2b3640' }, g);
    }
    label(g, e.x, e.y + 24, e.id, 10.5, { 'font-weight': 700 });
  }
  function drawFlare(g, e) {
    el('rect', { x: e.x - 8, y: e.y - 60, width: 16, height: 60, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 1.5, filter: 'url(#fShadow)' }, g);
    el('rect', { x: e.x - 8, y: e.y - 36, width: 16, height: 5, fill: '#29abe2' }, g);
    el('rect', { x: e.x - 12, y: e.y - 66, width: 24, height: 8, rx: 2, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 1.5 }, g);
    el('path', { d: `M${e.x - 8} ${e.y} l-10 14 M${e.x + 8} ${e.y} l10 14`, stroke: '#2b3640', 'stroke-width': 3 }, g);
    el('path', { class: 'flame', d: `M${e.x} ${e.y - 104} C${e.x + 15} ${e.y - 88} ${e.x + 11} ${e.y - 72} ${e.x} ${e.y - 66} C${e.x - 11} ${e.y - 72} ${e.x - 15} ${e.y - 88} ${e.x} ${e.y - 104} Z`, fill: 'url(#gFlame)', filter: 'url(#fGlow)' }, g);
    label(g, e.x - 16, e.y - 30, e.id, 12, { 'text-anchor': 'end' });
  }
  function drawTruck(g, e, ctx) {
    el('rect', { x: e.x - 10, y: e.y + e.h - 10, width: e.w + 40, height: 10, rx: 3, fill: '#2b3640' }, g);
    el('path', { d: `M${e.x + e.w + 2} ${e.y + e.h - 10} v-50 h20 l16 22 v28 z`, fill: 'url(#gDark)', stroke: '#1d262e', 'stroke-width': 2, filter: 'url(#fShadow)' }, g);
    el('path', { d: `M${e.x + e.w + 6} ${e.y + e.h - 40} h14 l10 14 h-24 z`, fill: '#8fdcf7' }, g);
    const body = { x: e.x, y: e.y, width: e.w, height: e.h - 12, rx: (e.h - 12) / 2, ry: (e.h - 12) / 2 };
    el('rect', Object.assign({ fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, body), g);
    if (e.level) addLevel(g, { id: e.id, x: e.x, y: e.y, w: e.w, h: e.h - 12 }, ctx, 'rect', body);
    el('rect', { x: e.x + 20, y: e.y + 6, width: e.w - 40, height: 6, rx: 3, fill: '#fff', opacity: 0.75 }, g);
    el('rect', { x: e.x + 30, y: e.y + (e.h - 12) * 0.78, width: e.w - 60, height: 3, fill: '#29abe2' }, g);
    [e.x + 24, e.x + 52, e.x + e.w + 16].forEach(wx => {
      el('circle', { cx: wx, cy: e.y + e.h + 2, r: 11, fill: '#1d262e', stroke: '#9aa6b1', 'stroke-width': 2 }, g);
      el('circle', { cx: wx, cy: e.y + e.h + 2, r: 4, fill: '#cfd6dc' }, g);
    });
    label(g, e.x + e.w / 2, e.y + (e.h - 12) / 2 + 2, e.id, 14);
  }
  function drawManifold(g, e) {
    for (let i = 0; i < 3; i++) el('rect', { x: e.x + 8 + i * 18, y: e.y - 18, width: 10, height: 18, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 1 }, g);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 8, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 2, filter: 'url(#fShadow)' }, g);
    label(g, e.x + e.w / 2, e.y + e.h + 14, e.id, 11, { 'font-weight': 700 });
  }
  function drawMotor(g, e) {
    el('rect', { x: e.x - 16, y: e.y - 12, width: 32, height: 24, rx: 5, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 1.5, filter: 'url(#fSoft)' }, g);
    el('rect', { x: e.x - 16, y: e.y + 6, width: 32, height: 3, fill: '#29abe2' }, g);
    text(g, e.x, e.y - 1, 'M', { 'font-size': 13, 'font-weight': 800, fill: '#1f2a35' });
    label(g, e.x + 36, e.y, e.id, 11, { 'text-anchor': 'start', 'font-weight': 700 });
  }
  function drawBuilding(g, e) {
    el('rect', { x: e.x - 30, y: e.y - 16, width: 60, height: 36, rx: 4, fill: 'url(#gDark)', stroke: '#1d262e', 'stroke-width': 2, filter: 'url(#fShadow)' }, g);
    el('path', { d: `M${e.x - 34} ${e.y - 16} L${e.x} ${e.y - 34} L${e.x + 34} ${e.y - 16} Z`, fill: '#3b4651', stroke: '#1d262e', 'stroke-width': 2 }, g);
    [-18, -4, 10].forEach(dx => el('rect', { x: e.x + dx, y: e.y - 8, width: 8, height: 8, fill: '#8fdcf7', opacity: 0.95 }, g));
    label(g, e.x, e.y + 32, e.name, 11, { 'font-weight': 700 });
  }
  function drawMuster(g, e) {
    el('circle', { cx: e.x, cy: e.y, r: 20, fill: 'url(#gMuster)', stroke: '#1b5e20', 'stroke-width': 2, filter: 'url(#fShadow)' }, g);
    [[-8, -4], [0, -8], [8, -4]].forEach(p => {
      el('circle', { cx: e.x + p[0], cy: e.y + p[1], r: 3.2, fill: '#fff' }, g);
      el('path', { d: `M${e.x + p[0] - 4} ${e.y + p[1] + 10} a4 4 0 0 1 8 0 z`, fill: '#fff' }, g);
    });
    label(g, e.x, e.y + 34, e.name, 11, { 'font-weight': 700 });
  }
  function drawSink(g, e) {
    const left = e.dir === 'left';
    const w = 132, h = 32;
    const x0 = left ? e.x - w : e.x;
    el('rect', { x: x0, y: e.y - h / 2, width: w, height: h, rx: 16, fill: 'url(#gSteelTop)', stroke: '#8d99a5', 'stroke-width': 1.5, filter: 'url(#fSoft)' }, g);
    const words = e.name.split(' ');
    let lines = [e.name];
    if (e.name.length > 17 && words.length > 1) {
      let best = 1, diff = 1e9;
      for (let i = 1; i < words.length; i++) {
        const a = words.slice(0, i).join(' ').length, b = words.slice(i).join(' ').length;
        if (Math.abs(a - b) < diff) { diff = Math.abs(a - b); best = i; }
      }
      lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
    }
    const fs = lines.some(l => l.length > 16) ? 8.5 : 9.5;
    lines.forEach((l, i) => text(g, x0 + w / 2, e.y + (i - (lines.length - 1) / 2) * 11 + 1, l, { class: 'eq-label', 'font-size': fs, 'font-weight': 700, fill: '#2b3640' }));
  }

  /* ---------- simbol tambahan lintas sektor ---------- */
  function legs(g, xs, y1, y2) { xs.forEach(lx => el('line', { x1: lx, y1, x2: lx, y2, stroke: '#2b3640', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g)); }
  function shine(g, x, y, w, h) { el('rect', { x, y, width: w, height: h, rx: Math.min(w, h) / 2, fill: '#fff', opacity: 0.6 }, g); }
  function drawColumn(g, e, ctx) {
    const r = e.w / 2, cx = e.x + r;
    el('path', { d: `M${e.x + 8} ${e.y + e.h - 6} L${e.x - 2} ${e.y + e.h + 18} H${e.x + e.w + 2} L${e.x + e.w - 8} ${e.y + e.h - 6} Z`, fill: 'url(#gDark)', stroke: '#1d262e', 'stroke-width': 1 }, g);
    const body = { x: e.x, y: e.y, width: e.w, height: e.h, rx: r, ry: r };
    el('rect', Object.assign({ fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, body), g);
    if (e.level) addLevel(g, { id: e.id, x: e.x, y: e.y + e.h * 0.72, w: e.w, h: e.h * 0.28 }, ctx, 'rect', body);
    const n = Math.max(4, Math.round((e.h - 2 * r) / 26));
    for (let i = 1; i < n; i++) {
      const ty = e.y + r * 0.8 + i * (e.h * 0.72 - r * 0.8) / n;
      el('path', { d: `M${e.x + 6} ${ty} H${e.x + e.w - 6}`, stroke: '#5d6874', 'stroke-width': 1.2, 'stroke-dasharray': '5 3', opacity: 0.55 }, g);
    }
    shine(g, e.x + 7, e.y + r * 0.6, 6, e.h - r * 1.2);
    label(g, cx, e.y + e.h * 0.42, e.id, e.w >= 70 ? 15 : 12);
  }
  function drawFurnace(g, e) {
    const cx = e.x + e.w / 2;
    el('path', { d: `M${e.x + 14} ${e.y + e.h - 2} L${cx - 14} ${e.y + e.h + 22} H${cx + 14} L${e.x + e.w - 14} ${e.y + e.h - 2} Z`, fill: 'url(#gDark)', stroke: '#1d262e', 'stroke-width': 1.2 }, g);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 8, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    const ix = e.x + 12, iy = e.y + 30, iw = e.w - 24, ih = e.h - 44;
    el('rect', { x: ix, y: iy, width: iw, height: ih, rx: 4, fill: '#1d262e', stroke: '#0b1015', 'stroke-width': 1.5 }, g);
    for (let k = 0; k < 4; k++) {
      el('line', { x1: ix + 3 + k * 4, y1: iy + 2, x2: ix + 3 + k * 4, y2: iy + ih - 2, stroke: '#7d8a96', 'stroke-width': 1.6 }, g);
      el('line', { x1: ix + iw - 3 - k * 4, y1: iy + 2, x2: ix + iw - 3 - k * 4, y2: iy + ih - 2, stroke: '#7d8a96', 'stroke-width': 1.6 }, g);
    }
    const fl = el('g', { class: 'furn-flames' }, g);
    const nb = Math.max(2, Math.min(4, Math.round(iw / 40)));
    for (let k = 0; k < nb; k++) {
      const fx0 = ix + 16 + (iw - 32) * (k + 0.5) / nb, fy = iy + ih - 6;
      el('path', { class: 'flame', d: `M${fx0} ${fy - 40} C${fx0 + 12} ${fy - 25} ${fx0 + 9} ${fy - 8} ${fx0} ${fy} C${fx0 - 9} ${fy - 8} ${fx0 - 12} ${fy - 25} ${fx0} ${fy - 40} Z`, fill: 'url(#gFlame)', filter: 'url(#fGlow)' }, fl);
    }
    el('rect', { x: e.x, y: e.y + 22, width: e.w, height: 4, fill: '#29abe2' }, g);
    label(g, cx, e.y + 13, e.id, 13);
  }
  function drawHeater(g, e) {
    const cx = e.x + e.w / 2;
    el('rect', { x: cx - 7, y: e.y - 34, width: 14, height: 36, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 1.4 }, g);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 10, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    const ix = e.x + 9, iy = e.y + 14, iw = e.w - 18, ih = e.h - 30;
    el('rect', { x: ix, y: iy, width: iw, height: ih, rx: 4, fill: '#1d262e' }, g);
    let d = '';
    for (let k = 0; k < 6; k++) { const yy = iy + 6 + k * (ih - 30) / 5; d += `M${ix + 4} ${yy} Q${cx} ${yy + 5} ${ix + iw - 4} ${yy} `; }
    el('path', { d, fill: 'none', stroke: '#ff8a50', 'stroke-width': 2, opacity: 0.85 }, g);
    el('path', { class: 'flame', d: `M${cx} ${iy + ih - 24} C${cx + 8} ${iy + ih - 15} ${cx + 6} ${iy + ih - 5} ${cx} ${iy + ih - 2} C${cx - 6} ${iy + ih - 5} ${cx - 8} ${iy + ih - 15} ${cx} ${iy + ih - 24} Z`, fill: 'url(#gFlame)', filter: 'url(#fGlow)' }, g);
    el('rect', { x: e.x, y: e.y + e.h - 12, width: e.w, height: 3, fill: '#29abe2' }, g);
    label(g, cx, e.y + e.h + 14, e.id, 11, { 'font-weight': 700 });
  }
  function drawBurner(g, e) {
    const s = e.dir === 'left' ? -1 : 1;
    el('rect', { x: e.x - 16, y: e.y - 11, width: 32, height: 22, rx: 5, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 1.6, filter: 'url(#fSoft)' }, g);
    el('rect', { x: e.x - 16, y: e.y + 5, width: 32, height: 3, fill: '#29abe2' }, g);
    el('path', { d: `M${e.x + s * 16} ${e.y - 6} L${e.x + s * 26} ${e.y - 3} V${e.y + 3} L${e.x + s * 16} ${e.y + 6} Z`, fill: '#2b3640' }, g);
    el('path', { class: 'hflame' + (s < 0 ? ' left' : ''), d: `M${e.x + s * 26} ${e.y} C${e.x + s * 34} ${e.y - 9} ${e.x + s * 46} ${e.y - 5} ${e.x + s * 56} ${e.y} C${e.x + s * 46} ${e.y + 5} ${e.x + s * 34} ${e.y + 9} ${e.x + s * 26} ${e.y} Z`, fill: 'url(#gFlame)', filter: 'url(#fGlow)' }, g);
    label(g, e.x, e.y + 25, e.id, 10.5, { 'font-weight': 700 });
  }
  function drawDrum(g, e) {
    const r = e.h / 2;
    [0.22, 0.78].forEach(f => { const rx = e.x + e.w * f; [-12, 12].forEach(dx => el('circle', { cx: rx + dx, cy: e.y + e.h + 7, r: 7, fill: 'url(#gDark)' }, g)); });
    el('rect', { x: e.x - 6, y: e.y + e.h + 12, width: e.w + 12, height: 6, rx: 2, fill: '#2b3640' }, g);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: r, ry: r, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    [0.22, 0.78].forEach(f => el('rect', { x: e.x + e.w * f - 7, y: e.y - 3, width: 14, height: e.h + 6, rx: 3, fill: 'url(#gDark)', stroke: '#1d262e', 'stroke-width': 1 }, g));
    el('rect', { x: e.x + e.w * 0.5 - 4, y: e.y - 2, width: 8, height: e.h + 4, rx: 2, fill: '#29abe2', opacity: 0.9 }, g);
    el('rect', { x: e.x + r, y: e.y + 6, width: e.w - 2 * r, height: 5, rx: 2.5, fill: '#fff', opacity: 0.7 }, g);
    label(g, e.x + e.w * 0.36, e.y + e.h / 2 + 2, e.id, 14);
  }
  function drawSilo(g, e, ctx) {
    const cx = e.x + e.w / 2, hb = e.y + e.h * 0.68, ow = Math.max(10, e.w * 0.16), ry = Math.min(10, e.w * 0.12);
    legs(g, [e.x + 6, e.x + e.w - 6], hb, e.y + e.h + 12);
    const d = `M${e.x} ${e.y} V${hb} L${cx - ow / 2} ${e.y + e.h} H${cx + ow / 2} L${e.x + e.w} ${hb} V${e.y} A${e.w / 2} ${ry} 0 0 1 ${e.x} ${e.y} Z`;
    el('path', { d, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    if (e.level) addLevel(g, e, ctx, 'path', { d });
    el('ellipse', { cx, cy: e.y, rx: e.w / 2, ry, fill: 'url(#gSteelTop)', stroke: '#3b4651', 'stroke-width': 2 }, g);
    el('path', { d: `M${e.x} ${hb} H${e.x + e.w}`, stroke: '#29abe2', 'stroke-width': 3, opacity: 0.85 }, g);
    shine(g, e.x + 7, e.y + 12, 6, Math.max(10, hb - e.y - 22));
    label(g, cx, e.y + (hb - e.y) / 2 + 4, e.id, e.w >= 80 ? 15 : 12);
  }
  function drawFilter(g, e) {
    const hh = e.h * 0.62, cx = e.x + e.w / 2, ow = Math.max(12, e.w * 0.18);
    legs(g, [e.x + 6, e.x + e.w - 6], e.y + hh, e.y + e.h + 10);
    el('path', { d: `M${e.x} ${e.y + hh} L${cx - ow / 2} ${e.y + e.h - 8} H${cx + ow / 2} L${e.x + e.w} ${e.y + hh} Z`, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 2, filter: 'url(#fShadow)' }, g);
    el('rect', { x: e.x, y: e.y, width: e.w, height: hh, rx: 6, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    el('rect', { x: e.x + 8, y: e.y + 16, width: e.w - 16, height: hh - 24, rx: 3, fill: '#e9eef2', stroke: '#8d99a5', 'stroke-width': 1 }, g);
    const nb = Math.max(3, Math.floor((e.w - 20) / 12));
    for (let k = 0; k < nb; k++) { const bx = e.x + 14 + k * (e.w - 28) / (nb - 1); el('line', { x1: bx, y1: e.y + 20, x2: bx, y2: e.y + hh - 12, stroke: '#c5cdd4', 'stroke-width': 5, 'stroke-linecap': 'round' }, g); }
    el('rect', { x: e.x, y: e.y + 6, width: e.w, height: 4, fill: '#29abe2' }, g);
    el('circle', { cx, cy: e.y + e.h - 2, r: 6, fill: 'url(#gDark)' }, g);
    label(g, cx, e.y + hh / 2 + 6, e.id, 13);
  }
  function drawElevator(g, e) {
    const cx = e.x + e.w / 2;
    el('rect', { x: e.x, y: e.y + 26, width: e.w, height: e.h - 48, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 1.8, filter: 'url(#fShadow)' }, g);
    for (let yy = e.y + 36; yy < e.y + e.h - 28; yy += 14) el('rect', { x: e.x + 4, y: yy, width: e.w / 2 - 6, height: 4, rx: 1, fill: '#5d6874', opacity: 0.7 }, g);
    el('path', { d: `M${e.x - 8} ${e.y + 28} V${e.y + 8} Q${cx} ${e.y - 14} ${e.x + e.w + 8} ${e.y + 8} V${e.y + 28} Z`, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 2, filter: 'url(#fShadow)' }, g);
    el('circle', { cx, cy: e.y + 12, r: 7, fill: 'url(#gDark)' }, g);
    el('rect', { x: e.x - 8, y: e.y + e.h - 24, width: e.w + 16, height: 24, rx: 4, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 2 }, g);
    el('rect', { x: e.x + e.w + 8, y: e.y + 4, width: 18, height: 14, rx: 3, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 1.2 }, g);
    text(g, e.x + e.w + 17, e.y + 11.5, 'M', { 'font-size': 9, 'font-weight': 800, fill: '#1f2a35' });
    label(g, cx, e.y - 18, e.id, 11, { 'font-weight': 700 });
  }
  function drawConveyor(g, e) {
    const x1 = e.x, y1 = e.y + e.h, x2 = e.x + e.w, y2 = e.y;
    const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const n = Math.max(2, Math.round(len / 46));
    for (let k = 0; k <= n; k++) { const px = x1 + ux * len * k / n, py = y1 + uy * len * k / n; el('line', { x1: px, y1: py + 5, x2: px, y2: py + 16, stroke: '#5d6874', 'stroke-width': 2.4 }, g); }
    el('path', { d: `M${x1} ${y1} L${x2} ${y2}`, stroke: '#1d262e', 'stroke-width': 9, 'stroke-linecap': 'round' }, g);
    el('path', { class: 'flow', d: `M${x1} ${y1} L${x2} ${y2}`, fill: 'none', stroke: '#c8a165', 'stroke-width': 3, 'stroke-dasharray': '6 8', 'stroke-linecap': 'round' }, g);
    [[x1, y1], [x2, y2]].forEach(pt => el('circle', { cx: pt[0], cy: pt[1], r: 7, fill: 'url(#gSteelR)', stroke: '#3b4651', 'stroke-width': 1.4 }, g));
    /* konveyor curam: label rata kanan di sisi atas agar tidak menimpa sabuk */
    if (uy < -0.3) label(g, (x1 + x2) / 2 - 12, (y1 + y2) / 2 - 8, e.id, 10.5, { 'font-weight': 700, 'text-anchor': 'end' });
    else label(g, (x1 + x2) / 2 + uy * 14, (y1 + y2) / 2 - 14, e.id, 10.5, { 'font-weight': 700 });
  }
  function drawMill(g, e) {
    el('rect', { x: e.x - 18, y: e.y + 20, width: 36, height: 8, rx: 2, fill: 'url(#gDark)' }, g);
    el('rect', { x: e.x - 26, y: e.y - 22, width: 52, height: 44, rx: 10, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    el('circle', { cx: e.x, cy: e.y, r: 14, fill: '#1d262e', stroke: '#5d6874', 'stroke-width': 2 }, g);
    const rot = el('g', { class: 'rot', transform: `translate(${e.x},${e.y})` }, g);
    el('path', { d: 'M-10 0 H10 M0 -10 V10', stroke: '#cfd6dc', 'stroke-width': 3, 'stroke-linecap': 'round' }, rot);
    el('rect', { x: e.x - 26, y: e.y + 13, width: 52, height: 3, fill: '#29abe2' }, g);
    label(g, e.x, e.y + 42, e.id, 12);
  }
  function drawFan(g, e) {
    const r = 22, s = e.dir === 'left' ? -1 : 1;
    el('rect', { x: s > 0 ? e.x : e.x - r - 12, y: e.y - r, width: r + 12, height: 13, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 1.6 }, g);
    el('circle', { cx: e.x, cy: e.y, r, fill: 'url(#gSteelR)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    el('circle', { cx: e.x, cy: e.y, r: 14, fill: '#26323d' }, g);
    const rot = el('g', { class: 'rot', transform: `translate(${e.x},${e.y})` }, g);
    let bd = '';
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; bd += `M0 0 L${(Math.cos(a) * 12).toFixed(1)} ${(Math.sin(a) * 12).toFixed(1)} `; }
    el('path', { d: bd, stroke: '#8fdcf7', 'stroke-width': 3, 'stroke-linecap': 'round' }, rot);
    el('circle', { cx: e.x, cy: e.y, r: 3, fill: '#cfd6dc' }, g);
    label(g, e.x, e.y + 37, e.id, 11.5);
  }
  function drawGenerator(g, e) {
    el('rect', { x: e.x - 6, y: e.y + e.h - 8, width: e.w + 12, height: 10, rx: 2, fill: 'url(#gDark)' }, g);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h - 8, rx: 8, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    for (let xx = e.x + 8; xx < e.x + e.w * 0.55; xx += 6) el('line', { x1: xx, y1: e.y + 10, x2: xx, y2: e.y + e.h - 16, stroke: '#5d6874', 'stroke-width': 1.4, opacity: 0.6 }, g);
    const gx = e.x + e.w * 0.77, gy = e.y + (e.h - 8) / 2, gr = Math.max(8, Math.min(16, (e.h - 8) / 2 - 5));
    el('circle', { cx: gx, cy: gy, r: gr, fill: '#ffffff', stroke: '#1565a6', 'stroke-width': 2.2 }, g);
    text(g, gx, gy + 1, 'G', { 'font-size': gr * 1.15, 'font-weight': 900, fill: '#1565a6' });
    el('rect', { x: e.x + 8, y: e.y + 4, width: e.w * 0.5, height: 4, rx: 2, fill: '#fff', opacity: 0.7 }, g);
    label(g, e.x + e.w / 2, e.y + e.h + 14, e.id, 12);
  }
  function drawTurbine(g, e) {
    el('line', { x1: e.x - 14, y1: e.y + e.h / 2, x2: e.x + e.w + 18, y2: e.y + e.h / 2, stroke: '#2b3640', 'stroke-width': 5 }, g);
    const d = `M${e.x} ${e.y + e.h * 0.28} L${e.x + e.w} ${e.y} V${e.y + e.h} L${e.x} ${e.y + e.h * 0.72} Z`;
    el('path', { d, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 2.2, 'stroke-linejoin': 'round', filter: 'url(#fShadow)' }, g);
    for (let k = 1; k < 4; k++) { const xx = e.x + e.w * k / 4, t = 1 - k / 4; el('line', { x1: xx, y1: e.y + e.h * 0.28 * t + 3, x2: xx, y2: e.y + e.h - e.h * 0.28 * t - 3, stroke: '#5d6874', 'stroke-width': 1.2, opacity: 0.6 }, g); }
    el('rect', { x: e.x + e.w * 0.25, y: e.y + e.h - 5, width: e.w * 0.75, height: 3, fill: '#29abe2' }, g);
    label(g, e.x + e.w * 0.58, e.y + e.h / 2 + 1, e.id, 12);
  }
  function drawTransformer(g, e) {
    const fw = 18, cx = e.x + e.w / 2;
    [e.x - fw, e.x + e.w].forEach(rx => {
      for (let k = 0; k < 4; k++) el('rect', { x: rx + k * 4.5, y: e.y + e.h * 0.1, width: 3.2, height: e.h * 0.8, rx: 1.2, fill: 'url(#gSteelV)', stroke: '#5d6874', 'stroke-width': 0.6 }, g);
      el('rect', { x: rx - 1, y: e.y + e.h * 0.12, width: fw + 1, height: 3, fill: '#5d6874' }, g);
      el('rect', { x: rx - 1, y: e.y + e.h * 0.84, width: fw + 1, height: 3, fill: '#5d6874' }, g);
    });
    const cvx = e.x + e.w * 0.6, cvy = e.y - 46, px = e.x + e.w * 0.74;
    el('path', { d: `M${px} ${cvy + 14} V${e.y}`, stroke: '#3b4651', 'stroke-width': 3.2 }, g);
    el('rect', { x: px - 5, y: e.y - 22, width: 10, height: 9, rx: 2, fill: '#2b3640' }, g);
    el('rect', { x: cvx, y: cvy, width: e.w * 0.46, height: 17, rx: 8.5, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 1.6, filter: 'url(#fSoft)' }, g);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 6, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    el('rect', { x: e.x, y: e.y + e.h - 12, width: e.w, height: 4, fill: '#29abe2' }, g);
    shine(g, e.x + 8, e.y + 8, 6, e.h - 24);
    [0.14, 0.29, 0.44].forEach(f => {
      const bx = e.x + e.w * f;
      el('rect', { x: bx - 3, y: e.y - 32, width: 6, height: 32, fill: '#cfd6dc', stroke: '#5d6874', 'stroke-width': 0.8 }, g);
      for (let k = 0; k < 4; k++) el('ellipse', { cx: bx, cy: e.y - 6 - k * 7, rx: 6.5, ry: 2.2, fill: '#eef1f3', stroke: '#5d6874', 'stroke-width': 0.8 }, g);
      el('circle', { cx: bx, cy: e.y - 34, r: 3, fill: '#2b3640' }, g);
    });
    label(g, cx, e.y + e.h / 2, e.id, 15);
  }
  function drawPanel(g, e) {
    el('rect', { x: e.x - 3, y: e.y + e.h - 4, width: e.w + 6, height: 6, rx: 2, fill: '#2b3640' }, g);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 4, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 2, filter: 'url(#fShadow)' }, g);
    const n = Math.max(1, Math.round(e.w / 30)), dw = e.w / n;
    for (let k = 0; k < n; k++) {
      const dx = e.x + k * dw;
      el('rect', { x: dx + 3, y: e.y + 10, width: dw - 6, height: e.h - 16, rx: 2, fill: 'url(#gSteelTop)', stroke: '#8d99a5', 'stroke-width': 1 }, g);
      el('circle', { cx: dx + dw / 2 - 4, cy: e.y + 17, r: 2.6, fill: k % 2 ? '#66bb6a' : '#29abe2' }, g);
      el('rect', { x: dx + dw - 9, y: e.y + e.h / 2 - 4, width: 3, height: 10, rx: 1.5, fill: '#2b3640' }, g);
      for (let v = 0; v < 3; v++) el('line', { x1: dx + 7, y1: e.y + e.h - 14 - v * 4, x2: dx + dw - 12, y2: e.y + e.h - 14 - v * 4, stroke: '#8d99a5', 'stroke-width': 1 }, g);
    }
    el('rect', { x: e.x, y: e.y + 3, width: e.w, height: 4, fill: '#29abe2' }, g);
    if (e.sub) text(g, e.x + e.w / 2, e.y + e.h / 2 + 1, e.sub, { 'font-size': 9.5, 'font-weight': 900, fill: '#1565a6' });
    label(g, e.x + e.w / 2, e.y + e.h + 14, e.id, 11.5);
  }
  function drawBattery(g, e) {
    el('rect', { x: e.x - 4, y: e.y + e.h - 4, width: e.w + 8, height: 8, rx: 2, fill: '#2b3640' }, g);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 3, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    for (let xx = e.x + 6; xx < e.x + e.w - 4; xx += 7) el('line', { x1: xx, y1: e.y + 3, x2: xx, y2: e.y + e.h - 3, stroke: '#8d99a5', 'stroke-width': 1, opacity: 0.5 }, g);
    const wx = e.x + 10, wy = e.y + 14, ww = e.w - 50, wh = e.h - 26;
    el('rect', { x: wx, y: wy, width: ww, height: wh, rx: 3, fill: '#1d262e', stroke: '#0b1015', 'stroke-width': 1.2 }, g);
    const cols = Math.max(3, Math.floor(ww / 18)), rows = Math.max(2, Math.floor(wh / 12));
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) el('rect', { x: wx + 4 + c * (ww - 8) / cols, y: wy + 4 + r * (wh - 8) / rows, width: (ww - 8) / cols - 3, height: (wh - 8) / rows - 3, rx: 1.5, fill: 'url(#gBlueV)', opacity: 0.9 }, g);
    el('rect', { x: e.x + e.w - 32, y: e.y + 9, width: 22, height: e.h - 18, rx: 2, fill: 'url(#gSteelTop)', stroke: '#5d6874', 'stroke-width': 1 }, g);
    el('rect', { x: e.x + e.w - 15, y: e.y + e.h / 2 - 5, width: 3, height: 10, rx: 1.5, fill: '#2b3640' }, g);
    label(g, e.x + e.w / 2, e.y + e.h + 16, e.id, 12);
  }
  function drawSolar(g, e) {
    const n = e.n || 3, pw = e.w / n, bh = e.h * 0.62;
    for (let k = 0; k < n; k++) {
      const px = e.x + k * pw;
      el('line', { x1: px + pw / 2, y1: e.y + bh - 6, x2: px + pw / 2, y2: e.y + e.h, stroke: '#2b3640', 'stroke-width': 3 }, g);
      const A = [px + pw * 0.26, e.y], B = [px + pw - 3, e.y], C = [px + pw * 0.74, e.y + bh], D = [px + 3, e.y + bh];
      el('path', { d: `M${A} L${B} L${C} L${D} Z`, fill: 'url(#gPV)', stroke: '#3b4651', 'stroke-width': 1.6, filter: 'url(#fSoft)' }, g);
      let gd = '';
      [1 / 3, 2 / 3].forEach(t => { gd += `M${A[0] + (B[0] - A[0]) * t} ${A[1]} L${D[0] + (C[0] - D[0]) * t} ${D[1]} `; });
      gd += `M${(A[0] + D[0]) / 2} ${(A[1] + D[1]) / 2} L${(B[0] + C[0]) / 2} ${(B[1] + C[1]) / 2}`;
      el('path', { d: gd, stroke: '#8fb7dd', 'stroke-width': 0.9, opacity: 0.75 }, g);
    }
    label(g, e.x + e.w / 2, e.y + e.h + 13, e.id, 11.5);
  }
  function drawLagoon(g, e) {
    const top = e.y + e.h * 0.4, cx = e.x + e.w / 2;
    el('rect', { x: e.x - 14, y: top, width: e.w + 28, height: e.y + e.h - top + 10, rx: 8, fill: 'url(#gEarth)', opacity: 0.85 }, g);
    el('path', { d: `M${e.x} ${top} H${e.x + e.w} L${e.x + e.w - 34} ${e.y + e.h} H${e.x + 34} Z`, fill: 'url(#gPome)', stroke: '#3b4651', 'stroke-width': 1.6 }, g);
    el('path', { d: `M${e.x + 10} ${top + 16} H${e.x + e.w - 10}`, stroke: '#a39274', 'stroke-width': 1.4, 'stroke-dasharray': '10 8', opacity: 0.8 }, g);
    el('path', { d: `M${e.x - 6} ${top + 2} C${e.x + e.w * 0.16} ${e.y - 6} ${e.x + e.w * 0.84} ${e.y - 6} ${e.x + e.w + 6} ${top + 2} Z`, fill: 'url(#gMembrane)', stroke: '#0b1015', 'stroke-width': 1.8, filter: 'url(#fShadow)' }, g);
    el('path', { d: `M${e.x + e.w * 0.2} ${e.y + (top - e.y) * 0.42} C${e.x + e.w * 0.35} ${e.y + 4} ${e.x + e.w * 0.6} ${e.y + 4} ${e.x + e.w * 0.72} ${e.y + (top - e.y) * 0.3}`, fill: 'none', stroke: '#ffffff', 'stroke-width': 3, opacity: 0.25, 'stroke-linecap': 'round' }, g);
    label(g, cx, e.y + (top - e.y) * 0.62, e.id, 15, { fill: '#e6f2f9', class: 'eq-label on-dark' });
  }
  function drawCooler(g, e) {
    const nf = e.fans || Math.max(1, Math.round(e.w / 50));
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 5, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    el('rect', { x: e.x + 6, y: e.y + 14, width: e.w - 12, height: e.h - 22, rx: 2, fill: '#e9eef2', stroke: '#8d99a5', 'stroke-width': 1 }, g);
    for (let xx = e.x + 10; xx < e.x + e.w - 14; xx += 5) el('line', { x1: xx, y1: e.y + 16, x2: xx + 6, y2: e.y + e.h - 10, stroke: '#9aa6b1', 'stroke-width': 1 }, g);
    for (let k = 0; k < nf; k++) {
      const fx0 = e.x + e.w * (k + 0.5) / nf, rr = Math.min(20, e.w / nf / 2 - 4);
      el('ellipse', { cx: fx0, cy: e.y - 1, rx: rr, ry: 6, fill: '#26323d', stroke: '#3b4651', 'stroke-width': 1.2 }, g);
      el('path', { d: `M${fx0 - rr * 0.7} ${e.y - 1} H${fx0 + rr * 0.7} M${fx0} ${e.y - 5} V${e.y + 3}`, stroke: '#8fdcf7', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
    }
    el('rect', { x: e.x, y: e.y + e.h - 6, width: e.w, height: 3, fill: '#29abe2' }, g);
    label(g, e.x + e.w / 2, e.y + e.h + 14, e.id, 11.5);
  }
  function drawStack(g, e) {
    const h = e.h || 120, w = e.w || 20, x = e.x - w / 2, y = e.y - h;
    el('path', { d: `M${x + 3} ${y} H${x + w - 3} L${x + w} ${e.y} H${x} Z`, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 1.8, filter: 'url(#fShadow)' }, g);
    [0.18, 0.5].forEach(f => el('rect', { x: x + 2, y: y + h * f, width: w - 4, height: 4, fill: '#29abe2', opacity: 0.85 }, g));
    el('rect', { x: x - 2, y: y - 4, width: w + 4, height: 6, rx: 2, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 1.2 }, g);
    label(g, e.x + w / 2 + 5, e.y - h * 0.32, e.id, 11, { 'text-anchor': 'start', 'font-weight': 700 });
  }
  function drawCylinders(g, e) {
    const n = e.n || 4, slot = (e.w - 16) / n, cw = Math.min(18, slot - 5);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 4, fill: 'rgba(255,255,255,0.35)', stroke: '#5d6874', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, g);
    el('path', { d: `M${e.x + 8} ${e.y + 12} H${e.x + e.w + 4}`, stroke: '#46525e', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    for (let k = 0; k < n; k++) {
      const cx = e.x + 8 + slot * (k + 0.5);
      el('path', { d: `M${cx} ${e.y + 21} V${e.y + 12}`, stroke: '#46525e', 'stroke-width': 2 }, g);
      el('rect', { x: cx - cw / 2, y: e.y + 20, width: cw, height: e.h - 26, rx: cw / 2, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 1.4, filter: 'url(#fSoft)' }, g);
      el('rect', { x: cx - cw / 2, y: e.y + e.h * 0.58, width: cw, height: 3, fill: '#29abe2' }, g);
    }
    label(g, e.x + e.w / 2, e.y + e.h + 13, e.id, 11);
  }
  function drawHood(g, e) {
    const cx = e.x + e.w / 2, hh = e.h * 0.4, sy = e.y + e.h * 0.68;
    el('rect', { x: cx - 10, y: e.y - 6, width: 20, height: 8, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 1.2 }, g);
    el('path', { d: `M${e.x + e.w * 0.22} ${e.y} H${e.x + e.w * 0.78} L${e.x + e.w} ${e.y + hh} H${e.x} Z`, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 2, filter: 'url(#fShadow)' }, g);
    el('rect', { x: e.x + 4, y: e.y + hh - 6, width: e.w - 8, height: 4, fill: '#29abe2' }, g);
    el('rect', { x: e.x + 4, y: sy, width: e.w - 8, height: e.y + e.h - sy, rx: 3, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 1.8, filter: 'url(#fShadow)' }, g);
    el('rect', { x: e.x + 4, y: sy, width: e.w - 8, height: 6, fill: '#26323d' }, g);
    const nb = Math.max(2, Math.round(e.w / 40));
    for (let k = 0; k < nb; k++) {
      const bx = e.x + 4 + (e.w - 8) * (k + 0.5) / nb;
      el('path', { class: 'flame', d: `M${bx} ${sy - 13} C${bx + 5} ${sy - 7} ${bx + 4} ${sy - 2} ${bx} ${sy} C${bx - 4} ${sy - 2} ${bx - 5} ${sy - 7} ${bx} ${sy - 13} Z`, fill: '#4fc3f7', opacity: 0.9 }, g);
    }
    label(g, cx, sy + (e.y + e.h - sy) / 2 + 3, e.id, 11);
  }
  function drawMixer(g, e) {
    const cx = e.x + e.w / 2;
    legs(g, [e.x + 6, e.x + e.w - 6], e.y + e.h * 0.7, e.y + e.h + 12);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h * 0.84, rx: 5, fill: 'url(#gSteelV)', stroke: '#3b4651', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    const sw = (e.w - 12) / 6;
    el('path', { d: `M${e.x + 6} ${e.y + 18} l${sw} 6 l${sw} -6 l${sw} 6 l${sw} -6 l${sw} 6 l${sw} -6`, fill: 'none', stroke: '#5d6874', 'stroke-width': 1.6 }, g);
    const by = e.y + 32, bh = e.h * 0.28;
    el('rect', { x: e.x + 6, y: by, width: e.w - 12, height: bh, rx: 2, fill: '#e9eef2', stroke: '#8d99a5', 'stroke-width': 1 }, g);
    for (let k = 1; k < 3; k++) el('line', { x1: e.x + 6 + (e.w - 12) * k / 3, y1: by, x2: e.x + 6 + (e.w - 12) * k / 3, y2: by + bh, stroke: '#8d99a5', 'stroke-width': 1.4 }, g);
    el('path', { d: `M${e.x + 10} ${by + bh + 4} H${e.x + e.w - 10} L${cx + 9} ${by + bh + 22} H${cx - 9} Z`, fill: 'url(#gDark)', opacity: 0.55 }, g);
    const py = e.y + e.h * 0.64;
    el('rect', { x: e.x + 4, y: py, width: e.w - 8, height: e.h * 0.16, rx: 4, fill: 'url(#gSteelH)', stroke: '#3b4651', 'stroke-width': 1.6 }, g);
    [0.36, 0.64].forEach(f => el('circle', { cx: e.x + e.w * f, cy: py + e.h * 0.08, r: 5, fill: '#26323d' }, g));
    el('rect', { x: e.x, y: e.y + 6, width: e.w, height: 4, fill: '#29abe2' }, g);
    label(g, cx, e.y - 10, e.id, 12);
  }

  const DRAW = { vessel: drawVessel, reactor: drawReactor, tank: drawTank, pump: drawPump, compressor: drawCompressor, hx: drawHx, valve: drawValve, flare: drawFlare, truck: drawTruck, manifold: drawManifold, motor: drawMotor, building: drawBuilding, muster: drawMuster, sink: drawSink,
    column: drawColumn, furnace: drawFurnace, heater: drawHeater, burner: drawBurner, drum: drawDrum, silo: drawSilo, filter: drawFilter, elevator: drawElevator, conveyor: drawConveyor, mill: drawMill, fan: drawFan, generator: drawGenerator, turbine: drawTurbine, transformer: drawTransformer, panel: drawPanel, battery: drawBattery, solar: drawSolar, lagoon: drawLagoon, cooler: drawCooler, stack: drawStack, cylinders: drawCylinders, hood: drawHood, mixer: drawMixer };

  function eqBounds(e) {
    switch (e.type) {
      case 'vessel': case 'reactor': case 'tank': case 'truck': case 'manifold': return { x: e.x, y: e.y, w: e.w, h: e.h };
      case 'pump': return { x: e.x - 24, y: e.y - 24, w: 48, h: 48 };
      case 'compressor': case 'hx': return { x: e.x - 30, y: e.y - 30, w: 60, h: 60 };
      case 'valve': return { x: e.x - 16, y: e.y - 36, w: 32, h: 52 };
      case 'flare': return { x: e.x - 20, y: e.y - 108, w: 40, h: 126 };
      case 'motor': return { x: e.x - 18, y: e.y - 14, w: 36, h: 28 };
      case 'building': return { x: e.x - 36, y: e.y - 36, w: 72, h: 60 };
      case 'muster': return { x: e.x - 22, y: e.y - 22, w: 44, h: 44 };
      case 'sink': return e.dir === 'left' ? { x: e.x - 132, y: e.y - 16, w: 132, h: 32 } : { x: e.x, y: e.y - 16, w: 132, h: 32 };
      case 'column': return { x: e.x, y: e.y, w: e.w, h: e.h + 16 };
      case 'furnace': return { x: e.x, y: e.y, w: e.w, h: e.h + 20 };
      case 'heater': return { x: e.x, y: e.y - 34, w: e.w, h: e.h + 34 };
      case 'burner': return e.dir === 'left' ? { x: e.x - 58, y: e.y - 14, w: 76, h: 28 } : { x: e.x - 18, y: e.y - 14, w: 76, h: 28 };
      case 'drum': return { x: e.x - 6, y: e.y - 3, w: e.w + 12, h: e.h + 21 };
      case 'silo': return { x: e.x, y: e.y - 10, w: e.w, h: e.h + 22 };
      case 'filter': return { x: e.x, y: e.y, w: e.w, h: e.h + 10 };
      case 'elevator': return { x: e.x - 8, y: e.y - 10, w: e.w + 36, h: e.h + 10 };
      case 'conveyor': return { x: e.x - 8, y: e.y - 8, w: e.w + 16, h: e.h + 26 };
      case 'mill': return { x: e.x - 28, y: e.y - 24, w: 56, h: 54 };
      case 'fan': return { x: e.x - 36, y: e.y - 26, w: 72, h: 52 };
      case 'generator': return { x: e.x - 6, y: e.y, w: e.w + 12, h: e.h + 2 };
      case 'turbine': return { x: e.x - 14, y: e.y, w: e.w + 32, h: e.h };
      case 'transformer': return { x: e.x - 20, y: e.y - 48, w: e.w + 40, h: e.h + 48 };
      case 'panel': case 'battery': case 'solar': case 'lagoon': case 'cylinders': case 'mixer': return { x: e.x, y: e.y, w: e.w, h: e.h };
      case 'cooler': return { x: e.x, y: e.y - 8, w: e.w, h: e.h + 8 };
      case 'stack': return { x: e.x - (e.w || 20) / 2 - 4, y: e.y - (e.h || 120) - 6, w: (e.w || 20) + 8, h: (e.h || 120) + 6 };
      case 'hood': return { x: e.x, y: e.y - 6, w: e.w, h: e.h + 6 };
      default: return { x: e.x - 20, y: e.y - 20, w: 40, h: 40 };
    }
  }

  function pathD(pts) { return pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' '); }

  /* Pipa: badan pipa berwarna sesuai kategori bahan dengan garis tepi gelap dan kilap tipis, lalu pola
     pembeda bila ada. Warna penuh pada badan pipa membuat kategori mudah dibedakan pada layar kecil. */
  function pipeLayers(g, d, w, f, dashed, arrow) {
    const cap = { 'stroke-linejoin': 'round', 'stroke-linecap': 'round', fill: 'none' };
    const P = (attrs) => el('path', Object.assign({ d }, cap, attrs), g);
    if (f.pat === 'dash' || dashed) {
      P({ stroke: '#ffffff', 'stroke-width': w + 2.5, opacity: 0.9 });
      P({ stroke: f.c, 'stroke-width': w + 0.5, 'stroke-dasharray': '9 6', 'stroke-linecap': 'butt', 'marker-end': arrow ? 'url(#mArrow)' : null });
      return;
    }
    if (f.pat === 'cable') {
      P({ stroke: '#1d262e', 'stroke-width': w + 2.5, 'marker-end': arrow ? 'url(#mArrow)' : null });
      P({ stroke: f.c, 'stroke-width': Math.max(2, w - 1) });
      P({ stroke: '#fff7cc', 'stroke-width': 1, opacity: 0.7, transform: 'translate(-0.4,-0.9)' });
      P({ class: 'flow', stroke: '#ffffff', 'stroke-width': 1.8, 'stroke-dasharray': '3 12', opacity: 0 });
      return;
    }
    P({ stroke: '#2b3640', 'stroke-width': w + 3, 'marker-end': arrow ? 'url(#mArrow)' : null });
    P({ stroke: f.c, 'stroke-width': w + 0.6 });
    P({ stroke: '#ffffff', 'stroke-width': Math.max(1, w * 0.24), opacity: 0.35, transform: 'translate(-0.5,-1.2)' });
    if (f.pat === 'dot') P({ stroke: 'rgba(52,36,20,0.6)', 'stroke-width': Math.max(2, w * 0.45), 'stroke-dasharray': '0.1 4.2' });
    if (f.pat === 'stripe') P({ stroke: '#ffffff', 'stroke-width': Math.max(1.4, w * 0.3), 'stroke-dasharray': '6 5', 'stroke-linecap': 'butt' });
    P({ class: 'flow', stroke: '#ffffff', 'stroke-width': Math.max(1.4, w * 0.3), 'stroke-dasharray': '5 15', opacity: 0 });
  }
  function drawPipe(g, p) {
    const f = FLUIDS[p.fluid] || FLUIDS.oil;
    const d = pathD(p.pts);
    const w = p.w || 6;
    const grp = el('g', { class: 'pipe', 'data-id': p.id, 'data-cat': f.cat }, g);
    pipeLayers(grp, d, w, f, p.dashed, p.arrow);
    if (p.label) {
      const last = p.pts[p.pts.length - 1];
      const prev = p.pts[p.pts.length - 2];
      const dx = last[0] - prev[0];
      text(grp, last[0] - Math.sign(dx) * 4, last[1] + 16, p.label, { 'font-size': 10, 'font-weight': 700, fill: '#2b3640', 'text-anchor': dx < 0 ? 'start' : 'end' });
    }
  }

  function drawReadout(g, id, v) {
    const grp = el('g', { class: 'readout', 'data-var': id, transform: `translate(${v.x},${v.y})` }, g);
    el('rect', { class: 'ro-bg', x: -44, y: -11, width: 88, height: 22, rx: 6, fill: '#1d262e', stroke: '#29abe2', 'stroke-width': 1.5, filter: 'url(#fSoft)' }, grp);
    el('rect', { x: -44, y: -11, width: 88, height: 11, rx: 6, fill: '#fff', opacity: 0.1 }, grp);
    text(grp, 0, 1, '--', { class: 'readout-text', 'font-size': 11.5, 'font-weight': 800, fill: '#e6f2f9' });
    return grp;
  }

  /* Garis sambung titik pemasangan ke peralatan, pipa, atau dinding area tempat perangkat dipasang,
     bergaya garis sinyal pada gelembung instrumen P&ID. Titik di dalam ruang (tanpa tap) tidak bergaris. */
  function hsLink(g, h, r, stroke, dot) {
    if (!h.tap) return;
    const dx = h.tap[0] - h.x, dy = h.tap[1] - h.y, L = Math.hypot(dx, dy);
    if (L <= r + 2) return;
    el('path', { class: 'hs-link', d: `M${dx.toFixed(1)} ${dy.toFixed(1)} L${(dx * r / L).toFixed(1)} ${(dy * r / L).toFixed(1)}`, fill: 'none', stroke, 'stroke-width': 1.5, 'stroke-dasharray': '3 2.2', 'stroke-linecap': 'round' }, g);
    el('circle', { class: 'hs-tap', cx: dx.toFixed(1), cy: dy.toFixed(1), r: 3.4, fill: dot || stroke, stroke: '#fff', 'stroke-width': 1.2 }, g);
  }
  /* nomor titik, sama dengan nomor pada daftar Titik Pemasangan di panel */
  function hsNum(g, n, ox, oy) {
    if (!n) return;
    const b = el('g', { class: 'hs-num', transform: `translate(${ox},${oy})` }, g);
    el('circle', { r: 7.6, fill: '#1d262e', stroke: '#fff', 'stroke-width': 1.4 }, b);
    text(b, 0, 0.7, String(n), { 'font-size': n > 9 ? 8 : 9.2, 'font-weight': 900, fill: '#fff' });
  }
  function drawHotspot(g, h, n, title) {
    const grp = el('g', { class: 'hotspot', 'data-hs': h.id, transform: `translate(${h.x},${h.y})` }, g);
    hsLink(grp, h, 13, '#1572a8');
    el('circle', { class: 'hs-pulse', r: 16, fill: 'none', stroke: '#29abe2', 'stroke-width': 2 }, grp);
    el('circle', { class: 'hs-core', r: 13, fill: '#eef9fe', stroke: '#1e9bd7', 'stroke-width': 2.5, 'stroke-dasharray': '4 3', filter: 'url(#fSoft)' }, grp);
    el('path', { d: 'M-6 0 h12 M0 -6 v12', stroke: '#1572a8', 'stroke-width': 3, 'stroke-linecap': 'round' }, grp);
    hsNum(grp, n, -12, -12);
    el('title', null, grp).textContent = title || h.label;
    return grp;
  }

  function drawDevice(g, h, dev, state, n, title) {
    const grp = el('g', { class: 'device', 'data-hs': h.id, transform: `translate(${h.x},${h.y})` }, g);
    hsLink(grp, h, 18, '#2b3640', dev.color);
    el('circle', { class: 'dev-target', r: 24, fill: 'none', stroke: '#29abe2', 'stroke-width': 3, opacity: 0 }, grp);
    el('circle', { class: 'dev-body', r: 18, fill: 'url(#gBubble)', stroke: dev.color, 'stroke-width': 3.4, filter: 'url(#fShadow)' }, grp);
    el('circle', { r: 14.5, fill: 'none', stroke: '#fff', 'stroke-width': 1, opacity: 0.8 }, grp);
    el('circle', { cx: -6, cy: -7, r: 5, fill: '#fff', opacity: 0.75 }, grp);
    text(grp, 0, 1, dev.code, { 'font-size': dev.code.length > 3 ? 9.5 : 11, 'font-weight': 800, fill: '#1f2a35' });
    if (state === 'tested') {
      const b = el('g', { class: 'dev-badge tested', transform: 'translate(14,-14)' }, grp);
      el('circle', { r: 8, fill: '#1e9bd7', stroke: '#fff', 'stroke-width': 1.6 }, b);
      el('path', { d: 'M-3.6 0.2 L-1 2.8 L3.8 -2.6', fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, b);
    } else if (state === 'untested') {
      const b = el('g', { class: 'dev-badge untested', transform: 'translate(14,-14)' }, grp);
      el('circle', { r: 7.5, fill: '#f0a500', stroke: '#fff', 'stroke-width': 1.6 }, b);
      text(b, 0, 0.8, '!', { 'font-size': 11, 'font-weight': 900, fill: '#1f2a35' });
    }
    hsNum(grp, n, -15, -14);
    el('title', null, grp).textContent = dev.name + ' @ ' + (title || h.label) + (state === 'tested' ? ' (escalation factor dikendalikan)' : state === 'untested' ? ' (escalation factor belum dikendalikan)' : '');
    return grp;
  }

  function starPath(n, r1, r2) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? r2 : r1;
      const a = (Math.PI * i) / n - Math.PI / 2;
      d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1);
    }
    return d + 'Z';
  }
  function flamePath(s) {
    return `M0 ${-40 * s} C${16 * s} ${-22 * s} ${12 * s} ${-6 * s} 0 0 C${-12 * s} ${-6 * s} ${-16 * s} ${-22 * s} 0 ${-40 * s} Z`;
  }

  /* ---------- render utama ---------- */
  function render(container, scn, handlers) {
    container.innerHTML = '';
    const svg = el('svg', { viewBox: `0 0 ${VB_W} ${VB_H}`, class: 'pid-svg', preserveAspectRatio: 'xMidYMid meet' }, container);
    const defs = makeDefs(svg);
    el('rect', { x: 0, y: 0, width: VB_W, height: VB_H, rx: 14, fill: 'url(#gGrid)' }, svg);
    el('rect', { x: 0, y: 0, width: VB_W, height: VB_H, rx: 14, fill: 'url(#pGrid)' }, svg);

    const gZones = el('g', { class: 'layer-zones' }, svg);
    const gPipes = el('g', { class: 'layer-pipes' }, svg);
    const gEq = el('g', { class: 'layer-eq' }, svg);
    const gLabels = el('g', { class: 'layer-labels' }, svg);
    const gBadge = el('g', { class: 'layer-badges' }, svg);
    const gFx = el('g', { class: 'layer-fx' }, svg);
    const gRead = el('g', { class: 'layer-readouts' }, svg);
    const gHs = el('g', { class: 'layer-hotspots' }, svg);
    const gDev = el('g', { class: 'layer-devices' }, svg);
    const gFxTop = el('g', { class: 'layer-fx layer-fx-top' }, svg);
    const ctx = { defs, levels: {} };

    if (scn.ground) {
      el('rect', { x: 2, y: scn.ground, width: VB_W - 4, height: VB_H - scn.ground - 2, fill: 'url(#gEarth)', opacity: 0.22 }, gZones);
      el('path', { d: `M2 ${scn.ground} H${VB_W - 2}`, stroke: '#8f8374', 'stroke-width': 2.4 }, gZones);
      text(gZones, 14, scn.ground + 13, 'Permukaan tanah', { 'text-anchor': 'start', 'font-size': 9.5, 'font-weight': 700, fill: '#6f6456' });
    }
    (scn.zones || []).forEach(z => {
      if (z.style === 'building') {
        el('rect', { x: z.x, y: z.y, width: z.w, height: z.h, rx: 4, fill: 'rgba(255,255,255,0.55)', stroke: '#5d6b78', 'stroke-width': 3 }, gZones);
        el('path', { d: `M${z.x - 10} ${z.y} H${z.x + z.w + 10}`, stroke: '#46525e', 'stroke-width': 7, 'stroke-linecap': 'round' }, gZones);
        (z.floors || []).forEach(fy => el('rect', { x: z.x, y: fy - 3, width: z.w, height: 6, fill: '#9aa6b1' }, gZones));
        (z.labels || []).forEach(l => text(gZones, z.x + 8, l[0], l[1], { 'text-anchor': 'start', 'font-size': 10.5, 'font-weight': 800, fill: '#4a6275' }));
        return;
      }
      el('rect', { x: z.x, y: z.y, width: z.w, height: z.h, rx: 10, fill: z.fill || 'rgba(41,171,226,0.05)', stroke: '#8fb3c9', 'stroke-width': 1.6, 'stroke-dasharray': '7 5' }, gZones);
      if (z.label) text(gZones, z.x + 10, z.labelPos === 'bottom' ? z.y + z.h - 10 : z.y + 13, z.label, { 'text-anchor': 'start', 'font-size': 10.5, 'font-weight': 800, fill: '#4a6275' });
    });
    scn.pipes.forEach(p => drawPipe(gPipes, p));
    const eqGroups = {}, eqById = {};
    scn.equipment.forEach(e => {
      eqById[e.id] = e;
      const g = el('g', { class: 'eq', 'data-id': e.id, 'data-type': e.type }, gEq);
      (DRAW[e.type] || DRAW.pump)(g, e, ctx);
      const b = eqBounds(e);
      el('rect', { class: 'eq-hit', x: b.x - 6, y: b.y - 6, width: b.w + 12, height: b.h + 12, rx: 10, fill: 'transparent' }, g);
      el('rect', { class: 'eq-ring', x: b.x - 6, y: b.y - 6, width: b.w + 12, height: b.h + 12, rx: 10, fill: 'none', stroke: '#29abe2', 'stroke-width': 3, 'stroke-dasharray': '6 4', opacity: 0 }, g);
      g.addEventListener('click', ev => { ev.stopPropagation(); handlers && handlers.onEquipment && handlers.onEquipment(e); });
      eqGroups[e.id] = g;
    });
    (scn.labels || []).forEach(l => text(gLabels, l.x, l.y, l.text, { 'font-size': l.size || 11, 'font-weight': 700, fill: '#2b3640' }));
    const readouts = {};
    Object.keys(scn.vars).forEach(id => { readouts[id] = drawReadout(gRead, id, scn.vars[id]); });

    /* ---------- efek insiden ---------- */
    function cloud(g, st, r, n, spread, cls) {
      if (st.haze) el('circle', { class: 'fx-haze', r: r * 0.95, fill: st.haze }, g);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const dx = Math.cos(a) * spread + (Math.random() - 0.5) * spread * 0.5;
        const dy = -Math.abs(Math.sin(a)) * spread * 0.8 - spread * 0.3;
        el('circle', { class: cls || 'fx-puff', r: (r * (0.38 + Math.random() * 0.25)).toFixed(1), fill: st.fill,
          stroke: st.stroke || null, 'stroke-width': st.stroke ? 1.6 : null,
          style: `--dx:${dx.toFixed(1)}px;--dy:${dy.toFixed(1)}px;animation-delay:${(i * 0.3).toFixed(2)}s` }, g);
      }
    }
    function fire(g, s) {
      el('circle', { class: 'fx-heat', r: 34 * s, cy: -12 * s, fill: 'url(#gHeat)' }, g);
      [[0, 0, 1], [-15 * s, 5, 0.68], [15 * s, 4, 0.74], [-6 * s, 2, 0.55]].forEach((f, i) => {
        const fg = el('g', { transform: `translate(${f[0]},${f[1]})` }, g);
        el('path', { class: 'fx-flame', d: flamePath(s * f[2]), fill: 'url(#gFlame)', filter: 'url(#fGlow)', style: `animation-delay:${(i * 0.11).toFixed(2)}s` }, fg);
      });
      const sm = el('g', { transform: `translate(0,${-46 * s})` }, g);
      cloud(sm, { fill: 'url(#gSmoke)' }, 16 * s, 5, 26 * s, 'fx-smoke');
    }
    function avoidReadouts(x, y) {
      for (let k = 0; k < 4; k++) {
        const hit = Object.values(scn.vars).find(v => gRead.style.display !== 'none' && Math.abs(v.x - x) < 60 && Math.abs(v.y - y) < 30);
        if (!hit) break;
        y = hit.y - 34;
      }
      return Math.max(20, y);
    }
    function marker(x, y, sev) {
      y = avoidReadouts(x, y);
      const m = el('g', { class: 'fx-marker', transform: `translate(${x},${y})` }, gFxTop);
      const inner = el('g', { class: 'fx-bob' }, m);
      el('path', { d: 'M0 -15 L14 10 H-14 Z', fill: sev === 'warn' ? '#f0a500' : '#e53935', stroke: '#fff', 'stroke-width': 2.2, 'stroke-linejoin': 'round', filter: 'url(#fSoft)' }, inner);
      text(inner, 0, 2, '!', { 'font-size': 14, 'font-weight': 900, fill: sev === 'warn' ? '#1f2a35' : '#fff' });
    }
    function fx(type, x, y, o) {
      o = o || {};
      const big = o.sev === 'final' || o.big;
      const g = el('g', { class: `fxg fxg-${type}`, transform: `translate(${x},${y})` }, gFx);
      let top = 30;
      if (type === 'leak') {
        cloud(g, { haze: 'url(#gVapor)', fill: '#f4f7f9', stroke: '#7f8f9c' }, big ? 50 : 34, big ? 10 : 7, big ? 64 : 40);
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i - 2) * 0.45;
          el('line', { class: 'fx-hiss', x1: Math.cos(a) * 10, y1: Math.sin(a) * 10, x2: Math.cos(a) * 24, y2: Math.sin(a) * 24, stroke: '#4b5966', 'stroke-width': 2.2, 'stroke-linecap': 'round', style: `animation-delay:${(i * 0.08).toFixed(2)}s` }, g);
        }
        top = big ? 70 : 46;
      } else if (type === 'toxic') {
        cloud(g, { haze: 'url(#gToxic)', fill: '#d4e157', stroke: '#7a7a12' }, big ? 66 : 46, big ? 11 : 8, big ? 80 : 54);
        el('circle', { class: 'fx-haze', r: big ? 30 : 22, fill: '#cddc39', opacity: 0.35 }, g);
        top = big ? 84 : 54;
      } else if (type === 'heat') {
        el('circle', { class: 'fx-heat', r: big ? 70 : 50, fill: 'url(#gHeat)' }, g);
        for (let i = 0; i < 3; i++) {
          el('path', { class: 'fx-wave', d: `M${-22 + i * 22} -6 q 6 -8 0 -16 q -6 -8 0 -16 q 6 -8 0 -16`, fill: 'none', stroke: '#ff7043', 'stroke-width': 3, 'stroke-linecap': 'round', style: `animation-delay:${(i * 0.35).toFixed(2)}s` }, g);
        }
        if (o.at && eqGroups[o.at]) eqGroups[o.at].setAttribute('filter', 'url(#fHot)');
        top = 62;
      } else if (type === 'vibration') {
        const b = o.at && eqById[o.at] ? eqBounds(eqById[o.at]) : { w: 60, h: 40 };
        const hw = b.w / 2 + 10, hh = Math.min(26, b.h / 2);
        [-1, 1].forEach(sx => [0, 1].forEach(k => {
          el('path', { class: 'fx-vib', d: `M${sx * (hw + k * 9)} ${-hh} q ${sx * 9} ${hh} 0 ${hh * 2}`, fill: 'none', stroke: '#f0a500', 'stroke-width': 3, 'stroke-linecap': 'round', style: `animation-delay:${(k * 0.15).toFixed(2)}s` }, g);
        }));
        if (o.at && eqGroups[o.at]) eqGroups[o.at].classList.add('shake');
        top = hh + 26;
      } else if (type === 'spill') {
        el('ellipse', { class: 'fx-spill', rx: big ? 80 : 58, ry: big ? 18 : 13, fill: 'url(#gSpill)' }, g);
        el('ellipse', { class: 'fx-spill', cx: -10, cy: -3, rx: big ? 30 : 22, ry: 4, fill: '#ffffff', opacity: 0.25 }, g);
        top = 30;
      } else if (type === 'fire') {
        fire(g, big ? 1.5 : 0.9);
        top = big ? 80 : 54;
      } else if (type === 'smoke') {
        cloud(g, { haze: 'url(#gSmoke)', fill: '#77828c', stroke: '#3b4651' }, big ? 52 : 38, big ? 10 : 7, big ? 60 : 42, 'fx-smoke');
        top = big ? 72 : 52;
      } else if (type === 'dust') {
        cloud(g, { haze: 'url(#gDust)', fill: '#dcc39a', stroke: '#8d6e3f' }, big ? 56 : 40, big ? 10 : 8, big ? 66 : 46);
        top = big ? 76 : 54;
      } else if (type === 'arc') {
        el('circle', { class: 'fx-arcglow', r: big ? 48 : 36, fill: 'url(#gArc)' }, g);
        el('path', { class: 'fx-arc', d: 'M3 -30 L-11 2 L-1 2 L-7 28 L11 -6 L1 -6 L9 -30 Z', fill: '#fff59d', stroke: '#ffffff', 'stroke-width': 1.6, 'stroke-linejoin': 'round', filter: 'url(#fGlow)' }, g);
        for (let i = 0; i < 6; i++) {
          const a = i * Math.PI / 3 + 0.3;
          el('line', { class: 'fx-spark', x1: (Math.cos(a) * 14).toFixed(1), y1: (Math.sin(a) * 14).toFixed(1), x2: (Math.cos(a) * 26).toFixed(1), y2: (Math.sin(a) * 26).toFixed(1), stroke: '#ffe082', 'stroke-width': 2.2, 'stroke-linecap': 'round', style: `animation-delay:${(i * 0.07).toFixed(2)}s` }, g);
        }
        top = big ? 58 : 46;
      } else if (type === 'explosion') {
        el('ellipse', { class: 'fx-scorch', rx: 90, ry: 40, fill: 'url(#gScorch)' }, g);
        fire(g, 1.3);
        const gb = el('g', { class: 'fxg fxg-blast', transform: `translate(${x},${y})` }, gFxTop);
        el('circle', { class: 'fx-shock', r: 30, fill: 'none', stroke: '#ffffff', 'stroke-width': 5 }, gb);
        el('circle', { class: 'fx-blast', r: 80, fill: 'url(#gBlast)' }, gb);
        el('path', { class: 'fx-star', d: starPath(12, 74, 32), fill: '#ffd54f', stroke: '#ff6f00', 'stroke-width': 3 }, gb);
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 + Math.random() * 0.3;
          const dist = 90 + Math.random() * 70;
          el('rect', { class: 'fx-frag', x: -3, y: -3, width: 6 + Math.random() * 5, height: 4 + Math.random() * 3, fill: '#5d6874',
            style: `--dx:${(Math.cos(a) * dist).toFixed(0)}px;--dy:${(Math.sin(a) * dist).toFixed(0)}px` }, gb);
        }
        el('rect', { class: 'fx-flash', x: -x, y: -y, width: VB_W, height: VB_H, fill: '#ffffff' }, gb);
        if (o.at && eqGroups[o.at]) eqGroups[o.at].classList.add('damaged');
        top = 0;
      }
      if (o.sev === 'final' && type !== 'explosion' && o.at && eqGroups[o.at]) eqGroups[o.at].classList.add('damaged');
      if (o.sev && o.sev !== 'final') marker(x, y - top - 14, o.sev);
      return g;
    }

    /* ---------- perbesar dan geser: cubit dua jari, seret saat diperbesar, tombol, ctrl+roda ----------
       Tampilan diatur lewat viewBox sehingga semua lapisan (efek insiden, pembacaan DCS, titik
       pemasangan) ikut membesar tanpa perhitungan ulang posisi. */
    const view = { x: 0, y: 0, w: VB_W, h: VB_H };
    const MAX_ZOOM = 4;
    const viewFns = [];
    const zoomOf = () => VB_W / view.w;
    const ctl = document.createElement('div');
    ctl.className = 'pid-zoom';
    ctl.innerHTML = '<button type="button" data-z="out" aria-label="Perkecil P&amp;ID" title="Perkecil"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></button>'
      + '<button type="button" data-z="fit" aria-label="Tampilkan seluruh P&amp;ID" title="Tampilkan seluruh P&amp;ID"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>'
      + '<button type="button" data-z="in" aria-label="Perbesar P&amp;ID" title="Perbesar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12M12 6v12"/></svg></button>';
    container.appendChild(ctl);
    const hint = document.createElement('div');
    hint.className = 'pid-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = 'Cubit atau ketuk + untuk memperbesar';
    container.appendChild(hint);
    const zb = { in: ctl.querySelector('[data-z=in]'), out: ctl.querySelector('[data-z=out]'), fit: ctl.querySelector('[data-z=fit]') };
    function clampView() {
      view.w = Math.min(VB_W, Math.max(VB_W / MAX_ZOOM, view.w));
      view.h = view.w * VB_H / VB_W;
      view.x = Math.min(VB_W - view.w, Math.max(0, view.x));
      view.y = Math.min(VB_H - view.h, Math.max(0, view.y));
    }
    function applyView() {
      clampView();
      svg.setAttribute('viewBox', `${view.x.toFixed(2)} ${view.y.toFixed(2)} ${view.w.toFixed(2)} ${view.h.toFixed(2)}`);
      const z = zoomOf();
      container.classList.toggle('zoomed', z > 1.01);
      zb.in.disabled = z >= MAX_ZOOM - 0.01;
      zb.out.disabled = zb.fit.disabled = z <= 1.01;
      viewFns.forEach(fn => { try { fn(z); } catch (e) { /* abaikan */ } });
    }
    function toSvgPt(cx, cy) {
      const m = svg.getScreenCTM();
      if (!m) return { x: view.x + view.w / 2, y: view.y + view.h / 2 };
      const p = new DOMPoint(cx, cy).matrixTransform(m.inverse());
      return { x: p.x, y: p.y };
    }
    function zoomAt(factor, px, py) {
      const nw = Math.min(VB_W, Math.max(VB_W / MAX_ZOOM, view.w / factor));
      const k = nw / view.w;
      view.x = px - (px - view.x) * k; view.y = py - (py - view.y) * k;
      view.w = nw; view.h = nw * VB_H / VB_W;
      applyView();
    }
    const zoomCenter = f => zoomAt(f, view.x + view.w / 2, view.y + view.h / 2);
    function resetView() { view.x = 0; view.y = 0; view.w = VB_W; view.h = VB_H; applyView(); }
    ctl.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || b.disabled) return;
      ev.stopPropagation();
      if (b.dataset.z === 'in') zoomCenter(1.6); else if (b.dataset.z === 'out') zoomCenter(1 / 1.6); else resetView();
    });
    /* Gestur penunjuk: posisi layar dari pojok kiri atas viewBox (ox, oy) tetap selama rasio aspek
       viewBox tidak berubah, sehingga titik di bawah jari dapat dijaga tetap di bawah jari. */
    const pts = new Map();
    let gest = null, swallow = false, swallowT = 0;
    function frame() { const m = svg.getScreenCTM(); return m ? { s: m.a, ox: m.a * view.x + m.e, oy: m.d * view.y + m.f } : null; }
    function startPan(p, moved) { const f = frame(); gest = { type: 'pan', sx: p.x, sy: p.y, vx: view.x, vy: view.y, s: f ? f.s : 1, moved: !!moved }; }
    function startPinch() {
      const [a, b] = Array.from(pts.values());
      const f = frame(); if (!f) { gest = null; return; }
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      gest = { type: 'pinch', d0: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), w0: view.w, fit: f.s * view.w / VB_W, ox: f.ox, oy: f.oy,
        px: view.x + (mx - f.ox) / f.s, py: view.y + (my - f.oy) / f.s, moved: true };
    }
    svg.addEventListener('pointerdown', ev => {
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (pts.size === 1) startPan({ x: ev.clientX, y: ev.clientY });
      else if (pts.size === 2) startPinch();
    });
    svg.addEventListener('pointermove', ev => {
      const p = pts.get(ev.pointerId); if (!p || !gest) return;
      p.x = ev.clientX; p.y = ev.clientY;
      if (gest.type === 'pan') {
        const dx = p.x - gest.sx, dy = p.y - gest.sy;
        if (!gest.moved) {
          if (zoomOf() <= 1.01 || Math.hypot(dx, dy) < 8) return;
          gest.moved = true; container.classList.add('panning');
          try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* abaikan */ }
        }
        view.x = gest.vx - dx / gest.s; view.y = gest.vy - dy / gest.s;
        applyView();
      } else if (pts.size >= 2) {
        const [a, b] = Array.from(pts.values());
        const d = Math.max(10, Math.hypot(a.x - b.x, a.y - b.y));
        const nw = Math.min(VB_W, Math.max(VB_W / MAX_ZOOM, gest.w0 * gest.d0 / d));
        const s = gest.fit * VB_W / nw;
        view.w = nw; view.h = nw * VB_H / VB_W;
        view.x = gest.px - ((a.x + b.x) / 2 - gest.ox) / s;
        view.y = gest.py - ((a.y + b.y) / 2 - gest.oy) / s;
        applyView();
        if (ev.cancelable) ev.preventDefault();
      }
    });
    const endPtr = ev => {
      if (!pts.has(ev.pointerId)) return;
      pts.delete(ev.pointerId);
      if (gest && gest.moved) { swallow = true; clearTimeout(swallowT); swallowT = setTimeout(() => { swallow = false; }, 400); }
      container.classList.remove('panning');
      if (pts.size === 1) startPan(Array.from(pts.values())[0], true);
      else if (!pts.size) gest = null;
    };
    svg.addEventListener('pointerup', endPtr);
    svg.addEventListener('pointercancel', endPtr);
    /* ketukan yang mengakhiri geseran tidak boleh membuka pop-up peralatan */
    svg.addEventListener('click', ev => { if (swallow) { swallow = false; ev.stopPropagation(); ev.preventDefault(); } }, true);
    svg.addEventListener('wheel', ev => {
      if (!ev.ctrlKey) return;
      ev.preventDefault();
      const p = toSvgPt(ev.clientX, ev.clientY);
      zoomAt(Math.exp(-ev.deltaY * (ev.deltaMode === 1 ? 0.15 : 0.005)), p.x, p.y);
    }, { passive: false });
    applyView();

    const api = {
      svg,
      /* tingkat perbesaran dan pengamat perubahan tampilan */
      zoom: () => zoomOf(),
      onView: fn => { viewFns.push(fn); },
      resetView,
      zoomBy: f => zoomCenter(f),
      /* bila diperbesar, geser tampilan agar node yang dituju terlihat */
      focusNode(node) {
        if (!node || zoomOf() <= 1.01) return;
        const r = node.getBoundingClientRect(), sr = svg.getBoundingClientRect();
        if (r.left >= sr.left && r.right <= sr.right && r.top >= sr.top && r.bottom <= sr.bottom) return;
        const p = toSvgPt(r.left + r.width / 2, r.top + r.height / 2);
        view.x = p.x - view.w / 2; view.y = p.y - view.h / 2;
        applyView();
      },
      eqBounds: id => eqById[id] ? eqBounds(eqById[id]) : null,
      eqAnchor(id) {
        const e = eqById[id]; if (!e) return { x: VB_W / 2, y: VB_H / 2 };
        const b = eqBounds(e);
        return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
      },
      eqNode: id => eqGroups[id] || null,
      devNode: hsId => gDev.querySelector(`[data-hs="${hsId}"]`),
      hsNode: hsId => gHs.querySelector(`[data-hs="${hsId}"]`),
      setFlow(on) { svg.classList.toggle('flowing', !!on); },
      highlight(id, on) {
        const g = eqGroups[id]; if (!g) return;
        g.querySelector('.eq-ring').setAttribute('opacity', on ? 1 : 0);
      },
      markRead(id) { const g = eqGroups[id]; if (g) g.classList.add('read'); },
      setReadout(id, valueText, state) {
        const r = readouts[id]; if (!r) return;
        r.querySelector('.readout-text').textContent = valueText;
        r.setAttribute('data-state', state || 'normal');
      },
      showReadouts(on) { gRead.style.display = on ? '' : 'none'; },
      setFlame(id, frac) {
        const g = eqGroups[id]; if (!g) return;
        const f = Math.max(0, Math.min(1, frac));
        g.querySelectorAll('.flame, .hflame').forEach(n => { n.style.opacity = f < 0.08 ? 0 : (0.25 + 0.75 * f).toFixed(2); });
      },
      setLevel(id, frac) {
        const L = ctx.levels[id]; if (!L) return;
        const f = Math.max(0, Math.min(1, frac));
        const hh = L.h * f;
        const y = L.y0 + L.h - hh;
        L.rect.setAttribute('y', y.toFixed(1));
        L.rect.setAttribute('height', (hh + (f > 0 ? L.extra : 0)).toFixed(1));
        L.surf.setAttribute('y', (y - 1).toFixed(1));
        L.surf.style.display = f > 0.01 && f < 0.995 ? '' : 'none';
      },
      showHotspots(stage, placements, itpmMap, opts) {
        gHs.innerHTML = ''; gDev.innerHTML = '';
        if (!stage) return;
        const o = opts || {};
        /* nomor titik mengikuti urutan data, yang sudah disusun menurut posisi baca pada P&ID */
        scn.hotspots.filter(h => h.stage === stage).forEach((h, i) => {
          const placedId = placements && placements[h.id];
          const title = o.title ? o.title(h) : h.label;
          if (placedId && DEVICES[placedId]) {
            const dev = DEVICES[placedId];
            /* o.credit: status kredit dari game (klaim sebelum evaluasi, hasil verifikasi sesudahnya) */
            const tested = o.credit ? !!o.credit[h.id] : !!(itpmMap && itpmMap[h.id] && itpmMap[h.id] === dev.itpm);
            const state = tested ? 'tested' : (o.flagUntested ? 'untested' : 'none');
            const d = drawDevice(gDev, h, dev, state, i + 1, title);
            d.addEventListener('click', ev => { ev.stopPropagation(); handlers && handlers.onDevice && handlers.onDevice(h, placedId); });
          } else {
            const hs = drawHotspot(gHs, h, i + 1, title);
            hs.addEventListener('click', ev => { ev.stopPropagation(); handlers && handlers.onHotspot && handlers.onHotspot(h); });
          }
        });
      },
      setHotspotState(id, state) {
        const n = gHs.querySelector(`[data-hs="${id}"]`) || gDev.querySelector(`[data-hs="${id}"]`);
        if (n) n.setAttribute('data-state', state || '');
      },
      setEqBadges(map, stage) {
        gBadge.innerHTML = '';
        const hs = scn.hotspots.filter(h => h.stage === (stage || 3));
        const taken = [];
        /* lencana tidak boleh menutup penanda titik maupun garis sambungnya */
        const hitsHs = (x0, y0, x1, y1) => hs.some(h => {
          const nx = Math.max(x0, Math.min(h.x, x1)), ny = Math.max(y0, Math.min(h.y, y1));
          if (Math.hypot(h.x - nx, h.y - ny) < 24) return true;
          if (!h.tap) return false;
          const L = Math.hypot(h.tap[0] - h.x, h.tap[1] - h.y);
          for (let s = 0; s <= L; s += 4) {
            const px = h.tap[0] + (h.x - h.tap[0]) * s / L, py = h.tap[1] + (h.y - h.tap[1]) * s / L;
            if (px > x0 - 2 && px < x1 + 2 && py > y0 - 2 && py < y1 + 2) return true;
          }
          return false;
        });
        Object.keys(map || {}).forEach(id => {
          const e = eqById[id]; const it = ITPM[map[id]];
          if (!e || !it) return;
          const b = eqBounds(e);
          const cands = [[b.x + b.w - 6, b.y - 2], [b.x + 8, b.y - 2], [b.x + b.w / 2, b.y - 2], [b.x + b.w + 22, b.y + b.h / 2], [b.x - 22, b.y + b.h / 2], [b.x + b.w - 6, b.y + b.h + 4], [b.x + 8, b.y + b.h + 4], [b.x + b.w / 2, b.y + b.h + 4]];
          const free = c => !hitsHs(c[0] - 22, c[1] - 10, c[0] + 22, c[1] + 10) && !taken.some(t => Math.abs(t[0] - c[0]) < 50 && Math.abs(t[1] - c[1]) < 24);
          const pos = cands.find(free) || cands[0];
          taken.push(pos);
          const tg = el('g', { class: 'eq-badge', transform: `translate(${pos[0]},${pos[1]})` }, gBadge);
          el('rect', { x: -22, y: -10, width: 44, height: 20, rx: 10, fill: '#1e9bd7', stroke: '#fff', 'stroke-width': 1.6, filter: 'url(#fSoft)' }, tg);
          el('path', { d: 'M-15 0.2 L-12.4 2.8 L-7.6 -2.6', fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, tg);
          text(tg, 5, 1, it.code, { 'font-size': 9.5, 'font-weight': 800, fill: '#fff' });
          el('title', null, tg).textContent = it.name + ' pada ' + e.name;
        });
      },
      setTargets(t) {
        svg.querySelectorAll('.is-target').forEach(n => n.classList.remove('is-target'));
        (t && t.hs || []).forEach(id => { const n = gDev.querySelector(`[data-hs="${id}"]`); if (n) n.classList.add('is-target'); });
        (t && t.eq || []).forEach(id => { if (eqGroups[id]) eqGroups[id].classList.add('is-target'); });
      },
      alarmNode(id, on) { const g = eqGroups[id]; if (g) g.classList.toggle('alarm', !!on); },
      fx,
      clearFx() {
        gFx.innerHTML = ''; gFxTop.innerHTML = '';
        Object.values(eqGroups).forEach(g => { g.classList.remove('shake', 'damaged'); g.removeAttribute('filter'); });
      },
    };
    svg.addEventListener('click', () => handlers && handlers.onBackground && handlers.onBackground());
    return api;
  }

  /* Legenda jalur: satu butir untuk setiap gaya garis yang dipakai skenario. Bahan dengan gaya yang sama
     digabung dalam satu butir. Nama bahan memakai legend pada pipa, lalu fluidNames skenario, lalu nama baku. */
  function fluidsIn(scn) {
    const out = [];
    scn.pipes.forEach(p => {
      const f = FLUIDS[p.fluid] || FLUIDS.oil;
      const style = f.cat + ':' + (p.dashed ? 'dash' : f.pat);
      const name = p.legend || (scn.fluidNames && scn.fluidNames[p.fluid]) || f.name;
      let it = out.find(x => x.style === style);
      if (!it) out.push(it = { style, key: p.fluid, c: f.c, cat: f.cat, catName: f.catName, pat: p.dashed ? 'dash' : f.pat, names: [] });
      if (!it.names.includes(name)) it.names.push(name);
    });
    out.forEach(it => { it.name = it.names.join('; '); });
    return out;
  }
  /* contoh garis untuk legenda, digambar dengan gaya yang sama dengan pipa di P&ID */
  function swatch(it) {
    const f = { c: it.c, pat: it.pat };
    const svg = el('svg', { viewBox: '0 0 34 12', width: 34, height: 12, class: 'sw-svg', 'aria-hidden': 'true' });
    pipeLayers(svg, 'M4 6 L30 6', 5, f, false, false);
    svg.querySelectorAll('.flow').forEach(n => n.remove());
    return svg.outerHTML;
  }

  return { render, fluidsIn, swatch, FLUIDS, FLUID_CATS, VB_W, VB_H };
})();
