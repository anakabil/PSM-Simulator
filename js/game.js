/* =====================================================================
   GAME: alur permainan PSM Simulator
   Layar: menu, pilih skenario, bermain (4 tahap), hasil, konfigurasi,
   credit. Progres disimpan di localStorage.
   ===================================================================== */
const Game = (() => {
  const SAVE_KEY = 'psm_sim_save_v1';
  const CFG_KEY = 'psm_sim_cfg_v1';
  const HIST_KEY = 'psm_sim_hist_v1';
  const DEFAULT_CFG = { sound: true, speed: 1, difficulty: 'normal', hints: true, anim: true, fx: true, name: '' };

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
  function grade(score) { return score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D'; }
  function gradeLabel(g) { return { A: 'Sangat Baik', B: 'Baik', C: 'Cukup', D: 'Perlu Pelatihan Ulang' }[g]; }
  function fxOn() { return cfg.fx && cfg.anim; }

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
    leak: '<svg viewBox="0 0 24 24"><path d="M7 19a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 17.6 8.6 4.2 4.2 0 0 1 17 19z"/><path d="M8 6c0-1.5 1.5-1.5 1.5-3M12 6c0-1.5 1.5-1.5 1.5-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    toxic: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2.5c-4.7 0-8.3 3.2-8.3 7.4 0 2.4 1.2 4.4 3.1 5.8V19c0 .9.7 1.6 1.6 1.6h7.2c.9 0 1.6-.7 1.6-1.6v-3.3c1.9-1.4 3.1-3.4 3.1-5.8 0-4.2-3.6-7.4-8.3-7.4zM8.6 13.4a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4zm6.8 0a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4zM10.6 16l1.4-2.2 1.4 2.2z"/></svg>',
    heat: '<svg viewBox="0 0 24 24"><path d="M12.5 14.5V5a2 2 0 1 0-4 0v9.5a4 4 0 1 0 4 0z"/><path d="M16 5c1 1 1 2 0 3s-1 2 0 3M19.5 5c1 1 1 2 0 3s-1 2 0 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    vibration: '<svg viewBox="0 0 24 24"><path d="M2 12h3l2-6 3 12 3-15 3 15 2-6h4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    spill: '<svg viewBox="0 0 24 24"><path d="M12 2.5s-5.5 6.3-5.5 10a5.5 5.5 0 0 0 11 0c0-3.7-5.5-10-5.5-10z"/><ellipse cx="12" cy="21.5" rx="9" ry="1.6"/></svg>',
    explosion: '<svg viewBox="0 0 24 24"><path d="m12 1.5 2.2 5.3 4.9-3.1-1.9 5.5 5.3 1.9-5.3 2 2.3 5.4-5.4-2.6L12 22l-2.1-6.1-5.4 2.6 2.3-5.4-5.3-2 5.3-1.9-1.9-5.5 4.9 3.1z"/></svg>',
  };

  /* ---------- modal ---------- */
  function showModal(o) {
    closeModal();
    const m = document.createElement('div');
    m.className = 'modal-wrap';
    m.innerHTML = `<div class="modal ${o.cls || ''}">
      ${o.title ? `<div class="modal-head"><h3>${o.title}</h3></div>` : ''}
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
    if (o.onMount) o.onMount(m);
    return m;
  }
  function closeModal() { $$('.modal-wrap').forEach(n => n.remove()); }

  /* ---------- latar industri 3D (silver, hitam, biru muda) ---------- */
  function sceneSVG() {
    return `<svg class="scene" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="skD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1117"/><stop offset=".55" stop-color="#15212b"/><stop offset="1" stop-color="#253747"/></linearGradient>
        <radialGradient id="glB" cx=".5" cy="1" r=".75"><stop offset="0" stop-color="#29abe2" stop-opacity=".38"/><stop offset="1" stop-color="#29abe2" stop-opacity="0"/></radialGradient>
        <linearGradient id="flD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a252f"/><stop offset="1" stop-color="#090d11"/></linearGradient>
        <linearGradient id="stV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f6f8fa"/><stop offset=".3" stop-color="#cdd5dc"/><stop offset=".7" stop-color="#8b97a3"/><stop offset="1" stop-color="#4b5661"/></linearGradient>
        <linearGradient id="stH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f8fa"/><stop offset=".3" stop-color="#cdd5dc"/><stop offset=".7" stop-color="#8b97a3"/><stop offset="1" stop-color="#4b5661"/></linearGradient>
        <linearGradient id="stT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b9c3cc"/></linearGradient>
        <linearGradient id="flm" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3d00"/><stop offset=".5" stop-color="#ff9100"/><stop offset="1" stop-color="#ffee58"/></linearGradient>
        <pattern id="grF" width="60" height="30" patternUnits="userSpaceOnUse"><path d="M60 0H0V30" fill="none" stroke="#29abe2" stroke-opacity=".14"/></pattern>
        <filter id="sh"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".45"/></filter>
        <filter id="gl"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="1200" height="700" fill="url(#skD)"/>
      <rect y="250" width="1200" height="450" fill="url(#glB)"/>
      <path d="M0 470V430h50v-40h30v40h60v-70h24v70h80v-30h40v30h120v-55h20v55h160v-90h28v90h90v-40h50v40h110v-65h26v65h90v-35h60v35h62v40z" fill="#1b2833"/>
      <rect y="470" width="1200" height="230" fill="url(#flD)"/>
      <rect y="470" width="1200" height="230" fill="url(#grF)"/>
      <rect y="468" width="1200" height="3" fill="#29abe2" opacity=".6"/>
      <g filter="url(#sh)">
        <rect x="1040" y="160" width="22" height="315" fill="url(#stV)"/>
        <rect x="1040" y="250" width="22" height="8" fill="#29abe2"/>
        <rect x="1033" y="150" width="36" height="14" rx="3" fill="url(#stH)"/>
        <rect x="55" y="325" width="190" height="150" fill="url(#stV)"/><ellipse cx="150" cy="325" rx="95" ry="22" fill="url(#stT)"/>
        <path d="M55 345a95 22 0 0 0 190 0" fill="none" stroke="#29abe2" stroke-width="5"/>
        <rect x="275" y="365" width="135" height="110" fill="url(#stV)"/><ellipse cx="342" cy="365" rx="67.5" ry="16" fill="url(#stT)"/>
        <rect x="520" y="120" width="72" height="355" rx="36" fill="url(#stV)"/>
        <rect x="640" y="378" width="300" height="100" rx="50" fill="url(#stH)"/>
        <rect x="690" y="458" width="34" height="18" fill="#2b3640"/><rect x="856" y="458" width="34" height="18" fill="#2b3640"/>
      </g>
      <rect x="505" y="300" width="102" height="9" rx="3" fill="#9aa6b1"/><rect x="505" y="215" width="102" height="9" rx="3" fill="#9aa6b1"/>
      <rect x="690" y="392" width="200" height="10" rx="5" fill="#fff" opacity=".6"/>
      <rect x="660" y="455" width="260" height="4" fill="#29abe2" opacity=".9"/>
      <path d="M245 400H275M410 420H520M592 250H640V378M790 378V300H1040" fill="none" stroke="#2b3640" stroke-width="16" stroke-linecap="round"/>
      <path d="M245 400H275M410 420H520M592 250H640V378M790 378V300H1040" fill="none" stroke="#c7d0d8" stroke-width="10" stroke-linecap="round"/>
      <path d="M245 400H275M410 420H520M592 250H640V378M790 378V300H1040" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7" transform="translate(-1,-2)"/>
      <circle cx="470" cy="455" r="22" fill="url(#stV)" filter="url(#sh)"/><path d="M460 443 484 455 460 467z" fill="#29abe2"/>
      <path class="flame big" d="M1051 66C1085 104 1080 132 1051 148 1022 132 1017 104 1051 66Z" fill="url(#flm)" filter="url(#gl)"/>
      <g class="lights">
        <circle cx="556" cy="140" r="4" fill="#29abe2" filter="url(#gl)"/><circle cx="1051" cy="190" r="4" fill="#29abe2" filter="url(#gl)"/>
        <circle cx="150" cy="320" r="4" fill="#29abe2" filter="url(#gl)"/><circle cx="905" cy="390" r="4" fill="#29abe2" filter="url(#gl)"/>
      </g>
      <g class="steam" fill="#e6edf2" opacity=".55"><ellipse cx="556" cy="100" rx="18" ry="10"/><ellipse cx="576" cy="80" rx="14" ry="8"/><ellipse cx="561" cy="60" rx="10" ry="6"/></g>
    </svg>`;
  }

  /* ---------- MENU ---------- */
  function showMenu() {
    stopAll();
    const save = loadJSON(SAVE_KEY);
    const saveScn = save && SCENARIOS.find(s => s.id === save.scenarioId);
    const canContinue = saveScn && !save.finished;
    app.innerHTML = `<div class="screen menu">
      ${sceneSVG()}
      <div class="menu-card">
        <img class="logo-full" src="${BRAND.logo}" alt="PSM Simulator by Nusa Safety">
        <p class="tagline">${esc(APP_INFO.tagline)}</p>
        <div class="menu-btns">
          <button class="btn3d primary big" data-act="new">${ICON.play}<span>New Game</span></button>
          <button class="btn3d dark big" data-act="continue" ${canContinue ? '' : 'disabled'}>${ICON.bolt}<span>Continue</span>${canContinue ? `<small>${esc(saveScn.title)} · Tahap ${save.stage}</small>` : '<small>Belum ada permainan tersimpan</small>'}</button>
          <button class="btn3d silver big" data-act="config">${ICON.gear}<span>Configuration</span></button>
          <button class="btn3d silver big" data-act="credit">${ICON.star}<span>Credit</span></button>
        </div>
      </div>
      <footer class="menu-foot">${esc(APP_INFO.name)} v${APP_INFO.version} · © ${esc(CREDITS.tahun)} ${esc(CREDITS.organisasi)}</footer>
    </div>`;
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
    app.innerHTML = `<div class="screen sub">
      ${sceneSVG()}
      <div class="panel wide">
        <div class="panel-head"><h2>Pilih Skenario Proses</h2><button class="btn3d silver small" data-act="back">${ICON.home}<span>Menu</span></button></div>
        <p class="muted">Setiap skenario memuat P&amp;ID, simulasi proses produksi, kejadian abnormal dengan peringatan lapangan, serta titik pemasangan barier dan program inspeksi. Mulailah dari tingkat Pemula bila baru mengenal keselamatan proses.</p>
        <div class="scn-grid">
          ${SCENARIOS.map(s => `<div class="scn-card" data-id="${s.id}" style="--accent:${s.color}">
            <div class="scn-badge">${esc(s.level)}</div>
            <div class="scn-icon">${scnIcon(s.id)}</div>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.subtitle)}</p>
            <div class="scn-meta"><span>${esc(s.sector)}</span>${hist[s.id] ? `<span class="best">Terbaik: ${hist[s.id].total} (${hist[s.id].grade})</span>` : ''}</div>
            <button class="btn3d primary">${ICON.play}<span>Mulai</span></button>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
    on(app, '[data-act=back]', 'click', () => { Sfx.click(); showMenu(); });
    on(app, '.scn-card button', 'click', ev => {
      Sfx.start();
      const id = ev.currentTarget.closest('.scn-card').dataset.id;
      const existing = loadJSON(SAVE_KEY);
      const start = () => startScenario(SCENARIOS.find(s => s.id === id));
      if (existing && !existing.finished) {
        showModal({ title: 'Permainan tersimpan akan ditimpa', body: '<p>Ada permainan yang belum selesai. Memulai permainan baru akan menghapus progres tersebut. Lanjutkan?</p>',
          buttons: [{ label: 'Ya, mulai baru', cls: 'btn3d primary', onClick: start }, { label: 'Batal', cls: 'btn3d silver' }] });
      } else start();
    });
  }
  function scnIcon(id) {
    const steel = '<defs><linearGradient id="si-%" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#b9c3cc"/><stop offset="1" stop-color="#5d6874"/></linearGradient><linearGradient id="sv-%" x1="0" x2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#b9c3cc"/><stop offset="1" stop-color="#5d6874"/></linearGradient></defs>';
    if (id === 'separator') return `<svg viewBox="0 0 80 60">${steel.replace(/%/g, 'a')}<rect x="8" y="18" width="64" height="26" rx="13" fill="url(#si-a)" stroke="#2b3640" stroke-width="2"/><rect x="18" y="21" width="44" height="4" rx="2" fill="#fff" opacity=".8"/><rect x="16" y="37" width="48" height="3" fill="#29abe2"/><path d="M40 18V6M14 44v10M62 44v10" stroke="#2b3640" stroke-width="4" stroke-linecap="round"/></svg>`;
    if (id === 'reactor') return `<svg viewBox="0 0 80 60">${steel.replace(/%/g, 'b')}<rect x="18" y="16" width="44" height="30" rx="12" fill="#5cc6ef" opacity=".55" stroke="#1572a8" stroke-width="2"/><rect x="22" y="6" width="36" height="48" rx="14" fill="url(#sv-b)" stroke="#2b3640" stroke-width="2"/><path d="M40 2v30M30 32h20" stroke="#2b3640" stroke-width="3" stroke-linecap="round"/></svg>`;
    return `<svg viewBox="0 0 80 60">${steel.replace(/%/g, 'c')}<rect x="6" y="14" width="56" height="26" rx="13" fill="url(#si-c)" stroke="#2b3640" stroke-width="2"/><rect x="14" y="34" width="40" height="3" fill="#29abe2"/><path d="M62 40v-18h8l6 8v10z" fill="#2b3640"/><path d="M64 26h5l4 5h-9z" fill="#8fdcf7"/><circle cx="18" cy="44" r="6" fill="#1d262e"/><circle cx="34" cy="44" r="6" fill="#1d262e"/><circle cx="68" cy="44" r="6" fill="#1d262e"/></svg>`;
  }

  /* ---------- KONFIGURASI ---------- */
  function showConfig() {
    app.innerHTML = `<div class="screen sub">
      ${sceneSVG()}
      <div class="panel">
        <div class="panel-head"><h2>Konfigurasi</h2><button class="btn3d silver small" data-act="back">${ICON.home}<span>Menu</span></button></div>
        <div class="cfg-row"><label for="cfg-name">Nama pemain</label><input type="text" id="cfg-name" maxlength="30" value="${esc(cfg.name)}" placeholder="Opsional, tampil di hasil"></div>
        <div class="cfg-row"><label>Efek suara</label><label class="switch"><input type="checkbox" id="cfg-sound" ${cfg.sound ? 'checked' : ''}><span></span></label></div>
        <div class="cfg-row"><label>Animasi latar dan aliran</label><label class="switch"><input type="checkbox" id="cfg-anim" ${cfg.anim ? 'checked' : ''}><span></span></label></div>
        <div class="cfg-row"><label>Efek kilatan dan guncangan saat insiden<small>Matikan bila sensitif terhadap cahaya berkedip</small></label><label class="switch"><input type="checkbox" id="cfg-fx" ${cfg.fx ? 'checked' : ''}><span></span></label></div>
        <div class="cfg-row"><label>Petunjuk titik pemasangan dan penanda barier belum diuji</label><label class="switch"><input type="checkbox" id="cfg-hints" ${cfg.hints ? 'checked' : ''}><span></span></label></div>
        <div class="cfg-row"><label for="cfg-speed">Kecepatan simulasi</label><select id="cfg-speed"><option value="0.5" ${cfg.speed == 0.5 ? 'selected' : ''}>Lambat (0,5x)</option><option value="1" ${cfg.speed == 1 ? 'selected' : ''}>Normal (1x)</option><option value="2" ${cfg.speed == 2 ? 'selected' : ''}>Cepat (2x)</option></select></div>
        <div class="cfg-row"><label for="cfg-diff">Tingkat kesulitan</label><select id="cfg-diff"><option value="mudah" ${cfg.difficulty === 'mudah' ? 'selected' : ''}>Mudah (anggaran +3, petunjuk lengkap)</option><option value="normal" ${cfg.difficulty === 'normal' ? 'selected' : ''}>Normal</option><option value="sulit" ${cfg.difficulty === 'sulit' ? 'selected' : ''}>Sulit (anggaran -2, tanpa penjelasan kuis)</option></select></div>
        <div class="cfg-actions">
          <button class="btn3d primary" data-act="save">${ICON.check}<span>Simpan</span></button>
          <button class="btn3d red" data-act="reset">${ICON.x}<span>Hapus Semua Data</span></button>
        </div>
      </div></div>`;
    on(app, '[data-act=back]', 'click', () => { Sfx.click(); showMenu(); });
    on(app, '[data-act=save]', 'click', () => {
      cfg.name = $('#cfg-name').value.trim();
      cfg.sound = $('#cfg-sound').checked; cfg.anim = $('#cfg-anim').checked; cfg.fx = $('#cfg-fx').checked; cfg.hints = $('#cfg-hints').checked;
      cfg.speed = parseFloat($('#cfg-speed').value); cfg.difficulty = $('#cfg-diff').value;
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
    document.body.classList.toggle('no-anim', !cfg.anim);
    document.body.classList.toggle('no-fx', !fxOn());
  }

  /* ---------- CREDIT ---------- */
  function showCredits() {
    app.innerHTML = `<div class="screen sub">
      ${sceneSVG()}
      <div class="panel">
        <div class="panel-head"><h2>Credit</h2><button class="btn3d silver small" data-act="back">${ICON.home}<span>Menu</span></button></div>
        <div class="credit-hero"><img src="${BRAND.logo}" alt="PSM Simulator by Nusa Safety"><p>${esc(APP_INFO.tagline)} · versi ${esc(APP_INFO.version)}</p></div>
        <div class="credit-company">
          <span class="lbl">Dipersembahkan oleh</span>
          <div class="brand-plate"><img src="${BRAND.company}" alt="Nusa Safety"></div>
          <span class="org">PT. Nusa Rendra Jayatama</span>
        </div>
        <dl class="credit-list">
          <dt>Konsep dan materi keselamatan proses</dt><dd>${esc(CREDITS.konsep)}</dd>
          <dt>Organisasi</dt><dd>${esc(CREDITS.organisasi)}</dd>
          <dt>Pengembangan perangkat lunak</dt><dd>${esc(CREDITS.pengembang)}</dd>
          <dt>Tahun</dt><dd>${esc(CREDITS.tahun)}</dd>
        </dl>
        <h4>Kerangka konsep</h4>
        <p class="muted">Alur permainan mengikuti model lapisan proteksi dan diagram bow-tie: memahami kondisi normal (BPCS), mengenali deviasi dan tanda-tanda lapangan (HAZOP), memasang barier pencegahan dan mitigasi, serta menjaga keandalan barier melalui inspeksi, pengujian, dan perawatan (elemen integritas aset pada Risk Based Process Safety). Tampilan mengikuti filosofi HMI berperforma tinggi: warna mencolok hanya untuk kondisi abnormal.</p>
        <h4>Referensi</h4>
        <ol class="refs">${CREDITS.referensi.map(r => `<li>${esc(r)}</li>`).join('')}</ol>
        <p class="muted small">Skenario, nilai parameter, nilai PFD, dan tata letak P&amp;ID disederhanakan untuk tujuan pelatihan dan bukan rancangan rekayasa yang dapat dipakai langsung di lapangan.</p>
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
        <div class="top-actions"><button class="btn3d silver small" data-act="menu">${ICON.home}<span>Menu</span></button></div>
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
    scn.equipment.forEach(e => { if (e.level) pid.setLevel(e.id, sim.vars[e.level] / 100); });
  }
  function onSimTick(s) {
    renderPlant();
    const alarmNodes = {};
    Object.keys(scn.vars).forEach(id => { if (s.status(id) !== 'normal') alarmNodes[scn.vars[id].node] = true; });
    scn.equipment.forEach(e => pid.alarmNode(e.id, !!alarmNodes[e.id]));
    const info = $('#eq-live');
    if (info && info.dataset.id) {
      const e = scn.equipment.find(x => x.id === info.dataset.id);
      if (e && e.vars) info.innerHTML = liveHTML(e);
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
    const v = $('#ps-val'); if (v) v.textContent = num(sim.prod, scn.production.unit === 'm³' ? 1 : 0) + ' ' + scn.production.unit;
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
      1: ['Klik setiap peralatan pada P&ID atau daftar di panel kanan untuk membaca fungsinya.', 'Tekan Jalankan Proses Produksi dan ubah set point untuk melihat respons proses serta isi cairan di bejana.', 'Setelah semua peralatan dipelajari, kerjakan kuis pemahaman proses.'],
      2: ['Tekan Jalankan Proses Produksi, lalu amati tren, pembacaan, dan isi bejana di P&ID.', 'Saat terjadi kegagalan, peringatan lapangan muncul bertahap: getaran, kebocoran gas, gas beracun, panas berlebih, hingga ledakan.', 'Laporkan sedini mungkin. Laporan sebelum peringatan kritis mendapat bonus, sedangkan laporan setelah insiden terjadi mendapat penalti.'],
      3: ['Tab Perangkat Barier: pilih perangkat, lalu klik titik pemasangan (lingkaran biru) pada P&ID.', 'Tab Inspeksi & Pengujian: pilih program, lalu klik perangkat terpasang atau peralatan seperti bejana, tangki, pompa, dan kompresor.', 'Barier tanpa pengujian berkala tidak dapat diandalkan. Pantau indikator keandalan dan anggaran.', 'Klik perangkat atau peralatan tanpa memilih alat untuk melihat detail atau melepasnya.'],
      4: ['Pikirkan apa yang terjadi bila pencegahan gagal: deteksi, isolasi, proteksi kebakaran, dan tanggap darurat.', 'Perhatikan sifat bahan, karena tidak semua media pemadam cocok untuk semua bahan.', 'Lengkapi setiap barier mitigasi dengan program uji: bump test detektor, uji sistem pemadam, uji fungsi ESD, dan latihan tanggap darurat.'],
    };
    return `<ul class="tips">${tips[n].map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  }

  function resetPlant() {
    clearTimers();
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
        <button class="btn3d primary wide" id="btn-run">${ICON.play}<span>Jalankan Proses Produksi</span></button>
        ${prodStatsHTML()}
        <p class="muted small">Ubah set point dan amati tren, pembacaan, serta isi cairan di bejana.</p>
        <div class="sliders">${scn.controls.map(c => `<label class="slider"><span>${esc(c.label)} <b id="val-${c.id}">${String(c.def).replace('.', ',')} ${esc(c.unit)}</b></span><input type="range" data-ctl="${c.id}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.def}"></label>`).join('')}</div>
      </div>
      <div class="card"><h4>Peralatan <span class="pill" id="read-count">0/${req.length}</span></h4>
        <p class="muted small">Klik peralatan di P&amp;ID atau di daftar ini.</p>
        <ul class="eq-list">${req.map(e => `<li data-id="${e.id}"><span class="dot"></span><b>${esc(e.id)}</b><span>${esc(e.name)}</span></li>`).join('')}</ul>
      </div>
      <div class="card" id="eq-info"><h4>Informasi Peralatan</h4><p class="muted">Belum ada peralatan dipilih.</p></div>
      <div class="card"><h4>Legenda Jalur</h4><ul class="legend">${PID.fluidsIn(scn).map(f => `<li><span class="sw" style="--c:${f.c}"></span>${esc(f.name)}</li>`).join('')}<li><span class="sw ro"></span>Pembacaan DCS (kuning/merah saat alarm)</li></ul></div>
      <div class="card action"><button class="btn3d dark wide" id="btn-quiz" disabled>${ICON.check}<span>Mulai Kuis Pemahaman</span></button><p class="muted small" id="quiz-hint">Pelajari semua peralatan terlebih dahulu.</p></div>`;
    S.read.forEach(id => markRead(id, true));
    on(side, '.eq-list li', 'click', ev => { const e = scn.equipment.find(x => x.id === ev.currentTarget.dataset.id); onEquipmentClick(e); });
    $('#btn-run').addEventListener('click', () => {
      Sfx.click();
      const running = sim.running;
      runSim(!running);
      setStatus(running ? 'Dijeda' : 'Normal', running ? 'idle' : 'ok');
      $('#btn-run').innerHTML = running ? `${ICON.play}<span>Lanjutkan Proses Produksi</span>` : `${ICON.pause}<span>Jeda Proses</span>`;
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
    scn.equipment.forEach(x => pid.highlight(x.id, false));
    pid.highlight(e.id, true);
    const info = $('#eq-info');
    if (info) info.innerHTML = `<h4>${esc(e.id)} <small>${esc(e.name)}</small></h4><p>${esc(e.desc)}</p>${e.vars ? `<div class="live-wrap" id="eq-live" data-id="${e.id}">${liveHTML(e)}</div>` : ''}`;
    if (S.stage === 1) { markRead(e.id); updateReadCount(); }
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
        <p class="muted small">Setiap kali proses produksi dijalankan, satu kegagalan akan muncul pada waktu yang tidak diketahui. Amati tren, pembacaan, dan peringatan lapangan, lalu laporkan secepatnya.</p>
        <div class="ev-track">${scn.events.map((e, i) => `<span class="ev-dot" data-i="${i}">${i + 1}</span>`).join('')}</div>
      </div>
      <div class="card prod-card">
        <button class="btn3d primary wide run-big" id="btn-run-prod">${ICON.factory}<span>Jalankan Proses Produksi</span></button>
        ${prodStatsHTML()}
        <div class="alarm-box" id="alarm-box"><span class="lamp"></span><span id="alarm-text">Proses belum berjalan</span></div>
        <button class="btn3d red wide" id="btn-report" disabled>${ICON.alert}<span>Hentikan &amp; Laporkan Abnormalitas</span></button>
      </div>
      <div class="card warn-card"><h4>Peringatan Lapangan <span class="pill warn" id="warn-count">0</span></h4>
        <ul class="warn-log" id="warn-log"><li class="empty">Belum ada peringatan. Proses berjalan normal.</li></ul>
      </div>
      <div class="card" id="eq-info"><h4>Informasi Peralatan</h4><p class="muted">Klik peralatan untuk melihat detail dan nilai proses.</p></div>
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
    const b = $('#btn-run-prod'); b.disabled = true; b.innerHTML = `${ICON.factory}<span>Proses produksi berjalan...</span>`;
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
    if (w.type === 'leak' || w.type === 'toxic' || w.type === 'spill') Sfx.hiss();
    else if (w.type === 'fire') Sfx.crackle();
    if (w.type !== 'explosion') Sfx.warn();
    if (w.sev === 'crit') setStatus('Bahaya', 'crit');
  }
  function triggerIncident(w) {
    ev2.incident = true; ev2.reported = true;
    sim.halted = true;
    runSim(false);
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
      <div class="rp-sec"><b>Konsekuensi bila tidak ada proteksi</b>${shuffledOpts(evt.cons, evt.consAns, 'rp-cons')}</div>`;
    showModal({ title: `Laporan Abnormalitas ${S.eventIdx + 1}${auto ? ' (otomatis)' : ''}`, cls: 'report', body,
      buttons: [{ label: 'Kirim Laporan', cls: 'btn3d primary', keep: true, onClick: () => submitReport() }] });
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
    const score = Math.max(0, Math.min(100, base + mod));
    S.eventResults.push({ node, param, guide, score, phase: ev2.phase });
    closeModal();
    if (score >= 60) Sfx.success(); else Sfx.fail();
    const row = (lbl, ok, ans) => `<tr><td>${lbl}</td><td class="${ok ? 'ok' : 'bad'}">${ok ? 'Benar' : 'Salah'}</td><td>${esc(ans)}</td></tr>`;
    const seen = evt.warnings.slice(0, ev2.warnIdx);
    const chain = evt.warnings.map((w, i) => `<li class="sev-${w.sev} ${i < ev2.warnIdx ? 'seen' : 'unseen'}"><span class="wi">${ICON[w.type]}</span><div><b>${esc(WARN_TYPES[w.type].title)}</b> <small>${i < ev2.warnIdx ? 'terjadi' : 'dicegah'}</small><p>${esc(w.text)}</p></div></li>`).join('');
    showModal({ title: `Hasil Laporan ${S.eventIdx + 1}: ${score} poin`, cls: 'report',
      body: `<table class="result-table"><tr><th>Unsur</th><th>Penilaian</th><th>Jawaban yang diharapkan</th></tr>
        ${row('Node', pts.node, a.node.join(' / '))}${row('Parameter', pts.param, a.param.map(p => PARAMS[p]).join(' / '))}${row('Guideword', pts.guide, a.guide.map(g => GUIDEWORDS[g].split(' (')[0]).join(' / '))}${row('Penyebab', pts.cause, evt.causes[evt.causeAns])}${row('Konsekuensi', pts.cons, evt.cons[evt.consAns])}</table>
        ${modTxt}<p class="explain">${esc(evt.explain)}</p>
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
          b.innerHTML = `${ICON.factory}<span>Jalankan Proses Produksi (kejadian ${S.eventIdx + 1})</span>`;
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
    const cat = stage === 3 ? 'prevent' : 'mitigate';
    const devs = Object.keys(DEVICES).filter(k => DEVICES[k].cat === cat);
    const progs = Object.keys(ITPM).filter(k => ITPM[k].stage === stage);
    const hs = scn.hotspots.filter(h => h.stage === stage);
    const insp = eqInspectable(stage);
    const done = S.evalDone[stage];
    const side = $('#side');
    side.innerHTML = `<div class="side-head"><h2>${ICON[stage === 3 ? 'shield' : 'fire']}<span>Tahap ${stage}: Barier ${stage === 3 ? 'Pencegahan' : 'Mitigasi'}</span></h2></div>
      <div class="card budget"><div class="budget-row"><span>${ICON.coin} Anggaran</span><b id="budget-val"></b></div><div class="budget-bar"><div id="budget-fill"></div></div><p class="muted small">${stage === 3 ? 'Pasang instrumen deteksi dan proteksi yang memutus rantai kejadian sebelum kehilangan kontainmen, lalu jaga keandalannya.' : 'Pasang perangkat yang membatasi dampak bila kehilangan kontainmen tetap terjadi, lalu jaga keandalannya.'}</p></div>
      <div class="card rel"><h4>${ICON.gauge}<span>Keandalan Sistem Proteksi</span></h4>
        <div class="rel-row"><b id="rel-val">0%</b><span id="rel-sub">Belum ada barier terpasang</span></div>
        <div class="rel-bar"><div id="rel-fill"></div></div>
        <p class="muted small">Barier tanpa inspeksi dan pengujian berkala menyimpan kegagalan tersembunyi sehingga PFD-nya naik sekitar ${UNTESTED_FACTOR} kali. Kriteria IPL pada LOPA mensyaratkan barier dapat diaudit melalui pengujian.</p>
      </div>
      <div class="card"><h4>Kotak Alat</h4>
        <div class="tabs" role="tablist"><button class="tab" data-tab="dev">${ICON.shield}<span>Perangkat Barier</span></button><button class="tab" data-tab="itpm">${ICON.wrench}<span>Inspeksi &amp; Pengujian</span></button></div>
        <div class="toolbox" id="tb-dev">${devs.map(k => `<button class="tool" data-kind="dev" data-id="${k}" style="--c:${DEVICES[k].color}"><span class="tcode">${esc(DEVICES[k].code)}</span><span class="tname">${esc(DEVICES[k].name)}</span><span class="tcost">${DEVICES[k].cost}</span></button>`).join('')}</div>
        <div class="toolbox" id="tb-itpm">${progs.map(k => `<button class="tool itpm" data-kind="itpm" data-id="${k}"><span class="tcode">${esc(ITPM[k].code)}</span><span class="tname">${esc(ITPM[k].name)}</span><span class="tcost">${ITPM[k].cost}</span></button>`).join('')}</div>
        <div class="tool-desc" id="tool-desc">Pilih alat untuk membaca fungsinya.</div>
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
    if (!tool) { desc.innerHTML = 'Pilih alat untuk membaca fungsinya.'; pid.setTargets(null); return; }
    if (tool.kind === 'dev') {
      const d = DEVICES[tool.id];
      desc.innerHTML = `<b>${esc(d.name)}</b><br>${esc(d.desc)}<div class="meta"><span>Biaya ${d.cost}</span><span>PFD desain ${String(d.pfd).replace('.', ',')}</span><span>Program uji: ${esc(ITPM[d.itpm].name)}</span></div>`;
      pid.setTargets(null);
    } else {
      const t = ITPM[tool.id];
      const fitTxt = t.target === 'device' ? t.fits.map(k => DEVICES[k].code).join(', ') : t.fitsEq.map(x => ({ vessel: 'bejana tekan', reactor: 'reaktor', tank: 'tangki', truck: 'truk tangki', hx: 'penukar panas', pump: 'pompa', compressor: 'kompresor', motor: 'motor/agitator' }[x])).join(', ');
      desc.innerHTML = `<b>${esc(t.name)}</b><br>${esc(t.desc)}<div class="meta"><span>Biaya ${t.cost}</span><span>Berlaku untuk: ${esc(fitTxt)}</span></div><p class="muted small">${t.target === 'device' ? 'Klik perangkat terpasang yang berbingkai biru di P&amp;ID.' : 'Klik peralatan yang berbingkai biru di P&amp;ID.'}</p>`;
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
    const b = budgetFor(stage), sp = spent(stage);
    const bv = $('#budget-val'); if (bv) bv.textContent = `${b - sp} / ${b}`;
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
  function placeDevice(stage, h, devId) {
    const cur = devState(stage, h.id);
    const refund = cur ? cur.d.cost + (S.itpm[stage][h.id] ? ITPM[S.itpm[stage][h.id]].cost : 0) : 0;
    const d = DEVICES[devId];
    if (cur && cur.dev === devId) { showToast(`${d.name} sudah terpasang di titik ini.`); return; }
    if (spent(stage) - refund + d.cost > budgetFor(stage)) { Sfx.fail(); showToast('Anggaran tidak cukup untuk ' + d.name + '.'); return; }
    S.placements[stage][h.id] = devId;
    delete S.itpm[stage][h.id];
    Sfx.place(); save(); refreshBarrierUI(stage);
    if (cur) showToast(`${cur.d.name} diganti dengan ${d.name}. Program uji sebelumnya dilepas.`);
  }
  function applyItpmToDevice(stage, h) {
    const st = devState(stage, h.id);
    const t = ITPM[tool.id];
    if (t.target !== 'device') { showToast(`${t.name} diterapkan pada peralatan proses, bukan pada perangkat barier.`); return; }
    if (!t.fits.includes(st.dev)) { Sfx.fail(); showToast(`${t.name} tidak sesuai untuk ${st.d.name}.`); return; }
    if (st.tested) { showToast('Program ini sudah diterapkan pada perangkat tersebut.'); return; }
    if (spent(stage) + t.cost > budgetFor(stage)) { Sfx.fail(); showToast('Anggaran tidak cukup untuk ' + t.name + '.'); return; }
    S.itpm[stage][h.id] = tool.id;
    Sfx.test(); save(); refreshBarrierUI(stage);
  }
  function onHotspotClick(h) {
    const stage = S.stage;
    if (S.evalDone[stage]) { showToast(h.label + ': ' + h.why); return; }
    if (!tool) { Sfx.click(); showToast('Pilih perangkat dari kotak alat terlebih dahulu. Titik: ' + h.label); return; }
    if (tool.kind === 'itpm') { showToast('Pasang perangkat barier di titik ini terlebih dahulu, lalu terapkan program pengujiannya.'); return; }
    placeDevice(stage, h, tool.id);
  }
  function onDeviceClick(h, devId) {
    const stage = S.stage;
    if (S.evalDone[stage]) { showToast(h.label + ': ' + h.why); return; }
    if (tool && tool.kind === 'itpm') { applyItpmToDevice(stage, h); return; }
    if (tool && tool.kind === 'dev') { placeDevice(stage, h, tool.id); return; }
    const st = devState(stage, h.id);
    const it = S.itpm[stage][h.id];
    const btns = [{ label: 'Lepas Perangkat', cls: 'btn3d red', onClick: () => { delete S.placements[stage][h.id]; delete S.itpm[stage][h.id]; Sfx.remove(); save(); refreshBarrierUI(stage); } }];
    if (it) btns.push({ label: 'Lepas Program Uji', cls: 'btn3d silver', onClick: () => { delete S.itpm[stage][h.id]; Sfx.remove(); save(); refreshBarrierUI(stage); } });
    btns.push({ label: 'Tutup', cls: 'btn3d primary' });
    showModal({ title: esc(st.d.name), cls: 'detail',
      body: `<p>${esc(st.d.desc)}</p>
        <table class="kv"><tr><th>Lokasi</th><td>${esc(h.label)}</td></tr>
        <tr><th>PFD desain</th><td>${String(st.d.pfd).replace('.', ',')} (faktor pengurangan risiko ${num(1 / st.d.pfd)})</td></tr>
        <tr><th>Program uji</th><td>${it ? esc(ITPM[it].name) : '<span class="bad">Belum ada</span>'}</td></tr>
        <tr><th>PFD efektif</th><td>${String(+st.pfd.toFixed(3)).replace('.', ',')}${st.tested ? '' : ' (naik karena tidak diuji)'}</td></tr>
        <tr><th>Keandalan yang dapat dikreditkan</th><td><b>${pct(st.rel)}</b></td></tr></table>
        ${st.tested ? '' : `<p class="note">Dalam LOPA, barier yang tidak diuji secara berkala tidak dapat dikreditkan sepenuhnya karena kegagalan tersembunyinya tidak pernah terungkap. Terapkan <b>${esc(ITPM[st.d.itpm].name)}</b> agar barier ini dapat diklaim sebagai lapisan proteksi independen.</p>`}`,
      buttons: btns });
  }
  function onEquipmentBarrier(e) {
    const stage = S.stage;
    if (!e) return;
    const eqm = (S.eqItpm && S.eqItpm[stage]) || null;
    if (tool && tool.kind === 'dev') { showToast('Perangkat barier dipasang pada titik pemasangan (lingkaran biru), bukan langsung pada peralatan.'); return; }
    if (tool && tool.kind === 'itpm') {
      const t = ITPM[tool.id];
      if (S.evalDone[stage]) { showToast('Tahap ini sudah dievaluasi.'); return; }
      if (t.target !== 'equipment' || !eqm) { showToast(`${t.name} diterapkan pada perangkat barier terpasang.`); return; }
      if (!t.fitsEq.includes(e.type)) { Sfx.fail(); showToast(`${t.name} tidak sesuai untuk ${e.name}.`); return; }
      const cur = eqm[e.id];
      if (cur === tool.id) { showToast('Program ini sudah diterapkan pada peralatan tersebut.'); return; }
      const refund = cur ? ITPM[cur].cost : 0;
      if (spent(stage) - refund + t.cost > budgetFor(stage)) { Sfx.fail(); showToast('Anggaran tidak cukup untuk ' + t.name + '.'); return; }
      eqm[e.id] = tool.id;
      Sfx.test(); save(); refreshBarrierUI(stage);
      return;
    }
    Sfx.click();
    const cur = eqm && eqm[e.id];
    const btns = [];
    if (cur && !S.evalDone[stage]) btns.push({ label: 'Lepas Program', cls: 'btn3d red', onClick: () => { delete eqm[e.id]; Sfx.remove(); save(); refreshBarrierUI(stage); } });
    btns.push({ label: 'Tutup', cls: 'btn3d primary' });
    showModal({ title: esc(e.id + ' · ' + e.name), cls: 'detail',
      body: `<p>${esc(e.desc)}</p>${eqm && eqInspectable(stage).some(x => x.id === e.id) ? `<table class="kv"><tr><th>Program inspeksi</th><td>${cur ? esc(ITPM[cur].name) : '<span class="bad">Belum ada</span>'}</td></tr></table>` : ''}`,
      buttons: btns });
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
          <div><span>Anggaran terpakai</span><b>${spent(stage)}/${budgetFor(stage)}</b></div>
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
      ${sceneSVG()}
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
    window.addEventListener('resize', () => { if (chart) chart.draw(); });
    window.addEventListener('keydown', ev => { if (ev.key === 'Escape' && tool && S && S.stage >= 3 && $('#tool-desc')) selectTool(null, null); });
  }
  return { init, showMenu };
})();

document.addEventListener('DOMContentLoaded', Game.init);
