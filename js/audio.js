/* Audio sederhana berbasis WebAudio (tanpa berkas eksternal). */
const Sfx = (() => {
  let ctx = null;
  let enabled = true;
  let noiseBuf = null;
  function getCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, gain, when, freqEnd) {
    const c = getCtx();
    if (!c || !enabled) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'sine';
    const t0 = c.currentTime + (when || 0);
    o.frequency.setValueAtTime(freq, t0);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.15, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }
  function noise(dur, filterType, freq, gain, when, q) {
    const c = getCtx();
    if (!c || !enabled) return;
    if (!noiseBuf) {
      const len = c.sampleRate * 2;
      noiseBuf = c.createBuffer(1, len, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = c.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = c.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; if (q) f.Q.value = q;
    const g = c.createGain();
    const t0 = c.currentTime + (when || 0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(c.destination);
    src.start(t0, Math.random());
    src.stop(t0 + dur + 0.05);
  }
  return {
    setEnabled(v) { enabled = !!v; },
    context: () => getCtx(),
    /* Dipanggil di dalam interaksi pengguna. Bunyi senyap satu sampel membuka kunci audio
       di Safari iOS lama; hasilnya true bila konteks audio sudah berjalan. */
    unlock() {
      const c = getCtx();
      if (!c) return Promise.resolve(true);
      if (c.state === 'running') return Promise.resolve(true);
      try { const b = c.createBuffer(1, 1, 22050), src = c.createBufferSource(); src.buffer = b; src.connect(c.destination); src.start(0); } catch (e) { /* abaikan */ }
      return (c.resume ? c.resume() : Promise.resolve()).then(() => c.state === 'running').catch(() => false);
    },
    click() { tone(520, 0.07, 'triangle', 0.08); },
    place() { tone(660, 0.08, 'triangle', 0.12); tone(880, 0.12, 'triangle', 0.1, 0.07); },
    test() { tone(988, 0.07, 'sine', 0.1); tone(1319, 0.14, 'sine', 0.09, 0.07); },
    remove() { tone(440, 0.1, 'sawtooth', 0.06); },
    success() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.12, i * 0.09)); },
    fail() { tone(220, 0.25, 'sawtooth', 0.1); tone(180, 0.3, 'sawtooth', 0.1, 0.15); },
    alarm() { for (let i = 0; i < 3; i++) { tone(1200, 0.12, 'square', 0.05, i * 0.25); tone(900, 0.12, 'square', 0.05, i * 0.25 + 0.12); } },
    warn() { tone(880, 0.16, 'square', 0.05); tone(660, 0.2, 'square', 0.05, 0.2); },
    hiss() { noise(1.6, 'highpass', 2800, 0.07); },
    crackle() { for (let i = 0; i < 9; i++) noise(0.05, 'bandpass', 1200 + Math.random() * 2400, 0.12, i * 0.08 + Math.random() * 0.05, 3); },
    boom() { noise(2.2, 'lowpass', 380, 0.6); tone(110, 1.4, 'sine', 0.45, 0, 32); },
    siren() { tone(600, 1.2, 'sawtooth', 0.05, 0, 1100); tone(1100, 1.2, 'sawtooth', 0.05, 1.2, 600); },
    start() { tone(392, 0.12, 'triangle', 0.1); tone(523, 0.2, 'triangle', 0.1, 0.1); },
    chat() { tone(1047, 0.06, 'sine', 0.07); tone(1319, 0.1, 'sine', 0.06, 0.07); },
  };
})();

/* ---------------------------------------------------------------------
   Musik latar "Measured Flow": diputar berulang dengan volume rendah,
   mulai setelah interaksi pertama pengguna (kebijakan autoplay peramban),
   diredam saat insiden, dan dijeda ketika tab tidak aktif. Level 0 sampai
   1 dipetakan secara kuadratik agar pengaturan volume rendah lebih halus.
   Di iOS properti volume elemen audio tidak dapat diubah lewat skrip,
   sehingga musik dialirkan melalui GainNode WebAudio bila diperlukan.
   --------------------------------------------------------------------- */
