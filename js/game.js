/* =====================================================================
   GAME: alur permainan PSM Simulator
   Layar: menu, pilih skenario, bermain (4 tahap), hasil, konfigurasi,
   credit. Progres disimpan di localStorage.
   ===================================================================== */
const Game = (() => {
  const SAVE_KEY = 'psm_sim_save_v1';
  const CFG_KEY = 'psm_sim_cfg_v1';
  const HIST_KEY = 'psm_sim_hist_v1';
  const DEFAULT_CFG = { sound: true, speed: 1, difficulty: 'normal', hints: true, anim: true, name: '' };

  const app = document.getElementById('app');
  let cfg = loadJSON(CFG_KEY) || Object.assign({}, DEFAULT_CFG);
  cfg = Object.assign({}, DEFAULT_CFG, cfg);
  let S = null;          // sesi permainan aktif
  let scn = null;        // skenario aktif
  let pid = null, sim = null, chart = null, chartRaf = 0;
  let selectedDevice = null;

  /* ---------- utilitas ---------- */
  function loadJSON(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function on(root, sel, evt, fn) { $$(sel, root).forEach(n => n.addEventListener(evt, fn)); }
  function grade(score) { return score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D'; }
  function gradeLabel(g) { return { A: 'Sangat Baik', B: 'Baik', C: 'Cukup', D: 'Perlu Pelatihan Ulang' }[g]; }

  const ICON = {
    book: '<svg viewBox="0 0 24 24"><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>',
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
    coin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">$</text></svg>',
  };

  /* ---------- modal ---------- */
  function showModal(o) {
    closeModal();
    const m = document.createElement('div');
    m.className = 'modal-wrap';
    m.innerHTML = `<div class="modal ${o.cls || ''}">
      ${o.title ? `<div class="modal-head"><h3>${o.title}</h3></div>` : ''}
      <div class="modal-body">${o.body || ''}</div>
      <div class="modal-foot">${(o.buttons || [{ label: 'Tutup', cls: 'btn3d blue' }]).map((b, i) => `<button class="${b.cls || 'btn3d blue'}" data-i="${i}">${b.label}</button>`).join('')}</div>
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

  /* ---------- latar belakang 3D (SVG animasi) ---------- */
  function sceneSVG() {
    return `<svg class="scene" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1565c0"/><stop offset="0.55" stop-color="#42a5f5"/><stop offset="1" stop-color="#b3e5fc"/></linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d7a8c"/><stop offset="1" stop-color="#2c3e50"/></linearGradient>
        <linearGradient id="cyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="0.3" stop-color="#cfd8dc"/><stop offset="0.75" stop-color="#78909c"/><stop offset="1" stop-color="#37474f"/></linearGradient>
        <linearGradient id="cylO" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe0b2"/><stop offset="0.3" stop-color="#ffb74d"/><stop offset="0.75" stop-color="#ef6c00"/><stop offset="1" stop-color="#bf360c"/></linearGradient>
        <linearGradient id="cylB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e3f2fd"/><stop offset="0.3" stop-color="#64b5f6"/><stop offset="0.75" stop-color="#1976d2"/><stop offset="1" stop-color="#0d47a1"/></linearGradient>
        <linearGradient id="cylG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8f5e9"/><stop offset="0.3" stop-color="#81c784"/><stop offset="0.75" stop-color="#388e3c"/><stop offset="1" stop-color="#1b5e20"/></linearGradient>
        <linearGradient id="flm" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3d00"/><stop offset="0.5" stop-color="#ff9100"/><stop offset="1" stop-color="#ffee58"/></linearGradient>
        <filter id="sh"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.35"/></filter>
        <filter id="gl"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="1200" height="700" fill="url(#sky)"/>
      <g class="clouds" fill="#fff" opacity="0.85">
        <g class="cloud c1"><ellipse cx="200" cy="120" rx="70" ry="28"/><ellipse cx="250" cy="105" rx="50" ry="32"/><ellipse cx="150" cy="110" rx="45" ry="26"/></g>
        <g class="cloud c2"><ellipse cx="800" cy="90" rx="80" ry="30"/><ellipse cx="860" cy="75" rx="55" ry="34"/><ellipse cx="740" cy="80" rx="48" ry="26"/></g>
      </g>
      <rect y="470" width="1200" height="230" fill="url(#ground)"/>
      <rect y="470" width="1200" height="8" fill="#90a4ae" opacity="0.6"/>
      <!-- flare -->
      <rect x="1040" y="150" width="22" height="330" fill="url(#cyl)" filter="url(#sh)"/>
      <rect x="1034" y="142" width="34" height="12" rx="3" fill="url(#cyl)"/>
      <path class="flame big" d="M1051 60 C1085 100 1080 130 1051 146 C1022 130 1017 100 1051 60Z" fill="url(#flm)" filter="url(#gl)"/>
      <!-- tanks -->
      <g filter="url(#sh)">
        <rect x="60" y="330" width="180" height="150" fill="url(#cylO)"/><ellipse cx="150" cy="330" rx="90" ry="22" fill="#ffcc80"/><ellipse cx="150" cy="480" rx="90" ry="22" fill="#bf360c"/>
        <rect x="270" y="360" width="140" height="120" fill="url(#cylB)"/><ellipse cx="340" cy="360" rx="70" ry="18" fill="#90caf9"/><ellipse cx="340" cy="480" rx="70" ry="18" fill="#0d47a1"/>
      </g>
      <!-- column -->
      <rect x="520" y="130" width="70" height="350" rx="35" fill="url(#cylG)" filter="url(#sh)"/>
      <rect x="505" y="300" width="100" height="10" rx="3" fill="#cfd8dc"/><rect x="505" y="220" width="100" height="10" rx="3" fill="#cfd8dc"/>
      <!-- horizontal separator -->
      <rect x="640" y="380" width="300" height="100" rx="50" fill="url(#cylB)" filter="url(#sh)"/>
      <rect x="680" y="392" width="220" height="12" rx="6" fill="#fff" opacity="0.5"/>
      <rect x="690" y="470" width="30" height="18" fill="#546e7a"/><rect x="860" y="470" width="30" height="18" fill="#546e7a"/>
      <!-- pipes -->
      <path d="M240 400 H270 M410 420 H520 M590 250 H640 V380 M790 380 V300 H1040" fill="none" stroke="#37474f" stroke-width="16" stroke-linecap="round"/>
      <path d="M240 400 H270 M410 420 H520 M590 250 H640 V380 M790 380 V300 H1040" fill="none" stroke="#b0bec5" stroke-width="10" stroke-linecap="round"/>
      <path d="M240 400 H270 M410 420 H520 M590 250 H640 V380 M790 380 V300 H1040" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.7" transform="translate(-1,-2)"/>
      <!-- pump -->
      <circle cx="470" cy="460" r="22" fill="url(#cylG)" filter="url(#sh)"/><path d="M460 448 L484 460 L460 472Z" fill="#fff"/>
      <!-- steam -->
      <g class="steam" fill="#fff" opacity="0.7"><ellipse cx="555" cy="110" rx="18" ry="10"/><ellipse cx="575" cy="90" rx="14" ry="8"/><ellipse cx="560" cy="70" rx="10" ry="6"/></g>
    </svg>`;
  }

  /* ---------- MENU ---------- */
  function showMenu() {
    stopAll();
    const save = loadJSON(SAVE_KEY);
    const canContinue = save && SCENARIOS.find(s => s.id === save.scenarioId) && !save.finished;
    app.innerHTML = `<div class="screen menu">
      ${sceneSVG()}
      <div class="menu-card">
        <img class="logo" src="assets/logo.svg" alt="PSM Simulator">
        <h1 class="title3d"><span class="t1">PSM</span><span class="t2">SIMULATOR</span></h1>
        <p class="tagline">${APP_INFO.tagline}</p>
        <div class="menu-btns">
          <button class="btn3d orange big" data-act="new">${ICON.play}<span>New Game</span></button>
          <button class="btn3d teal big" data-act="continue" ${canContinue ? '' : 'disabled'}>${ICON.bolt}<span>Continue</span>${canContinue ? `<small>${esc(SCENARIOS.find(s => s.id === save.scenarioId).title)} · Tahap ${save.stage}</small>` : '<small>Belum ada permainan tersimpan</small>'}</button>
          <button class="btn3d blue big" data-act="config">${ICON.gear}<span>Configuration</span></button>
          <button class="btn3d purple big" data-act="credit">${ICON.star}<span>Credit</span></button>
        </div>
      </div>
      <footer class="menu-foot">${esc(APP_INFO.name)} v${APP_INFO.version} · ${esc(CREDITS.organisasi)}</footer>
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
        <div class="panel-head"><h2>Pilih Skenario Proses</h2><button class="btn3d gray small" data-act="back">${ICON.home}<span>Menu</span></button></div>
        <p class="muted">Setiap skenario memuat P&amp;ID, simulasi proses, kejadian abnormal, dan titik pemasangan barier yang berbeda. Mulailah dari tingkat Pemula bila baru mengenal keselamatan proses.</p>
        <div class="scn-grid">
          ${SCENARIOS.map(s => `<div class="scn-card" data-id="${s.id}" style="--accent:${s.color}">
            <div class="scn-badge">${esc(s.level)}</div>
            <div class="scn-icon">${scnIcon(s.id)}</div>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.subtitle)}</p>
            <div class="scn-meta"><span>${esc(s.sector)}</span>${hist[s.id] ? `<span class="best">Terbaik: ${hist[s.id].total} (${hist[s.id].grade})</span>` : ''}</div>
            <button class="btn3d orange">${ICON.play}<span>Mulai</span></button>
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
          buttons: [{ label: 'Ya, mulai baru', cls: 'btn3d orange', onClick: start }, { label: 'Batal', cls: 'btn3d gray' }] });
      } else start();
    });
  }
  function scnIcon(id) {
    if (id === 'separator') return '<svg viewBox="0 0 80 60"><defs><linearGradient id="si1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#90caf9"/><stop offset="1" stop-color="#0d47a1"/></linearGradient></defs><rect x="8" y="18" width="64" height="26" rx="13" fill="url(#si1)" stroke="#0b3d91" stroke-width="2"/><rect x="18" y="21" width="44" height="4" rx="2" fill="#fff" opacity=".6"/><path d="M40 18V6M14 44v10M62 44v10" stroke="#37474f" stroke-width="4" stroke-linecap="round"/></svg>';
    if (id === 'reactor') return '<svg viewBox="0 0 80 60"><defs><linearGradient id="si2" x1="0" x2="1"><stop offset="0" stop-color="#ce93d8"/><stop offset="1" stop-color="#4a148c"/></linearGradient></defs><rect x="22" y="6" width="36" height="48" rx="14" fill="url(#si2)" stroke="#4a148c" stroke-width="2"/><rect x="18" y="16" width="44" height="30" rx="12" fill="none" stroke="#00acc1" stroke-width="3"/><path d="M40 2v30M30 32h20" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>';
    return '<svg viewBox="0 0 80 60"><defs><linearGradient id="si3" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#546e7a"/></linearGradient></defs><rect x="6" y="14" width="56" height="26" rx="13" fill="url(#si3)" stroke="#37474f" stroke-width="2"/><path d="M62 40v-18h8l6 8v10z" fill="#ff7043" stroke="#bf360c" stroke-width="2"/><circle cx="18" cy="44" r="6" fill="#263238"/><circle cx="34" cy="44" r="6" fill="#263238"/><circle cx="68" cy="44" r="6" fill="#263238"/></svg>';
  }

  /* ---------- KONFIGURASI ---------- */
  function showConfig() {
    app.innerHTML = `<div class="screen sub">
      ${sceneSVG()}
      <div class="panel">
        <div class="panel-head"><h2>Konfigurasi</h2><button class="btn3d gray small" data-act="back">${ICON.home}<span>Menu</span></button></div>
        <div class="cfg-row"><label>Nama pemain</label><input type="text" id="cfg-name" maxlength="30" value="${esc(cfg.name)}" placeholder="Opsional, tampil di hasil"></div>
        <div class="cfg-row"><label>Efek suara</label><label class="switch"><input type="checkbox" id="cfg-sound" ${cfg.sound ? 'checked' : ''}><span></span></label></div>
        <div class="cfg-row"><label>Animasi latar dan aliran</label><label class="switch"><input type="checkbox" id="cfg-anim" ${cfg.anim ? 'checked' : ''}><span></span></label></div>
        <div class="cfg-row"><label>Petunjuk titik pemasangan</label><label class="switch"><input type="checkbox" id="cfg-hints" ${cfg.hints ? 'checked' : ''}><span></span></label></div>
        <div class="cfg-row"><label>Kecepatan simulasi</label><select id="cfg-speed"><option value="0.5" ${cfg.speed == 0.5 ? 'selected' : ''}>Lambat (0,5x)</option><option value="1" ${cfg.speed == 1 ? 'selected' : ''}>Normal (1x)</option><option value="2" ${cfg.speed == 2 ? 'selected' : ''}>Cepat (2x)</option></select></div>
        <div class="cfg-row"><label>Tingkat kesulitan</label><select id="cfg-diff"><option value="mudah" ${cfg.difficulty === 'mudah' ? 'selected' : ''}>Mudah (anggaran +3, petunjuk lengkap)</option><option value="normal" ${cfg.difficulty === 'normal' ? 'selected' : ''}>Normal</option><option value="sulit" ${cfg.difficulty === 'sulit' ? 'selected' : ''}>Sulit (anggaran -2, tanpa penjelasan kuis)</option></select></div>
        <div class="cfg-actions">
          <button class="btn3d teal" data-act="save">${ICON.check}<span>Simpan</span></button>
          <button class="btn3d red" data-act="reset">${ICON.x}<span>Hapus Semua Data</span></button>
        </div>
      </div></div>`;
    on(app, '[data-act=back]', 'click', () => { Sfx.click(); showMenu(); });
    on(app, '[data-act=save]', 'click', () => {
      cfg.name = $('#cfg-name').value.trim();
      cfg.sound = $('#cfg-sound').checked; cfg.anim = $('#cfg-anim').checked; cfg.hints = $('#cfg-hints').checked;
      cfg.speed = parseFloat($('#cfg-speed').value); cfg.difficulty = $('#cfg-diff').value;
      saveJSON(CFG_KEY, cfg); applyCfg(); Sfx.success();
      showModal({ title: 'Tersimpan', body: '<p>Konfigurasi telah disimpan.</p>', buttons: [{ label: 'OK', cls: 'btn3d teal', onClick: showMenu }] });
    });
    on(app, '[data-act=reset]', 'click', () => {
      showModal({ title: 'Hapus semua data?', body: '<p>Progres permainan, riwayat skor, dan konfigurasi akan dihapus dari peramban ini.</p>',
        buttons: [{ label: 'Hapus', cls: 'btn3d red', onClick: () => { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(HIST_KEY); localStorage.removeItem(CFG_KEY); cfg = Object.assign({}, DEFAULT_CFG); applyCfg(); showMenu(); } }, { label: 'Batal', cls: 'btn3d gray' }] });
    });
  }
  function applyCfg() {
    Sfx.setEnabled(cfg.sound);
    document.body.classList.toggle('no-anim', !cfg.anim);
  }

  /* ---------- CREDIT ---------- */
  function showCredits() {
    app.innerHTML = `<div class="screen sub">
      ${sceneSVG()}
      <div class="panel">
        <div class="panel-head"><h2>Credit</h2><button class="btn3d gray small" data-act="back">${ICON.home}<span>Menu</span></button></div>
        <div class="credit-hero"><img src="assets/logo.svg" alt=""><div><h3>${esc(APP_INFO.name)} <small>v${APP_INFO.version}</small></h3><p>${esc(APP_INFO.tagline)}</p></div></div>
        <dl class="credit-list">
          <dt>Konsep dan materi keselamatan proses</dt><dd>${esc(CREDITS.konsep)}</dd>
          <dt>Organisasi</dt><dd>${esc(CREDITS.organisasi)}</dd>
          <dt>Pengembangan perangkat lunak</dt><dd>${esc(CREDITS.pengembang)}</dd>
          <dt>Tahun</dt><dd>${esc(CREDITS.tahun)}</dd>
        </dl>
        <h4>Kerangka konsep</h4>
        <p class="muted">Alur permainan mengikuti model lapisan proteksi dan diagram bow-tie: memahami kondisi normal (BPCS), mengenali deviasi (HAZOP), memasang barier pencegahan (alarm, SIS, relief), dan barier mitigasi (deteksi, isolasi, proteksi kebakaran, tanggap darurat).</p>
        <h4>Referensi</h4>
        <ol class="refs">${CREDITS.referensi.map(r => `<li>${esc(r)}</li>`).join('')}</ol>
        <p class="muted small">Skenario, nilai parameter, dan tata letak P&amp;ID disederhanakan untuk tujuan pelatihan dan bukan rancangan rekayasa yang dapat dipakai langsung di lapangan.</p>
      </div></div>`;
    on(app, '[data-act=back]', 'click', () => { Sfx.click(); showMenu(); });
  }

  /* ---------- SESI PERMAINAN ---------- */
  function newSession(s) {
    return {
      scenarioId: s.id, stage: 1, scores: {}, read: [], quizIdx: 0, quizCorrect: 0,
      eventIdx: 0, eventResults: [], placements: { 3: {}, 4: {} }, evalDone: { 3: false, 4: false },
      finished: false, startedAt: Date.now(),
    };
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
    S = sv;
    // mulai ulang dari awal tahap yang tersimpan agar simulasi konsisten
    S.quizIdx = 0; S.quizCorrect = 0; S.eventIdx = 0; S.eventResults = [];
    if (S.stage > 4) { showResult(); return; }
    showPlay(); stageIntro();
  }
  function stopAll() {
    if (sim) { sim.stop(); sim = null; }
    if (chartRaf) { cancelAnimationFrame(chartRaf); chartRaf = 0; }
    if (ev2) { clearTimeout(ev2.autoTimer); ev2 = null; }
    chart = null; pid = null; selectedDevice = null; closeModal();
  }

  function budgetFor(stage) {
    const b = scn.budget[stage];
    return b + (cfg.difficulty === 'mudah' ? 3 : cfg.difficulty === 'sulit' ? -2 : 0);
  }

  function showPlay() {
    stopAll();
    app.innerHTML = `<div class="screen play">
      <header class="topbar">
        <div class="brand"><img src="assets/logo.svg" alt=""><div><b>PSM Simulator</b><small>${esc(scn.title)}</small></div></div>
        <ol class="stepper">${STAGES.map(st => `<li class="step" data-stage="${st.n}"><span class="ico">${ICON[st.icon]}</span><span class="lbl">${st.n}. ${esc(st.short)}</span><span class="sc"></span></li>`).join('')}</ol>
        <div class="top-actions"><button class="btn3d gray small" data-act="menu">${ICON.home}<span>Menu</span></button></div>
      </header>
      <main class="play-main">
        <section class="pid-area">
          <div class="pid-wrap" id="pid"></div>
          <div class="trend-wrap" id="trend-wrap"><canvas id="trend"></canvas></div>
        </section>
        <aside class="side" id="side"></aside>
      </main>
    </div>`;
    on(app, '[data-act=menu]', 'click', () => {
      Sfx.click();
      showModal({ title: 'Kembali ke menu?', body: '<p>Progres tersimpan pada awal tahap yang sedang berjalan. Anda dapat melanjutkan melalui tombol Continue.</p>',
        buttons: [{ label: 'Ke Menu', cls: 'btn3d orange', onClick: () => { save(); showMenu(); } }, { label: 'Batal', cls: 'btn3d gray' }] });
    });
    pid = PID.render($('#pid'), scn, {
      onEquipment: e => onEquipmentClick(e),
      onHotspot: h => onHotspotClick(h),
      onDevice: (h, devId) => onDeviceClick(h, devId),
      onBackground: () => {},
    });
    sim = new Simulator(scn, { speed: cfg.speed });
    sim.onTick(onSimTick);
    chart = new TrendChart($('#trend'), sim, scn.trendVars);
    updateStepper();
    renderReadouts();
  }
  function updateStepper() {
    $$('.step').forEach(li => {
      const n = +li.dataset.stage;
      li.classList.toggle('active', n === S.stage);
      li.classList.toggle('done', S.scores[n] !== undefined);
      li.querySelector('.sc').textContent = S.scores[n] !== undefined ? S.scores[n] : '';
    });
  }
  function renderReadouts() {
    Object.keys(scn.vars).forEach(id => pid.setReadout(id, sim.format(id), sim.status(id)));
  }
  function onSimTick(s) {
    renderReadouts();
    // highlight alarm pada peralatan
    const alarmNodes = {};
    Object.keys(scn.vars).forEach(id => { const st = s.status(id); if (st !== 'normal') alarmNodes[scn.vars[id].node] = true; });
    scn.equipment.forEach(e => pid.alarmNode(e.id, !!alarmNodes[e.id]));
    const info = $('#eq-live');
    if (info && info.dataset.id) {
      const e = scn.equipment.find(x => x.id === info.dataset.id);
      if (e && e.vars) info.innerHTML = e.vars.map(v => `<div class="live ${s.status(v)}"><span>${esc(scn.vars[v].label)}</span><b>${s.format(v)}</b></div>`).join('');
    }
  }
  function chartLoop() {
    if (chart) chart.draw();
    chartRaf = requestAnimationFrame(chartLoop);
  }
  function runSim(on) {
    if (!sim) return;
    if (on) { sim.start(); pid.setFlow(true); if (!chartRaf) chartLoop(); }
    else { sim.stop(); pid.setFlow(false); }
  }

  function stageIntro() {
    const st = STAGES[S.stage - 1];
    renderStage();
    showModal({ title: st.title, cls: 'intro', body: `<div class="intro-ico">${ICON[st.icon]}</div><p>${esc(st.desc)}</p>${stageTips(S.stage)}`,
      buttons: [{ label: 'Mulai Tahap', cls: 'btn3d orange', onClick: () => { Sfx.start(); } }] });
  }
  function stageTips(n) {
    const tips = {
      1: ['Klik setiap peralatan pada P&ID (atau daftar di panel kanan) untuk membaca fungsinya.', 'Jalankan simulasi dan ubah set point untuk melihat respons proses.', 'Setelah semua peralatan dipelajari, kerjakan kuis pemahaman proses.'],
      2: ['Jalankan simulasi dan perhatikan tren serta pembacaan di P&ID.', 'Saat Anda melihat deviasi, tekan Laporkan Abnormalitas secepatnya.', 'Tentukan node, parameter, guideword, penyebab, dan konsekuensi.'],
      3: ['Pilih perangkat dari kotak alat, lalu klik titik pemasangan (lingkaran oranye) pada P&ID.', 'Anggaran terbatas: prioritaskan barier yang memutus skenario yang Anda temukan di Tahap 2.', 'Klik perangkat terpasang untuk melepasnya. Tekan Evaluasi bila selesai.'],
      4: ['Pikirkan apa yang terjadi bila pencegahan gagal: deteksi, isolasi, proteksi kebakaran, dan tanggap darurat.', 'Perhatikan sifat bahan: tidak semua media pemadam cocok untuk semua bahan.', 'Tekan Evaluasi bila selesai untuk melihat diagram bow-tie Anda.'],
    };
    return `<ul class="tips">${tips[n].map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  }

  function renderStage() {
    runSim(false); sim.reset(); sim.clearEvent(); renderReadouts();
    selectedDevice = null;
    updateStepper();
    $('#trend-wrap').style.display = S.stage <= 2 ? '' : 'none';
    pid.showReadouts(S.stage <= 2);
    pid.showHotspots(S.stage >= 3 ? S.stage : 0, S.placements[S.stage]);
    scn.equipment.forEach(e => pid.alarmNode(e.id, false));
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
      <div class="card"><h4>Peralatan <span class="pill" id="read-count">0/${req.length}</span></h4>
        <p class="muted small">Klik peralatan di P&amp;ID atau di daftar ini.</p>
        <ul class="eq-list">${req.map(e => `<li data-id="${e.id}"><span class="dot"></span><b>${esc(e.id)}</b><span>${esc(e.name)}</span></li>`).join('')}</ul>
      </div>
      <div class="card" id="eq-info"><h4>Informasi Peralatan</h4><p class="muted">Belum ada peralatan dipilih.</p></div>
      <div class="card"><h4>Simulasi Proses</h4>
        <div class="sim-ctl"><button class="btn3d teal small" id="btn-run">${ICON.play}<span>Jalankan</span></button><span class="muted small">Ubah set point dan amati tren.</span></div>
        <div class="sliders">${scn.controls.map(c => `<label class="slider"><span>${esc(c.label)} <b id="val-${c.id}">${c.def} ${esc(c.unit)}</b></span><input type="range" data-ctl="${c.id}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.def}"></label>`).join('')}</div>
      </div>
      <div class="card action"><button class="btn3d orange wide" id="btn-quiz" disabled>${ICON.check}<span>Mulai Kuis Pemahaman</span></button><p class="muted small" id="quiz-hint">Pelajari semua peralatan terlebih dahulu.</p></div>`;
    S.read.forEach(id => markRead(id, true));
    on(side, '.eq-list li', 'click', ev => { const e = scn.equipment.find(x => x.id === ev.currentTarget.dataset.id); onEquipmentClick(e); });
    $('#btn-run').addEventListener('click', () => {
      Sfx.click();
      const running = sim.running;
      runSim(!running);
      $('#btn-run').innerHTML = running ? `${ICON.play}<span>Jalankan</span>` : `${ICON.pause}<span>Jeda</span>`;
    });
    on(side, 'input[type=range]', 'input', ev => {
      const id = ev.currentTarget.dataset.ctl; const c = scn.controls.find(x => x.id === id);
      sim.setControl(id, parseFloat(ev.currentTarget.value));
      $('#val-' + id).textContent = ev.currentTarget.value + ' ' + c.unit;
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
    Sfx.click();
    scn.equipment.forEach(x => pid.highlight(x.id, false));
    pid.highlight(e.id, true);
    const info = $('#eq-info');
    if (info) {
      info.innerHTML = `<h4>${esc(e.id)} <small>${esc(e.name)}</small></h4><p>${esc(e.desc)}</p>${e.vars ? `<div class="live-wrap" id="eq-live" data-id="${e.id}">${e.vars.map(v => `<div class="live ${sim.status(v)}"><span>${esc(scn.vars[v].label)}</span><b>${sim.format(v)}</b></div>`).join('')}</div>` : ''}`;
    }
    if (S.stage === 1) { markRead(e.id); updateReadCount(); }
  }
  function startQuiz() {
    S.quizIdx = 0; S.quizCorrect = 0;
    nextQuiz();
  }
  function nextQuiz() {
    if (S.quizIdx >= scn.quiz.length) {
      const score = Math.round(S.quizCorrect / scn.quiz.length * 100);
      finishStage(1, score, `<p>Anda menjawab benar <b>${S.quizCorrect}</b> dari <b>${scn.quiz.length}</b> pertanyaan.</p>`);
      return;
    }
    const q = scn.quiz[S.quizIdx];
    showModal({ title: `Kuis ${S.quizIdx + 1} / ${scn.quiz.length}`, cls: 'quiz',
      body: `<p class="q">${esc(q.q)}</p><div class="opts">${q.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="letter">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`).join('')}</div><div class="fb" id="quiz-fb"></div>`,
      buttons: [{ label: 'Lanjut', cls: 'btn3d orange', keep: true, onClick: () => { if ($('#quiz-fb').dataset.done) { closeModal(); nextQuiz(); } } }],
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

  /* ---------- TAHAP 2 ---------- */
  let ev2 = null; // kejadian aktif
  function renderStage2() {
    const side = $('#side');
    const n = scn.events.length;
    side.innerHTML = `<div class="side-head"><h2>${ICON.alert}<span>Tahap 2: Abnormalitas</span></h2></div>
      <div class="card"><h4>Kejadian <span class="pill" id="ev-count">${S.eventIdx}/${n}</span></h4>
        <p class="muted small">Setiap kejadian menampilkan satu deviasi proses. Amati tren dan pembacaan, lalu laporkan secepatnya.</p>
        <div class="ev-track">${scn.events.map((e, i) => `<span class="ev-dot" data-i="${i}">${i + 1}</span>`).join('')}</div>
      </div>
      <div class="card" id="ev-panel">
        <div class="sim-ctl"><button class="btn3d teal" id="btn-ev-run">${ICON.play}<span>Jalankan Simulasi</span></button></div>
        <div class="alarm-box" id="alarm-box"><span class="lamp"></span><span id="alarm-text">Proses normal</span></div>
        <button class="btn3d red wide" id="btn-report" disabled>${ICON.alert}<span>Laporkan Abnormalitas</span></button>
      </div>
      <div class="card" id="eq-info"><h4>Informasi Peralatan</h4><p class="muted">Klik peralatan untuk melihat detail dan nilai proses.</p></div>
      <div class="card"><h4>Tabel HAZOP Anda</h4><table class="hazop" id="hazop"><thead><tr><th>#</th><th>Node</th><th>Parameter</th><th>Guideword</th><th>Skor</th></tr></thead><tbody>${S.eventResults.map((r, i) => hazopRow(r, i)).join('')}</tbody></table></div>`;
    updateEvTrack();
    $('#btn-ev-run').addEventListener('click', () => { Sfx.click(); beginEvent(); });
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
    sim.reset(); sim.clearEvent();
    runSim(true);
    $('#btn-ev-run').disabled = true;
    $('#btn-report').disabled = false;
    setAlarm('Proses normal, amati tren...', false);
    const evt = scn.events[S.eventIdx];
    ev2 = { evt, started: false, reported: false, autoTimer: null, alarmed: false };
    // kejadian dimulai setelah 4 hingga 8 detik simulasi
    const delay = 4 + Math.random() * 4;
    const check = () => {
      if (!ev2 || ev2.reported || !sim) return;
      if (!ev2.started && sim.t >= delay) { ev2.started = true; sim.startEvent(evt); }
      if (ev2.started) {
        const anyAlarm = Object.keys(scn.vars).some(id => sim.status(id) !== 'normal');
        if (anyAlarm && !ev2.alarmed) { ev2.alarmed = true; Sfx.alarm(); setAlarm('ALARM: deviasi terdeteksi. Laporkan!', true); }
        if (sim.eventMature() && sim.eventElapsed() > evt.effects.reduce((m, f) => Math.max(m, f.delay + f.dur), 0) + 8) {
          openReport(true); return;
        }
      }
      ev2.autoTimer = setTimeout(check, 200);
    };
    check();
  }
  function setAlarm(txt, on) {
    const b = $('#alarm-box'); if (!b) return;
    b.classList.toggle('on', on); $('#alarm-text').textContent = txt;
  }
  function openReport(auto) {
    if (!ev2 || ev2.reported) return;
    ev2.reported = true;
    clearTimeout(ev2.autoTimer);
    runSim(false);
    const evt = ev2.evt;
    const early = ev2.started && !sim.eventMature();
    const nodes = scn.equipment.filter(e => !['muster', 'building'].includes(e.type));
    const body = `${auto ? '<p class="warn">Simulasi dihentikan otomatis karena deviasi sudah berkembang penuh. Pelaporan lebih awal memberi nilai lebih baik.</p>' : ''}
      ${!ev2.started ? '<p class="warn">Anda melapor sebelum ada deviasi. Jawaban tetap dinilai, tetapi tanpa dasar pengamatan yang cukup.</p>' : ''}
      <div class="form-grid">
        <label>Node (peralatan)<select id="rp-node"><option value="">-- pilih --</option>${nodes.map(e => `<option value="${e.id}">${esc(e.id)} · ${esc(e.name)}</option>`).join('')}</select></label>
        <label>Parameter<select id="rp-param"><option value="">-- pilih --</option>${Object.keys(PARAMS).map(k => `<option value="${k}">${esc(PARAMS[k])}</option>`).join('')}</select></label>
        <label>Guideword<select id="rp-guide"><option value="">-- pilih --</option>${Object.keys(GUIDEWORDS).map(k => `<option value="${k}">${esc(GUIDEWORDS[k])}</option>`).join('')}</select></label>
      </div>
      <div class="rp-sec"><b>Penyebab yang paling mungkin</b>${shuffledOpts(evt.causes, evt.causeAns, 'rp-cause')}</div>
      <div class="rp-sec"><b>Konsekuensi bila tidak ada proteksi</b>${shuffledOpts(evt.cons, evt.consAns, 'rp-cons')}</div>`;
    showModal({ title: `Laporan Abnormalitas ${S.eventIdx + 1}`, cls: 'report', body,
      buttons: [{ label: 'Kirim Laporan', cls: 'btn3d orange', keep: true, onClick: () => submitReport(early) }] });
  }
  function shuffledOpts(opts, ansIdx, name) {
    const idx = opts.map((_, i) => i).sort(() => Math.random() - 0.5);
    return `<div class="radios">${idx.map(i => `<label><input type="radio" name="${name}" value="${i === ansIdx ? 1 : 0}"><span>${esc(opts[i])}</span></label>`).join('')}</div>`;
  }
  function submitReport(early) {
    const node = $('#rp-node').value, param = $('#rp-param').value, guide = $('#rp-guide').value;
    const cause = $('input[name=rp-cause]:checked'), cons = $('input[name=rp-cons]:checked');
    if (!node || !param || !guide || !cause || !cons) { Sfx.fail(); showToast('Lengkapi semua isian laporan.'); return; }
    const evt = ev2.evt; const a = evt.answer;
    const pts = { node: a.node.includes(node) ? 20 : 0, param: a.param.includes(param) ? 20 : 0, guide: a.guide.includes(guide) ? 20 : 0, cause: cause.value === '1' ? 20 : 0, cons: cons.value === '1' ? 20 : 0 };
    let score = pts.node + pts.param + pts.guide + pts.cause + pts.cons;
    let bonus = 0;
    if (early && ev2.started && score >= 60) { bonus = 5; score = Math.min(100, score + bonus); }
    S.eventResults.push({ node, param, guide, score });
    closeModal();
    if (score >= 60) Sfx.success(); else Sfx.fail();
    const row = (lbl, ok, ans) => `<tr><td>${lbl}</td><td class="${ok ? 'ok' : 'bad'}">${ok ? 'Benar' : 'Salah'}</td><td>${esc(ans)}</td></tr>`;
    showModal({ title: `Hasil Laporan ${S.eventIdx + 1}: ${score} poin`, cls: 'report',
      body: `<table class="result-table"><tr><th>Unsur</th><th>Penilaian</th><th>Jawaban yang diharapkan</th></tr>
        ${row('Node', pts.node, a.node.join(' / '))}${row('Parameter', pts.param, a.param.map(p => PARAMS[p]).join(' / '))}${row('Guideword', pts.guide, a.guide.map(g => GUIDEWORDS[g].split(' (')[0]).join(' / '))}${row('Penyebab', pts.cause, evt.causes[evt.causeAns])}${row('Konsekuensi', pts.cons, evt.cons[evt.consAns])}</table>
        ${bonus ? `<p class="ok"><b>Bonus deteksi dini +${bonus}.</b></p>` : ''}<p class="explain">${esc(evt.explain)}</p>`,
      buttons: [{ label: 'Lanjut', cls: 'btn3d orange', onClick: () => {
        S.eventIdx++; updateEvTrack();
        const tb = $('#hazop tbody'); if (tb) tb.insertAdjacentHTML('beforeend', hazopRow(S.eventResults[S.eventResults.length - 1], S.eventResults.length - 1));
        sim.reset(); sim.clearEvent(); renderReadouts(); scn.equipment.forEach(e => pid.alarmNode(e.id, false));
        setAlarm('Proses normal', false);
        $('#btn-report').disabled = true;
        if (S.eventIdx >= scn.events.length) {
          const avg = Math.round(S.eventResults.reduce((s, r) => s + r.score, 0) / S.eventResults.length);
          finishStage(2, avg, `<p>Rata-rata skor identifikasi dari <b>${S.eventResults.length}</b> kejadian.</p>`);
        } else { $('#btn-ev-run').disabled = false; $('#btn-ev-run').innerHTML = `${ICON.play}<span>Kejadian ${S.eventIdx + 1}</span>`; }
      } }] });
  }

  /* ---------- TAHAP 3 & 4 ---------- */
  function renderStageBarrier(stage) {
    const cat = stage === 3 ? 'prevent' : 'mitigate';
    const devs = Object.keys(DEVICES).filter(k => DEVICES[k].cat === cat);
    const hs = scn.hotspots.filter(h => h.stage === stage);
    const side = $('#side');
    const done = S.evalDone[stage];
    side.innerHTML = `<div class="side-head"><h2>${ICON[stage === 3 ? 'shield' : 'fire']}<span>Tahap ${stage}: Barier ${stage === 3 ? 'Pencegahan' : 'Mitigasi'}</span></h2></div>
      <div class="card budget"><div class="budget-row"><span>${ICON.coin} Anggaran</span><b id="budget-val"></b></div><div class="budget-bar"><div id="budget-fill"></div></div><p class="muted small">${stage === 3 ? 'Pasang instrumen deteksi dan proteksi yang memutus rantai kejadian sebelum kehilangan kontainmen.' : 'Pasang perangkat yang membatasi dampak bila kehilangan kontainmen tetap terjadi.'}</p></div>
      <div class="card"><h4>Kotak Alat</h4><p class="muted small">Klik perangkat, lalu klik titik pemasangan di P&amp;ID.</p>
        <div class="toolbox">${devs.map(k => `<button class="tool" data-dev="${k}" style="--c:${DEVICES[k].color}"><span class="tcode">${esc(DEVICES[k].code)}</span><span class="tname">${esc(DEVICES[k].name)}</span><span class="tcost">${DEVICES[k].cost}</span></button>`).join('')}</div>
        <div class="tool-desc" id="tool-desc">Pilih perangkat untuk membaca fungsinya.</div>
      </div>
      <div class="card"><h4>Titik Pemasangan <span class="pill" id="hs-count"></span></h4>
        <ul class="hs-list" id="hs-list">${hs.map(h => `<li data-hs="${h.id}"><span class="dot"></span><div><b>${cfg.hints || cfg.difficulty === 'mudah' ? esc(h.label) : 'Titik ' + esc(h.id.toUpperCase())}</b><small class="placed"></small></div></li>`).join('')}</ul>
      </div>
      <div class="card action"><button class="btn3d orange wide" id="btn-eval">${ICON.check}<span>${done ? 'Lanjut' : 'Evaluasi Pemasangan'}</span></button></div>`;
    on(side, '.tool', 'click', ev => {
      Sfx.click();
      const k = ev.currentTarget.dataset.dev;
      selectedDevice = selectedDevice === k ? null : k;
      $$('.tool').forEach(b => b.classList.toggle('sel', b.dataset.dev === selectedDevice));
      $('#tool-desc').innerHTML = selectedDevice ? `<b>${esc(DEVICES[k].name)}</b> (biaya ${DEVICES[k].cost})<br>${esc(DEVICES[k].desc)}` : 'Pilih perangkat untuk membaca fungsinya.';
      $('#pid').classList.toggle('placing', !!selectedDevice);
    });
    on(side, '.hs-list li', 'click', ev => {
      const h = scn.hotspots.find(x => x.id === ev.currentTarget.dataset.hs);
      if (S.evalDone[stage]) return;
      if (S.placements[stage][h.id]) onDeviceClick(h, S.placements[stage][h.id]); else onHotspotClick(h);
    });
    $('#btn-eval').addEventListener('click', () => { Sfx.click(); if (S.evalDone[stage]) afterEval(stage); else evaluate(stage); });
    refreshBarrierUI(stage);
    if (done) showEvalMarks(stage);
  }
  function spent(stage) { return Object.values(S.placements[stage]).reduce((s, k) => s + (DEVICES[k] ? DEVICES[k].cost : 0), 0); }
  function refreshBarrierUI(stage) {
    const b = budgetFor(stage), sp = spent(stage);
    const bv = $('#budget-val'); if (bv) bv.textContent = `${b - sp} / ${b}`;
    const bf = $('#budget-fill'); if (bf) { bf.style.width = Math.min(100, sp / b * 100) + '%'; bf.classList.toggle('low', b - sp <= 2); }
    const hs = scn.hotspots.filter(h => h.stage === stage);
    hs.forEach(h => {
      const li = $(`.hs-list li[data-hs="${h.id}"]`); if (!li) return;
      const p = S.placements[stage][h.id];
      li.classList.toggle('placed', !!p);
      li.querySelector('.placed').textContent = p ? DEVICES[p].name : 'belum terpasang';
    });
    const hc = $('#hs-count'); if (hc) hc.textContent = `${Object.keys(S.placements[stage]).length}/${hs.length}`;
    pid.showHotspots(stage, S.placements[stage]);
  }
  function onHotspotClick(h) {
    const stage = S.stage;
    if (S.evalDone[stage]) { showToast(h.label + ': ' + h.why); return; }
    if (!selectedDevice) { Sfx.click(); showToast('Pilih perangkat dari kotak alat terlebih dahulu. Titik: ' + h.label); return; }
    const d = DEVICES[selectedDevice];
    if (spent(stage) + d.cost > budgetFor(stage)) { Sfx.fail(); showToast('Anggaran tidak cukup untuk ' + d.name + '.'); return; }
    S.placements[stage][h.id] = selectedDevice;
    Sfx.place(); save();
    refreshBarrierUI(stage);
  }
  function onDeviceClick(h, devId) {
    const stage = S.stage;
    if (S.evalDone[stage]) { showToast(h.label + ': ' + h.why); return; }
    delete S.placements[stage][h.id];
    Sfx.remove(); save();
    refreshBarrierUI(stage);
  }
  function evaluate(stage) {
    const hs = scn.hotspots.filter(h => h.stage === stage);
    const needed = hs.filter(h => h.accept.length);
    let correct = 0, wrong = 0, unnecessary = 0;
    const rows = hs.map(h => {
      const p = S.placements[stage][h.id];
      let st, msg;
      if (h.accept.length) {
        if (!p) { st = 'missing'; msg = 'Tidak terpasang. Diharapkan: ' + h.accept.map(k => DEVICES[k].name).join(' atau '); }
        else if (h.accept.includes(p)) { st = 'ok'; correct++; msg = 'Tepat.'; }
        else { st = 'wrong'; wrong++; msg = `${DEVICES[p].name} kurang tepat di sini. Diharapkan: ${h.accept.map(k => DEVICES[k].name).join(' atau ')}`; }
      } else {
        if (p) { st = 'wrong'; unnecessary++; msg = `${DEVICES[p].name} tidak diperlukan di titik ini.`; } else { st = 'ok'; msg = 'Benar dibiarkan kosong.'; }
      }
      return { h, st, msg };
    });
    const score = Math.max(0, Math.min(100, Math.round(70 * correct / needed.length + 30 - 10 * (wrong + unnecessary))));
    S.evalDone[stage] = true; S.evalRows = S.evalRows || {}; S.evalRows[stage] = rows.map(r => ({ id: r.h.id, st: r.st }));
    save();
    showEvalMarks(stage);
    $('#btn-eval').innerHTML = `${ICON.check}<span>Lanjut</span>`;
    if (score >= 70) Sfx.success(); else Sfx.fail();
    showModal({ title: `Evaluasi Tahap ${stage}: ${score} poin`, cls: 'report',
      body: `<p>Barier tepat: <b>${correct}/${needed.length}</b>. Pemasangan keliru: <b>${wrong}</b>. Tidak perlu: <b>${unnecessary}</b>. Anggaran terpakai: <b>${spent(stage)}/${budgetFor(stage)}</b>.</p>
        <ul class="eval-list">${rows.map(r => `<li class="${r.st}"><b>${esc(r.h.label)}</b><span>${esc(r.msg)}</span><em>${esc(r.h.why)}</em></li>`).join('')}</ul>`,
      buttons: [{ label: 'Lihat P&ID', cls: 'btn3d gray' }, { label: 'Lanjut', cls: 'btn3d orange', onClick: () => finishStage(stage, score, '') }] });
    S.pendingScore = { stage, score };
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
      buttons: [{ label: stage < 4 ? 'Tahap Berikutnya' : 'Lihat Hasil Akhir', cls: 'btn3d orange', onClick: advanceStage }] });
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
  function showResult() {
    stopAll();
    const total = totalScore(), g = grade(total);
    const prev = Object.values(S.placements[3]).map(k => DEVICES[k]).filter(Boolean);
    const mit = Object.values(S.placements[4]).map(k => DEVICES[k]).filter(Boolean);
    app.innerHTML = `<div class="screen sub result">
      ${sceneSVG()}
      <div class="panel wide">
        <div class="panel-head"><h2>Hasil Akhir: ${esc(scn.title)}</h2><button class="btn3d gray small" data-act="menu">${ICON.home}<span>Menu</span></button></div>
        <div class="result-top">
          <div class="score-big ${g}">${total}<small>${g} · ${gradeLabel(g)}</small></div>
          <div class="score-grid">${STAGES.map(st => `<div class="score-item"><span class="ico">${ICON[st.icon]}</span><span>${esc(st.short)}</span><b>${S.scores[st.n] !== undefined ? S.scores[st.n] : '-'}</b></div>`).join('')}</div>
        </div>
        ${cfg.name ? `<p class="muted">Pemain: <b>${esc(cfg.name)}</b></p>` : ''}
        <h4>Diagram Bow-Tie Anda</h4>
        <div class="bowtie-wrap">${bowtieSVG(prev, mit)}</div>
        <h4>Catatan Pembelajaran</h4>
        <ul class="notes">
          <li>Barier pencegahan yang terpasang: ${prev.length ? prev.map(d => esc(d.name)).join('; ') : 'tidak ada'}.</li>
          <li>Barier mitigasi yang terpasang: ${mit.length ? mit.map(d => esc(d.name)).join('; ') : 'tidak ada'}.</li>
          <li>Prinsip utama: lapisan proteksi harus independen, dan setiap ancaman pada bow-tie idealnya dipotong oleh lebih dari satu barier dengan mekanisme berbeda (instrumen, mekanis, dan prosedural).</li>
        </ul>
        <div class="cfg-actions">
          <button class="btn3d orange" data-act="again">${ICON.play}<span>Ulangi Skenario</span></button>
          <button class="btn3d teal" data-act="new">${ICON.bolt}<span>Skenario Lain</span></button>
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
    const bar = (devs, x, color) => devs.slice(0, 6).map((d, i) => `<g transform="translate(${x + (i % 3) * 34},${210 + (Math.floor(i / 3) - 0.5) * 40 - 20})"><rect width="30" height="30" rx="6" fill="${color}" stroke="#263238" stroke-width="1.5"/><text x="15" y="19" text-anchor="middle" font-size="${d.code.length > 3 ? 7 : 9}" font-weight="800" fill="#fff">${esc(d.code)}</text></g>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" class="bowtie">
      <defs><linearGradient id="btTop" x1="0" x2="1"><stop offset="0" stop-color="#ff8a65"/><stop offset="1" stop-color="#d84315"/></linearGradient></defs>
      <text x="150" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#1b3a57">ANCAMAN</text>
      <text x="340" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#1b3a57">BARIER PENCEGAHAN</text>
      <text x="660" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#1b3a57">BARIER MITIGASI</text>
      <text x="850" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#1b3a57">KONSEKUENSI</text>
      ${th.map((t, i) => `<g><path d="M250 ${rowY(i, th.length)} C 380 ${rowY(i, th.length)}, 400 210, 440 210" fill="none" stroke="#90a4ae" stroke-width="2"/><rect x="20" y="${rowY(i, th.length) - 20}" width="230" height="40" rx="8" fill="#fff3e0" stroke="#ff9800" stroke-width="2"/><foreignObject x="26" y="${rowY(i, th.length) - 18}" width="218" height="36"><div xmlns="http://www.w3.org/1999/xhtml" class="bt-txt">${esc(t)}</div></foreignObject></g>`).join('')}
      ${cs.map((c, i) => `<g><path d="M560 210 C 600 210, 620 ${rowY(i, cs.length)}, 750 ${rowY(i, cs.length)}" fill="none" stroke="#90a4ae" stroke-width="2"/><rect x="750" y="${rowY(i, cs.length) - 20}" width="230" height="40" rx="8" fill="#ffebee" stroke="#e53935" stroke-width="2"/><foreignObject x="756" y="${rowY(i, cs.length) - 18}" width="218" height="36"><div xmlns="http://www.w3.org/1999/xhtml" class="bt-txt">${esc(c)}</div></foreignObject></g>`).join('')}
      <rect x="440" y="170" width="120" height="80" rx="14" fill="url(#btTop)" stroke="#bf360c" stroke-width="2.5"/>
      <foreignObject x="446" y="176" width="108" height="68"><div xmlns="http://www.w3.org/1999/xhtml" class="bt-txt top">${esc(bt.top)}</div></foreignObject>
      ${bar(prev, 300, '#7e57c2')}${bar(mit, 600, '#ef6c00')}
      ${prev.length ? '' : '<text x="340" y="215" text-anchor="middle" font-size="11" fill="#b71c1c">tidak ada barier</text>'}${mit.length ? '' : '<text x="660" y="215" text-anchor="middle" font-size="11" fill="#b71c1c">tidak ada barier</text>'}
    </svg>`;
  }

  /* ---------- toast ---------- */
  let toastT = 0;
  function showToast(msg) {
    let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function init() {
    applyCfg();
    showMenu();
    window.addEventListener('resize', () => { if (chart) chart.draw(); });
  }
  return { init, showMenu };
})();

document.addEventListener('DOMContentLoaded', Game.init);
