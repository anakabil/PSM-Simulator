/* =====================================================================
   PID: penggambar P&ID berbasis SVG dengan gradien dan bayangan
   agar peralatan terlihat seperti objek tiga dimensi.
   ===================================================================== */
const PID = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const VB_W = 1000, VB_H = 560;

  const FLUIDS = {
    mix:     { c: '#8d6e63', d: '#4e342e', l: '#d7ccc8' },
    gas:     { c: '#ffb300', d: '#b26a00', l: '#ffe082' },
    oil:     { c: '#6d4c41', d: '#3e2723', l: '#bcaaa4' },
    water:   { c: '#29b6f6', d: '#0277bd', l: '#b3e5fc' },
    cw:      { c: '#4dd0e1', d: '#00838f', l: '#b2ebf2' },
    chem:    { c: '#ab47bc', d: '#6a1b9a', l: '#e1bee7' },
    product: { c: '#66bb6a', d: '#2e7d32', l: '#c8e6c9' },
    lpg:     { c: '#ff7043', d: '#bf360c', l: '#ffccbc' },
    flare:   { c: '#ff8a65', d: '#d84315', l: '#ffccbc' },
    steam:   { c: '#cfd8dc', d: '#78909c', l: '#ffffff' },
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

  function grad(defs, id, stops, opts) {
    const o = opts || {};
    const g = el(o.radial ? 'radialGradient' : 'linearGradient', Object.assign({ id }, o.attrs || {}), defs);
    stops.forEach(s => el('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] }, g));
    return g;
  }

  function makeDefs(svg) {
    const d = el('defs', null, svg);
    grad(d, 'gVesselV', [[0, '#e3f2fd'], [0.25, '#90caf9'], [0.6, '#42a5f5'], [1, '#0d47a1']], { attrs: { x1: 0, y1: 0, x2: 1, y2: 0 } });
    grad(d, 'gVesselH', [[0, '#e3f2fd'], [0.25, '#90caf9'], [0.6, '#42a5f5'], [1, '#0d47a1']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gReactor', [[0, '#f3e5f5'], [0.25, '#ce93d8'], [0.6, '#ab47bc'], [1, '#4a148c']], { attrs: { x1: 0, y1: 0, x2: 1, y2: 0 } });
    grad(d, 'gTank', [[0, '#fff8e1'], [0.3, '#ffd54f'], [0.65, '#ffb300'], [1, '#e65100']], { attrs: { x1: 0, y1: 0, x2: 1, y2: 0 } });
    grad(d, 'gTankTop', [[0, '#fff3c4'], [1, '#ffca28']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gPump', [[0, '#e8f5e9'], [0.4, '#66bb6a'], [1, '#1b5e20']], { radial: true, attrs: { cx: 0.35, cy: 0.3, r: 0.8 } });
    grad(d, 'gComp', [[0, '#fff3e0'], [0.4, '#ffa726'], [1, '#e65100']], { radial: true, attrs: { cx: 0.35, cy: 0.3, r: 0.8 } });
    grad(d, 'gHx', [[0, '#e0f7fa'], [0.4, '#4dd0e1'], [1, '#006064']], { radial: true, attrs: { cx: 0.35, cy: 0.3, r: 0.8 } });
    grad(d, 'gValve', [[0, '#fafafa'], [0.5, '#bdbdbd'], [1, '#424242']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gValveC', [[0, '#e8eaf6'], [0.5, '#7986cb'], [1, '#1a237e']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gMetal', [[0, '#eceff1'], [0.5, '#90a4ae'], [1, '#37474f']], { attrs: { x1: 0, y1: 0, x2: 1, y2: 0 } });
    grad(d, 'gMetalV', [[0, '#eceff1'], [0.5, '#90a4ae'], [1, '#37474f']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gBubble', [[0, '#ffffff'], [0.5, '#fff59d'], [1, '#f9a825']], { radial: true, attrs: { cx: 0.35, cy: 0.3, r: 0.8 } });
    grad(d, 'gFlame', [[0, '#ff3d00'], [0.55, '#ff9100'], [1, '#ffee58']], { attrs: { x1: 0, y1: 1, x2: 0, y2: 0 } });
    grad(d, 'gTruck', [[0, '#ffffff'], [0.3, '#cfd8dc'], [0.7, '#90a4ae'], [1, '#455a64']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gBuilding', [[0, '#fce4ec'], [0.5, '#f48fb1'], [1, '#880e4f']], { attrs: { x1: 0, y1: 0, x2: 1, y2: 1 } });
    grad(d, 'gMuster', [[0, '#e8f5e9'], [0.5, '#81c784'], [1, '#2e7d32']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gGlass', [[0, '#ffffff', 0.7], [0.5, '#ffffff', 0.05], [1, '#000000', 0.15]], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    grad(d, 'gGrid', [[0, '#f8fbff'], [1, '#e3edf7']], { attrs: { x1: 0, y1: 0, x2: 0, y2: 1 } });
    const f = el('filter', { id: 'fShadow', x: '-20%', y: '-20%', width: '140%', height: '150%' }, d);
    el('feDropShadow', { dx: 0, dy: 3, stdDeviation: 2.5, 'flood-color': '#0b2545', 'flood-opacity': 0.35 }, f);
    const f2 = el('filter', { id: 'fGlow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, d);
    el('feGaussianBlur', { stdDeviation: 3, result: 'b' }, f2);
    const m = el('feMerge', null, f2);
    el('feMergeNode', { in: 'b' }, m); el('feMergeNode', { in: 'SourceGraphic' }, m);
    const f3 = el('filter', { id: 'fSoft', x: '-20%', y: '-20%', width: '140%', height: '150%' }, d);
    el('feDropShadow', { dx: 0, dy: 1.5, stdDeviation: 1.2, 'flood-color': '#0b2545', 'flood-opacity': 0.3 }, f3);
    const mk = el('marker', { id: 'mArrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' }, d);
    el('path', { d: 'M0,0 L10,5 L0,10 Z', fill: '#37474f' }, mk);
    const pat = el('pattern', { id: 'pGrid', width: 25, height: 25, patternUnits: 'userSpaceOnUse' }, d);
    el('path', { d: 'M25 0 L0 0 0 25', fill: 'none', stroke: '#c9d8e8', 'stroke-width': 0.6 }, pat);
  }

  /* ---------- Simbol peralatan ---------- */
  function drawVessel(g, e) {
    const horiz = e.orient === 'h';
    const r = horiz ? e.h / 2 : e.w / 2;
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: r, ry: r, fill: horiz ? 'url(#gVesselH)' : 'url(#gVesselV)', stroke: '#0b3d91', 'stroke-width': 2.5, filter: 'url(#fShadow)' }, g);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: r, ry: r, fill: 'url(#gGlass)' }, g);
    if (horiz) {
      el('rect', { x: e.x + 24, y: e.y + 8, width: e.w - 48, height: 7, rx: 3.5, fill: '#fff', opacity: 0.55 }, g);
      // support saddles
      el('rect', { x: e.x + 40, y: e.y + e.h - 4, width: 28, height: 16, fill: 'url(#gMetalV)', stroke: '#263238', 'stroke-width': 1.2 }, g);
      el('rect', { x: e.x + e.w - 68, y: e.y + e.h - 4, width: 28, height: 16, fill: 'url(#gMetalV)', stroke: '#263238', 'stroke-width': 1.2 }, g);
    } else {
      el('rect', { x: e.x + 8, y: e.y + 24, width: 7, height: e.h - 48, rx: 3.5, fill: '#fff', opacity: 0.55 }, g);
      el('path', { d: `M${e.x + 10} ${e.y + e.h - 6} l-10 20 M${e.x + e.w - 10} ${e.y + e.h - 6} l10 20`, stroke: '#37474f', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    }
    text(g, e.x + e.w / 2, e.y + e.h / 2 + 2, e.id, { class: 'eq-label', 'font-size': 18, 'font-weight': 800, fill: '#fff', stroke: '#0b3d91', 'stroke-width': 0.6 });
  }
  function drawReactor(g, e) {
    const r = 36;
    // jacket
    el('rect', { x: e.x - 10, y: e.y + 30, width: e.w + 20, height: e.h - 40, rx: r + 10, fill: '#b2ebf2', stroke: '#00838f', 'stroke-width': 2, opacity: 0.9, filter: 'url(#fShadow)' }, g);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: r, ry: r, fill: 'url(#gReactor)', stroke: '#4a148c', 'stroke-width': 2.5, filter: 'url(#fShadow)' }, g);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: r, ry: r, fill: 'url(#gGlass)' }, g);
    el('rect', { x: e.x + 10, y: e.y + 30, width: 8, height: e.h - 60, rx: 4, fill: '#fff', opacity: 0.5 }, g);
    // agitator shaft and blades
    const cx = e.x + e.w / 2 + 25;
    el('line', { x1: cx, y1: e.y - 10, x2: cx, y2: e.y + e.h - 50, stroke: '#eceff1', 'stroke-width': 4 }, g);
    el('path', { d: `M${cx - 30} ${e.y + e.h - 50} h60 M${cx - 22} ${e.y + e.h - 90} h44`, stroke: '#eceff1', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    el('path', { d: `M${e.x + 20} ${e.y + e.h - 6} l-10 22 M${e.x + e.w - 20} ${e.y + e.h - 6} l10 22`, stroke: '#37474f', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    text(g, e.x + e.w / 2 - 20, e.y + e.h / 2, e.id, { class: 'eq-label', 'font-size': 18, 'font-weight': 800, fill: '#fff', stroke: '#4a148c', 'stroke-width': 0.6 });
  }
  function drawTank(g, e) {
    const ry = 12;
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, fill: 'url(#gTank)', stroke: '#bf360c', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, fill: 'url(#gGlass)' }, g);
    el('ellipse', { cx: e.x + e.w / 2, cy: e.y + e.h, rx: e.w / 2, ry, fill: '#e65100', stroke: '#bf360c', 'stroke-width': 2 }, g);
    el('rect', { x: e.x, y: e.y + e.h - 1, width: e.w, height: ry + 2, fill: 'url(#gTank)' }, g);
    el('ellipse', { cx: e.x + e.w / 2, cy: e.y + e.h, rx: e.w / 2, ry, fill: 'none', stroke: '#bf360c', 'stroke-width': 2, 'stroke-dasharray': '0' }, g);
    el('path', { d: `M${e.x} ${e.y + e.h} A${e.w / 2} ${ry} 0 0 0 ${e.x + e.w} ${e.y + e.h}`, fill: 'url(#gTank)', stroke: '#bf360c', 'stroke-width': 2 }, g);
    el('ellipse', { cx: e.x + e.w / 2, cy: e.y, rx: e.w / 2, ry, fill: 'url(#gTankTop)', stroke: '#bf360c', 'stroke-width': 2 }, g);
    el('rect', { x: e.x + 10, y: e.y + 18, width: 8, height: e.h - 30, rx: 4, fill: '#fff', opacity: 0.45 }, g);
    text(g, e.x + e.w / 2, e.y + e.h / 2 + 4, e.id, { class: 'eq-label', 'font-size': 17, 'font-weight': 800, fill: '#fff', stroke: '#bf360c', 'stroke-width': 0.6 });
  }
  function drawPump(g, e) {
    const r = 22;
    el('rect', { x: e.x - 14, y: e.y + 14, width: 28, height: 14, fill: 'url(#gMetalV)', stroke: '#263238', 'stroke-width': 1.2 }, g);
    el('circle', { cx: e.x, cy: e.y, r, fill: 'url(#gPump)', stroke: '#1b5e20', 'stroke-width': 2.5, filter: 'url(#fShadow)' }, g);
    el('path', { d: `M${e.x - 10} ${e.y - 12} L${e.x + 16} ${e.y} L${e.x - 10} ${e.y + 12} Z`, fill: '#fff', opacity: 0.9 }, g);
    el('circle', { cx: e.x - 6, cy: e.y - 7, r: 6, fill: '#fff', opacity: 0.35 }, g);
    text(g, e.x, e.y + 40, e.id, { class: 'eq-label', 'font-size': 12, 'font-weight': 700, fill: '#1b3a57' });
  }
  function drawCompressor(g, e) {
    const r = 28;
    el('circle', { cx: e.x, cy: e.y, r, fill: 'url(#gComp)', stroke: '#e65100', 'stroke-width': 2.5, filter: 'url(#fShadow)' }, g);
    el('path', { d: `M${e.x - 18} ${e.y - 14} L${e.x - 18} ${e.y + 14} L${e.x + 18} ${e.y + 6} L${e.x + 18} ${e.y - 6} Z`, fill: '#fff', opacity: 0.9 }, g);
    el('circle', { cx: e.x - 8, cy: e.y - 9, r: 7, fill: '#fff', opacity: 0.35 }, g);
    text(g, e.x, e.y + 44, e.id, { class: 'eq-label', 'font-size': 12, 'font-weight': 700, fill: '#1b3a57' });
  }
  function drawHx(g, e) {
    const r = 28;
    el('circle', { cx: e.x, cy: e.y, r, fill: 'url(#gHx)', stroke: '#006064', 'stroke-width': 2.5, filter: 'url(#fShadow)' }, g);
    el('path', { d: `M${e.x - 26} ${e.y} l10 -10 l10 20 l10 -20 l10 20 l6 -10`, fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
    el('circle', { cx: e.x - 8, cy: e.y - 9, r: 7, fill: '#fff', opacity: 0.35 }, g);
    text(g, e.x, e.y + 44, e.id, { class: 'eq-label', 'font-size': 12, 'font-weight': 700, fill: '#1b3a57' });
  }
  function drawValve(g, e) {
    const s = 12;
    const ctrl = e.sub === 'control';
    el('path', { d: `M${e.x - s} ${e.y - s} L${e.x + s} ${e.y + s} L${e.x + s} ${e.y - s} L${e.x - s} ${e.y + s} Z`, fill: ctrl ? 'url(#gValveC)' : 'url(#gValve)', stroke: '#263238', 'stroke-width': 2, filter: 'url(#fSoft)' }, g);
    if (ctrl) {
      el('line', { x1: e.x, y1: e.y, x2: e.x, y2: e.y - 22, stroke: '#263238', 'stroke-width': 2 }, g);
      el('path', { d: `M${e.x - 12} ${e.y - 22} a12 12 0 0 1 24 0 z`, fill: 'url(#gValveC)', stroke: '#263238', 'stroke-width': 2 }, g);
      if (e.tag) {
        const bx = e.x + 30, by = e.y - 32;
        el('path', { d: `M${e.x} ${e.y - 30} L${bx - 12} ${by}`, stroke: '#263238', 'stroke-width': 1.2, 'stroke-dasharray': '3 2', fill: 'none' }, g);
        el('circle', { cx: bx, cy: by, r: 12, fill: 'url(#gBubble)', stroke: '#1a237e', 'stroke-width': 1.8, filter: 'url(#fSoft)' }, g);
        el('line', { x1: bx - 12, y1: by, x2: bx + 12, y2: by, stroke: '#1a237e', 'stroke-width': 1 }, g);
        text(g, bx, by - 4, e.tag, { 'font-size': 7.5, 'font-weight': 800, fill: '#1a237e' });
        text(g, bx, by + 5.5, e.id.split('-')[1] || '', { 'font-size': 7, 'font-weight': 700, fill: '#1a237e' });
      }
    } else {
      el('line', { x1: e.x, y1: e.y, x2: e.x, y2: e.y - 16, stroke: '#263238', 'stroke-width': 2 }, g);
      el('rect', { x: e.x - 10, y: e.y - 20, width: 20, height: 5, rx: 2, fill: 'url(#gMetal)', stroke: '#263238', 'stroke-width': 1 }, g);
    }
    text(g, e.x, e.y + 24, e.id, { class: 'eq-label', 'font-size': 10.5, 'font-weight': 700, fill: '#1b3a57' });
  }
  function drawFlare(g, e) {
    el('rect', { x: e.x - 8, y: e.y - 60, width: 16, height: 60, fill: 'url(#gMetal)', stroke: '#37474f', 'stroke-width': 1.5, filter: 'url(#fShadow)' }, g);
    el('rect', { x: e.x - 12, y: e.y - 66, width: 24, height: 8, rx: 2, fill: 'url(#gMetal)', stroke: '#37474f', 'stroke-width': 1.5 }, g);
    el('path', { d: `M${e.x - 8} ${e.y} l-10 14 M${e.x + 8} ${e.y} l10 14`, stroke: '#37474f', 'stroke-width': 3 }, g);
    el('path', { class: 'flame', d: `M${e.x} ${e.y - 104} C${e.x + 15} ${e.y - 88} ${e.x + 11} ${e.y - 72} ${e.x} ${e.y - 66} C${e.x - 11} ${e.y - 72} ${e.x - 15} ${e.y - 88} ${e.x} ${e.y - 104} Z`, fill: 'url(#gFlame)', filter: 'url(#fGlow)' }, g);
    text(g, e.x - 16, e.y - 30, e.id, { class: 'eq-label', 'font-size': 12, 'font-weight': 700, fill: '#1b3a57', 'text-anchor': 'end' });
  }
  function drawTruck(g, e) {
    // chassis
    el('rect', { x: e.x - 10, y: e.y + e.h - 10, width: e.w + 40, height: 10, rx: 3, fill: '#455a64' }, g);
    // cabin
    el('path', { d: `M${e.x + e.w + 2} ${e.y + e.h - 10} v-50 h20 l16 22 v28 z`, fill: '#ff7043', stroke: '#bf360c', 'stroke-width': 2, filter: 'url(#fShadow)' }, g);
    el('path', { d: `M${e.x + e.w + 6} ${e.y + e.h - 40} h14 l10 14 h-24 z`, fill: '#b3e5fc' }, g);
    // tank
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h - 12, rx: (e.h - 12) / 2, fill: 'url(#gTruck)', stroke: '#37474f', 'stroke-width': 2.2, filter: 'url(#fShadow)' }, g);
    el('rect', { x: e.x + 20, y: e.y + 6, width: e.w - 40, height: 6, rx: 3, fill: '#fff', opacity: 0.7 }, g);
    // wheels
    [e.x + 24, e.x + 52, e.x + e.w + 16].forEach(wx => {
      el('circle', { cx: wx, cy: e.y + e.h + 2, r: 11, fill: '#263238', stroke: '#90a4ae', 'stroke-width': 2 }, g);
      el('circle', { cx: wx, cy: e.y + e.h + 2, r: 4, fill: '#cfd8dc' }, g);
    });
    text(g, e.x + e.w / 2, e.y + (e.h - 12) / 2 + 2, e.id, { class: 'eq-label', 'font-size': 14, 'font-weight': 800, fill: '#263238' });
  }
  function drawManifold(g, e) {
    el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 8, fill: 'url(#gMetalV)', stroke: '#263238', 'stroke-width': 2, filter: 'url(#fShadow)' }, g);
    for (let i = 0; i < 3; i++) {
      el('rect', { x: e.x + 8 + i * 18, y: e.y - 18, width: 10, height: 18, fill: 'url(#gMetal)', stroke: '#263238', 'stroke-width': 1 }, g);
    }
    text(g, e.x + e.w / 2, e.y + e.h + 14, e.id, { class: 'eq-label', 'font-size': 11, 'font-weight': 700, fill: '#1b3a57' });
  }
  function drawMotor(g, e) {
    el('rect', { x: e.x - 16, y: e.y - 12, width: 32, height: 24, rx: 5, fill: 'url(#gMetalV)', stroke: '#263238', 'stroke-width': 1.5, filter: 'url(#fSoft)' }, g);
    text(g, e.x, e.y + 1, 'M', { 'font-size': 14, 'font-weight': 800, fill: '#263238' });
    text(g, e.x + 36, e.y, e.id, { class: 'eq-label', 'font-size': 11, 'font-weight': 700, fill: '#1b3a57', 'text-anchor': 'start' });
  }
  function drawBuilding(g, e) {
    el('rect', { x: e.x - 30, y: e.y - 16, width: 60, height: 36, rx: 4, fill: 'url(#gBuilding)', stroke: '#880e4f', 'stroke-width': 2, filter: 'url(#fShadow)' }, g);
    el('path', { d: `M${e.x - 34} ${e.y - 16} L${e.x} ${e.y - 34} L${e.x + 34} ${e.y - 16} Z`, fill: '#ad1457', stroke: '#880e4f', 'stroke-width': 2 }, g);
    [-18, -4, 10].forEach(dx => el('rect', { x: e.x + dx, y: e.y - 8, width: 8, height: 8, fill: '#fff9c4', opacity: 0.9 }, g));
    text(g, e.x, e.y + 32, e.name, { class: 'eq-label', 'font-size': 11, 'font-weight': 700, fill: '#1b3a57' });
  }
  function drawMuster(g, e) {
    el('circle', { cx: e.x, cy: e.y, r: 20, fill: 'url(#gMuster)', stroke: '#1b5e20', 'stroke-width': 2, filter: 'url(#fShadow)' }, g);
    [[-8, -4], [0, -8], [8, -4]].forEach(p => {
      el('circle', { cx: e.x + p[0], cy: e.y + p[1], r: 3.2, fill: '#fff' }, g);
      el('path', { d: `M${e.x + p[0] - 4} ${e.y + p[1] + 10} a4 4 0 0 1 8 0 z`, fill: '#fff' }, g);
    });
    text(g, e.x, e.y + 34, e.name, { class: 'eq-label', 'font-size': 11, 'font-weight': 700, fill: '#1b3a57' });
  }
  function drawSink(g, e) {
    const left = e.dir === 'left';
    const w = 132, h = 32;
    const x0 = left ? e.x - w : e.x;
    el('rect', { x: x0, y: e.y - h / 2, width: w, height: h, rx: 16, fill: '#eceff1', stroke: '#90a4ae', 'stroke-width': 1.5, filter: 'url(#fSoft)' }, g);
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
    lines.forEach((l, i) => text(g, x0 + w / 2, e.y + (i - (lines.length - 1) / 2) * 11 + 1, l, { class: 'eq-label', 'font-size': fs, 'font-weight': 700, fill: '#37474f' }));
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

  function pathD(pts) {
    return pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  }

  function drawPipe(g, p) {
    const f = FLUIDS[p.fluid] || FLUIDS.mix;
    const d = pathD(p.pts);
    const w = p.w || 6;
    const grp = el('g', { class: 'pipe', 'data-id': p.id }, g);
    if (p.dashed) {
      el('path', { d, fill: 'none', stroke: f.d, 'stroke-width': w, 'stroke-dasharray': '8 6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.8 }, grp);
    } else {
      el('path', { d, fill: 'none', stroke: f.d, 'stroke-width': w + 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, grp);
      el('path', { d, fill: 'none', stroke: f.c, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'marker-end': p.arrow ? 'url(#mArrow)' : null }, grp);
      el('path', { d, fill: 'none', stroke: f.l, 'stroke-width': Math.max(1.2, w * 0.3), 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.7, transform: 'translate(-0.8,-1.2)' }, grp);
      el('path', { class: 'flow', d, fill: 'none', stroke: '#ffffff', 'stroke-width': Math.max(1.5, w * 0.35), 'stroke-dasharray': '6 14', 'stroke-linecap': 'round', opacity: 0 }, grp);
    }
    if (p.label) {
      const last = p.pts[p.pts.length - 1];
      const prev = p.pts[p.pts.length - 2];
      const dx = last[0] - prev[0];
      const anchor = dx < 0 ? 'start' : 'end';
      text(grp, last[0] - Math.sign(dx) * 4, last[1] + 16, p.label, { 'font-size': 10, 'font-weight': 700, fill: '#37474f', 'text-anchor': anchor });
    }
  }

  function drawReadout(g, id, v) {
    const grp = el('g', { class: 'readout', 'data-var': id, transform: `translate(${v.x},${v.y})` }, g);
    el('rect', { x: -44, y: -11, width: 88, height: 22, rx: 6, fill: '#0b2545', stroke: v.color || '#90caf9', 'stroke-width': 1.5, filter: 'url(#fSoft)' }, grp);
    el('rect', { x: -44, y: -11, width: 88, height: 11, rx: 6, fill: '#fff', opacity: 0.12 }, grp);
    text(grp, 0, 1, '--', { class: 'readout-text', 'font-size': 11.5, 'font-weight': 800, fill: '#e3f2fd', 'font-family': "'Nunito', monospace" });
    return grp;
  }

  function drawHotspot(g, h) {
    const grp = el('g', { class: 'hotspot', 'data-hs': h.id, transform: `translate(${h.x},${h.y})` }, g);
    el('circle', { class: 'hs-pulse', r: 16, fill: 'none', stroke: '#ff9100', 'stroke-width': 2 }, grp);
    el('circle', { class: 'hs-core', r: 13, fill: '#fff8e1', stroke: '#ff9100', 'stroke-width': 2.5, 'stroke-dasharray': '4 3', filter: 'url(#fSoft)' }, grp);
    el('path', { d: 'M-6 0 h12 M0 -6 v12', stroke: '#ff6d00', 'stroke-width': 3, 'stroke-linecap': 'round' }, grp);
    const t = el('title', null, grp);
    t.textContent = h.label;
    return grp;
  }

  function drawDevice(g, h, dev) {
    const grp = el('g', { class: 'device', 'data-hs': h.id, transform: `translate(${h.x},${h.y})` }, g);
    el('circle', { r: 18, fill: 'url(#gBubble)', stroke: dev.color || '#f9a825', 'stroke-width': 3, filter: 'url(#fShadow)' }, grp);
    el('circle', { r: 18, fill: 'none', stroke: '#fff', 'stroke-width': 1, opacity: 0.8 }, grp);
    el('circle', { cx: -6, cy: -7, r: 5, fill: '#fff', opacity: 0.5 }, grp);
    text(grp, 0, 1, dev.code, { 'font-size': dev.code.length > 3 ? 9.5 : 11, 'font-weight': 800, fill: '#263238' });
    const t = el('title', null, grp);
    t.textContent = dev.name + ' @ ' + h.label;
    return grp;
  }

  /* ---------- Render utama ---------- */
  function render(container, scn, handlers) {
    container.innerHTML = '';
    const svg = el('svg', { viewBox: `0 0 ${VB_W} ${VB_H}`, class: 'pid-svg', preserveAspectRatio: 'xMidYMid meet' }, container);
    makeDefs(svg);
    el('rect', { x: 0, y: 0, width: VB_W, height: VB_H, rx: 14, fill: 'url(#gGrid)' }, svg);
    el('rect', { x: 0, y: 0, width: VB_W, height: VB_H, rx: 14, fill: 'url(#pGrid)' }, svg);

    const gPipes = el('g', { class: 'layer-pipes' }, svg);
    const gEq = el('g', { class: 'layer-eq' }, svg);
    const gLabels = el('g', { class: 'layer-labels' }, svg);
    const gRead = el('g', { class: 'layer-readouts' }, svg);
    const gHs = el('g', { class: 'layer-hotspots' }, svg);
    const gDev = el('g', { class: 'layer-devices' }, svg);

    scn.pipes.forEach(p => drawPipe(gPipes, p));
    const eqGroups = {};
    scn.equipment.forEach(e => {
      const g = el('g', { class: 'eq', 'data-id': e.id }, gEq);
      (DRAW[e.type] || DRAW.pump)(g, e);
      const b = eqBounds(e);
      el('rect', { class: 'eq-hit', x: b.x - 6, y: b.y - 6, width: b.w + 12, height: b.h + 12, rx: 10, fill: 'transparent' }, g);
      el('rect', { class: 'eq-ring', x: b.x - 6, y: b.y - 6, width: b.w + 12, height: b.h + 12, rx: 10, fill: 'none', stroke: '#ff9100', 'stroke-width': 3, 'stroke-dasharray': '6 4', opacity: 0 }, g);
      g.addEventListener('click', ev => { ev.stopPropagation(); handlers && handlers.onEquipment && handlers.onEquipment(e); });
      eqGroups[e.id] = g;
    });
    (scn.labels || []).forEach(l => text(gLabels, l.x, l.y, l.text, { 'font-size': l.size || 11, 'font-weight': 700, fill: '#37474f' }));
    const readouts = {};
    Object.keys(scn.vars).forEach(id => { readouts[id] = drawReadout(gRead, id, scn.vars[id]); });

    const api = {
      svg,
      setFlow(on) { svg.classList.toggle('flowing', !!on); },
      highlight(id, on) {
        const g = eqGroups[id]; if (!g) return;
        const r = g.querySelector('.eq-ring');
        r.setAttribute('opacity', on ? 1 : 0);
      },
      markRead(id) { const g = eqGroups[id]; if (g) g.classList.add('read'); },
      setReadout(id, valueText, state) {
        const r = readouts[id]; if (!r) return;
        r.querySelector('.readout-text').textContent = valueText;
        r.setAttribute('data-state', state || 'normal');
      },
      showReadouts(on) { gRead.style.display = on ? '' : 'none'; },
      showHotspots(stage, placements) {
        gHs.innerHTML = ''; gDev.innerHTML = '';
        if (!stage) return;
        scn.hotspots.filter(h => h.stage === stage).forEach(h => {
          const placedId = placements && placements[h.id];
          if (placedId && DEVICES[placedId]) {
            const d = drawDevice(gDev, h, DEVICES[placedId]);
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
      alarmNode(id, on) { const g = eqGroups[id]; if (g) g.classList.toggle('alarm', !!on); },
    };
    svg.addEventListener('click', () => handlers && handlers.onBackground && handlers.onBackground());
    return api;
  }

  return { render, FLUIDS, VB_W, VB_H };
})();