const Music = (() => {
  let a = null, enabled = true, level = 0.45, unlocked = false, raf = 0, duckUntil = 0, duckTimer = 0, resumeOnShow = false;
  let gainNode = null, fadeInUntil = 0;
  const gain = l => Math.max(0, Math.min(1, l * l));
  const volumeWritable = (() => { try { const t = document.createElement('audio'); t.volume = 0.5; return Math.abs(t.volume - 0.5) < 0.01; } catch (e) { return true; } })();
  function ensureGraph() {
    if (volumeWritable || gainNode || !a || typeof Sfx === 'undefined') return;
    try {
      const c = Sfx.context(); if (!c) return;
      const src = c.createMediaElementSource(a);
      gainNode = c.createGain();
      gainNode.gain.value = 0;
      src.connect(gainNode).connect(c.destination);
    } catch (e) { gainNode = null; }
  }
  const getVol = () => gainNode ? gainNode.gain.value : (a ? a.volume : 0);
  function setVol(v) { v = Math.max(0, Math.min(1, v)); if (gainNode) gainNode.gain.value = v; else if (a) a.volume = v; }
  function el() {
    if (!a) {
      a = document.createElement('audio');
      a.id = 'bgm';
      a.src = (typeof BRAND !== 'undefined' && BRAND.music) || 'assets/audio/measured-flow.mp3';
      a.loop = true; a.preload = 'none'; a.volume = 0; a.hidden = true;
      document.body.appendChild(a);
    }
    return a;
  }
  function target() { return gain(level) * (Date.now() < duckUntil ? 0.3 : 1); }
  /* v boleh berupa fungsi agar fade-in mengikuti perubahan volume selama berlangsung */
  function fadeTo(v, ms, done) {
    el();
    cancelAnimationFrame(raf);
    const tv = typeof v === 'function' ? v : () => v;
    const from = getVol(), t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / Math.max(1, ms));
      setVol(from + (tv() - from) * k);
      if (k < 1) raf = requestAnimationFrame(step); else if (done) done();
    };
    raf = requestAnimationFrame(step);
  }
  /* hasilnya true bila musik benar-benar berbunyi */
  function play() {
    const m = el();
    ensureGraph();
    /* satu ketukan memicu beberapa event; fade-in 2,5 detik yang sedang berjalan tidak dimulai ulang */
    if (!m.paused) { if (Date.now() > fadeInUntil) fadeTo(target(), 500); return Promise.resolve(true); }
    setVol(0);
    fadeInUntil = Date.now() + 2600;
    const p = m.play();
    if (p && p.then) return p.then(() => { fadeTo(target, 2500); return true; }).catch(() => { fadeInUntil = 0; return false; });
    fadeTo(target, 2500);
    return Promise.resolve(true);
  }
  function stop() {
    if (!a || a.paused) return;
    fadeTo(0, 700, () => a.pause());
  }
  document.addEventListener('visibilitychange', () => {
    if (!a) return;
    if (document.hidden) { resumeOnShow = !a.paused; if (resumeOnShow) a.pause(); }
    else if (resumeOnShow && enabled && unlocked) { resumeOnShow = false; play(); }
  });
  return {
    configure(on, lvl) {
      enabled = !!on;
      if (typeof lvl === 'number') level = Math.max(0, Math.min(1, lvl));
      if (!enabled) stop();
      else if (unlocked) play();
    },
    unlock() { unlocked = true; return enabled ? play() : Promise.resolve(true); },
    /* memulihkan musik yang semestinya berbunyi tetapi terhenti, misalnya setelah iOS menangguhkan audio */
    kick() { if (enabled && unlocked && a && a.paused && !document.hidden) play(); },
    duck(ms) {
      duckUntil = Date.now() + ms;
      if (!a || a.paused) return;
      fadeTo(target(), 400);
      clearTimeout(duckTimer);
      duckTimer = setTimeout(() => { if (a && !a.paused) fadeTo(target(), 2000); }, ms + 50);
    },
    state() { return { playing: !!a && !a.paused, volume: getVol(), target: target(), enabled, unlocked, webAudio: !!gainNode }; },
  };
})();
