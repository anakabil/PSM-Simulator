/* =====================================================================
   SIM: mesin simulasi proses sederhana.
   Setiap variabel bergerak menuju nilai target dengan konstanta waktu
   (orde satu) ditambah derau kecil. Target = nilai normal + pengaruh
   kendali operator + pengaruh kejadian abnormal (ramp halus).
   Satu detik simulasi dianggap satu menit operasi pabrik.
   ===================================================================== */
class Simulator {
  constructor(scn, opts) {
    this.scn = scn;
    this.opts = Object.assign({ speed: 1, historyLen: 90 }, opts || {});
    this.vars = {};
    this.history = {};
    Object.keys(scn.vars).forEach(id => {
      this.vars[id] = scn.vars[id].normal;
      this.history[id] = [];
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
    Object.keys(this.scn.vars).forEach(id => { this.vars[id] = this.scn.vars[id].normal; this.history[id] = []; });
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
    Object.keys(this.scn.vars).forEach(id => {
      const v = this.scn.vars[id];
      const tgt = this.target(id);
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
   latar gelap netral, jejak biru muda, warna kuning/merah hanya saat
   variabel keluar batas alarm.
   --------------------------------------------------------------------- */
class TrendChart {
  constructor(canvas, sim, varIds) {
    this.c = canvas; this.sim = sim; this.ids = varIds;
    this.ctx = canvas.getContext('2d');
  }
  draw() {
    const c = this.c, ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    const W = c.clientWidth, H = c.clientHeight;
    if (!W || !H) return;
    if (c.width !== W * dpr || c.height !== H * dpr) { c.width = W * dpr; c.height = H * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const n = this.ids.length;
    const padL = 138, padR = 10, gap = 6;
    const rowH = (H - gap * (n + 1)) / n;
    const len = this.sim.opts.historyLen;
    const COL = { normal: '#4fc3f7', hi: '#ffb300', lo: '#ffb300', hihi: '#ff5252', lolo: '#ff5252' };
    this.ids.forEach((id, i) => {
      const v = this.sim.scn.vars[id];
      const st = this.sim.status(id);
      const y0 = gap + i * (rowH + gap);
      const x0 = padL, w = W - padL - padR;
      ctx.fillStyle = '#18212a';
      roundRect(ctx, 4, y0, W - 8, rowH, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(143,220,247,0.12)'; ctx.lineWidth = 1; ctx.stroke();
      const yOf = val => y0 + rowH - ((val - v.min) / (v.max - v.min)) * rowH;
      const band = (from, to, color) => {
        const ya = yOf(Math.min(to, v.max)), yb = yOf(Math.max(from, v.min));
        ctx.fillStyle = color; ctx.fillRect(x0, ya, w, Math.max(0, yb - ya));
      };
      if (v.hi !== undefined) band(v.hi, v.hihi !== undefined ? v.hihi : v.max, 'rgba(255,179,0,0.13)');
      if (v.hihi !== undefined) band(v.hihi, v.max, 'rgba(255,82,82,0.2)');
      if (v.lo !== undefined) band(v.lolo !== undefined ? v.lolo : v.min, v.lo, 'rgba(255,179,0,0.13)');
      if (v.lolo !== undefined) band(v.min, v.lolo, 'rgba(255,82,82,0.2)');
      ctx.strokeStyle = 'rgba(207,216,224,0.3)'; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, yOf(v.normal)); ctx.lineTo(x0 + w, yOf(v.normal)); ctx.stroke();
      ctx.setLineDash([]);
      const h = this.sim.history[id];
      ctx.strokeStyle = COL[st]; ctx.lineWidth = 2.2; ctx.lineJoin = 'round';
      ctx.beginPath();
      h.forEach((val, k) => {
        const x = x0 + ((k + (len - h.length)) / (len - 1)) * w;
        const y = yOf(val);
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      if (h.length) {
        const y = yOf(h[h.length - 1]);
        ctx.fillStyle = COL[st];
        ctx.beginPath(); ctx.arc(x0 + w, y, 3.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = st === 'normal' ? '#cfd8e0' : COL[st];
      ctx.font = '700 11px Nunito, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(ellipsize(ctx, v.label, padL - 16), 10, y0 + 6);
      ctx.font = '800 14px Nunito, sans-serif';
      ctx.fillStyle = st === 'normal' ? '#ffffff' : COL[st];
      ctx.fillText(this.sim.format(id), 10, y0 + rowH - 22);
    });
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
