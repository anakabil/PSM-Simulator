/* =====================================================================
   GAME: alur permainan PSM Simulator
   Layar: menu, pilih skenario, bermain (4 tahap), hasil, konfigurasi,
   credit. Progres disimpan di localStorage.
   ===================================================================== */
const Game = (() => {
  const SAVE_KEY = 'psm_sim_save_v1';
  const CFG_KEY = 'psm_sim_cfg_v1';
  const HIST_KEY = 'psm_sim_hist_v1';
  const HINT_COST = 5;
  const DEFAULT_CFG = { sound: true, music: true, musicVol: 45, speed: 1, difficulty: 'normal', hints: true, anim: true, fx: true, name: '', currency: 'IDR', rate: COST_MODEL.idrPerUsd };

  const app = document.getElementById('app');
  let cfg = Object.assign({}, DEFAULT_CFG, loadJSON(CFG_KEY) || {});
  let S = null;          // sesi permainan aktif
  let scn = null;        // skenario aktif
  let pid = null, sim = null, chart = null, chartRaf = 0;
  let tool = null;       // { kind: 'dev' | 'itpm', id }
  let toolTab = 'dev';
  let ev2 = null;        // kejadian aktif Tahap 2
  const timers = new Set();

  /* ---------- utilitas ---------- */
  function loadJSON(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function on(root, sel, evt, fn) { $$(sel, root).forEach(n => n.addEventListener(evt, fn)); }
  function later(fn, ms) { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; }
  function clearTimers() { timers.forEach(t => clearTimeout(t)); timers.clear(); }
  function num(x, dec) { return Number(x).toLocaleString('id-ID', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }); }
  function pct(x) { return Math.round(x * 100) + '%'; }
  /* Biaya disimpan dalam satuan anggaran, ditampilkan dalam Rupiah atau USD. */
  function money(units, full) {
    const usd = units * COST_MODEL.usdPerUnit;
    const sym = cfg.currency === 'USD' ? 'USD' : 'Rp';
    const v = cfg.currency === 'USD' ? usd : usd * (cfg.rate || COST_MODEL.idrPerUsd);
    if (full) return sym + ' ' + num(Math.round(v));
    const short = (x, unit) => sym + ' ' + Number(x.toFixed(x >= 100 ? 0 : x >= 10 ? 1 : 2)).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' ' + unit;
    if (v >= 1e9) return short(v / 1e9, 'M');
    if (v >= 1e6) return short(v / 1e6, 'jt');
    if (v >= 1e3) return short(v / 1e3, 'rb');
    return sym + ' ' + num(v);
  }
  function costNote() {
    return `Nilai indikatif: 1 satuan biaya setara USD ${num(COST_MODEL.usdPerUnit)}${cfg.currency === 'USD' ? '' : `, kurs Rp ${num(cfg.rate || COST_MODEL.idrPerUsd)} per USD`}.`;
  }
  function grade(score) { return score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D'; }
  function gradeLabel(g) { return { A: 'Sangat Baik', B: 'Baik', C: 'Cukup', D: 'Perlu Pelatihan Ulang' }[g]; }
  function fxOn() { return cfg.fx && cfg.anim; }
  function opName() { return (scn && scn.op) || 'Proses Produksi'; }
  const SECTOR_ICON = { migas: 'drop', petrokimia: 'flask', listrik: 'bolt', ebt: 'leaf', manufaktur: 'factory', properti: 'building' };
  const LEVELS = ['Pemula', 'Menengah', 'Lanjutan'];
  let scnFilter = 'all';

  const ICON = {
    book: '<svg viewBox="0 0 24 24"><path d="M2.5 5.2c3.3-1.6 6.4-1.4 8.7.6v14c-2.3-1.8-5.4-2-8.7-.6z"/><path d="M21.5 5.2c-3.3-1.6-6.4-1.4-8.7.6v14c2.3-1.8 5.4-2 8.7-.6z"/></svg>',
    alert: '<svg viewBox="0 0 24 24"><path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17.5v.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5.5 3.4 9.4 8 11 4.6-1.6 8-5.5 8-11V5z"/><path d="m8.5 12 2.5 2.5 5-5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    fire: '<svg viewBox="0 0 24 24"><path d="M12 2c1 4 5 5 5 11a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 2 2c1 0 1-1 1-2 0-3-1-4 1-8z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M6 4v16l14-8z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 4-2.2-.6a7 7 0 0 0-.5-1.3l1.1-2-1.5-1.5-2 1.1a7 7 0 0 0-1.3-.5L14 3h-4l-.6 2.2a7 7 0 0 0-1.3.5l-2-1.1L4.6 6.1l1.1 2a7 7 0 0 0-.5 1.3L3 10v4l2.2.6a7 7 0 0 0 .5 1.3l-1.1 2 1.5 1.5 2-1.1a7 7 0 0 0 1.3.5L10 21h4l.6-2.2a7 7 0 0 0 1.3-.5l2 1.1 1.5-1.5-1.1-2a7 7 0 0 0 .5-1.3L21 14z"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
    coin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 6v12M9 9.5c0-1.4 1.3-2 3-2s3 .7 3 2-1.3 1.8-3 2.3-3 1-3 2.4 1.3 2.3 3 2.3 3-.8 3-2" fill="none" stroke="#1f2a35" stroke-width="1.6" stroke-linecap="round"/></svg>',
    wrench: '<svg viewBox="0 0 24 24"><path d="M21.7 6.3a5.5 5.5 0 0 1-7.3 6.6l-7 7a2.1 2.1 0 0 1-3-3l7-7a5.5 5.5 0 0 1 6.6-7.3l-3.3 3.3.6 2.8 2.8.6z"/></svg>',
    gauge: '<svg viewBox="0 0 24 24"><path d="M12 4a9 9 0 0 0-9 9c0 2 .7 3.9 1.8 5.4h14.4A9 9 0 0 0 12 4zm4.6 4.8-3.3 5.1a1.8 1.8 0 1 1-2.6-1.7z"/></svg>',
    factory: '<svg viewBox="0 0 24 24"><path d="M2 21V10l6 3V10l6 3V4h3v17zM19 21V2h3v19z"/></svg>',
    stop: '<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>',
    musicOn: '<svg viewBox="0 0 24 24"><path d="M3.5 9h4l5-4v14l-5-4h-4z"/><path d="M15.5 8.5a4.5 4.5 0 0 1 0 7M18.3 5.8a8.3 8.3 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    musicOff: '<svg viewBox="0 0 24 24"><path d="M3.5 9h4l5-4v14l-5-4h-4z"/><path d="m15.8 9.3 5.4 5.4m0-5.4-5.4 5.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    globe: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-3a15.7 15.7 0 0 0-1.4-4 8 8 0 0 1 4.4 4zM12 4.1c.8 1.1 1.5 2.4 1.9 3.9h-3.8c.4-1.5 1.1-2.8 1.9-3.9zM4.3 14a8 8 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4zm.8 2h3a15.7 15.7 0 0 0 1.4 4 8 8 0 0 1-4.4-4zm3-8h-3a8 8 0 0 1 4.4-4A15.7 15.7 0 0 0 8.1 8zM12 19.9c-.8-1.1-1.5-2.4-1.9-3.9h3.8c-.4 1.5-1.1 2.8-1.9 3.9zM14.3 14H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4zm.3 6a15.7 15.7 0 0 0 1.4-4h3a8 8 0 0 1-4.4 4zm1.7-6a16.5 16.5 0 0 0 0-4h3.4a8 8 0 0 1 0 4z"/></svg>',
    leak: '<svg viewBox="0 0 24 24"><path d="M7 19a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 17.6 8.6 4.2 4.2 0 0 1 17 19z"/><path d="M8 6c0-1.5 1.5-1.5 1.5-3M12 6c0-1.5 1.5-1.5 1.5-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    toxic: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2.5c-4.7 0-8.3 3.2-8.3 7.4 0 2.4 1.2 4.4 3.1 5.8V19c0 .9.7 1.6 1.6 1.6h7.2c.9 0 1.6-.7 1.6-1.6v-3.3c1.9-1.4 3.1-3.4 3.1-5.8 0-4.2-3.6-7.4-8.3-7.4zM8.6 13.4a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4zm6.8 0a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4zM10.6 16l1.4-2.2 1.4 2.2z"/></svg>',
    heat: '<svg viewBox="0 0 24 24"><path d="M12.5 14.5V5a2 2 0 1 0-4 0v9.5a4 4 0 1 0 4 0z"/><path d="M16 5c1 1 1 2 0 3s-1 2 0 3M19.5 5c1 1 1 2 0 3s-1 2 0 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    vibration: '<svg viewBox="0 0 24 24"><path d="M2 12h3l2-6 3 12 3-15 3 15 2-6h4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    spill: '<svg viewBox="0 0 24 24"><path d="M12 2.5s-5.5 6.3-5.5 10a5.5 5.5 0 0 0 11 0c0-3.7-5.5-10-5.5-10z"/><ellipse cx="12" cy="21.5" rx="9" ry="1.6"/></svg>',
    explosion: '<svg viewBox="0 0 24 24"><path d="m12 1.5 2.2 5.3 4.9-3.1-1.9 5.5 5.3 1.9-5.3 2 2.3 5.4-5.4-2.6L12 22l-2.1-6.1-5.4 2.6 2.3-5.4-5.3-2 5.3-1.9-1.9-5.5 4.9 3.1z"/></svg>',
    minimize: '<svg viewBox="0 0 24 24"><path d="M5 18h14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    restore: '<svg viewBox="0 0 24 24"><path d="M12 19V7m-6 6 6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    smoke: '<svg viewBox="0 0 24 24"><path d="M6.5 19.5a4 4 0 0 1-.4-8 5.6 5.6 0 0 1 10.7-1.6 3.9 3.9 0 0 1 .2 7.8z"/><path d="M8.5 6.5c1-1.2 2.6-1.2 3.6 0M13.5 4.8c.9-1 2.3-1 3.2 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    arc: '<svg viewBox="0 0 24 24"><path d="M13.5 1.5 4.5 13.5h6l-1.5 9 9.5-13h-6.2z"/></svg>',
    dust: '<svg viewBox="0 0 24 24"><circle cx="6" cy="14" r="2.6"/><circle cx="11.5" cy="10.5" r="3.2"/><circle cx="17.5" cy="13" r="2.8"/><circle cx="9" cy="18.2" r="1.7"/><circle cx="14.6" cy="18.4" r="1.9"/><circle cx="19.5" cy="7.5" r="1.3"/><circle cx="4" cy="8.5" r="1.2"/><circle cx="15" cy="5" r="1"/></svg>',
    drop: '<svg viewBox="0 0 24 24"><path d="M12 2.5s-6.5 7.4-6.5 12a6.5 6.5 0 0 0 13 0c0-4.6-6.5-12-6.5-12z"/></svg>',
    flask: '<svg viewBox="0 0 24 24"><path d="M9 2.5h6M10 2.5v6.2L4.6 18.4A2.2 2.2 0 0 0 6.5 21.5h11a2.2 2.2 0 0 0 1.9-3.1L14 8.7V2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7.2 15h9.6l2 3.8a1.6 1.6 0 0 1-1.4 2.3H6.6a1.6 1.6 0 0 1-1.4-2.3z"/></svg>',
    leaf: '<svg viewBox="0 0 24 24"><path d="M20.5 3.5C11 3.5 4.5 8.5 4.5 15.6c0 1.4.3 2.6.8 3.6C7 13 11 9.5 16 7.5c-4.2 2.6-7.4 6.4-9 11.6 1 .9 2.5 1.4 4.2 1.4 6.4 0 9.3-6.5 9.3-17z"/></svg>',
    building: '<svg viewBox="0 0 24 24"><path d="M4 21.5V5.5L13 2.5v19zM14.5 21.5V9l5.5 2v10.5z"/><path d="M6.5 8h4M6.5 11.5h4M6.5 15h4M16.5 13h2M16.5 16.5h2" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>',
    bulb: '<svg viewBox="0 0 24 24"><path d="M12 2.5a6.5 6.5 0 0 0-3.9 11.7c.6.5.9 1.1.9 1.8v1h6v-1c0-.7.3-1.3.9-1.8A6.5 6.5 0 0 0 12 2.5z"/><path d="M9.5 19.5h5M10.5 22h3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  };

  /* ---------- ikon 3D halaman depan (gradien, bevel, kilap) ---------- */
  function gearPath(cx, cy, ro, ri, n) {
    const step = (Math.PI * 2) / n;
    const P = (r, a) => (cx + r * Math.cos(a)).toFixed(2) + ' ' + (cy + r * Math.sin(a)).toFixed(2);
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = i * step - Math.PI / 2;
      d += (i ? ' L' : 'M') + P(ri, a - step * 0.3) + ' L' + P(ro, a - step * 0.16) + ' A' + ro + ' ' + ro + ' 0 0 1 ' + P(ro, a + step * 0.16)
        + ' L' + P(ri, a + step * 0.3) + ' A' + ri + ' ' + ri + ' 0 0 1 ' + P(ri, a + step * 0.7);
    }
    return d + ' Z';
  }
  function starPts(cx, cy, ro, ri) {
    const pts = [];
    for (let i = 0; i < 10; i++) { const r = i % 2 ? ri : ro, a = -Math.PI / 2 + i * Math.PI / 5; pts.push((cx + r * Math.cos(a)).toFixed(2) + ',' + (cy + r * Math.sin(a)).toFixed(2)); }
    return pts.join(' ');
  }
  const gloss = id => `<radialGradient id="${id}" cx=".38" cy=".16" r=".62"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>`;
  const ICON3D = {
    play: () => `<svg class="icon3d i-play" viewBox="0 0 48 48" aria-hidden="true"><defs>
      <linearGradient id="i3p-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9be5ff"/><stop offset=".5" stop-color="#22a6e3"/><stop offset="1" stop-color="#0a557f"/></linearGradient>
      <linearGradient id="i3p-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfeaf8"/></linearGradient>${gloss('i3p-s')}</defs>
      <circle class="ping" cx="24" cy="23" r="20.5" fill="none" stroke="#8fe0ff" stroke-width="2"/>
      <ellipse cx="24" cy="45" rx="15" ry="2.4" fill="#04111a" opacity=".35"/>
      <circle cx="24" cy="23" r="20.5" fill="url(#i3p-b)" stroke="#08476b" stroke-width="1.2"/>
      <circle cx="24" cy="23" r="18.4" fill="none" stroke="#ffffff" stroke-opacity=".35"/>
      <path d="M19.5 14.8 33.6 23 19.5 31.2z" transform="translate(1.2 1.8)" fill="#063a57" opacity=".45" stroke="#063a57" stroke-width="3" stroke-linejoin="round"/>
      <path d="M19.5 14.8 33.6 23 19.5 31.2z" fill="url(#i3p-g)" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="20" cy="12.6" rx="13" ry="7.2" fill="url(#i3p-s)"/></svg>`,
    resume: () => `<svg class="icon3d i-resume" viewBox="0 0 48 48" aria-hidden="true"><defs>
      <linearGradient id="i3c-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f7c88"/><stop offset=".5" stop-color="#2c3843"/><stop offset="1" stop-color="#0e151b"/></linearGradient>
      <linearGradient id="i3c-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9f1ff"/><stop offset="1" stop-color="#29abe2"/></linearGradient>
      <filter id="i3c-f" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter>${gloss('i3c-s')}</defs>
      <ellipse cx="24" cy="45" rx="15" ry="2.4" fill="#04111a" opacity=".35"/>
      <circle cx="24" cy="23" r="20.5" fill="url(#i3c-b)" stroke="#05080b" stroke-width="1.2"/>
      <circle cx="24" cy="23" r="18.4" fill="none" stroke="#ffffff" stroke-opacity=".22"/>
      <g class="chev"><path d="M15.5 15l8.5 8-8.5 8M24.5 15l8.5 8-8.5 8" fill="none" stroke="#29abe2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#i3c-f)" opacity=".85"/>
      <path d="M15.5 15l8.5 8-8.5 8M24.5 15l8.5 8-8.5 8" fill="none" stroke="url(#i3c-g)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g>
      <ellipse cx="20" cy="12.6" rx="13" ry="7" fill="url(#i3c-s)" opacity=".55"/></svg>`,
    gear: () => `<svg class="icon3d i-gear" viewBox="0 0 48 48" aria-hidden="true"><defs>
      <linearGradient id="i3g-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#c8d1d9"/><stop offset="1" stop-color="#5a6672"/></linearGradient>
      <radialGradient id="i3g-h" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#d6f4ff"/><stop offset=".6" stop-color="#29abe2"/><stop offset="1" stop-color="#0a557f"/></radialGradient></defs>
      <ellipse cx="24" cy="45" rx="15" ry="2.4" fill="#04111a" opacity=".35"/>
      <g class="gear-rot"><path d="${gearPath(24, 24.8, 21, 16, 8)}" fill="#1d262e" opacity=".45"/>
      <path d="${gearPath(24, 23, 21, 16, 8)}" fill="url(#i3g-b)" stroke="#3b4651" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="24" cy="23" r="12.6" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="1.2"/>
      <circle cx="24" cy="23" r="11.2" fill="none" stroke="#5a6672" stroke-opacity=".55" stroke-width="1"/></g>
      <circle cx="24" cy="23" r="7.4" fill="url(#i3g-h)" stroke="#08476b" stroke-width="1.2"/>
      <circle cx="21.8" cy="20.8" r="2.4" fill="#ffffff" opacity=".75"/></svg>`,
    medal: () => `<svg class="icon3d i-medal" viewBox="0 0 48 48" aria-hidden="true"><defs>
      <linearGradient id="i3m-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd8fb"/><stop offset="1" stop-color="#1565a6"/></linearGradient>
      <linearGradient id="i3m-d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#c4ccd4"/><stop offset="1" stop-color="#5f6b77"/></linearGradient>
      <linearGradient id="i3m-i" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f9ba6"/><stop offset="1" stop-color="#eef2f5"/></linearGradient>
      <linearGradient id="i3m-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6ecff"/><stop offset="1" stop-color="#1e9bd7"/></linearGradient>${gloss('i3m-g')}</defs>
      <ellipse cx="24" cy="45.2" rx="13" ry="2.2" fill="#04111a" opacity=".32"/>
      <g class="medal-swing">
      <path d="M14.5 2.5h8.5l3.5 15.5-7.5 4.2z" fill="url(#i3m-r)" stroke="#0d4f80" stroke-width="1"/>
      <path d="M33.5 2.5H25l-3.5 15.5 7.5 4.2z" fill="url(#i3m-r)" stroke="#0d4f80" stroke-width="1"/>
      <path d="M23 2.5h2l-1 8z" fill="#0d4f80" opacity=".35"/>
      <circle cx="24" cy="30" r="13.4" fill="url(#i3m-d)" stroke="#4b5661" stroke-width="1.2"/>
      <circle cx="24" cy="30" r="10.2" fill="url(#i3m-i)" stroke="#ffffff" stroke-opacity=".7"/>
      <polygon points="${starPts(24.8, 31.2, 7.2, 3)}" fill="#0b4f75" opacity=".35"/>
      <polygon points="${starPts(24, 30.2, 7.2, 3)}" fill="url(#i3m-s)" stroke="#0b5a86" stroke-width=".8" stroke-linejoin="round"/>
      <ellipse cx="20.5" cy="22.5" rx="8.5" ry="4.6" fill="url(#i3m-g)" opacity=".85"/></g></svg>`,
    speaker: on => `<svg class="icon3d i-speaker" viewBox="0 0 48 48" aria-hidden="true"><defs>
      <linearGradient id="i3s-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#cfd6dd"/><stop offset="1" stop-color="#7f8b96"/></linearGradient>${gloss('i3s-g')}</defs>
      <circle cx="24" cy="24" r="21" fill="url(#i3s-b)" stroke="#6b7783" stroke-width="1.2"/>
      <circle cx="24" cy="24" r="19" fill="none" stroke="#ffffff" stroke-opacity=".7"/>
      <path d="M12.5 20h5l6.5-5.5v19l-6.5-5.5h-5z" fill="#26323d" stroke="#141c23" stroke-width="1" stroke-linejoin="round"/>
      ${on ? '<path d="M28.3 19.3a6.3 6.3 0 0 1 0 9.4M31.8 15.8a11.2 11.2 0 0 1 0 16.4" fill="none" stroke="#1e9bd7" stroke-width="2.8" stroke-linecap="round"/>'
           : '<path d="m28.6 20.2 7.6 7.6m0-7.6-7.6 7.6" fill="none" stroke="#5d6b78" stroke-width="2.8" stroke-linecap="round"/>'}
      <ellipse cx="20" cy="13" rx="13" ry="6.6" fill="url(#i3s-g)" opacity=".8"/></svg>`,
  };

  /* ---------- modal ---------- */
  function showModal(o) {
    closeModal();
    closePopover();
    const m = document.createElement('div');
    m.className = 'modal-wrap';
    m.innerHTML = `<div class="modal ${o.cls || ''}">
      ${o.title ? `<div class="modal-head"><h3>${o.title}</h3>${o.minimizable ? `<button class="modal-min" aria-label="Perkecil laporan" title="Perkecil untuk melihat P&amp;ID">${ICON.minimize}</button>` : ''}</div>` : ''}
      <div class="modal-body">${o.body || ''}</div>
      <div class="modal-foot">${(o.buttons || [{ label: 'Tutup', cls: 'btn3d primary' }]).map((b, i) => `<button class="${b.cls || 'btn3d primary'}" data-i="${i}">${b.label}</button>`).join('')}</div>
    </div>`;
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add('show'));
    on(m, '.modal-foot button', 'click', ev => {
      Sfx.click();
      const b = (o.buttons || [{}])[+ev.currentTarget.dataset.i];
      if (!b || !b.keep) closeModal();
      if (b && b.onClick) b.onClick();
    });
    if (o.minimizable) m.querySelector('.modal-min').addEventListener('click', () => minimizeModal(m, o.dockTitle || o.title));
    if (o.onMount) o.onMount(m);
    return m;
  }
  function minimizeModal(m, label) {
    Sfx.click();
    m.classList.add('minimized');
    document.body.classList.add('has-dock');
    const dock = document.createElement('div');
    dock.className = 'modal-dock';
    dock.setAttribute('role', 'status');
    dock.innerHTML = `<span class="dock-dot"></span><div><b>${label}</b><span>Isian tersimpan. Pelajari P&amp;ID, tren, dan peringatan, lalu lanjutkan.</span></div><button class="btn3d primary small">${ICON.restore}<span>Lanjutkan Mengisi</span></button>`;
    document.body.appendChild(dock);
    requestAnimationFrame(() => dock.classList.add('show'));
    dock.querySelector('button').addEventListener('click', () => {
      Sfx.click(); closePopover(); dock.remove();
      document.body.classList.remove('has-dock');
      m.classList.remove('minimized');
    });
  }
  function closeModal() {
    $$('.modal-wrap').forEach(n => n.remove());
    $$('.modal-dock').forEach(n => n.remove());
    document.body.classList.remove('has-dock');
  }

  /* ---------- pop-up informasi pada P&ID ---------- */
  let pop = null;
  function closePopover() {
    if (!pop) return;
    pop.el.remove();
    if (pop.eqId && pid) pid.highlight(pop.eqId, false);
    pop = null;
  }
  function openPopover(anchor, html, meta, opts) {
    closePopover();
    const o = opts || {};
    const area = $('#pid-area');
    if (!area || !anchor) return null;
    const el = document.createElement('div');
    el.className = 'pop' + (o.cls ? ' ' + o.cls : '');
    el.setAttribute('role', 'dialog');
    el.innerHTML = `<button class="pop-x" aria-label="Tutup">${ICON.x}</button><div class="pop-body">${html}</div>${o.foot || ''}<span class="pop-arrow" aria-hidden="true"></span>`;
    el.style.setProperty('--pop-max', Math.max(200, area.clientHeight - 16) + 'px');
    area.appendChild(el);
    placePopover(el, anchor, area);
    el.addEventListener('click', ev => ev.stopPropagation());
    el.querySelector('.pop-x').addEventListener('click', () => { Sfx.click(); closePopover(); });
    pop = Object.assign({ el }, meta || {});
    requestAnimationFrame(() => el.classList.add('show'));
    return el;
  }
  function placePopover(el, anchor, area) {
    const a = anchor.getBoundingClientRect(), r = area.getBoundingClientRect();
    const w = el.offsetWidth, h = el.offsetHeight, gap = 14, pad = 8;
    let side = 'right', left = a.right - r.left + gap, top;
    if (left + w > r.width - pad) { side = 'left'; left = a.left - r.left - w - gap; }
    if (left < pad) {
      side = 'below';
      left = Math.min(Math.max(pad, a.left - r.left + a.width / 2 - w / 2), r.width - w - pad);
      top = a.bottom - r.top + gap;
      if (top + h > r.height - pad) { side = 'above'; top = a.top - r.top - h - gap; }
      top = Math.max(pad, top);
      el.style.setProperty('--ax', Math.min(Math.max(16, a.left - r.left + a.width / 2 - left), w - 16) + 'px');
    } else {
      top = Math.min(Math.max(pad, a.top - r.top + a.height / 2 - h / 2), Math.max(pad, r.height - h - pad));
      el.style.setProperty('--ay', Math.min(Math.max(16, a.top - r.top + a.height / 2 - top), h - 16) + 'px');
    }
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    el.dataset.side = side;
  }
  function eqPopHTML(e, live) {
    return `<div class="pop-head"><b>${esc(e.id)}</b><span>${esc(e.name)}</span></div><p>${esc(e.desc)}</p>${live && e.vars ? `<div class="live-wrap" id="pop-live">${liveHTML(e)}</div>` : ''}`;
  }

  /* ---------- latar foto kilang (monokrom silver, redup) ---------- */
  function bgPhoto() { return '<div class="bg-photo" aria-hidden="true"></div>'; }

  /* ---------- partikel cahaya halaman depan (canvas) ---------- */
  function startParticles(canvas) {
    if (!canvas) return;
    const reduce = document.body.classList.contains('no-anim') || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (reduce) return;
    const ctx = canvas.getContext('2d');
    const sprite = (rgb, size) => {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d'), grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grd.addColorStop(0, `rgba(${rgb},1)`); grd.addColorStop(0.35, `rgba(${rgb},.55)`); grd.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = grd; g.fillRect(0, 0, size, size); return c;
    };
    const sprites = [sprite('143,220,247', 64), sprite('255,255,255', 64), sprite('41,171,226', 64)];
    let W = 0, H = 0, parts = [];
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const spawn = init => ({ x: Math.random() * W, y: init ? Math.random() * H : H + 20, r: 2 + Math.random() * 6, vy: 0.12 + Math.random() * 0.42, vx: (Math.random() - 0.5) * 0.12, a: 0.18 + Math.random() * 0.45, ph: Math.random() * Math.PI * 2, s: sprites[Math.random() < 0.55 ? 0 : Math.random() < 0.5 ? 1 : 2] });
    resize();
    parts = Array.from({ length: Math.round(Math.min(80, Math.max(30, (W * H) / 20000))) }, () => spawn(true));
    const step = () => {
      if (!canvas.isConnected) return;
      if (canvas.clientWidth !== W || canvas.clientHeight !== H) resize();
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of parts) {
        p.y -= p.vy; p.ph += 0.02; p.x += p.vx + Math.sin(p.ph) * 0.15;
        if (p.y < -20) Object.assign(p, spawn(false));
        ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(p.ph * 1.7));
        const d = p.r * 4; ctx.drawImage(p.s, p.x - d / 2, p.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- musik latar ---------- */
  function musicIcon() { return cfg.music ? ICON.musicOn : ICON.musicOff; }
  function refreshMusicButtons() {
    $$('[data-music]').forEach(b => {
      b.innerHTML = b.classList.contains('music-toggle') ? ICON3D.speaker(cfg.music) : musicIcon();
      b.setAttribute('aria-pressed', cfg.music ? 'true' : 'false');
      b.title = cfg.music ? 'Matikan musik latar' : 'Nyalakan musik latar';
    });
  }
  function toggleMusic() {
    cfg.music = !cfg.music;
    saveJSON(CFG_KEY, cfg);
    applyCfg();
    if (cfg.music) Music.unlock();
    showToast(cfg.music ? 'Musik latar dinyalakan.' : 'Musik latar dimatikan.');
  }

  /* ---------- MENU ---------- */
  function showMenu() {
    stopAll();
    const save = loadJSON(SAVE_KEY);
    const saveScn = save && SCENARIOS.find(s => s.id === save.scenarioId);
    const canContinue = saveScn && !save.finished;
    app.innerHTML = `<div class="screen menu">
      ${bgPhoto()}
      <canvas class="menu-particles" aria-hidden="true"></canvas>
      <div class="menu-rays" aria-hidden="true"></div>
      <button class="music-toggle" data-music aria-label="Musik latar">${ICON3D.speaker(cfg.music)}</button>
      <div class="menu-card">
        <div class="logo-wrap"><img class="logo-full" src="${BRAND.logo}" alt="PSM Simulator by Nusa Safety"></div>
        <p class="tagline">${esc(APP_INFO.tagline)}</p>
        <div class="menu-btns">
          <button class="btn3d primary big" data-act="new" style="--i:0">${ICON3D.play()}<span>New Game</span></button>
          <button class="btn3d dark big" data-act="continue" style="--i:1" ${canContinue ? '' : 'disabled'}>${ICON3D.resume()}<span>Continue</span>${canContinue ? `<small>${esc(saveScn.title)} · Tahap ${save.stage}</small>` : '<small>Belum ada permainan tersimpan</small>'}</button>
          <button class="btn3d silver big" data-act="config" style="--i:2">${ICON3D.gear()}<span>Configuration</span></button>
          <button class="btn3d silver big" data-act="credit" style="--i:3">${ICON3D.medal()}<span>Credit</span></button>
        </div>
      </div>
      <footer class="menu-foot">${esc(APP_INFO.name)} v${APP_INFO.version} · © ${esc(CREDITS.tahun)} ${esc(CREDITS.organisasi)}</footer>
    </div>`;
    startParticles($('.menu-particles'));
    refreshMusicButtons();
    on(app, '[data-act]', 'click', ev => {
      Sfx.click();
      const a = ev.currentTarget.dataset.act;
      if (a === 'new') showNewGame();
      else if (a === 'continue') continueGame();
      else if (a === 'config') showConfig();
      else if (a === 'credit') showCredits();
    });
  }

  /* ---------- PILIH SKENARIO ---------- */
  function showNewGame() {
    const hist = loadJSON(HIST_KEY) || {};
    const listOf = key => SCENARIOS.filter(x => x.sector === key).sort((p, q) => LEVELS.indexOf(p.level) - LEVELS.indexOf(q.level));
    const sectors = SECTORS.filter(x => listOf(x.key).length);
    if (scnFilter !== 'all' && !sectors.some(x => x.key === scnFilter)) scnFilter = 'all';
    const card = sc => `<div class="scn-card" data-id="${sc.id}" style="--accent:${sc.color}">
        <div class="scn-badge">${esc(sc.level)}</div>
        <div class="scn-icon">${scnIcon(sc.id)}</div>
        <h3>${esc(sc.title)}</h3>
        <p>${esc(sc.subtitle)}</p>
        <div class="scn-meta"><span>${esc(sc.area)}</span>${hist[sc.id] ? `<span class="best">Terbaik: ${hist[sc.id].total} (${hist[sc.id].grade})</span>` : ''}</div>
        <button class="btn3d primary">${ICON.play}<span>Mulai</span></button>
      </div>`;
    app.innerHTML = `<div class="screen sub">
      ${bgPhoto()}
      <div class="panel wide">
        <div class="panel-head"><h2>Pilih Skenario Proses</h2><button class="btn3d silver small" data-act="back">${ICON.home}<span>Menu</span></button></div>
        <p class="muted">Setiap skenario memuat P&amp;ID, simulasi proses, kejadian abnormal dengan peringatan lapangan, serta titik pemasangan barier dan program inspeksi. Skenario dikelompokkan menurut sektor industri. Mulailah dari tingkat Pemula bila baru mengenal keselamatan proses.</p>
        <div class="sector-tabs" role="tablist" aria-label="Filter sektor">
          <button class="chip-tab" data-sec="all" role="tab">Semua Sektor<b>${SCENARIOS.length}</b></button>
          ${sectors.map(x => `<button class="chip-tab" data-sec="${x.key}" role="tab">${ICON[SECTOR_ICON[x.key]] || ''}<span>${esc(x.name)}</span><b>${listOf(x.key).length}</b></button>`).join('')}
        </div>
        <div id="scn-list"></div>
      </div>
    </div>`;
    const pick = ev => {
      Sfx.start();
      const id = ev.currentTarget.closest('.scn-card').dataset.id;
      const existing = loadJSON(SAVE_KEY);
      const start = () => startScenario(SCENARIOS.find(x => x.id === id));
      if (existing && !existing.finished) {
        showModal({ title: 'Permainan tersimpan akan ditimpa', body: '<p>Ada permainan yang belum selesai. Memulai permainan baru akan menghapus progres tersebut. Lanjutkan?</p>',
          buttons: [{ label: 'Ya, mulai baru', cls: 'btn3d primary', onClick: start }, { label: 'Batal', cls: 'btn3d silver' }] });
      } else start();
    };
    const render = () => {
      $$('.chip-tab').forEach(t => { const act = t.dataset.sec === scnFilter; t.classList.toggle('active', act); t.setAttribute('aria-selected', act ? 'true' : 'false'); });
      const secs = scnFilter === 'all' ? sectors : sectors.filter(x => x.key === scnFilter);
      const box = $('#scn-list');
      box.innerHTML = secs.map(x => `<section class="scn-sector"><h3 class="sector-h"><span class="sector-ico">${ICON[SECTOR_ICON[x.key]] || ''}</span>${esc(x.name)}</h3><div class="scn-grid">${listOf(x.key).map(card).join('')}</div></section>`).join('');
      on(box, '.scn-card button', 'click', pick);
    };
    on(app, '[data-act=back]', 'click', () => { Sfx.click(); showMenu(); });
    on(app, '.chip-tab', 'click', ev => { Sfx.click(); scnFilter = ev.currentTarget.dataset.sec; render(); });
    render();
  }
  function scnIcon(id) {
    const steel = '<defs><linearGradient id="si-%" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#b9c3cc"/><stop offset="1" stop-color="#5d6874"/></linearGradient><linearGradient id="sv-%" x1="0" x2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#b9c3cc"/><stop offset="1" stop-color="#5d6874"/></linearGradient></defs>';
    if (id === 'separator') return `<svg viewBox="0 0 80 60">${steel.replace(/%/g, 'a')}<rect x="8" y="18" width="64" height="26" rx="13" fill="url(#si-a)" stroke="#2b3640" stroke-width="2"/><rect x="18" y="21" width="44" height="4" rx="2" fill="#fff" opacity=".8"/><rect x="16" y="37" width="48" height="3" fill="#29abe2"/><path d="M40 18V6M14 44v10M62 44v10" stroke="#2b3640" stroke-width="4" stroke-linecap="round"/></svg>`;
    const IC = {
      distilasi: k => `<rect x="14" y="3" width="20" height="54" rx="10" fill="url(#sv-${k})" stroke="#2b3640" stroke-width="2"/><path d="M18 16h12M18 24h12M18 32h12M18 40h12" stroke="#5d6874" stroke-width="1.5"/><path d="M24 3V1h26v9" fill="none" stroke="#2b3640" stroke-width="2.5"/><rect x="40" y="12" width="34" height="14" rx="7" fill="url(#si-${k})" stroke="#2b3640" stroke-width="2"/><rect x="45" y="21" width="24" height="3" fill="#29abe2"/><circle cx="58" cy="44" r="8" fill="url(#si-${k})" stroke="#2b3640" stroke-width="2"/>`,
      boiler: k => `<rect x="8" y="4" width="50" height="12" rx="6" fill="url(#si-${k})" stroke="#2b3640" stroke-width="2"/><rect x="12" y="18" width="42" height="38" rx="4" fill="url(#sv-${k})" stroke="#2b3640" stroke-width="2"/><rect x="18" y="26" width="30" height="24" rx="2" fill="#1d262e"/><path d="M26 49c-4-5 1-8 1-13 3 3 4 6 3 9 2-1 3-3 3-5 3 4 1 8-2 9z" fill="#ff9100"/><rect x="62" y="8" width="10" height="48" fill="url(#sv-${k})" stroke="#2b3640" stroke-width="2"/>`,
      trafo: k => `<path d="M8 22h6v28H8zM66 22h6v28h-6z" fill="url(#sv-${k})" stroke="#5d6874" stroke-width="1.2"/><rect x="16" y="20" width="48" height="34" rx="4" fill="url(#sv-${k})" stroke="#2b3640" stroke-width="2"/><path d="M24 20V6M34 20V6M44 20V6" stroke="#5d6874" stroke-width="5"/><path d="M20 10h8M30 10h8M40 10h8M20 15h8M30 15h8M40 15h8" stroke="#eef1f3" stroke-width="2.4"/><rect x="48" y="4" width="22" height="9" rx="4.5" fill="url(#si-${k})" stroke="#2b3640" stroke-width="1.5"/><path d="M38 31l-5 8h5l-3 8 8-11h-5l3-5z" fill="#29abe2"/>`,
      biogas: k => `<path d="M4 40h60l-8 14H12z" fill="#7a6a52" stroke="#2b3640" stroke-width="2"/><path d="M2 41C10 20 56 20 66 41z" fill="#26323d" stroke="#0b1015" stroke-width="2"/><path d="M14 33c8-8 26-9 36-3" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/><rect x="70" y="18" width="5" height="36" fill="url(#sv-${k})" stroke="#2b3640" stroke-width="1.5"/><path d="M72.5 4c4 5 3 9 0 12-3-3-4-7 0-12z" fill="#ff9100"/>`,
      bess: k => `<rect x="6" y="14" width="68" height="38" rx="3" fill="url(#si-${k})" stroke="#2b3640" stroke-width="2"/><rect x="11" y="20" width="40" height="26" rx="2" fill="#1d262e"/><path d="M14 24h7v8h-7zM24 24h7v8h-7zM34 24h7v8h-7zM14 35h7v8h-7zM24 35h7v8h-7zM34 35h7v8h-7z" fill="#5cc6ef"/><rect x="55" y="19" width="14" height="28" rx="2" fill="#e9eef2" stroke="#5d6874"/><path d="M66 2l-8 12h6l-3 9 9-13h-6z" fill="#29abe2"/>`,
      debu: k => `<path d="M8 6h28v32L26 54h-8L8 38z" fill="url(#sv-${k})" stroke="#2b3640" stroke-width="2"/><rect x="8" y="34" width="28" height="3" fill="#29abe2"/><circle cx="52" cy="26" r="9" fill="#d8bd8f"/><circle cx="63" cy="20" r="7" fill="#c9a46a"/><circle cx="62" cy="33" r="8" fill="#e0c89f"/><circle cx="72" cy="27" r="5" fill="#d8bd8f"/><circle cx="48" cy="38" r="4" fill="#c9a46a"/>`,
      amonia: k => `<circle cx="26" cy="32" r="18" fill="url(#si-${k})" stroke="#2b3640" stroke-width="2"/><path d="M16 26v12l20-4v-4z" fill="#2b3640"/><g stroke="#29abe2" stroke-width="3" stroke-linecap="round"><path d="M60 10v40M43 20l34 20M43 40l34-20"/><path d="M55 12l5 5 5-5M55 48l5-5 5 5"/></g>`,
      gedung: k => `<rect x="14" y="6" width="40" height="50" rx="2" fill="url(#sv-${k})" stroke="#2b3640" stroke-width="2"/><path d="M14 18h40M14 30h40M14 42h40" stroke="#5d6874" stroke-width="2"/><path d="M20 11h6M30 11h6M40 11h6M20 23h6M30 23h6M40 23h6M20 35h6M30 35h6M40 35h6" stroke="#5cc6ef" stroke-width="3"/><path d="M60 14v38" stroke="#ef5350" stroke-width="4"/><path d="M60 22h10M60 36h10" stroke="#ef5350" stroke-width="3"/><path d="M70 26l-3 4h6zM70 40l-3 4h6z" fill="#29abe2"/>`,
      amp: k => `<rect x="4" y="22" width="48" height="18" rx="9" fill="url(#si-${k})" stroke="#2b3640" stroke-width="2"/><path d="M14 20v22M40 20v22" stroke="#26323d" stroke-width="5"/><path d="M52 31c6-5 12-4 16 0-4 4-10 5-16 0z" fill="#ff9100"/><rect x="58" y="4" width="10" height="20" fill="url(#sv-${k})" stroke="#2b3640" stroke-width="1.5"/><path d="M6 50h60" stroke="#2b3640" stroke-width="3"/><circle cx="14" cy="46" r="4" fill="#26323d"/><circle cx="42" cy="46" r="4" fill="#26323d"/>`,
    };
    if (IC[id]) return `<svg viewBox="0 0 80 60">${steel.replace(/%/g, id)}${IC[id](id)}</svg>`;
    if (id === 'reactor') return `<svg viewBox="0 0 80 60">${steel.replace(/%/g, 'b')}<rect x="18" y="16" width="44" height="30" rx="12" fill="#5cc6ef" opacity=".55" stroke="#1572a8" stroke-width="2"/><rect x="22" y="6" width="36" height="48" rx="14" fill="url(#sv-b)" stroke="#2b3640" stroke-width="2"/><path d="M40 2v30M30 32h20" stroke="#2b3640" stroke-width="3" stroke-linecap="round"/></svg>`;
    return `<svg viewBox="0 0 80 60">${steel.replace(/%/g, 'c')}<rect x="6" y="14" width="56" height="26" rx="13" fill="url(#si-c)" stroke="#2b3640" stroke-width="2"/><rect x="14" y="34" width="40" height="3" fill="#29abe2"/><path d="M62 40v-18h8l6 8v10z" fill="#2b3640"/><path d="M64 26h5l4 5h-9z" fill="#8fdcf7"/><circle cx="18" cy="44" r="6" fill="#1d262e"/><circle cx="34" cy="44" r="6" fill="#1d262e"/><circle cx="68" cy="44" r="6" fill="#1d262e"/></svg>`;
  }

  /* ---------- KONFIGURASI ---------- */
  function showConfig() {
    app.innerHTML = `<div class="screen sub">
      ${bgPhoto()}
      <div class="panel">
        <div class="panel-head"><h2>Konfigurasi</h2><button class="btn3d silver small" data-act="back">${ICON.home}<span>Menu</span></button></div>
        <div class="cfg-row"><label for="cfg-name">Nama pemain</label><input type="text" id="cfg-name" maxlength="30" value="${esc(cfg.name)}" placeholder="Opsional, tampil di hasil"></div>
        <div class="cfg-row"><label>Efek suara</label><label class="switch"><input type="checkbox" id="cfg-sound" ${cfg.sound ? 'checked' : ''}><span></span></label></div>
        <div class="cfg-row"><label>Musik latar<small>${esc(CREDITS.musik)}, diputar berulang</small></label><label class="switch"><input type="checkbox" id="cfg-music" ${cfg.music ? 'checked' : ''}><span></span></label></div>
        <div class="cfg-row"><label for="cfg-mvol">Volume musik</label><div class="range-wrap"><input type="range" id="cfg-mvol" min="0" max="100" step="5" value="${cfg.musicVol}"><b id="cfg-mvol-val">${cfg.musicVol}%</b></div></div>
        <div class="cfg-row"><label>Animasi latar dan aliran</label><label class="switch"><input type="checkbox" id="cfg-anim" ${cfg.anim ? 'checked' : ''}><span></span></label></div>
        <div class="cfg-row"><label>Efek kilatan dan guncangan saat insiden<small>Matikan bila sensitif terhadap cahaya berkedip</small></label><label class="switch"><input type="checkbox" id="cfg-fx" ${cfg.fx ? 'checked' : ''}><span></span></label></div>
        <div class="cfg-row"><label>Petunjuk titik pemasangan dan penanda barier belum diuji</label><label class="switch"><input type="checkbox" id="cfg-hints" ${cfg.hints ? 'checked' : ''}><span></span></label></div>
        <div class="cfg-row"><label for="cfg-speed">Kecepatan simulasi</label><select id="cfg-speed"><option value="0.5" ${cfg.speed == 0.5 ? 'selected' : ''}>Lambat (0,5x)</option><option value="1" ${cfg.speed == 1 ? 'selected' : ''}>Normal (1x)</option><option value="2" ${cfg.speed == 2 ? 'selected' : ''}>Cepat (2x)</option></select></div>
        <div class="cfg-row"><label for="cfg-cur">Mata uang anggaran<small>Biaya perangkat dan program ditampilkan sebagai nilai indikatif</small></label><select id="cfg-cur"><option value="IDR" ${cfg.currency !== 'USD' ? 'selected' : ''}>Rupiah (Rp)</option><option value="USD" ${cfg.currency === 'USD' ? 'selected' : ''}>Dolar AS (USD)</option></select></div>
        <div class="cfg-row"><label for="cfg-rate">Kurs Rupiah per USD<small>1 satuan biaya setara USD ${num(COST_MODEL.usdPerUnit)} (pengadaan, pemasangan, rekayasa)</small></label><input type="number" id="cfg-rate" min="5000" max="50000" step="50" value="${cfg.rate || COST_MODEL.idrPerUsd}"></div>
        <div class="cfg-row"><label for="cfg-diff">Tingkat kesulitan</label><select id="cfg-diff"><option value="mudah" ${cfg.difficulty === 'mudah' ? 'selected' : ''}>Mudah (anggaran +3, petunjuk lengkap)</option><option value="normal" ${cfg.difficulty === 'normal' ? 'selected' : ''}>Normal</option><option value="sulit" ${cfg.difficulty === 'sulit' ? 'selected' : ''}>Sulit (anggaran -2, tanpa penjelasan kuis)</option></select></div>
        <div class="cfg-actions">
          <button class="btn3d primary" data-act="save">${ICON.check}<span>Simpan</span></button>
          <button class="btn3d red" data-act="reset">${ICON.x}<span>Hapus Semua Data</span></button>
        </div>
      </div></div>`;
    const preview = () => { Music.configure($('#cfg-music').checked, +$('#cfg-mvol').value / 100); if ($('#cfg-music').checked) Music.unlock(); };
    $('#cfg-mvol').addEventListener('input', ev => { $('#cfg-mvol-val').textContent = ev.target.value + '%'; preview(); });
    $('#cfg-music').addEventListener('change', preview);
    on(app, '[data-act=back]', 'click', () => { Sfx.click(); applyCfg(); showMenu(); });
    on(app, '[data-act=save]', 'click', () => {
      cfg.name = $('#cfg-name').value.trim();
      cfg.music = $('#cfg-music').checked; cfg.musicVol = +$('#cfg-mvol').value;
      cfg.sound = $('#cfg-sound').checked; cfg.anim = $('#cfg-anim').checked; cfg.fx = $('#cfg-fx').checked; cfg.hints = $('#cfg-hints').checked;
      cfg.speed = parseFloat($('#cfg-speed').value); cfg.difficulty = $('#cfg-diff').value;
      cfg.currency = $('#cfg-cur').value === 'USD' ? 'USD' : 'IDR';
      const rate = parseFloat($('#cfg-rate').value);
      cfg.rate = rate >= 5000 && rate <= 50000 ? Math.round(rate) : COST_MODEL.idrPerUsd;
      saveJSON(CFG_KEY, cfg); applyCfg(); Sfx.success();
      showModal({ title: 'Tersimpan', body: '<p>Konfigurasi telah disimpan.</p>', buttons: [{ label: 'OK', cls: 'btn3d primary', onClick: showMenu }] });
    });
    on(app, '[data-act=reset]', 'click', () => {
      showModal({ title: 'Hapus semua data?', body: '<p>Progres permainan, riwayat skor, dan konfigurasi akan dihapus dari peramban ini.</p>',
        buttons: [{ label: 'Hapus', cls: 'btn3d red', onClick: () => { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(HIST_KEY); localStorage.removeItem(CFG_KEY); cfg = Object.assign({}, DEFAULT_CFG); applyCfg(); showMenu(); } }, { label: 'Batal', cls: 'btn3d silver' }] });
    });
  }
  function applyCfg() {
    Sfx.setEnabled(cfg.sound);
    Music.configure(cfg.music, cfg.musicVol / 100);
    refreshMusicButtons();
    document.body.classList.toggle('no-anim', !cfg.anim);
    document.body.classList.toggle('no-fx', !fxOn());
  }

  /* ---------- CREDIT ---------- */
  function showCredits() {
    const C = COMPANY;
    app.innerHTML = `<div class="screen sub">
      ${bgPhoto()}
      <div class="panel">
        <div class="panel-head"><h2>Credit</h2><button class="btn3d silver small" data-act="back">${ICON.home}<span>Menu</span></button></div>
        <div class="credit-hero"><img src="${BRAND.logo}" alt="PSM Simulator by Nusa Safety"><p>${esc(APP_INFO.tagline)} · versi ${esc(APP_INFO.version)}</p></div>
        <section class="company">
          <span class="lbl">Dipersembahkan oleh</span>
          <img class="company-logo" src="${BRAND.company}" alt="${esc(C.brand)}">
          <h3>${esc(C.legalName)}</h3>
          <div class="taglines">${C.taglines.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
        </section>
        <h4>Profil Perusahaan</h4>
        ${C.profile.map(p => `<p>${esc(p)}</p>`).join('')}
        <h4>Layanan</h4>
        <ul class="svc-grid">${C.services.map(v => `<li><span class="svc-ico">${ICON[v.icon]}</span><div><b>${esc(v.name)}</b><small class="svc-desc">${esc(v.desc)}</small></div></li>`).join('')}</ul>
        <div class="company-links"><a class="btn3d primary small" href="${C.website}" target="_blank" rel="noopener noreferrer">${ICON.globe}<span>Kunjungi ${esc(C.websiteLabel)}</span></a><span class="muted small">Sumber profil: ${esc(C.source)}.</span></div>
        <h4>Kerangka konsep</h4>
        <p class="muted">Alur permainan mengikuti model lapisan proteksi dan diagram bow-tie: memahami kondisi normal (BPCS), mengenali deviasi dan tanda-tanda lapangan (HAZOP), memasang barier pencegahan dan mitigasi, serta menjaga keandalan barier melalui inspeksi, pengujian, dan perawatan (elemen integritas aset pada Risk Based Process Safety). Tampilan mengikuti filosofi HMI berperforma tinggi: warna mencolok hanya untuk kondisi abnormal.</p>
        <h4>Referensi</h4>
        <ol class="refs">${CREDITS.referensi.map(r => `<li>${esc(r)}</li>`).join('')}</ol>
        <p class="muted small">Musik latar: ${esc(CREDITS.musik)}.</p>
        <p class="muted small">Skenario, nilai parameter, nilai PFD, dan tata letak P&amp;ID disederhanakan untuk tujuan pelatihan dan bukan rancangan rekayasa yang dapat dipakai langsung di lapangan.</p>
        <p class="credit-foot">© ${esc(CREDITS.tahun)} ${esc(C.legalName)} · ${esc(C.brand)}</p>
      </div></div>`;
    on(app, '[data-act=back]', 'click', () => { Sfx.click(); showMenu(); });
  }

  /* ---------- SESI PERMAINAN ---------- */
  function newSession(s) {
    return {
      scenarioId: s.id, stage: 1, scores: {}, read: [], quizIdx: 0, quizCorrect: 0,
      eventIdx: 0, eventResults: [], placements: { 3: {}, 4: {} }, itpm: { 3: {}, 4: {} }, eqItpm: { 3: {} },
      evalDone: { 3: false, 4: false }, evalRows: {}, finished: false, startedAt: Date.now(),
    };
  }
  function migrate(sv) {
    sv.placements = sv.placements || { 3: {}, 4: {} };
    sv.itpm = sv.itpm || { 3: {}, 4: {} };
    sv.eqItpm = sv.eqItpm || { 3: {} };
    sv.evalDone = sv.evalDone || { 3: false, 4: false };
    sv.evalRows = sv.evalRows || {};
    sv.read = sv.read || [];
    sv.scores = sv.scores || {};
    return sv;
  }
  function save() { if (S) saveJSON(SAVE_KEY, S); }
  function startScenario(s) {
    scn = s; S = newSession(s); save(); showPlay(); stageIntro();
  }
  function continueGame() {
    const sv = loadJSON(SAVE_KEY);
    if (!sv) return;
    scn = SCENARIOS.find(s => s.id === sv.scenarioId);
    if (!scn) return;
    S = migrate(sv);
    S.quizIdx = 0; S.quizCorrect = 0;
    if (S.stage === 2) { S.eventIdx = 0; S.eventResults = []; }
    if (S.stage > 4) { showResult(); return; }
    showPlay(); stageIntro();
  }
  function stopAll() {
    clearTimers();
    ev2 = null;
    if (sim) { sim.stop(); sim = null; }
    if (chartRaf) { cancelAnimationFrame(chartRaf); chartRaf = 0; }
    closePopover();
    chart = null; pid = null; tool = null; closeModal();
    $$('.fx-banner-wrap').forEach(n => n.remove());
  }

  function budgetFor(stage) {
    const b = scn.budget[stage];
    return b + (cfg.difficulty === 'mudah' ? 3 : cfg.difficulty === 'sulit' ? -2 : 0);
  }

  function showPlay() {
    stopAll();
    app.innerHTML = `<div class="screen play">
      <header class="topbar">
        <div class="brand"><span class="emblem-plate"><img src="${BRAND.emblem}" alt=""></span><div><b>PSM Simulator</b><small>${esc(scn.title)}</small></div></div>
        <ol class="stepper">${STAGES.map(st => `<li class="step" data-stage="${st.n}"><span class="ico">${ICON[st.icon]}</span><span class="lbl">${st.n}. ${esc(st.short)}</span><span class="sc"></span></li>`).join('')}</ol>
        <div class="top-actions"><button class="btn3d silver small icon-only" data-music aria-label="Musik latar">${musicIcon()}</button><button class="btn3d silver small" data-act="menu">${ICON.home}<span>Menu</span></button></div>
      </header>
      <main class="play-main">
        <section class="pid-area" id="pid-area">
          <div class="pid-wrap" id="pid"></div>
          <div class="fx-banner-wrap" id="fx-banners" aria-live="assertive"></div>
          <div class="trend-wrap" id="trend-wrap"><canvas id="trend"></canvas></div>
        </section>
        <aside class="side" id="side"></aside>
      </main>
    </div>`;
    on(app, '[data-act=menu]', 'click', () => {
      Sfx.click();
      showModal({ title: 'Kembali ke menu?', body: '<p>Progres tersimpan pada awal tahap yang sedang berjalan. Anda dapat melanjutkan melalui tombol Continue.</p>',
        buttons: [{ label: 'Ke Menu', cls: 'btn3d primary', onClick: () => { save(); showMenu(); } }, { label: 'Batal', cls: 'btn3d silver' }] });
    });
    pid = PID.render($('#pid'), scn, {
      onEquipment: e => onEquipmentClick(e),
      onHotspot: h => onHotspotClick(h),
      onDevice: (h, devId) => onDeviceClick(h, devId),
      onBackground: () => closePopover(),
    });
    sim = new Simulator(scn, { speed: cfg.speed });
    sim.onTick(onSimTick);
    chart = new TrendChart($('#trend'), sim, scn.trendVars);
    updateStepper();
    renderPlant();
  }
  function updateStepper() {
    $$('.step').forEach(li => {
      const n = +li.dataset.stage;
      li.classList.toggle('active', n === S.stage);
      li.classList.toggle('done', S.scores[n] !== undefined);
      li.querySelector('.sc').textContent = S.scores[n] !== undefined ? S.scores[n] : '';
    });
  }
  function renderPlant() {
    Object.keys(scn.vars).forEach(id => pid.setReadout(id, sim.format(id), sim.status(id)));
    scn.equipment.forEach(e => {
      if (e.level) pid.setLevel(e.id, sim.vars[e.level] / 100);
      if (e.flameVar) pid.setFlame(e.id, sim.vars[e.flameVar] / scn.vars[e.flameVar].normal);
    });
  }
  function onSimTick(s) {
    renderPlant();
    const alarmNodes = {};
    Object.keys(scn.vars).forEach(id => { if (s.status(id) !== 'normal') alarmNodes[scn.vars[id].node] = true; });
    scn.equipment.forEach(e => pid.alarmNode(e.id, !!alarmNodes[e.id]));
    if (pop && pop.eqId && pop.live) {
      const lw = $('#pop-live');
      const e = scn.equipment.find(x => x.id === pop.eqId);
      if (lw && e && e.vars) lw.innerHTML = liveHTML(e);
    }
    updateProdStats();
    if (S && S.stage === 2) handleEvent(s);
  }
  function liveHTML(e) { return e.vars.map(v => `<div class="live ${sim.status(v)}"><span>${esc(scn.vars[v].label)}</span><b>${sim.format(v)}</b></div>`).join(''); }
  function chartLoop() {
    if (chart) chart.draw();
    chartRaf = requestAnimationFrame(chartLoop);
  }
  function runSim(run) {
    if (!sim) return;
    if (run) { sim.start(); pid.setFlow(true); if (!chartRaf) chartLoop(); }
    else { sim.stop(); pid.setFlow(false); }
  }

  /* ---------- statistik produksi ---------- */
  function prodStatsHTML() {
    const p = scn.production;
    return `<div class="prod-stats">
      <div><span>Jam operasi</span><b id="ps-time">08:00</b></div>
      <div><span>${esc(p.label)}</span><b id="ps-val">0 ${esc(p.unit)}</b></div>
      <div><span>Status</span><b id="ps-status" class="st-idle">Siap</b></div>
    </div>`;
  }
  function updateProdStats() {
    const t = $('#ps-time'); if (!t || !sim) return;
    t.textContent = sim.clock();
    const p = scn.production;
    const v = $('#ps-val'); if (v) v.textContent = num(sim.prod, p.dec !== undefined ? p.dec : (p.unit === 'm³' ? 1 : 0)) + ' ' + p.unit;
  }
  function setStatus(txt, cls) {
    const st = $('#ps-status'); if (!st) return;
    st.textContent = txt; st.className = 'st-' + cls;
  }

  function stageIntro() {
    const st = STAGES[S.stage - 1];
    renderStage();
    showModal({ title: st.title, cls: 'intro', body: `<div class="intro-ico">${ICON[st.icon]}</div><p>${esc(st.desc)}</p>${stageTips(S.stage)}`,
      buttons: [{ label: 'Mulai Tahap', cls: 'btn3d primary', onClick: () => { Sfx.start(); } }] });
  }
  function stageTips(n) {
    const tips = {
      1: ['Klik setiap peralatan pada P&ID atau daftar di panel kanan untuk membaca fungsinya.', `Tekan Jalankan ${opName()} dan ubah set point untuk melihat respons proses serta isi cairan di bejana.`, 'Setelah semua peralatan dipelajari, kerjakan kuis pemahaman proses.'],
      2: [`Tekan Jalankan ${opName()}, lalu amati tren, pembacaan, dan isi bejana di P&ID.`, 'Saat terjadi kegagalan, peringatan lapangan muncul bertahap: getaran, kebocoran gas, gas beracun, panas berlebih, hingga ledakan.', 'Laporkan sedini mungkin. Laporan sebelum peringatan kritis mendapat bonus, sedangkan laporan setelah insiden terjadi mendapat penalti.'],
      3: ['Klik titik pemasangan (+) pada P&ID untuk memilih perangkat barier langsung dari pop-up. Cara lain, pilih perangkat di Kotak Alat lalu klik titiknya.', 'Setelah perangkat terpasang, pop-up perangkat menampilkan program inspeksi dan pengujian yang dapat langsung diterapkan. Klik bejana, tangki, atau mesin berputar untuk menerapkan program inspeksi peralatan.', 'Barier tanpa pengujian berkala tidak dapat diandalkan. Pantau indikator keandalan dan sisa anggaran, yang ditampilkan dalam mata uang pilihan Anda di Configuration.', 'Klik perangkat atau peralatan untuk melihat detail, mengganti, atau melepasnya.'],
      4: ['Pikirkan apa yang terjadi bila pencegahan gagal: deteksi, isolasi, proteksi kebakaran, dan tanggap darurat.', 'Perhatikan sifat bahan, karena tidak semua media pemadam cocok untuk semua bahan.', 'Klik titik (+) untuk memilih perangkat mitigasi, lalu lengkapi dengan program uji yang sesuai, misalnya bump test detektor, uji sistem pemadam, uji fungsi ESD, dan latihan tanggap darurat.'],
    };
    return `<ul class="tips">${tips[n].map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  }

  function resetPlant() {
    clearTimers();
    closePopover();
    runSim(false);
    sim.reset(); sim.clearEvent();
    pid.clearFx();
    $('#fx-banners').innerHTML = '';
    $('#pid').classList.remove('boom');
    scn.equipment.forEach(e => pid.alarmNode(e.id, false));
    renderPlant();
    if (chart) chart.draw();
  }

  function renderStage() {
    resetPlant();
    tool = null; ev2 = null; toolTab = 'dev';
    scn.equipment.forEach(x => pid.highlight(x.id, false));
    updateStepper();
    $('#trend-wrap').style.display = S.stage <= 2 ? '' : 'none';
    pid.showReadouts(S.stage <= 2);
    pid.setTargets(null);
    pid.setEqBadges(S.stage === 3 ? S.eqItpm[3] : {}, S.stage);
    pid.showHotspots(S.stage >= 3 ? S.stage : 0, S.placements[S.stage], S.itpm[S.stage], { flagUntested: cfg.hints });
    $('#pid').classList.remove('placing');
    if (S.stage === 1) renderStage1();
    else if (S.stage === 2) renderStage2();
    else renderStageBarrier(S.stage);
  }

  /* ---------- TAHAP 1 ---------- */
  function requiredEq() { return scn.equipment.filter(e => !['muster', 'building'].includes(e.type)); }
  function renderStage1() {
    const req = requiredEq();
    const side = $('#side');
    side.innerHTML = `<div class="side-head"><h2>${ICON.book}<span>Tahap 1: Kondisi Normal</span></h2></div>
      <div class="card"><h4>Gambaran Proses</h4>${scn.overview.map(p => `<p>${esc(p)}</p>`).join('')}</div>
      <div class="card"><h4>Proses Produksi</h4>
        <button class="btn3d primary wide" id="btn-run">${ICON.play}<span>Jalankan ${esc(opName())}</span></button>
        ${prodStatsHTML()}
        <p class="muted small">Ubah set point dan amati tren, pembacaan, serta isi cairan di bejana.</p>
        <div class="sliders">${scn.controls.map(c => `<label class="slider"><span>${esc(c.label)} <b id="val-${c.id}">${String(c.def).replace('.', ',')} ${esc(c.unit)}</b></span><input type="range" data-ctl="${c.id}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.def}"></label>`).join('')}</div>
      </div>
      <div class="card"><h4>Peralatan <span class="pill" id="read-count">0/${req.length}</span></h4>
        <p class="muted small">Klik peralatan di P&amp;ID atau di daftar ini untuk membuka pop-up informasi.</p>
        <ul class="eq-list">${req.map(e => `<li data-id="${e.id}"><span class="dot"></span><b>${esc(e.id)}</b><span>${esc(e.name)}</span></li>`).join('')}</ul>
      </div>
      <div class="card"><h4>Legenda Jalur</h4><ul class="legend">${PID.fluidsIn(scn).map(f => `<li><span class="sw" style="--c:${f.c}"></span>${esc(f.name)}</li>`).join('')}<li><span class="sw ro"></span>Pembacaan DCS (kuning/merah saat alarm)</li></ul></div>
      <div class="card action"><button class="btn3d dark wide" id="btn-quiz" disabled>${ICON.check}<span>Mulai Kuis Pemahaman</span></button><p class="muted small" id="quiz-hint">Pelajari semua peralatan terlebih dahulu.</p></div>`;
    S.read.forEach(id => markRead(id, true));
    on(side, '.eq-list li', 'click', ev => { const e = scn.equipment.find(x => x.id === ev.currentTarget.dataset.id); onEquipmentClick(e); });
    $('#btn-run').addEventListener('click', () => {
      Sfx.click();
      const running = sim.running;
      runSim(!running);
      setStatus(running ? 'Dijeda' : 'Normal', running ? 'idle' : 'ok');
      $('#btn-run').innerHTML = running ? `${ICON.play}<span>Lanjutkan ${esc(opName())}</span>` : `${ICON.pause}<span>Jeda Proses</span>`;
    });
    on(side, 'input[type=range]', 'input', ev => {
      const id = ev.currentTarget.dataset.ctl; const c = scn.controls.find(x => x.id === id);
      sim.setControl(id, parseFloat(ev.currentTarget.value));
      $('#val-' + id).textContent = ev.currentTarget.value.replace('.', ',') + ' ' + c.unit;
    });
    $('#btn-quiz').addEventListener('click', () => { Sfx.click(); runSim(false); startQuiz(); });
    updateReadCount();
  }
  function markRead(id, silent) {
    if (!S.read.includes(id)) S.read.push(id);
    const li = $(`.eq-list li[data-id="${id}"]`); if (li) li.classList.add('read');
    pid.markRead(id);
    if (!silent) save();
  }
  function updateReadCount() {
    const req = requiredEq();
    const n = req.filter(e => S.read.includes(e.id)).length;
    const rc = $('#read-count'); if (rc) rc.textContent = `${n}/${req.length}`;
    const b = $('#btn-quiz');
    if (b) { b.disabled = n < req.length; const hint = $('#quiz-hint'); if (hint) hint.textContent = n < req.length ? `Pelajari ${req.length - n} peralatan lagi.` : 'Semua peralatan telah dipelajari. Silakan mulai kuis.'; }
  }
  function onEquipmentClick(e) {
    if (S.stage >= 3) { onEquipmentBarrier(e); return; }
    Sfx.click();
    if (S.stage === 1) { markRead(e.id); updateReadCount(); }
    if (pop && pop.eqId === e.id) { closePopover(); return; }
    scn.equipment.forEach(x => pid.highlight(x.id, false));
    pid.highlight(e.id, true);
    openPopover(pid.eqNode(e.id), eqPopHTML(e, true), { eqId: e.id, live: true });
  }
  function startQuiz() { S.quizIdx = 0; S.quizCorrect = 0; nextQuiz(); }
  function nextQuiz() {
    if (S.quizIdx >= scn.quiz.length) {
      const score = Math.round(S.quizCorrect / scn.quiz.length * 100);
      finishStage(1, score, `<p>Anda menjawab benar <b>${S.quizCorrect}</b> dari <b>${scn.quiz.length}</b> pertanyaan.</p>`);
      return;
    }
    const q = scn.quiz[S.quizIdx];
    showModal({ title: `Kuis ${S.quizIdx + 1} / ${scn.quiz.length}`, cls: 'quiz',
      body: `<p class="q">${esc(q.q)}</p><div class="opts">${q.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="letter">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`).join('')}</div><div class="fb" id="quiz-fb"></div>`,
      buttons: [{ label: 'Lanjut', cls: 'btn3d primary', keep: true, onClick: () => { if ($('#quiz-fb').dataset.done) { closeModal(); nextQuiz(); } else showToast('Pilih salah satu jawaban terlebih dahulu.'); } }],
      onMount: m => {
        on(m, '.opt', 'click', ev => {
          if ($('#quiz-fb').dataset.done) return;
          const i = +ev.currentTarget.dataset.i;
          const ok = i === q.ans;
          if (ok) { S.quizCorrect++; Sfx.success(); } else Sfx.fail();
          $$('.opt', m).forEach(b => { b.disabled = true; if (+b.dataset.i === q.ans) b.classList.add('correct'); });
          if (!ok) ev.currentTarget.classList.add('wrong');
          const fb = $('#quiz-fb'); fb.dataset.done = '1';
          fb.innerHTML = `<b class="${ok ? 'ok' : 'bad'}">${ok ? 'Benar.' : 'Kurang tepat.'}</b> ${cfg.difficulty === 'sulit' ? '' : esc(q.why)}`;
          S.quizIdx++;
        });
      } });
  }

  /* ---------- TAHAP 2: proses produksi dan peringatan lapangan ---------- */
  function renderStage2() {
    const side = $('#side');
    const n = scn.events.length;
    side.innerHTML = `<div class="side-head"><h2>${ICON.alert}<span>Tahap 2: Abnormalitas</span></h2></div>
      <div class="card"><h4>Kejadian <span class="pill" id="ev-count">${S.eventIdx}/${n}</span></h4>
        <p class="muted small">Setiap kali ${esc(opName().toLowerCase())} dijalankan, satu kegagalan akan muncul pada waktu yang tidak diketahui. Amati tren, pembacaan, dan peringatan lapangan, lalu laporkan secepatnya.</p>
        <div class="ev-track">${scn.events.map((e, i) => `<span class="ev-dot" data-i="${i}">${i + 1}</span>`).join('')}</div>
      </div>
      <div class="card prod-card">
        <button class="btn3d primary wide run-big" id="btn-run-prod">${ICON.factory}<span>Jalankan ${esc(opName())}</span></button>
        ${prodStatsHTML()}
        <div class="alarm-box" id="alarm-box"><span class="lamp"></span><span id="alarm-text">Proses belum berjalan</span></div>
        <button class="btn3d red wide" id="btn-report" disabled>${ICON.alert}<span>Hentikan &amp; Laporkan Abnormalitas</span></button>
      </div>
      <div class="card warn-card"><h4>Peringatan Lapangan <span class="pill warn" id="warn-count">0</span></h4>
        <ul class="warn-log" id="warn-log"><li class="empty">Belum ada peringatan. Proses berjalan normal.</li></ul>
      </div>
      <p class="side-tip">${ICON.bulb}<span>Klik peralatan di P&amp;ID untuk membuka pop-up informasi dan nilai proses terkini.</span></p>
      <div class="card"><h4>Tabel HAZOP Anda</h4><table class="hazop" id="hazop"><thead><tr><th>#</th><th>Node</th><th>Parameter</th><th>Guideword</th><th>Skor</th></tr></thead><tbody>${S.eventResults.map((r, i) => hazopRow(r, i)).join('')}</tbody></table></div>`;
    updateEvTrack();
    $('#btn-run-prod').addEventListener('click', () => { Sfx.start(); beginEvent(); });
    $('#btn-report').addEventListener('click', () => { Sfx.click(); openReport(false); });
  }
  function hazopRow(r, i) {
    return `<tr><td>${i + 1}</td><td>${esc(r.node)}</td><td>${esc(PARAMS[r.param] || '-')}</td><td>${esc((GUIDEWORDS[r.guide] || '-').split(' (')[0])}</td><td class="${r.score >= 60 ? 'ok' : 'bad'}">${r.score}</td></tr>`;
  }
  function updateEvTrack() {
    $$('.ev-dot').forEach(d => { const i = +d.dataset.i; d.classList.toggle('done', i < S.eventIdx); d.classList.toggle('active', i === S.eventIdx); });
    const c = $('#ev-count'); if (c) c.textContent = `${S.eventIdx}/${scn.events.length}`;
  }
  function beginEvent() {
    if (S.eventIdx >= scn.events.length) return;
    resetPlant();
    const wl = $('#warn-log'); wl.innerHTML = '<li class="empty">Belum ada peringatan. Proses berjalan normal.</li>';
    $('#warn-count').textContent = '0';
    const evt = scn.events[S.eventIdx];
    ev2 = { evt, delay: 5 + Math.random() * 4, started: false, alarmed: false, warnIdx: 0, nWarn: 0, crit: false, incident: false, reported: false, reportOpen: false };
    runSim(true);
    const b = $('#btn-run-prod'); b.disabled = true; b.innerHTML = `${ICON.factory}<span>${esc(opName())} berjalan...</span>`;
    $('#btn-report').disabled = false;
    setStatus('Normal', 'ok');
    setAlarm('Proses normal. Amati tren dan P&ID.', false);
  }
  function handleEvent(s) {
    if (!ev2 || ev2.reported) return;
    const evt = ev2.evt;
    if (!ev2.started && s.t >= ev2.delay) { ev2.started = true; s.startEvent(evt); }
    if (!ev2.started) return;
    if (!ev2.alarmed && Object.keys(scn.vars).some(id => s.status(id) !== 'normal')) {
      ev2.alarmed = true; Sfx.alarm();
      setAlarm('ALARM DCS: deviasi proses terdeteksi', true);
      setStatus('Abnormal', 'warn');
    }
    const te = s.eventElapsed();
    while (ev2 && !ev2.reported && ev2.warnIdx < evt.warnings.length && te >= evt.warnings[ev2.warnIdx].t) {
      const w = evt.warnings[ev2.warnIdx++];
      fireWarning(w);
      if (w.sev === 'final') triggerIncident(w);
    }
  }
  function warnPos(w) {
    if (w.pos) return { x: w.pos[0], y: w.pos[1] };
    return pid.eqAnchor(w.at);
  }
  function fireWarning(w) {
    ev2.nWarn++;
    if (w.sev !== 'warn') ev2.crit = true;
    const p = warnPos(w);
    pid.fx(w.type, p.x, p.y, { sev: w.sev, at: w.at, big: w.big });
    addWarnLog(w);
    showBanner(w);
    if (['leak', 'toxic', 'spill', 'dust'].includes(w.type)) Sfx.hiss();
    else if (['fire', 'smoke', 'arc'].includes(w.type)) Sfx.crackle();
    if (w.type !== 'explosion') Sfx.warn();
    if (w.sev === 'crit') setStatus('Bahaya', 'crit');
  }
  function triggerIncident(w) {
    ev2.incident = true; ev2.reported = true;
    sim.halted = true;
    runSim(false);
    Music.duck(8000);
    if (w.type === 'explosion') {
      Sfx.boom();
      if (fxOn()) { const pw = $('#pid'); pw.classList.remove('boom'); void pw.offsetWidth; pw.classList.add('boom'); }
    } else Sfx.siren();
    setStatus('INSIDEN', 'crit');
    setAlarm('INSIDEN: produksi terhenti', true);
    $('#btn-report').disabled = true;
    later(() => openReport(true), 2800);
  }
  function setAlarm(txt, isOn) {
    const b = $('#alarm-box'); if (!b) return;
    b.classList.toggle('on', isOn); $('#alarm-text').textContent = txt;
  }
  function addWarnLog(w) {
    const wl = $('#warn-log'); if (!wl) return;
    const empty = wl.querySelector('.empty'); if (empty) empty.remove();
    const li = document.createElement('li');
    li.className = 'sev-' + w.sev;
    li.innerHTML = `<span class="wi">${ICON[w.type]}</span><div><div class="wh"><b>${esc(WARN_TYPES[w.type].title)}</b><time>${sim.clock()}</time></div><p>${esc(w.text)}</p></div>`;
    wl.prepend(li);
    $('#warn-count').textContent = ev2.nWarn;
  }
  function showBanner(w) {
    const wrap = $('#fx-banners'); if (!wrap) return;
    const b = document.createElement('div');
    b.className = 'fx-banner sev-' + w.sev;
    b.innerHTML = `<span class="wi">${ICON[w.type]}</span><div><b>${w.sev === 'final' ? 'INSIDEN: ' : 'PERINGATAN: '}${esc(WARN_TYPES[w.type].title)}</b><span>${esc(w.text)}</span></div><time>${sim.clock()}</time>`;
    wrap.prepend(b);
    while (wrap.children.length > 2) wrap.lastChild.remove();
    requestAnimationFrame(() => b.classList.add('show'));
    if (w.sev !== 'final') later(() => { b.classList.remove('show'); later(() => b.remove(), 400); }, 6500);
  }
  function openReport(auto) {
    if (!ev2 || ev2.reportOpen) return;
    ev2.reportOpen = true;
    ev2.reported = true;
    runSim(false);
    const evt = ev2.evt;
    ev2.phase = !ev2.started ? 'pre' : ev2.incident ? 'late' : (!ev2.crit ? 'early' : 'mid');
    ev2.reportClock = sim.clock();
    if (!ev2.incident) { setStatus('Dihentikan', 'idle'); setAlarm('Proses dihentikan untuk investigasi', false); }
    $('#btn-report').disabled = true;
    const nodes = scn.equipment.filter(e => !['muster', 'building'].includes(e.type));
    const notes = {
      pre: '<p class="warn">Anda menghentikan proses sebelum ada deviasi. Jawaban tetap dinilai, tetapi tanpa dasar pengamatan yang cukup.</p>',
      early: '<p class="note ok">Anda melapor sebelum muncul peringatan kritis di lapangan. Bila jawaban tepat, Anda mendapat bonus deteksi dini.</p>',
      mid: '<p class="note">Anda melapor setelah muncul peringatan kritis, tetapi sebelum insiden terjadi.</p>',
      late: '<p class="warn">Insiden telah terjadi sebelum abnormalitas dilaporkan. Identifikasi tetap dinilai dengan penalti keterlambatan.</p>',
    };
    const body = `${notes[ev2.phase]}
      <div class="form-grid">
        <label>Node (peralatan)<select id="rp-node"><option value="">-- pilih --</option>${nodes.map(e => `<option value="${e.id}">${esc(e.id)} · ${esc(e.name)}</option>`).join('')}</select></label>
        <label>Parameter<select id="rp-param"><option value="">-- pilih --</option>${Object.keys(PARAMS).map(k => `<option value="${k}">${esc(PARAMS[k])}</option>`).join('')}</select></label>
        <label>Guideword<select id="rp-guide"><option value="">-- pilih --</option>${Object.keys(GUIDEWORDS).map(k => `<option value="${k}">${esc(GUIDEWORDS[k])}</option>`).join('')}</select></label>
      </div>
      <div class="rp-sec"><b>Penyebab yang paling mungkin</b>${shuffledOpts(evt.causes, evt.causeAns, 'rp-cause')}</div>
      <div class="rp-sec"><b>Konsekuensi bila tidak ada proteksi</b>${shuffledOpts(evt.cons, evt.consAns, 'rp-cons')}</div>
      <div class="hint-box">
        <div class="hint-head"><span class="hint-ico">${ICON.bulb}</span><div><b>Butuh petunjuk?</b><small>${cfg.difficulty === 'mudah' ? 'Mode Mudah: petunjuk tidak mengurangi poin.' : 'Setiap petunjuk mengurangi ' + HINT_COST + ' poin dari laporan ini.'}</small></div><button class="btn3d silver small" id="btn-hint">Buka petunjuk 1 dari 3</button></div>
        <ol class="hint-list" id="hint-list"></ol>
      </div>
      <p class="muted small min-tip">Lupa detail proses? Tekan tombol perkecil di kanan atas untuk melihat P&amp;ID, tren, dan peringatan lapangan. Isian Anda tidak akan hilang.</p>`;
    ev2.hintsUsed = 0;
    const hints = eventHints(evt);
    showModal({ title: `Laporan Abnormalitas ${S.eventIdx + 1}${auto ? ' (otomatis)' : ''}`, cls: 'report', body, minimizable: true,
      dockTitle: `Laporan Abnormalitas ${S.eventIdx + 1} sedang diisi`,
      buttons: [{ label: 'Kirim Laporan', cls: 'btn3d primary', keep: true, onClick: () => submitReport() }],
      onMount: m => {
        const btn = m.querySelector('#btn-hint');
        btn.addEventListener('click', () => {
          if (!ev2 || ev2.hintsUsed >= hints.length) return;
          Sfx.click();
          const li = document.createElement('li');
          li.textContent = hints[ev2.hintsUsed];
          m.querySelector('#hint-list').appendChild(li);
          ev2.hintsUsed++;
          if (ev2.hintsUsed >= hints.length) { btn.disabled = true; btn.textContent = 'Semua petunjuk terbuka'; }
          else btn.textContent = `Buka petunjuk ${ev2.hintsUsed + 1} dari ${hints.length}`;
        });
      } });
  }
  function eventHints(evt) {
    const early = Math.min(...evt.effects.map(f => f.delay));
    const norm = f => Math.abs(f.to - scn.vars[f.var].normal) / (scn.vars[f.var].max - scn.vars[f.var].min);
    const first = evt.hintVar ? evt.effects.find(f => f.var === evt.hintVar) || evt.effects[0]
      : evt.effects.filter(f => f.delay === early).sort((a, b) => norm(b) - norm(a))[0];
    const v = scn.vars[first.var];
    const node = scn.equipment.find(e => e.id === evt.answer.node[0]);
    return [
      `Perhatikan tren ${v.label}. Variabel ini paling awal ${first.to > v.normal ? 'naik' : 'turun'} dari nilai normalnya.`,
      evt.hint,
      `Deviasi utama berpusat di ${node.id}, ${node.name}.`,
    ];
  }
  function shuffledOpts(opts, ansIdx, name) {
    const idx = opts.map((_, i) => i).sort(() => Math.random() - 0.5);
    return `<div class="radios">${idx.map(i => `<label><input type="radio" name="${name}" value="${i === ansIdx ? 1 : 0}"><span>${esc(opts[i])}</span></label>`).join('')}</div>`;
  }
  function submitReport() {
    const node = $('#rp-node').value, param = $('#rp-param').value, guide = $('#rp-guide').value;
    const cause = $('input[name=rp-cause]:checked'), cons = $('input[name=rp-cons]:checked');
    if (!node || !param || !guide || !cause || !cons) { Sfx.fail(); showToast('Lengkapi semua isian laporan.'); return; }
    const evt = ev2.evt; const a = evt.answer;
    const pts = { node: a.node.includes(node) ? 20 : 0, param: a.param.includes(param) ? 20 : 0, guide: a.guide.includes(guide) ? 20 : 0, cause: cause.value === '1' ? 20 : 0, cons: cons.value === '1' ? 20 : 0 };
    const base = pts.node + pts.param + pts.guide + pts.cause + pts.cons;
    let mod = 0, modTxt = '';
    if (ev2.phase === 'early' && base >= 60) { mod = 10; modTxt = '<p class="note ok"><b>Bonus deteksi dini +10.</b> Abnormalitas dikenali dari tren proses sebelum muncul peringatan kritis di lapangan.</p>'; }
    else if (ev2.phase === 'late') { mod = -20; modTxt = '<p class="warn"><b>Penalti -20.</b> Insiden telah terjadi sebelum abnormalitas dilaporkan.</p>'; }
    else if (ev2.phase === 'mid') modTxt = '<p class="note">Dilaporkan setelah peringatan kritis. Insiden masih dapat dicegah, tetapi margin waktunya sempit.</p>';
    const hintsUsed = ev2.hintsUsed || 0;
    const hintPenalty = cfg.difficulty === 'mudah' ? 0 : HINT_COST * hintsUsed;
    const hintTxt = hintsUsed ? `<p class="note">Petunjuk dipakai: <b>${hintsUsed}</b>${hintPenalty ? `, pengurangan ${hintPenalty} poin` : ', tanpa pengurangan poin pada Mode Mudah'}.</p>` : '';
    const score = Math.max(0, Math.min(100, base + mod - hintPenalty));
    S.eventResults.push({ node, param, guide, score, phase: ev2.phase, hints: hintsUsed });
    closeModal();
    if (score >= 60) Sfx.success(); else Sfx.fail();
    const row = (lbl, ok, ans) => `<tr><td>${lbl}</td><td class="${ok ? 'ok' : 'bad'}">${ok ? 'Benar' : 'Salah'}</td><td>${esc(ans)}</td></tr>`;
    const seen = evt.warnings.slice(0, ev2.warnIdx);
    const chain = evt.warnings.map((w, i) => `<li class="sev-${w.sev} ${i < ev2.warnIdx ? 'seen' : 'unseen'}"><span class="wi">${ICON[w.type]}</span><div><b>${esc(WARN_TYPES[w.type].title)}</b> <small>${i < ev2.warnIdx ? 'terjadi' : 'dicegah'}</small><p>${esc(w.text)}</p></div></li>`).join('');
    showModal({ title: `Hasil Laporan ${S.eventIdx + 1}: ${score} poin`, cls: 'report',
      body: `<table class="result-table"><tr><th>Unsur</th><th>Penilaian</th><th>Jawaban yang diharapkan</th></tr>
        ${row('Node', pts.node, a.node.join(' / '))}${row('Parameter', pts.param, a.param.map(p => PARAMS[p]).join(' / '))}${row('Guideword', pts.guide, a.guide.map(g => GUIDEWORDS[g].split(' (')[0]).join(' / '))}${row('Penyebab', pts.cause, evt.causes[evt.causeAns])}${row('Konsekuensi', pts.cons, evt.cons[evt.consAns])}</table>
        ${modTxt}${hintTxt}<p class="explain">${esc(evt.explain)}</p>
        <h4 class="chain-h">Rangkaian eskalasi kejadian ini (${seen.length} dari ${evt.warnings.length} tahap terjadi)</h4><ul class="chain">${chain}</ul>`,
      buttons: [{ label: 'Lanjut', cls: 'btn3d primary', onClick: () => {
        S.eventIdx++; updateEvTrack();
        const tb = $('#hazop tbody'); if (tb) tb.insertAdjacentHTML('beforeend', hazopRow(S.eventResults[S.eventResults.length - 1], S.eventResults.length - 1));
        ev2 = null;
        resetPlant();
        setStatus('Siap', 'idle');
        setAlarm('Proses belum berjalan', false);
        $('#btn-report').disabled = true;
        if (S.eventIdx >= scn.events.length) {
          const avg = Math.round(S.eventResults.reduce((s, r) => s + r.score, 0) / S.eventResults.length);
          finishStage(2, avg, `<p>Rata-rata skor identifikasi dari <b>${S.eventResults.length}</b> kejadian.</p>`);
        } else {
          const b = $('#btn-run-prod'); b.disabled = false;
          b.innerHTML = `${ICON.factory}<span>Jalankan ${esc(opName())} (kejadian ${S.eventIdx + 1})</span>`;
        }
      } }] });
  }

  /* ---------- TAHAP 3 & 4: barier, inspeksi, dan pengujian ---------- */
  function devState(stage, hsId) {
    const dev = S.placements[stage][hsId];
    if (!dev) return null;
    const d = DEVICES[dev];
    const tested = S.itpm[stage][hsId] === d.itpm;
    const pfd = tested ? d.pfd : Math.min(1, d.pfd * UNTESTED_FACTOR);
    return { dev, d, tested, pfd, rel: 1 - pfd };
  }
  function reliability(stage) {
    const items = Object.keys(S.placements[stage]).map(h => devState(stage, h)).filter(Boolean);
    if (!items.length) return { avg: 0, n: 0, tested: 0 };
    return { avg: items.reduce((s, x) => s + x.rel, 0) / items.length, n: items.length, tested: items.filter(x => x.tested).length };
  }
  function spent(stage) {
    let s = 0;
    Object.keys(S.placements[stage]).forEach(h => { const d = DEVICES[S.placements[stage][h]]; if (d) s += d.cost; });
    Object.values(S.itpm[stage] || {}).forEach(k => { if (ITPM[k]) s += ITPM[k].cost; });
    Object.values((S.eqItpm && S.eqItpm[stage]) || {}).forEach(k => { if (ITPM[k]) s += ITPM[k].cost; });
    return s;
  }
  function eqInspectable(stage) {
    const types = new Set();
    Object.values(ITPM).filter(t => t.stage === stage && t.target === 'equipment').forEach(t => t.fitsEq.forEach(x => types.add(x)));
    return scn.equipment.filter(e => types.has(e.type));
  }
  function renderStageBarrier(stage) {
    const devs = stageDevices(stage);
    const progs = stagePrograms(stage);
    const hs = scn.hotspots.filter(h => h.stage === stage);
    const insp = eqInspectable(stage);
    const done = S.evalDone[stage];
    const side = $('#side');
    side.innerHTML = `<div class="side-head"><h2>${ICON[stage === 3 ? 'shield' : 'fire']}<span>Tahap ${stage}: Barier ${stage === 3 ? 'Pencegahan' : 'Mitigasi'}</span></h2></div>
      <div class="card budget"><div class="budget-row"><span>${ICON.coin} Anggaran</span><b id="budget-val"></b></div><div class="budget-bar"><div id="budget-fill"></div></div><p class="muted small budget-note" id="budget-note"></p><p class="muted small">${stage === 3 ? 'Pasang instrumen deteksi dan proteksi yang memutus rantai kejadian sebelum kehilangan kontainmen, lalu jaga keandalannya.' : 'Pasang perangkat yang membatasi dampak bila kehilangan kontainmen tetap terjadi, lalu jaga keandalannya.'}</p></div>
      <div class="card rel"><h4>${ICON.gauge}<span>Keandalan Sistem Proteksi</span></h4>
        <div class="rel-row"><b id="rel-val">0%</b><span id="rel-sub">Belum ada barier terpasang</span></div>
        <div class="rel-bar"><div id="rel-fill"></div></div>
        <p class="muted small">Barier tanpa inspeksi dan pengujian berkala menyimpan kegagalan tersembunyi sehingga PFD-nya naik sekitar ${UNTESTED_FACTOR} kali. Kriteria IPL pada LOPA mensyaratkan barier dapat diaudit melalui pengujian.</p>
      </div>
      <div class="card"><h4>Kotak Alat</h4>
        <div class="tabs" role="tablist"><button class="tab" data-tab="dev">${ICON.shield}<span>Perangkat Barier</span></button><button class="tab" data-tab="itpm">${ICON.wrench}<span>Inspeksi &amp; Pengujian</span></button></div>
        <div class="toolbox" id="tb-dev">${devs.map(k => `<button class="tool" data-kind="dev" data-id="${k}" style="--c:${DEVICES[k].color}"><span class="tcode">${esc(DEVICES[k].code)}</span><span class="tname">${esc(DEVICES[k].name)}</span><span class="tcost">${money(DEVICES[k].cost)}</span></button>`).join('')}</div>
        <div class="toolbox" id="tb-itpm">${progs.map(k => `<button class="tool itpm" data-kind="itpm" data-id="${k}"><span class="tcode">${esc(ITPM[k].code)}</span><span class="tname">${esc(ITPM[k].name)}</span><span class="tcost">${money(ITPM[k].cost)}</span></button>`).join('')}</div>
        <div class="tool-desc" id="tool-desc">Pilih alat untuk membaca fungsinya, atau klik titik (+) pada P&amp;ID untuk memilih perangkat lewat pop-up.</div>
      </div>
      <div class="card"><h4>Titik Pemasangan <span class="pill" id="hs-count"></span></h4>
        <ul class="hs-list" id="hs-list">${hs.map(h => `<li data-hs="${h.id}"><span class="dot"></span><div><b>${cfg.hints || cfg.difficulty === 'mudah' ? esc(h.label) : 'Titik ' + esc(h.id.toUpperCase())}</b><small class="placed"></small></div></li>`).join('')}</ul>
      </div>
      ${insp.length ? `<div class="card"><h4>Inspeksi Peralatan <span class="pill" id="eq-count"></span></h4><p class="muted small">Pilih program pada tab Inspeksi &amp; Pengujian, lalu klik peralatan di P&amp;ID.</p><ul class="eq-insp" id="eq-insp">${insp.map(e => `<li data-eq="${e.id}"><span class="dot"></span><div><b>${esc(e.id)}</b> <span>${esc(e.name)}</span><small class="placed"></small></div></li>`).join('')}</ul></div>` : ''}
      <div class="card action"><button class="btn3d ${done ? 'primary' : 'dark'} wide" id="btn-eval">${ICON.check}<span>${done ? 'Lanjut' : 'Evaluasi Pemasangan'}</span></button></div>`;
    on(side, '.tab', 'click', ev => { Sfx.click(); setTab(ev.currentTarget.dataset.tab); });
    on(side, '.tool', 'click', ev => { Sfx.click(); selectTool(ev.currentTarget.dataset.kind, ev.currentTarget.dataset.id); });
    on(side, '.hs-list li', 'click', ev => {
      const h = scn.hotspots.find(x => x.id === ev.currentTarget.dataset.hs);
      if (S.placements[stage][h.id]) onDeviceClick(h, S.placements[stage][h.id]); else onHotspotClick(h);
    });
    on(side, '.eq-insp li', 'click', ev => onEquipmentBarrier(scn.equipment.find(x => x.id === ev.currentTarget.dataset.eq)));
    $('#btn-eval').addEventListener('click', () => { Sfx.click(); if (S.evalDone[stage]) afterEval(stage); else confirmEvaluate(stage); });
    setTab(toolTab);
    refreshBarrierUI(stage);
    if (done) showEvalMarks(stage);
  }
  function setTab(t) {
    toolTab = t;
    $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
    const a = $('#tb-dev'), b = $('#tb-itpm');
    if (a) a.hidden = t !== 'dev';
    if (b) b.hidden = t !== 'itpm';
    if (tool && tool.kind !== t) selectTool(null, null);
  }
  function selectTool(kind, id) {
    if (!kind || (tool && tool.kind === kind && tool.id === id)) tool = null;
    else tool = { kind, id };
    $$('.tool').forEach(b => b.classList.toggle('sel', !!tool && b.dataset.kind === tool.kind && b.dataset.id === tool.id));
    $('#pid').classList.toggle('placing', !!tool);
    const desc = $('#tool-desc');
    if (!tool) { desc.innerHTML = 'Pilih alat untuk membaca fungsinya, atau klik titik (+) pada P&amp;ID untuk memilih perangkat lewat pop-up.'; pid.setTargets(null); return; }
    if (tool.kind === 'dev') {
      const d = DEVICES[tool.id];
      desc.innerHTML = `<b>${esc(d.name)}</b><br>${esc(d.desc)}<div class="meta"><span>Biaya ${money(d.cost)}</span><span>PFD desain ${String(d.pfd).replace('.', ',')}</span><span>Program uji: ${esc(ITPM[d.itpm].name)}</span></div>`;
      pid.setTargets(null);
    } else {
      const t = ITPM[tool.id];
      const fitTxt = t.target === 'device' ? t.fits.filter(k => kitOk(DEVICES[k])).map(k => DEVICES[k].code).join(', ') : t.fitsEq.filter(x => scn.equipment.some(e => e.type === x)).map(x => EQ_TYPE_NAMES[x] || x).join(', ');
      desc.innerHTML = `<b>${esc(t.name)}</b><br>${esc(t.desc)}<div class="meta"><span>Biaya ${money(t.cost)}</span><span>Berlaku untuk: ${esc(fitTxt)}</span></div><p class="muted small">${t.target === 'device' ? 'Klik perangkat terpasang yang berbingkai biru di P&amp;ID.' : 'Klik peralatan yang berbingkai biru di P&amp;ID.'}</p>`;
      updateTargets();
    }
  }
  function updateTargets() {
    if (!tool || tool.kind !== 'itpm') { pid.setTargets(null); return; }
    const t = ITPM[tool.id]; const stage = S.stage;
    if (t.target === 'device') pid.setTargets({ hs: Object.keys(S.placements[stage]).filter(h => t.fits.includes(S.placements[stage][h])) });
    else pid.setTargets({ eq: eqInspectable(stage).filter(e => t.fitsEq.includes(e.type)).map(e => e.id) });
  }
  function refreshBarrierUI(stage) {
    closePopover();
    const b = budgetFor(stage), sp = spent(stage);
    const bv = $('#budget-val'); if (bv) bv.textContent = `${money(b - sp)} / ${money(b)}`;
    const bn = $('#budget-note'); if (bn) bn.textContent = `Terpakai ${money(sp)}. ${costNote()}`;
    const bf = $('#budget-fill'); if (bf) { bf.style.width = Math.min(100, sp / b * 100) + '%'; bf.classList.toggle('low', b - sp <= 2); }
    const r = reliability(stage);
    const rv = $('#rel-val'); if (rv) rv.textContent = r.n ? pct(r.avg) : '0%';
    const rs = $('#rel-sub'); if (rs) rs.textContent = r.n ? `${r.tested} dari ${r.n} barier teruji` : 'Belum ada barier terpasang';
    const rf = $('#rel-fill'); if (rf) { rf.style.width = (r.n ? r.avg * 100 : 0) + '%'; rf.className = r.avg >= 0.9 ? 'good' : r.avg >= 0.6 ? 'mid' : 'low'; }
    const hs = scn.hotspots.filter(h => h.stage === stage);
    hs.forEach(h => {
      const li = $(`.hs-list li[data-hs="${h.id}"]`); if (!li) return;
      const st = devState(stage, h.id);
      li.classList.toggle('placed', !!st);
      li.classList.toggle('tested', !!st && st.tested);
      li.querySelector('.placed').innerHTML = st ? `${esc(st.d.name)}<em class="${st.tested ? 'ok' : 'warnc'}">${st.tested ? 'teruji' : 'belum diuji'}</em>` : 'belum terpasang';
    });
    const hc = $('#hs-count'); if (hc) hc.textContent = `${Object.keys(S.placements[stage]).length}/${hs.length}`;
    const eqm = (S.eqItpm && S.eqItpm[stage]) || {};
    $$('.eq-insp li').forEach(li => {
      const k = eqm[li.dataset.eq];
      li.classList.toggle('placed', !!k);
      li.querySelector('.placed').textContent = k ? ITPM[k].name : 'belum ada program';
    });
    const ec = $('#eq-count'); if (ec) ec.textContent = `${Object.keys(eqm).length}`;
    pid.showHotspots(stage, S.placements[stage], S.itpm[stage], { flagUntested: cfg.hints });
    pid.setEqBadges(eqm, stage);
    updateTargets();
  }
  function remaining(stage) { return budgetFor(stage) - spent(stage); }
  function hsLabel(h) { return cfg.hints || cfg.difficulty === 'mudah' ? h.label : 'Titik ' + h.id.toUpperCase(); }
  /* Kit perangkat: setiap skenario hanya menampilkan perangkat yang relevan
     dengan sektornya, termasuk pengecoh yang masuk akal. */
  function kitOk(d) { const ks = scn.kits || ['proses']; return (d.kit || ['proses']).some(k => ks.includes(k)); }
  function stageDevices(stage) {
    const cat = stage === 3 ? 'prevent' : 'mitigate';
    return Object.keys(DEVICES).filter(k => DEVICES[k].cat === cat && kitOk(DEVICES[k]));
  }
  function stagePrograms(stage, target) {
    const devs = stageDevices(stage);
    return Object.keys(ITPM).filter(k => {
      const t = ITPM[k];
      if (t.stage !== stage || (target && t.target !== target)) return false;
      return t.target === 'device' ? t.fits.some(f => devs.includes(f)) : scn.equipment.some(e => t.fitsEq.includes(e.type));
    });
  }
  function placeDevice(stage, h, devId) {
    const cur = devState(stage, h.id);
    const refund = cur ? cur.d.cost + (S.itpm[stage][h.id] ? ITPM[S.itpm[stage][h.id]].cost : 0) : 0;
    const d = DEVICES[devId];
    if (cur && cur.dev === devId) { showToast(`${d.name} sudah terpasang di titik ini.`); return false; }
    if (d.cost - refund > remaining(stage)) { Sfx.fail(); showToast(`Anggaran tidak cukup untuk ${d.name}. Sisa ${money(remaining(stage) + refund)}.`); return false; }
    S.placements[stage][h.id] = devId;
    delete S.itpm[stage][h.id];
    Sfx.place(); save(); refreshBarrierUI(stage);
    if (cur) showToast(`${cur.d.name} diganti dengan ${d.name}. Program uji sebelumnya dilepas.`);
    return true;
  }
  function applyProgram(stage, h, progId) {
    const st = devState(stage, h.id);
    const t = ITPM[progId];
    if (!st || !t) return false;
    if (t.target !== 'device') { showToast(`${t.name} diterapkan pada peralatan proses, bukan pada perangkat barier.`); return false; }
    if (!t.fits.includes(st.dev)) { Sfx.fail(); showToast(`${t.name} tidak sesuai untuk ${st.d.name}.`); return false; }
    if (st.tested) { showToast('Program ini sudah diterapkan pada perangkat tersebut.'); return false; }
    if (t.cost > remaining(stage)) { Sfx.fail(); showToast(`Anggaran tidak cukup untuk ${t.name}. Sisa ${money(remaining(stage))}.`); return false; }
    S.itpm[stage][h.id] = progId;
    Sfx.test(); save(); refreshBarrierUI(stage);
    return true;
  }
  function applyEqProgram(stage, e, progId) {
    const eqm = (S.eqItpm && S.eqItpm[stage]) || null;
    const t = ITPM[progId];
    if (S.evalDone[stage]) { showToast('Tahap ini sudah dievaluasi.'); return false; }
    if (t.target !== 'equipment' || !eqm) { showToast(`${t.name} diterapkan pada perangkat barier terpasang.`); return false; }
    if (!t.fitsEq.includes(e.type)) { Sfx.fail(); showToast(`${t.name} tidak sesuai untuk ${e.name}.`); return false; }
    const cur = eqm[e.id];
    if (cur === progId) { showToast('Program ini sudah diterapkan pada peralatan tersebut.'); return false; }
    const refund = cur ? ITPM[cur].cost : 0;
    if (t.cost - refund > remaining(stage)) { Sfx.fail(); showToast(`Anggaran tidak cukup untuk ${t.name}. Sisa ${money(remaining(stage) + refund)}.`); return false; }
    eqm[e.id] = progId;
    Sfx.test(); save(); refreshBarrierUI(stage);
    return true;
  }
  function onHotspotClick(h) {
    const stage = S.stage;
    if (S.evalDone[stage]) { showToast(h.label + ': ' + h.why); return; }
    if (tool && tool.kind === 'itpm') { showToast('Pasang perangkat barier di titik ini terlebih dahulu, lalu terapkan program pengujiannya.'); return; }
    if (tool) { placeDevice(stage, h, tool.id); return; }
    if (pop && pop.pickHs === h.id) { closePopover(); return; }
    Sfx.click();
    openPicker(stage, h, pid.hsNode(h.id));
  }
  function onDeviceClick(h, devId) {
    const stage = S.stage;
    if (S.evalDone[stage]) { showToast(h.label + ': ' + h.why); return; }
    if (tool && tool.kind === 'itpm') { applyProgram(stage, h, tool.id); return; }
    if (tool && tool.kind === 'dev') { placeDevice(stage, h, tool.id); return; }
    if (pop && pop.devHs === h.id) { closePopover(); return; }
    Sfx.click();
    openDevicePop(stage, h);
  }

  /* ---------- pop-up pemilih perangkat dan program ---------- */
  function progBtn(k, fit, left) {
    const t = ITPM[k];
    return `<button class="prog${fit ? ' fit' : ''}${t.cost > left ? ' poor' : ''}" data-prog="${k}"><span class="pcode">${esc(t.code)}</span><span class="pname">${esc(t.name)}${fit ? '<em>sesuai</em>' : ''}</span><span class="tcost">${money(t.cost)}</span></button>`;
  }
  function openPicker(stage, h, anchor) {
    const cur = S.placements[stage][h.id];
    const refund = cur ? DEVICES[cur].cost + (S.itpm[stage][h.id] ? ITPM[S.itpm[stage][h.id]].cost : 0) : 0;
    const left = remaining(stage) + refund;
    const groups = [];
    stageDevices(stage).forEach(k => {
      const name = ITPM[DEVICES[k].itpm].grp || 'Perangkat Lain';
      let g = groups.find(x => x.name === name);
      if (!g) groups.push(g = { name, items: [] });
      g.items.push(k);
    });
    const html = `<div class="pop-head"><b>${cur ? 'Ganti Perangkat' : 'Pasang Perangkat'}</b><span>${esc(hsLabel(h))}</span></div>
      <p class="pick-budget">${ICON.coin}<span>Sisa anggaran <b>${money(remaining(stage))}</b></span></p>
      ${groups.map(g => `<div class="pick-grp"><h5>${esc(g.name)}</h5><div class="pick-grid">${g.items.map(k => {
        const d = DEVICES[k];
        return `<button class="pick${k === cur ? ' current' : ''}${d.cost > left ? ' poor' : ''}" data-dev="${k}" style="--c:${d.color}"><span class="tcode">${esc(d.code)}</span><span class="tname">${esc(d.name)}</span><span class="tcost">${money(d.cost)}</span></button>`;
      }).join('')}</div></div>`).join('')}`;
    const el = openPopover(anchor, html, { pickHs: h.id }, { cls: 'picker', foot: '<div class="pick-desc">Arahkan kursor ke perangkat untuk membaca fungsinya, lalu klik untuk memasang.</div>' });
    if (!el) return;
    const desc = el.querySelector('.pick-desc');
    $$('.pick', el).forEach(b => {
      const k = b.dataset.dev, d = DEVICES[k];
      const show = () => { desc.innerHTML = `<b>${esc(d.name)}</b>. ${esc(d.desc)}`; };
      b.addEventListener('mouseenter', show);
      b.addEventListener('focus', show);
      b.addEventListener('click', () => {
        if (k === cur) { showToast(`${d.name} sudah terpasang di titik ini.`); return; }
        if (placeDevice(stage, h, k)) openDevicePop(stage, h);
      });
    });
  }
  function openDevicePop(stage, h) {
    const st = devState(stage, h.id);
    if (!st) return;
    const it = S.itpm[stage][h.id];
    const easy = cfg.difficulty === 'mudah';
    const progs = stagePrograms(stage, 'device');
    const el = openPopover(pid.devNode(h.id), `<div class="pop-head"><b>${esc(st.d.code)}</b><span>${esc(st.d.name)}</span></div>
        <p>${esc(st.d.desc)}</p>
        <table class="kv"><tr><th>Lokasi</th><td>${esc(hsLabel(h))}</td></tr>
        <tr><th>Biaya</th><td>${money(st.d.cost)}${it ? ` + program ${money(ITPM[it].cost)}` : ''}</td></tr>
        <tr><th>PFD desain</th><td>${String(st.d.pfd).replace('.', ',')} (faktor pengurangan risiko ${num(1 / st.d.pfd)})</td></tr>
        <tr><th>Program uji</th><td>${it ? esc(ITPM[it].name) : '<span class="bad">Belum ada</span>'}</td></tr>
        <tr><th>PFD efektif</th><td>${String(+st.pfd.toFixed(3)).replace('.', ',')}${st.tested ? '' : ' (naik karena tidak diuji)'}</td></tr>
        <tr><th>Keandalan yang dapat dikreditkan</th><td><b>${pct(st.rel)}</b></td></tr></table>
        ${st.tested ? '' : `<div class="pick-grp"><h5>Terapkan program inspeksi &amp; pengujian</h5><p class="note">Barier yang tidak diuji berkala tidak dapat dikreditkan penuh dalam LOPA karena kegagalan tersembunyinya tidak pernah terungkap. Pilih program yang sesuai untuk perangkat ini.</p><div class="prog-list">${progs.map(k => progBtn(k, easy && ITPM[k].fits.includes(st.dev), remaining(stage))).join('')}</div></div>`}
        <div class="pop-actions"><button class="btn3d silver small" data-pop="swap">Ganti Perangkat</button><button class="btn3d red small" data-pop="rm-dev">Lepas Perangkat</button>${it ? '<button class="btn3d silver small" data-pop="rm-test">Lepas Program Uji</button>' : ''}</div>`, { devHs: h.id });
    if (!el) return;
    $$('.prog', el).forEach(b => b.addEventListener('click', () => { if (applyProgram(stage, h, b.dataset.prog)) openDevicePop(stage, h); }));
    el.querySelector('[data-pop="swap"]').addEventListener('click', () => { Sfx.click(); openPicker(stage, h, pid.devNode(h.id)); });
    el.querySelector('[data-pop="rm-dev"]').addEventListener('click', () => { delete S.placements[stage][h.id]; delete S.itpm[stage][h.id]; Sfx.remove(); save(); refreshBarrierUI(stage); });
    const rt = el.querySelector('[data-pop="rm-test"]');
    if (rt) rt.addEventListener('click', () => { delete S.itpm[stage][h.id]; Sfx.remove(); save(); refreshBarrierUI(stage); openDevicePop(stage, h); });
  }
  function onEquipmentBarrier(e) {
    const stage = S.stage;
    if (!e) return;
    if (tool && tool.kind === 'dev') { showToast('Perangkat barier dipasang pada titik pemasangan (lingkaran biru), bukan langsung pada peralatan.'); return; }
    if (tool && tool.kind === 'itpm') { applyEqProgram(stage, e, tool.id); return; }
    Sfx.click();
    if (pop && pop.eqId === e.id) { closePopover(); return; }
    openEqPop(stage, e);
  }
  function openEqPop(stage, e) {
    const eqm = (S.eqItpm && S.eqItpm[stage]) || null;
    const cur = eqm && eqm[e.id];
    const inspectable = eqm && eqInspectable(stage).some(x => x.id === e.id);
    const open = inspectable && !S.evalDone[stage];
    const easy = cfg.difficulty === 'mudah';
    const left = remaining(stage) + (cur ? ITPM[cur].cost : 0);
    scn.equipment.forEach(x => pid.highlight(x.id, false));
    pid.highlight(e.id, true);
    const el = openPopover(pid.eqNode(e.id), eqPopHTML(e, false)
      + (inspectable ? `<table class="kv"><tr><th>Program inspeksi</th><td>${cur ? esc(ITPM[cur].name) + ' (' + money(ITPM[cur].cost) + ')' : '<span class="bad">Belum ada</span>'}</td></tr></table>` : '')
      + (open ? `<div class="pick-grp"><h5>${cur ? 'Ganti program inspeksi' : 'Terapkan program inspeksi peralatan'}</h5><div class="prog-list">${stagePrograms(stage, 'equipment').filter(k => k !== cur).map(k => progBtn(k, easy && ITPM[k].fitsEq.includes(e.type), left)).join('')}</div></div>` : '')
      + (cur && open ? '<div class="pop-actions"><button class="btn3d red small" data-pop="rm-eq">Lepas Program</button></div>' : ''), { eqId: e.id });
    if (!el) return;
    $$('.prog', el).forEach(b => b.addEventListener('click', () => { if (applyEqProgram(stage, e, b.dataset.prog)) openEqPop(stage, e); }));
    const rb = el.querySelector('[data-pop="rm-eq"]');
    if (rb) rb.addEventListener('click', () => { delete eqm[e.id]; Sfx.remove(); save(); refreshBarrierUI(stage); openEqPop(stage, e); });
  }
  function confirmEvaluate(stage) {
    const untested = Object.keys(S.placements[stage]).filter(h => !devState(stage, h).tested).length;
    if (untested) {
      showModal({ title: 'Evaluasi sekarang?', body: `<p>Masih ada <b>${untested}</b> barier yang belum memiliki program inspeksi dan pengujian. Barier tersebut tidak dapat dikreditkan penuh.</p>`,
        buttons: [{ label: 'Evaluasi', cls: 'btn3d primary', onClick: () => evaluate(stage) }, { label: 'Kembali', cls: 'btn3d silver' }] });
    } else evaluate(stage);
  }
  function evaluate(stage) {
    const hs = scn.hotspots.filter(h => h.stage === stage);
    const needed = hs.filter(h => h.accept.length);
    const names = arr => arr.map(k => DEVICES[k].name).join(' atau ');
    let correct = 0, tested = 0, wrong = 0, unnecessary = 0;
    const rows = hs.map(h => {
      const st = devState(stage, h.id);
      if (h.accept.length) {
        if (!st) return { h, st: 'missing', msg: 'Tidak terpasang. Diharapkan: ' + names(h.accept) + '.' };
        if (h.accept.includes(st.dev)) {
          correct++;
          if (st.tested) { tested++; return { h, st: 'ok', msg: `Tepat dan teruji (${ITPM[st.d.itpm].name}).` }; }
          return { h, st: 'partial', msg: `Tepat, tetapi belum ada ${ITPM[st.d.itpm].name}. Keandalan barier tidak dapat dibuktikan sehingga tidak dapat dikreditkan sebagai IPL.` };
        }
        wrong++; return { h, st: 'wrong', msg: `${st.d.name} kurang tepat di sini. Diharapkan: ${names(h.accept)}.` };
      }
      if (st) { unnecessary++; return { h, st: 'wrong', msg: `${st.d.name} tidak diperlukan di titik ini.` }; }
      return { h, st: 'ok', msg: 'Benar dibiarkan kosong.' };
    });
    const targets = stage === 3 ? (scn.inspect || []) : [];
    const eqm = (S.eqItpm && S.eqItpm[stage]) || {};
    const eqRows = targets.map(t => {
      const e = scn.equipment.find(x => x.id === t.id);
      const ok = eqm[t.id] === t.itpm;
      return { t, e, st: ok ? 'ok' : 'missing', msg: ok ? `Tepat: ${ITPM[t.itpm].name}.` : `Belum ada ${ITPM[t.itpm].name}.` };
    });
    const eqOk = eqRows.filter(r => r.st === 'ok').length;
    const hw = correct / needed.length, cov = tested / needed.length, eqc = targets.length ? eqOk / targets.length : 0;
    const raw = stage === 3 ? 55 * hw + 25 * cov + 20 * eqc : 65 * hw + 35 * cov;
    const score = Math.max(0, Math.min(100, Math.round(raw - 8 * (wrong + unnecessary))));
    const rel = reliability(stage);
    S.evalDone[stage] = true;
    S.evalRows[stage] = rows.map(r => ({ id: r.h.id, st: r.st }));
    S.pendingScore = { stage, score };
    save();
    showEvalMarks(stage);
    const be = $('#btn-eval'); be.innerHTML = `${ICON.check}<span>Lanjut</span>`; be.className = 'btn3d primary wide';
    selectTool(null, null);
    if (score >= 70) Sfx.success(); else Sfx.fail();
    showModal({ title: `Evaluasi Tahap ${stage}: ${score} poin`, cls: 'report',
      body: `<div class="eval-sum">
          <div><span>Barier tepat</span><b>${correct}/${needed.length}</b></div>
          <div><span>Tepat dan teruji</span><b>${tested}/${needed.length}</b></div>
          ${stage === 3 ? `<div><span>Inspeksi peralatan kritis</span><b>${eqOk}/${targets.length}</b></div>` : ''}
          <div><span>Keliru / tidak perlu</span><b>${wrong + unnecessary}</b></div>
          <div><span>Keandalan rata-rata</span><b>${rel.n ? pct(rel.avg) : '0%'}</b></div>
          <div><span>Anggaran terpakai</span><b>${money(spent(stage))} dari ${money(budgetFor(stage))}</b></div>
        </div>
        <p class="muted small">Bobot nilai: ${stage === 3 ? 'ketepatan barier 55%, pengujian barier 25%, inspeksi peralatan 20%' : 'ketepatan barier 65%, pengujian barier 35%'}, dikurangi 8 poin untuk setiap pemasangan keliru atau tidak perlu.</p>
        <ul class="eval-list">${rows.map(r => `<li class="${r.st}"><b>${esc(r.h.label)}</b><span>${esc(r.msg)}</span><em>${esc(r.h.why)}</em></li>`).join('')}</ul>
        ${eqRows.length ? `<h4 class="chain-h">Inspeksi peralatan kritis</h4><ul class="eval-list">${eqRows.map(r => `<li class="${r.st}"><b>${esc(r.e.id)} · ${esc(r.e.name)}</b><span>${esc(r.msg)}</span><em>${esc(r.t.why)}</em></li>`).join('')}</ul>` : ''}`,
      buttons: [{ label: 'Lihat P&ID', cls: 'btn3d silver' }, { label: 'Lanjut', cls: 'btn3d primary', onClick: () => finishStage(stage, score, '') }] });
  }
  function showEvalMarks(stage) {
    const rows = (S.evalRows && S.evalRows[stage]) || [];
    rows.forEach(r => { pid.setHotspotState(r.id, r.st); const li = $(`.hs-list li[data-hs="${r.id}"]`); if (li) li.setAttribute('data-state', r.st); });
  }
  function afterEval(stage) {
    if (S.pendingScore && S.pendingScore.stage === stage) finishStage(stage, S.pendingScore.score, '');
    else if (S.scores[stage] !== undefined) advanceStage();
    else evaluate(stage);
  }

  /* ---------- penyelesaian tahap ---------- */
  function finishStage(stage, score, extra) {
    S.scores[stage] = score; S.pendingScore = null; save(); updateStepper();
    const g = grade(score);
    showModal({ title: `${STAGES[stage - 1].title} selesai`, cls: 'intro',
      body: `<div class="score-big ${g}">${score}<small>${g} · ${gradeLabel(g)}</small></div>${extra || ''}`,
      buttons: [{ label: stage < 4 ? 'Tahap Berikutnya' : 'Lihat Hasil Akhir', cls: 'btn3d primary', onClick: advanceStage }] });
  }
  function advanceStage() {
    S.stage++;
    if (S.stage > 4) { S.finished = true; save(); recordHistory(); showResult(); return; }
    save(); renderStage(); stageIntro();
  }
  function totalScore() {
    const w = { 1: 0.2, 2: 0.3, 3: 0.25, 4: 0.25 };
    return Math.round([1, 2, 3, 4].reduce((s, n) => s + (S.scores[n] || 0) * w[n], 0));
  }
  function recordHistory() {
    const hist = loadJSON(HIST_KEY) || {};
    const total = totalScore();
    if (!hist[scn.id] || hist[scn.id].total < total) hist[scn.id] = { total, grade: grade(total), at: Date.now() };
    saveJSON(HIST_KEY, hist);
  }

  /* ---------- HASIL AKHIR + BOW-TIE ---------- */
  function barrierList(stage) {
    return Object.keys(S.placements[stage]).map(h => devState(stage, h)).filter(Boolean);
  }
  function showResult() {
    stopAll();
    S = migrate(S);
    const total = totalScore(), g = grade(total);
    const prev = barrierList(3), mit = barrierList(4);
    const progs = [];
    [3, 4].forEach(st => Object.values(S.itpm[st]).forEach(k => { if (ITPM[k] && !progs.includes(ITPM[k].name)) progs.push(ITPM[k].name); }));
    const eqProgs = Object.keys(S.eqItpm[3] || {}).map(id => `${ITPM[S.eqItpm[3][id]].name} pada ${id}`);
    const relAll = [...prev, ...mit];
    const relAvg = relAll.length ? relAll.reduce((s, x) => s + x.rel, 0) / relAll.length : 0;
    app.innerHTML = `<div class="screen sub result">
      ${bgPhoto()}
      <div class="panel wide">
        <div class="panel-head"><h2>Hasil Akhir: ${esc(scn.title)}</h2><button class="btn3d silver small" data-act="menu">${ICON.home}<span>Menu</span></button></div>
        <div class="result-top">
          <div class="score-big ${g}">${total}<small>${g} · ${gradeLabel(g)}</small></div>
          <div class="score-grid">${STAGES.map(st => `<div class="score-item"><span class="ico">${ICON[st.icon]}</span><span>${esc(st.short)}</span><b>${S.scores[st.n] !== undefined ? S.scores[st.n] : '-'}</b></div>`).join('')}
            <div class="score-item rel"><span class="ico">${ICON.gauge}</span><span>Keandalan barier</span><b>${pct(relAvg)}</b></div></div>
        </div>
        ${cfg.name ? `<p class="muted">Pemain: <b>${esc(cfg.name)}</b></p>` : ''}
        <h4>Diagram Bow-Tie Anda</h4>
        <div class="bowtie-wrap">${bowtieSVG(prev, mit)}</div>
        <div class="bt-legend"><span><i class="lg solid"></i>Barier teruji (terkredit)</span><span><i class="lg dashed"></i>Barier belum diuji (keandalan tidak terbukti)</span></div>
        <div class="degr"><b>Kontrol degradasi (inspeksi, pengujian, dan perawatan):</b> ${progs.length || eqProgs.length ? [...progs, ...eqProgs].map(p => `<span class="chip">${esc(p)}</span>`).join('') : '<span class="muted">tidak ada</span>'}</div>
        <h4>Catatan Pembelajaran</h4>
        <ul class="notes">
          <li>Barier pencegahan yang terpasang: ${prev.length ? prev.map(x => esc(x.d.name) + (x.tested ? '' : ' (belum diuji)')).join('; ') : 'tidak ada'}.</li>
          <li>Barier mitigasi yang terpasang: ${mit.length ? mit.map(x => esc(x.d.name) + (x.tested ? '' : ' (belum diuji)')).join('; ') : 'tidak ada'}.</li>
          <li>Investasi barier dan program pengujian: pencegahan ${money(spent(3))}, mitigasi ${money(spent(4))}, total ${money(spent(3) + spent(4))}. ${esc(costNote())}</li>
          <li>Lapisan proteksi harus independen, efektif, dan dapat diaudit. Setiap ancaman pada bow-tie idealnya dipotong oleh lebih dari satu barier dengan mekanisme berbeda (instrumen, mekanis, dan prosedural).</li>
          <li>Barier hanya seandal program inspeksi dan pengujiannya. Tanpa pengujian berkala, kegagalan tersembunyi baru diketahui saat barier dibutuhkan.</li>
        </ul>
        <div class="cfg-actions">
          <button class="btn3d primary" data-act="again">${ICON.play}<span>Ulangi Skenario</span></button>
          <button class="btn3d dark" data-act="new">${ICON.bolt}<span>Skenario Lain</span></button>
        </div>
      </div></div>`;
    on(app, '[data-act=menu]', 'click', () => { Sfx.click(); showMenu(); });
    on(app, '[data-act=again]', 'click', () => { Sfx.start(); startScenario(scn); });
    on(app, '[data-act=new]', 'click', () => { Sfx.click(); showNewGame(); });
  }
  function bowtieSVG(prev, mit) {
    const bt = scn.bowtie;
    const W = 1000, H = 420;
    const th = bt.threats, cs = bt.cons;
    const rowY = (i, n) => 60 + i * ((H - 120) / Math.max(1, n - 1));
    const grid = (items, x0, color) => {
      const n = Math.min(items.length, 9);
      const rows = Math.ceil(n / 3);
      return items.slice(0, 9).map((it, i) => {
        const r = Math.floor(i / 3), c = i % 3;
        const x = x0 + c * 36, y = 210 - (rows * 36) / 2 + r * 36 + 3;
        const solid = it.tested;
        return `<g transform="translate(${x},${y})"><rect width="32" height="30" rx="6" fill="${solid ? color : '#ffffff'}" stroke="${color}" stroke-width="2" ${solid ? '' : 'stroke-dasharray="4 3"'}/><text x="16" y="19" text-anchor="middle" font-size="${it.d.code.length > 3 ? 8 : 10}" font-weight="800" fill="${solid ? '#ffffff' : color}">${esc(it.d.code)}</text>${solid ? '<circle cx="30" cy="2" r="6" fill="#29abe2" stroke="#fff" stroke-width="1.5"/><path d="M27.4 2.2 29.2 4 32.6 0.4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>' : ''}</g>`;
      }).join('');
    };
    return `<svg viewBox="0 0 ${W} ${H}" class="bowtie">
      <text x="135" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#1f2a35">ANCAMAN</text>
      <text x="342" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#1f2a35">BARIER PENCEGAHAN</text>
      <text x="658" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#1f2a35">BARIER MITIGASI</text>
      <text x="865" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#1f2a35">KONSEKUENSI</text>
      ${th.map((t, i) => `<g><path d="M250 ${rowY(i, th.length)} C 380 ${rowY(i, th.length)}, 400 210, 440 210" fill="none" stroke="#9aa6b1" stroke-width="2"/><rect x="20" y="${rowY(i, th.length) - 20}" width="230" height="40" rx="8" fill="#eef2f5" stroke="#5d6b78" stroke-width="2"/><foreignObject x="26" y="${rowY(i, th.length) - 18}" width="218" height="36"><div xmlns="http://www.w3.org/1999/xhtml" class="bt-txt">${esc(t)}</div></foreignObject></g>`).join('')}
      ${cs.map((c, i) => `<g><path d="M560 210 C 600 210, 620 ${rowY(i, cs.length)}, 750 ${rowY(i, cs.length)}" fill="none" stroke="#9aa6b1" stroke-width="2"/><rect x="750" y="${rowY(i, cs.length) - 20}" width="230" height="40" rx="8" fill="#fdecec" stroke="#d64541" stroke-width="2"/><foreignObject x="756" y="${rowY(i, cs.length) - 18}" width="218" height="36"><div xmlns="http://www.w3.org/1999/xhtml" class="bt-txt">${esc(c)}</div></foreignObject></g>`).join('')}
      <rect x="440" y="168" width="120" height="84" rx="14" fill="#1f2a35" stroke="#e53935" stroke-width="3"/>
      <foreignObject x="446" y="174" width="108" height="72"><div xmlns="http://www.w3.org/1999/xhtml" class="bt-txt top">${esc(bt.top)}</div></foreignObject>
      ${grid(prev, 290, '#1565a6')}${grid(mit, 606, '#26323d')}
      ${prev.length ? '' : '<text x="342" y="215" text-anchor="middle" font-size="11" fill="#c62828">tidak ada barier</text>'}${mit.length ? '' : '<text x="658" y="215" text-anchor="middle" font-size="11" fill="#c62828">tidak ada barier</text>'}
    </svg>`;
  }

  /* ---------- toast ---------- */
  let toastT = 0;
  function showToast(msg) {
    let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3600);
  }

  function init() {
    applyCfg();
    showMenu();
    const unlock = () => { Music.unlock(); window.removeEventListener('pointerdown', unlock, true); window.removeEventListener('keydown', unlock, true); };
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
    document.addEventListener('click', ev => { if (ev.target.closest('[data-music]')) { Sfx.click(); toggleMusic(); } });
    window.addEventListener('resize', () => { if (chart) chart.draw(); closePopover(); });
    window.addEventListener('keydown', ev => {
      if (ev.key !== 'Escape') return;
      if (pop) { closePopover(); return; }
      if (tool && S && S.stage >= 3 && $('#tool-desc')) selectTool(null, null);
    });
  }
  return { init, showMenu };
})();

document.addEventListener('DOMContentLoaded', Game.init);
