/* =====================================================================
   PID: penggambar P&ID berbasis SVG.
   Peralatan digambar sebagai baja silver dengan gradien dan bayangan
   (kesan tiga dimensi), aksen biru muda, isi cairan dinamis, lapisan
   efek insiden, dan lencana program inspeksi/pengujian.
   ===================================================================== */
const PID = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const VB_W = 1000, VB_H = 560;

  /* Warna inti fluida (garis tipis di tengah pipa silver). */
  const FLUIDS = {
    mix:     { c: '#8a7768', name: 'Fluida sumur (campuran)' },
    gas:     { c: '#e8b23a', name: 'Gas / uap' },
    oil:     { c: '#5b4636', name: 'Minyak' },
    water:   { c: '#29abe2', name: 'Air terproduksi' },
    cw:      { c: '#8fdcf7', name: 'Air pendingin' },
    chem:    { c: '#8a6bbf', name: 'Monomer / pelarut' },
    product: { c: '#4f9d69', name: 'Produk resin' },
    lpg:     { c: '#e0773a', name: 'LPG cair' },
    flare:   { c: '#e05a4f', name: 'Jalur flare' },
  };

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
    const rect = el('rect', { x: e.x - 2, y: e.y + e.h, width: e.w + 4, height: 0, fill: 'url(#gLiquid)' }, lg);
    const surf = el('rect', { x: e.x - 2, y: e.y + e.h, width: e.w + 4, height: 2, fill: '#e8f8ff', opacity: 0.85 }, lg);
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
    label(g, e.x + e.w / 2, e.y + e.h / 2 + 2, e.id, 18);
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
    el('path', { d: `M${e.x - 10} ${e.y - 12} L${e.x + 15} ${e.y} L${e.x - 10} ${e.y + 12} Z`, fill: '#29abe2', stroke: '#1572a8', 'stroke-width': 1.2 }, g);
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

  const DRAW = { vessel: drawVessel, reactor: drawReactor, tank: drawTank, pump: drawPump, compressor: drawCompressor, hx: drawHx, valve: drawValve, flare: drawFlare, truck: drawTruck, manifold: drawManifold, motor: drawMotor, building: drawBuilding, muster: drawMuster, sink: drawSink };

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
      default: return { x: e.x - 20, y: e.y - 20, w: 40, h: 40 };
    }
  }

  function pathD(pts) { return pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' '); }

  /* Pipa: tabung silver dengan garis inti berwarna sesuai fluida. */
  function drawPipe(g, p) {
    const f = FLUIDS[p.fluid] || FLUIDS.mix;
    const d = pathD(p.pts);
    const w = p.w || 6;
    const grp = el('g', { class: 'pipe', 'data-id': p.id }, g);
    if (p.dashed) {
      el('path', { d, fill: 'none', stroke: f.c, 'stroke-width': w * 0.75, 'stroke-dasharray': '8 6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.85 }, grp);
    } else {
      el('path', { d, fill: 'none', stroke: '#46525e', 'stroke-width': w + 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'marker-end': p.arrow ? 'url(#mArrow)' : null }, grp);
      el('path', { d, fill: 'none', stroke: '#cfd6dc', 'stroke-width': w + 1, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, grp);
      el('path', { d, fill: 'none', stroke: '#ffffff', 'stroke-width': Math.max(1, w * 0.28), 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.85, transform: 'translate(-0.6,-1.4)' }, grp);
      el('path', { d, fill: 'none', stroke: f.c, 'stroke-width': Math.max(1.8, w * 0.42), 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, grp);
      el('path', { class: 'flow', d, fill: 'none', stroke: '#ffffff', 'stroke-width': Math.max(1.4, w * 0.3), 'stroke-dasharray': '5 15', 'stroke-linecap': 'round', opacity: 0 }, grp);
    }
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

  function drawHotspot(g, h) {
    const grp = el('g', { class: 'hotspot', 'data-hs': h.id, transform: `translate(${h.x},${h.y})` }, g);
    el('circle', { class: 'hs-pulse', r: 16, fill: 'none', stroke: '#29abe2', 'stroke-width': 2 }, grp);
    el('circle', { class: 'hs-core', r: 13, fill: '#eef9fe', stroke: '#1e9bd7', 'stroke-width': 2.5, 'stroke-dasharray': '4 3', filter: 'url(#fSoft)' }, grp);
    el('path', { d: 'M-6 0 h12 M0 -6 v12', stroke: '#1572a8', 'stroke-width': 3, 'stroke-linecap': 'round' }, grp);
    el('title', null, grp).textContent = h.label;
    return grp;
  }

  function drawDevice(g, h, dev, state) {
    const grp = el('g', { class: 'device', 'data-hs': h.id, transform: `translate(${h.x},${h.y})` }, g);
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
    el('title', null, grp).textContent = dev.name + ' @ ' + h.label + (state === 'tested' ? ' (teruji)' : state === 'untested' ? ' (belum diuji)' : '');
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

    const api = {
      svg,
      eqBounds: id => eqById[id] ? eqBounds(eqById[id]) : null,
      eqAnchor(id) {
        const e = eqById[id]; if (!e) return { x: VB_W / 2, y: VB_H / 2 };
        const b = eqBounds(e);
        return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
      },
      eqNode: id => eqGroups[id] || null,
      devNode: hsId => gDev.querySelector(`[data-hs="${hsId}"]`),
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
        scn.hotspots.filter(h => h.stage === stage).forEach(h => {
          const placedId = placements && placements[h.id];
          if (placedId && DEVICES[placedId]) {
            const dev = DEVICES[placedId];
            const tested = itpmMap && itpmMap[h.id] && itpmMap[h.id] === dev.itpm;
            const state = tested ? 'tested' : (o.flagUntested ? 'untested' : 'none');
            const d = drawDevice(gDev, h, dev, state);
            d.addEventListener('click', ev => { ev.stopPropagation(); handlers && handlers.onDevice && handlers.onDevice(h, placedId); });
          } else {
            const hs = drawHotspot(gHs, h);
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
        Object.keys(map || {}).forEach(id => {
          const e = eqById[id]; const it = ITPM[map[id]];
          if (!e || !it) return;
          const b = eqBounds(e);
          const cands = [[b.x + b.w - 6, b.y - 2], [b.x + 8, b.y - 2], [b.x + b.w - 6, b.y + b.h + 4], [b.x + 8, b.y + b.h + 4]];
          const free = c => !hs.some(h => Math.abs(h.x - c[0]) < 44 && Math.abs(h.y - c[1]) < 28) && !taken.some(t => Math.abs(t[0] - c[0]) < 50 && Math.abs(t[1] - c[1]) < 24);
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

  function fluidsIn(scn) {
    const seen = [];
    scn.pipes.forEach(p => { if (!seen.includes(p.fluid)) seen.push(p.fluid); });
    return seen.map(k => Object.assign({ key: k }, FLUIDS[k] || FLUIDS.mix));
  }

  return { render, fluidsIn, FLUIDS, VB_W, VB_H };
})();
