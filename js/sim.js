/* =====================================================================
   SIM: mesin simulasi proses sederhana.
   Setiap variabel bergerak menuju nilai target dengan konstanta waktu
   (orde satu) ditambah derau kecil. Target = nilai normal + pengaruh
   kendali operator + pengaruh kejadian abnormal (ramp halus) + variasi
   proses alami yang lambat (drift acak berbalik ke nol). Amplitudo drift
   dibatasi sepersepuluh jarak nilai normal ke batas alarm terdekat
   sehingga tidak memicu alarm palsu.
   Satu detik simulasi dianggap satu menit operasi pabrik.
   ===================================================================== */
const DRIFT_TAU = 8; // detik simulasi
function gaussRand() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function alarmMargin(v) {
  const lims = ['lo', 'lolo', 'hi', 'hihi'].filter(k => v[k] !== undefined).map(k => Math.abs(v[k] - v.normal));
  return lims.length ? Math.min(...lims) : (v.max - v.min) * 0.15;
}
class Simulator {
  constructor(scn, opts) {
    this.scn = scn;
    /* 600 sampel x 0,1 detik = jendela tren 60 menit operasi */
    this.opts = Object.assign({ speed: 1, historyLen: 600 }, opts || {});
    this.vars = {};
    this.history = {};
    this.drift = {};
    this.driftSig = {};
    Object.keys(scn.vars).forEach(id => {
      const v = scn.vars[id];
      this.vars[id] = v.normal;
      this.history[id] = [];
      this.drift[id] = 0;
      this.driftSig[id] = Math.min((v.noise || 0) + (v.max - v.min) * 0.0012, alarmMargin(v) / 10);
    });
    this.controls = {};
    (scn.controls || []).forEach(c => { this.controls[c.id] = c.def; });
    this.t = 0;
    this.prod = 0;
    this.halted = false;
    this.running = false;
    this.event = null;
    this.eventT0 = 0;
    this._acc = 0;
    this.listeners = [];
  }
  onTick(fn) { this.listeners.push(fn); }
  setControl(id, v) { this.controls[id] = v; }
  resetControls() { (this.scn.controls || []).forEach(c => { this.controls[c.id] = c.def; }); }
  startEvent(ev) { this.event = ev; this.eventT0 = this.t; }
  clearEvent() { this.event = null; }
  eventElapsed() { return this.event ? this.t - this.eventT0 : 0; }
  eventMature() {
    if (!this.event) return false;
    const te = this.eventElapsed();
    return this.event.effects.every(f => te >= f.delay + f.dur);
  }
  reset() {
    Object.keys(this.scn.vars).forEach(id => { this.vars[id] = this.scn.vars[id].normal; this.history[id] = []; this.drift[id] = 0; });
    this.t = 0; this.prod = 0; this.halted = false; this.event = null; this._acc = 0; this.resetControls();
  }
  target(id) {
    const v = this.scn.vars[id];
    let tgt = v.normal;
    (this.scn.controls || []).forEach(c => {
      c.effects.forEach(f => { if (f.var === id) tgt += f.gain * (this.controls[c.id] - c.def); });
    });
    if (this.event) {
      const te = this.eventElapsed();
      this.event.effects.forEach(f => {
        if (f.var !== id || te <= f.delay) return;
        const frac = Math.min(1, (te - f.delay) / Math.max(0.01, f.dur));
        const k = frac * frac * (3 - 2 * frac);
        tgt = tgt + (f.to - v.normal) * k;
      });
    }
    return Math.max(v.min, Math.min(v.max, tgt));
  }
  step(dt) {
    this.t += dt;
    const kd = Math.sqrt(2 * dt / DRIFT_TAU);
    Object.keys(this.scn.vars).forEach(id => {
      const v = this.scn.vars[id];
      this.drift[id] += -this.drift[id] * dt / DRIFT_TAU + this.driftSig[id] * kd * gaussRand();
      const tgt = Math.max(v.min, Math.min(v.max, this.target(id) + this.drift[id]));
      const a = 1 - Math.exp(-dt / (v.tau || 3));
      let val = this.vars[id] + (tgt - this.vars[id]) * a;
      val += (Math.random() - 0.5) * 2 * (v.noise || 0);
      this.vars[id] = Math.max(v.min, Math.min(v.max, val));
      const h = this.history[id];
      h.push(this.vars[id]);
      if (h.length > this.opts.historyLen) h.shift();
    });
    const p = this.scn.production;
    if (p && !this.halted) this.prod += Math.max(0, this.vars[p.var]) * p.k * dt;
    this.listeners.forEach(fn => fn(this));
  }
  status(id) {
    const v = this.scn.vars[id];
    const x = this.vars[id];
    if (v.hihi !== undefined && x >= v.hihi) return 'hihi';
    if (v.lolo !== undefined && x <= v.lolo) return 'lolo';
    if (v.hi !== undefined && x >= v.hi) return 'hi';
    if (v.lo !== undefined && x <= v.lo) return 'lo';
    return 'normal';
  }
  format(id) {
    const v = this.scn.vars[id];
    return this.vars[id].toFixed(v.dec === undefined ? 1 : v.dec).replace('.', ',') + ' ' + v.unit;
  }
  /* Jam operasi: mulai 08:00, satu detik simulasi = satu menit. */
  clock(t) {
    const m = Math.floor(t === undefined ? this.t : t);
    const hh = (8 + Math.floor(m / 60)) % 24, mm = m % 60;
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }
  start() {
    if (this.running) return;
    this.running = true;
    let last = performance.now();
    const loop = now => {
      if (!this.running) return;
      const real = Math.min(0.25, (now - last) / 1000);
      last = now;
      this._acc += real * this.opts.speed;
      const DT = 0.1;
      let n = 0;
      while (this._acc >= DT && n < 20 && this.running) { this.step(DT); this._acc -= DT; n++; }
      if (this.running) this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }
  stop() { this.running = false; if (this._raf) cancelAnimationFrame(this._raf); }
}

/* ---------------------------------------------------------------------
   Grafik tren pada canvas, gaya HMI berperforma tinggi (ISA-101):
   latar abu-abu netral dengan teks gelap, warna kuning dan merah hanya
   saat variabel keluar batas alarm. Sumbu Y menyesuaikan rentang data
   secara otomatis (dengan rentang minimum) sehingga kenaikan atau
   penurunan kecil tetap terlihat, dan batas alarm ikut tampil saat nilai
   mendekatinya. Setiap panel menampilkan arah dan laju perubahan per
   menit operasi.
   --------------------------------------------------------------------- */
const TREND_THEME = {
  panel: '#dfe4e9', card: '#eceff2', plot: '#f7f8fa', border: '#b7c1ca', grid: '#d3dae1',
  label: '#12355b', value: '#0b1b2b', axis: '#3e5163', ref: '#7b8b9a',
  line: { normal: '#0d47a1', hi: '#a86400', lo: '#a86400', hihi: '#c62828', lolo: '#c62828' },
  bandWarn: 'rgba(255, 179, 0, 0.20)', bandCrit: 'rgba(229, 57, 53, 0.16)',
  limWarn: '#c98500', limCrit: '#d32f2f',
};
function niceStep(span, count) {
  const raw = span / Math.max(1, count);
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
}
function fmtNum(x, d) { return x.toFixed(Math.max(0, d)).replace('.', ','); }
function smoothSeries(a, w) {
  if (a.length < 3) return a;
  const out = new Array(a.length), half = Math.floor(w / 2);
  let sum = 0, cnt = 0, lo = 0, hi = -1;
  for (let i = 0; i < a.length; i++) {
    const L = Math.max(0, i - half), R = Math.min(a.length - 1, i + half);
    while (hi < R) { hi++; sum += a[hi]; cnt++; }
    while (lo < L) { sum -= a[lo]; lo++; cnt--; }
    out[i] = sum / cnt;
  }
  out[a.length - 1] = a[a.length - 1];
  return out;
}

class TrendChart {
  constructor(canvas, sim, varIds) {
    this.c = canvas; this.sim = sim; this.ids = varIds;
    this.ctx = canvas.getContext('2d');
    this.rng = {};
  }
  layout(W, H) {
    const n = this.ids.length;
    const cols = W >= 720 && n > 1 ? 2 : 1;
    const rows = Math.ceil(n / cols);
    const gap = 6;
    const cw = (W - gap * (cols + 1)) / cols, ch = (H - gap * (rows + 1)) / rows;
    return this.ids.map((id, i) => ({ id, x: gap + (i % cols) * (cw + gap), y: gap + Math.floor(i / cols) * (ch + gap), w: cw, h: ch }));
  }
  /* Rentang sumbu Y: data dalam jendela, nilai normal, dan batas alarm yang sudah dekat. */
  targetRange(id) {
    const v = this.sim.scn.vars[id], h = this.sim.history[id];
    const full = v.max - v.min;
    let dmin = v.normal, dmax = v.normal;
    for (let k = 0; k < h.length; k += 2) { if (h[k] < dmin) dmin = h[k]; if (h[k] > dmax) dmax = h[k]; }
    const cur = this.sim.vars[id]; dmin = Math.min(dmin, cur); dmax = Math.max(dmax, cur);
    const minSpan = Math.max((v.noise || 0) * 8, full * 0.05);
    const span = Math.max(dmax - dmin, minSpan);
    const mid = (dmin + dmax) / 2;
    let lo = mid - span * 0.62, hi = mid + span * 0.62;
    ['lo', 'lolo', 'hi', 'hihi'].forEach(k => {
      const L = v[k]; if (L === undefined) return;
      if (L >= lo - span * 0.6 && L <= hi + span * 0.6) { lo = Math.min(lo, L - span * 0.08); hi = Math.max(hi, L + span * 0.08); }
    });
    return { lo: Math.max(v.min, lo), hi: Math.min(v.max, hi) };
  }
  range(id) {
    const t = this.targetRange(id);
    let r = this.rng[id];
    if (!r) r = this.rng[id] = { lo: t.lo, hi: t.hi };
    const cur = this.sim.vars[id];
    r.lo += (t.lo - r.lo) * 0.08; r.hi += (t.hi - r.hi) * 0.08;
    if (cur < r.lo) r.lo = t.lo;
    if (cur > r.hi) r.hi = t.hi;
    return r;
  }
  /* Laju perubahan per menit operasi (= per detik simulasi), regresi linear 6 menit terakhir. */
  slope(id) {
    const h = this.sim.history[id];
    const n = Math.min(60, h.length);
    if (n < 12) return 0;
    let sx = 0, sy = 0, sxx = 0, sxy = 0, m = 0;
    for (let k = h.length - n; k < h.length; k += 2) {
      const x = (k - (h.length - 1)) * 0.1, y = h[k];
      sx += x; sy += y; sxx += x * x; sxy += x * y; m++;
    }
    const den = m * sxx - sx * sx;
    return den ? (m * sxy - sx * sy) / den : 0;
  }
  trendInfo(id) {
    const v = this.sim.scn.vars[id];
    const s = this.slope(id);
    const sigNoise = (v.noise || 0) * 2.4 + (this.sim.driftSig ? this.sim.driftSig[id] : 0);
    const thr = Math.max(sigNoise * 3 / 6, (v.max - v.min) * 0.001);
    if (Math.abs(s) < thr) return { dir: 0, text: 'stabil' };
    const a = Math.abs(s);
    const d = a >= 10 ? 0 : a >= 1 ? 1 : 2;
    return { dir: s > 0 ? 1 : -1, text: `${s > 0 ? 'naik' : 'turun'} ${fmtNum(a, d)} ${v.unit}/mnt` };
  }
  draw() {
    const c = this.c, ctx = this.ctx, T = TREND_THEME;
    const dpr = window.devicePixelRatio || 1;
    const W = c.clientWidth, H = c.clientHeight;
    if (!W || !H) return;
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const len = this.sim.opts.historyLen;
    const tNow = this.sim.t, win = len * 0.1;
    this.layout(W, H).forEach(card => this.drawCard(card, len, tNow, win, T));
  }
  drawCard(card, len, tNow, win, T) {
    const ctx = this.ctx, sim = this.sim, id = card.id;
    const v = sim.scn.vars[id], st = sim.status(id);
    const col = T.line[st];
    const compact = card.h < 74;
    ctx.fillStyle = T.card; roundRect(ctx, card.x, card.y, card.w, card.h, 8); ctx.fill();
    ctx.strokeStyle = st === 'normal' ? T.border : col; ctx.lineWidth = st === 'normal' ? 1 : 1.6; ctx.stroke();
    const headH = 19, axisH = compact ? 2 : 13, gutL = compact ? 36 : 44;
    const px = card.x + gutL, py = card.y + headH, pw = card.w - gutL - 8, ph = card.h - headH - axisH - 4;
    if (pw < 30 || ph < 14) return;
    /* kepala panel: nama variabel, arah dan laju, nilai terkini */
    const info = this.trendInfo(id);
    ctx.textBaseline = 'middle';
    ctx.font = '800 15px Nunito, sans-serif';
    const valTxt = sim.format(id);
    const valW = ctx.measureText(valTxt).width;
    ctx.fillStyle = st === 'normal' ? T.value : col;
    ctx.fillText(valTxt, card.x + card.w - 8 - valW, card.y + 11);
    ctx.font = '700 10.5px Nunito, sans-serif';
    const tw = ctx.measureText(info.text).width;
    const tx = card.x + card.w - 8 - valW - 10 - tw;
    const icx = tx - 9, icy = card.y + 11;
    ctx.fillStyle = info.dir === 0 ? T.axis : (st === 'normal' ? T.label : col);
    if (info.dir === 0) { ctx.fillRect(icx - 5, icy - 1.5, 10, 3); }
    else {
      ctx.beginPath();
      if (info.dir > 0) { ctx.moveTo(icx, icy - 5.5); ctx.lineTo(icx + 5.5, icy + 4); ctx.lineTo(icx - 5.5, icy + 4); }
      else { ctx.moveTo(icx, icy + 5.5); ctx.lineTo(icx + 5.5, icy - 4); ctx.lineTo(icx - 5.5, icy - 4); }
      ctx.closePath(); ctx.fill();
    }
    ctx.fillText(info.text, tx, icy);
    ctx.font = '800 11.5px Nunito, sans-serif';
    ctx.fillStyle = T.label;
    ctx.fillText(ellipsize(ctx, v.label, Math.max(40, icx - 12 - (card.x + 8))), card.x + 8, card.y + 11);
    /* area plot */
    const r = this.range(id);
    const span = Math.max(1e-9, r.hi - r.lo);
    const yOf = val => py + ph - ((val - r.lo) / span) * ph;
    ctx.save();
    ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
    ctx.fillStyle = T.plot; ctx.fillRect(px, py, pw, ph);
    const band = (from, to, color) => {
      const ya = yOf(Math.min(to, r.hi)), yb = yOf(Math.max(from, r.lo));
      if (yb > ya) { ctx.fillStyle = color; ctx.fillRect(px, ya, pw, yb - ya); }
    };
    if (v.hi !== undefined) band(v.hi, v.hihi !== undefined ? v.hihi : v.max, T.bandWarn);
    if (v.hihi !== undefined) band(v.hihi, v.max, T.bandCrit);
    if (v.lo !== undefined) band(v.lolo !== undefined ? v.lolo : v.min, v.lo, T.bandWarn);
    if (v.lolo !== undefined) band(v.min, v.lolo, T.bandCrit);
    /* garis grid nilai dan waktu */
    const step = niceStep(span, compact ? 2 : 3);
    const td = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
    ctx.strokeStyle = T.grid; ctx.lineWidth = 1;
    const ticks = [];
    for (let tv = Math.ceil(r.lo / step) * step; tv <= r.hi + 1e-9; tv += step) ticks.push(tv);
    ticks.forEach(tv => { const y = Math.round(yOf(tv)) + 0.5; ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + pw, y); ctx.stroke(); });
    for (let k = 1; k < 4; k++) { const x = Math.round(px + pw * k / 4) + 0.5; ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x, py + ph); ctx.stroke(); }
    /* garis nilai normal */
    ctx.strokeStyle = T.ref; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(px, yOf(v.normal)); ctx.lineTo(px + pw, yOf(v.normal)); ctx.stroke();
    /* garis batas alarm */
    const lims = [['hihi', 'HH', T.limCrit], ['hi', 'H', T.limWarn], ['lo', 'L', T.limWarn], ['lolo', 'LL', T.limCrit]];
    ctx.font = '800 9px Nunito, sans-serif';
    const labs = [];
    lims.forEach(([k, tag, lc]) => {
      const L = v[k]; if (L === undefined || L < r.lo || L > r.hi) return;
      const y = yOf(L);
      ctx.strokeStyle = lc; ctx.setLineDash([6, 3]); ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + pw, y); ctx.stroke();
      let ly = (k === 'hi' || k === 'hihi') ? y - 6 : y + 6;
      ly = Math.max(py + 6, Math.min(py + ph - 6, ly));
      labs.forEach(o => { if (Math.abs(o - ly) < 11) ly = ly < o ? o - 11 : o + 11; });
      labs.push(ly);
      labs.lab = labs.lab || [];
      labs.lab.push([`${tag} ${fmtNum(L, v.dec === undefined ? 1 : v.dec)}`, ly, lc]);
    });
    ctx.setLineDash([]);
    /* jejak nilai dengan isian gradien */
    const raw = sim.history[id];
    /* tampilan memakai rata-rata bergerak 0,9 menit agar derau sesaat tidak menutupi pola */
    const h = smoothSeries(raw, 9);
    if (h.length > 1) {
      const step2 = h.length > 300 ? 2 : 1;
      const xOf = k => px + ((k + (len - h.length)) / (len - 1)) * pw;
      ctx.beginPath();
      for (let k = 0; k < h.length; k += step2) { const x = xOf(k), y = yOf(h[k]); if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      const lastX = xOf(h.length - 1), lastY = yOf(h[h.length - 1]);
      ctx.lineTo(lastX, lastY);
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.lineTo(lastX, py + ph); ctx.lineTo(xOf(0), py + ph); ctx.closePath();
      const g = ctx.createLinearGradient(0, py, 0, py + ph);
      g.addColorStop(0, col + '40'); g.addColorStop(1, col + '05');
      ctx.fillStyle = g; ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lastX, lastY, 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4; ctx.stroke();
    }
    (labs.lab || []).forEach(([lab, ly, lc]) => {
      const lw = ctx.measureText(lab).width, lx = px + pw - lw - 16;
      ctx.fillStyle = 'rgba(247, 248, 250, 0.9)'; ctx.fillRect(lx - 3, ly - 5.5, lw + 6, 11);
      ctx.fillStyle = lc; ctx.textBaseline = 'middle'; ctx.fillText(lab, lx, ly);
    });
    ctx.restore();
    ctx.strokeStyle = T.border; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
    /* label sumbu nilai */
    ctx.font = '700 9.5px Nunito, sans-serif'; ctx.fillStyle = T.axis; ctx.textBaseline = 'middle';
    ticks.forEach(tv => {
      const y = yOf(tv); if (y < py + 4 || y > py + ph - 3) return;
      const lab = fmtNum(tv, td); ctx.fillText(lab, px - 5 - ctx.measureText(lab).width, y);
    });
    /* label sumbu waktu (jam operasi) */
    if (!compact) {
      ctx.textBaseline = 'top';
      for (let k = 0; k <= 4; k++) {
        const t = tNow - win + win * k / 4;
        if (t < 0) continue;
        const lab = sim.clock(t), lw = ctx.measureText(lab).width;
        const x = px + pw * k / 4 - (k === 0 ? 0 : k === 4 ? lw : lw / 2);
        ctx.fillText(lab, x, py + ph + 2);
      }
    }
  }
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function ellipsize(ctx, str, maxW) {
  if (ctx.measureText(str).width <= maxW) return str;
  let s = str;
  while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1);
  return s.trim() + '…';
}
