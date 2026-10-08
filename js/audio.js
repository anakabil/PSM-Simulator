/* Audio sederhana berbasis WebAudio (tanpa berkas eksternal). */
const Sfx = (() => {
  let ctx = null;
  let enabled = true;
  let noiseBuf = null;
  let ctxOverride = null;
  function getCtx() {
    if (ctxOverride) return ctxOverride;
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  /* dest: simpul tujuan opsional, dipakai bunyi latar agar dapat diredam bersama */
  function tone(freq, dur, type, gain, when, freqEnd, dest) {
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
    o.connect(g).connect(dest || c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }
  function noiseBuffer(c) {
    if (!noiseBuf || noiseBuf.sampleRate !== c.sampleRate) {
      const len = c.sampleRate * 2;
      noiseBuf = c.createBuffer(1, len, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }
  /* freqEnd: frekuensi filter di akhir bunyi (sapuan), attack: waktu naik */
  function noise(dur, filterType, freq, gain, when, q, dest, freqEnd, attack) {
    const c = getCtx();
    if (!c || !enabled) return;
    const src = c.createBufferSource(); src.buffer = noiseBuffer(c); src.loop = true;
    const f = c.createBiquadFilter(); f.type = filterType; if (q) f.Q.value = q;
    const g = c.createGain();
    const t0 = c.currentTime + (when || 0);
    f.frequency.setValueAtTime(freq, t0);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + (attack || 0.04));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(dest || c.destination);
    src.start(t0, Math.random());
    src.stop(t0 + dur + 0.05);
  }

  /* =====================================================================
     Bunyi abnormalitas. Setiap peringatan dipetakan ke profil bunyi menurut
     jenis dan isi teksnya (desis gas, semburan, tetesan, hentakan pipa,
     kavitasi, dengung listrik, busur listrik, kobaran api, dan lainnya).
     Profil memiliki bunyi pemicu (sekali) dan bunyi latar yang terus
     terdengar selama abnormalitas berlangsung, makin keras pada tingkat
     kritis, dan berhenti saat laporan dibuka atau tahap berganti.
     ===================================================================== */
  const R = (a, b) => a + Math.random() * (b - a);
  const g = {
    thump(t, k, d) { tone(R(105, 125), 0.38, 'sine', 0.3 * k, t, 38, d); tone(R(220, 260), 0.16, 'triangle', 0.12 * k, t, 110, d); noise(0.09, 'bandpass', 600, 0.25 * k, t, 1, d, 0, 0.004); },
    knock(t, k, d) { tone(R(560, 720), 0.09, 'triangle', 0.13 * k, t, 0, d); noise(0.025, 'bandpass', 2600, 0.1 * k, t, 2, d); },
    tick(t, k, d, f) { noise(0.02, 'bandpass', f || R(1800, 5000), 0.2 * k, t, 7, d, 0, 0.003); },
    drip(t, k, d) { tone(R(1300, 1900), 0.075, 'sine', 0.13 * k, t, R(450, 600), d); },
    pop(t, k, d) { noise(0.14, 'lowpass', 420, 0.3 * k, t, 0, d, 0, 0.005); tone(95, 0.13, 'sine', 0.16 * k, t, 48, d); },
    zap(t, k, d) { noise(R(0.03, 0.08), 'highpass', 3600, 0.12 * k, t, 0, d, 0, 0.003); tone(100, 0.06, 'sawtooth', 0.05 * k, t, 0, d); },
    beep(t, k, d, f, len) { tone(f || 2900, len || 0.08, 'square', 0.05 * k, t, 0, d); },
    crack(t, k, d) { noise(0.05, 'bandpass', R(1200, 3600), 0.16 * k, t, 3, d, 0, 0.003); },
    creak(t, k, d) {
      const c = getCtx(); if (!c || !enabled) return;
      const o = c.createOscillator(), f = c.createBiquadFilter(), v = c.createGain(), lfo = c.createOscillator(), ld = c.createGain();
      const t0 = c.currentTime + t, f0 = R(150, 210), len = R(0.45, 0.8);
      o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f0 * 0.62, t0 + len);
      lfo.frequency.value = R(7, 11); ld.gain.value = f0 * 0.06; lfo.connect(ld).connect(o.frequency);
      f.type = 'bandpass'; f.frequency.value = R(900, 1300); f.Q.value = 4;
      v.gain.setValueAtTime(0.0001, t0); v.gain.exponentialRampToValueAtTime(0.42 * k, t0 + 0.08); v.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      o.connect(f).connect(v).connect(d || c.destination);
      o.start(t0); lfo.start(t0); o.stop(t0 + len + 0.05); lfo.stop(t0 + len + 0.05);
    },
    squeal(t, k, d) {
      const c = getCtx(); if (!c || !enabled) return;
      const o = c.createOscillator(), v = c.createGain(), lfo = c.createOscillator(), ld = c.createGain();
      const t0 = c.currentTime + t, f0 = R(950, 1250), len = R(0.5, 0.9);
      o.type = 'triangle'; o.frequency.value = f0;
      lfo.frequency.value = R(5, 8); ld.gain.value = f0 * 0.04; lfo.connect(ld).connect(o.frequency);
      v.gain.setValueAtTime(0.0001, t0); v.gain.exponentialRampToValueAtTime(0.06 * k, t0 + 0.1); v.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      o.connect(v).connect(d || c.destination);
      o.start(t0); lfo.start(t0); o.stop(t0 + len + 0.05); lfo.stop(t0 + len + 0.05);
    },
  };
  /* bunyi latar kontinu: derau tersaring atau osilator, dengan modulasi amplitudo lambat */
  function bedNoise(c, out, type, freq, q, gain, lfoRate, lfoDepth) {
    const src = c.createBufferSource(); src.buffer = noiseBuffer(c); src.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    const v = c.createGain(); v.gain.value = gain;
    src.connect(f).connect(v).connect(out); src.start(0, Math.random());
    const nodes = [src];
    if (lfoRate) { const l = c.createOscillator(), ld = c.createGain(); l.frequency.value = lfoRate; ld.gain.value = gain * (lfoDepth || 0.3); l.connect(ld).connect(v.gain); l.start(); nodes.push(l); }
    return nodes;
  }
  function bedOsc(c, out, type, freq, gain, cutoff, lfoRate, lfoDepth) {
    const o = c.createOscillator(); o.type = type; o.frequency.value = freq;
    const v = c.createGain(); v.gain.value = gain;
    let tail = v;
    if (cutoff) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff; v.connect(f); tail = f; }
    o.connect(v); tail.connect(out); o.start();
    const nodes = [o];
    if (lfoRate) { const l = c.createOscillator(), ld = c.createGain(); l.frequency.value = lfoRate; ld.gain.value = gain * (lfoDepth || 0.3); l.connect(ld).connect(v.gain); l.start(); nodes.push(l); }
    return nodes;
  }
  /* cue(k): bunyi pemicu dengan kekuatan k; bed(c, out): simpul latar; grain(k, out, bed): butir acak setiap 0,12 detik */
  const P = {
    hiss: { cue: k => { noise(1.4, 'highpass', 3000, 0.08 * k); noise(1.0, 'bandpass', 5500, 0.04 * k, 0.05, 1); },
      bed: (c, o) => bedNoise(c, o, 'bandpass', 4200, 0.8, 0.022, 0.6, 0.35) },
    jet: { cue: k => { noise(1.9, 'bandpass', 900, 0.17 * k, 0, 0.7, null, 0, 0.02); noise(1.9, 'highpass', 2500, 0.1 * k, 0, 0, null, 0, 0.02); },
      bed: (c, o) => bedNoise(c, o, 'bandpass', 1000, 0.6, 0.032, 3, 0.15).concat(bedNoise(c, o, 'highpass', 3000, 0, 0.013)) },
    relief: { cue: k => { g.thump(0, 0.6 * k); noise(1.6, 'highpass', 2600, 0.09 * k, 0.08); },
      bed: (c, o) => bedNoise(c, o, 'highpass', 2800, 0, 0.017, 1.2, 0.25) },
    drip: { cue: k => { g.drip(0, k); g.drip(0.35, k); g.drip(0.8, 0.8 * k); },
      grain: (k, o) => { if (Math.random() < 0.12) g.drip(0, 0.55 * k, o); } },
    splash: { cue: k => { noise(0.5, 'lowpass', 1400, 0.22 * k); noise(0.35, 'bandpass', 700, 0.16 * k, 0.15, 1.5); g.drip(0.5, k); g.drip(0.9, k); },
      bed: (c, o) => bedNoise(c, o, 'bandpass', 1600, 1.2, 0.018, 2.3, 0.6),
      grain: (k, o) => { if (Math.random() < 0.08) g.drip(0, 0.5 * k, o); } },
    rumble: { cue: k => { noise(1.6, 'lowpass', 160, 0.2 * k); noise(1.6, 'bandpass', 320, 0.16 * k, 0, 1.2); tone(46, 1.6, 'sine', 0.08 * k); },
      bed: (c, o) => bedNoise(c, o, 'bandpass', 300, 0.9, 0.05, 7, 0.4).concat(bedNoise(c, o, 'lowpass', 140, 0, 0.05)).concat(bedOsc(c, o, 'sine', 48, 0.01)) },
    hammer: { cue: k => { g.thump(0, k); g.thump(0.42, 0.8 * k); g.thump(0.95, 0.6 * k); },
      bed: (c, o) => bedNoise(c, o, 'bandpass', 250, 1, 0.04),
      grain: (k, o) => { if (Math.random() < 0.035) g.thump(0, 0.55 * k, o); } },
    gravel: { cue: k => { noise(1.3, 'bandpass', 280, 0.14 * k, 0, 1); for (let i = 0; i < 34; i++) g.tick(R(0, 1.3), R(0.5, 1) * k); },
      bed: (c, o) => bedNoise(c, o, 'bandpass', 260, 1, 0.035),
      grain: (k, o) => { const n = Math.random() < 0.9 ? 1 + Math.floor(Math.random() * 3) : 0; for (let i = 0; i < n; i++) g.tick(R(0, 0.11), 0.4 * k, o); } },
    knock: { cue: k => { [0, 0.32, 0.6, 0.95].forEach(t => g.knock(t, k)); },
      bed: (c, o) => bedNoise(c, o, 'bandpass', 300, 1, 0.03),
      grain: (k, o) => { if (Math.random() < 0.22) g.knock(0, 0.55 * k, o); } },
    hum: { cue: k => { tone(100, 1.5, 'sawtooth', 0.05 * k); tone(200, 1.5, 'sine', 0.03 * k); tone(50, 1.5, 'sine', 0.05 * k); },
      bed: (c, o) => bedOsc(c, o, 'sawtooth', 100, 0.009, 600, 0.5, 0.25).concat(bedOsc(c, o, 'sine', 50, 0.01)).concat(bedOsc(c, o, 'sine', 200, 0.005)) },
    creak: { cue: k => { g.creak(0, k); g.creak(0.7, 0.8 * k); },
      grain: (k, o) => { if (Math.random() < 0.03) g.creak(0, 0.6 * k, o); } },
    squeal: { cue: k => { g.squeal(0, k); g.squeal(0.8, 0.8 * k); },
      grain: (k, o) => { if (Math.random() < 0.04) g.squeal(0, 0.6 * k, o); } },
    puff: { cue: k => { g.pop(0, k); g.pop(0.25, 0.8 * k); g.pop(0.7, 0.9 * k); },
      grain: (k, o) => { if (Math.random() < 0.05) g.pop(0, 0.5 * k, o); } },
    bang: { cue: k => { noise(0.25, 'highpass', 1200, 0.25 * k, 0, 0, null, 0, 0.003); g.thump(0, k); for (let i = 0; i < 8; i++) g.tick(R(0.15, 0.9), 0.6 * k, null, R(2000, 4500)); },
      bed: (c, o) => bedNoise(c, o, 'lowpass', 130, 0, 0.025) },
    crackle: { cue: k => { for (let i = 0; i < 11; i++) g.crack(i * 0.08 + R(0, 0.05), k); noise(1.5, 'lowpass', 420, 0.12 * k); noise(1.5, 'bandpass', 700, 0.05 * k, 0, 1); },
      bed: (c, o) => bedNoise(c, o, 'lowpass', 380, 0, 0.035, 1.3, 0.3),
      grain: (k, o) => { if (Math.random() < 0.5) g.crack(R(0, 0.1), 0.5 * k, o); } },
    roar: { cue: k => { noise(2.5, 'lowpass', 500, 0.32 * k, 0, 0, null, 0, 0.15); noise(2.2, 'bandpass', 900, 0.14 * k, 0, 0.8, null, 0, 0.15); noise(2.0, 'bandpass', 1500, 0.08 * k); for (let i = 0; i < 12; i++) g.crack(R(0, 1.4), k); },
      bed: (c, o) => bedNoise(c, o, 'lowpass', 450, 0, 0.08, 0.9, 0.3).concat(bedNoise(c, o, 'bandpass', 1400, 0.8, 0.015, 0.7, 0.4)),
      grain: (k, o) => { if (Math.random() < 0.55) g.crack(R(0, 0.1), 0.6 * k, o); } },
    smoke: { cue: k => { noise(1.8, 'bandpass', 700, 0.08 * k, 0, 0.6, null, 300, 0.3); for (let i = 0; i < 4; i++) g.crack(R(0.2, 1.4), 0.5 * k); },
      bed: (c, o) => bedNoise(c, o, 'bandpass', 500, 0.5, 0.015, 0.4, 0.5),
      grain: (k, o) => { if (Math.random() < 0.12) g.crack(R(0, 0.1), 0.3 * k, o); } },
    arc: { cue: k => { for (let i = 0; i < 6; i++) g.zap(R(0, 0.8), k); tone(100, 1.0, 'sawtooth', 0.05 * k); tone(150, 1.0, 'square', 0.02 * k); },
      bed: (c, o) => bedOsc(c, o, 'sawtooth', 100, 0.014, 900, 6, 0.5),
      grain: (k, o) => { if (Math.random() < 0.18) g.zap(R(0, 0.1), 0.55 * k, o); } },
    sizzle: { cue: k => { noise(1.5, 'highpass', 5500, 0.03 * k); [0.3, 0.8, 1.2].forEach(t => g.tick(t, 0.6 * k, null, 900)); },
      bed: (c, o) => bedNoise(c, o, 'highpass', 6000, 0, 0.008),
      grain: (k, o) => { if (Math.random() < 0.05) g.tick(0, 0.45 * k, o, R(700, 1100)); } },
    fan: { cue: k => { noise(1.6, 'bandpass', 700, 0.17 * k, 0, 2, null, 0, 0.5); tone(160, 1.6, 'square', 0.012 * k); },
      bed: (c, o) => bedNoise(c, o, 'bandpass', 700, 2, 0.03, 24, 0.2).concat(bedOsc(c, o, 'square', 160, 0.006, 500)) },
    engine: { cue: k => { tone(52, 1.6, 'sawtooth', 0.06 * k); tone(104, 1.6, 'sawtooth', 0.025 * k); },
      bed: (c, o) => bedOsc(c, o, 'sawtooth', 52, 0.015, 320, 6, 0.3).concat(bedOsc(c, o, 'sawtooth', 104, 0.006, 320)) },
    burner: { cue: k => { noise(1.6, 'lowpass', 280, 0.2 * k, 0, 0, null, 0, 0.3); noise(1.6, 'bandpass', 700, 0.08 * k, 0, 1, null, 0, 0.3); },
      bed: (c, o) => bedNoise(c, o, 'lowpass', 260, 0, 0.05, 4, 0.12).concat(bedNoise(c, o, 'bandpass', 700, 1, 0.02)) },
    winddown: { cue: k => {
      const c = getCtx(); if (!c || !enabled) return;
      const o = c.createOscillator(), f = c.createBiquadFilter(), v = c.createGain(), t0 = c.currentTime;
      o.type = 'sawtooth'; o.frequency.setValueAtTime(420, t0); o.frequency.exponentialRampToValueAtTime(45, t0 + 1.7);
      f.type = 'lowpass'; f.frequency.value = 1200;
      v.gain.setValueAtTime(0.0001, t0); v.gain.exponentialRampToValueAtTime(0.06 * k, t0 + 0.05); v.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.8);
      o.connect(f).connect(v).connect(c.destination); o.start(t0); o.stop(t0 + 1.9);
      g.thump(1.75, 0.35 * k);
    } },
    flameout: { cue: k => { noise(0.45, 'lowpass', 250, 0.3 * k, 0, 0, null, 0, 0.01); noise(0.45, 'bandpass', 420, 0.18 * k, 0, 1.2, null, 0, 0.01); noise(1.5, 'bandpass', 2500, 0.05 * k, 0.3); },
      bed: (c, o) => bedNoise(c, o, 'bandpass', 2500, 0.8, 0.012, 0.5, 0.3) },
    igniter: { cue: k => { [0, 0.5, 1.0, 1.5].forEach(t => { g.tick(t, 2.2 * k, null, 4200); g.tick(t + 0.01, 1.4 * k, null, 2400); }); },
      grain: (k, o, b) => { b.n = (b.n || 0) + 1; if (b.n % 4 === 0) g.tick(0, 0.9 * k, o, 4200); } },
    detector: { cue: k => { [0, 0.14, 0.28, 0.6, 0.74, 0.88].forEach(t => g.beep(t, k)); },
      grain: (k, o, b) => { b.n = (b.n || 0) + 1; if (b.n % 13 === 0) [0, 0.14, 0.28].forEach(t => g.beep(t, 0.6 * k, o)); } },
    devbeep: { cue: k => { [0, 0.3, 0.6].forEach(t => g.beep(t, 0.8 * k, null, 1050, 0.12)); },
      grain: (k, o, b) => { b.n = (b.n || 0) + 1; if (b.n % 20 === 0) g.beep(0, 0.5 * k, o, 1050, 0.12); } },
    toxic: { cue: k => { noise(1.5, 'highpass', 2500, 0.04 * k); },
      bed: (c, o) => bedNoise(c, o, 'highpass', 2800, 0, 0.01, 0.5, 0.4) },
    odour: { cue: k => { noise(1.4, 'bandpass', 900, 0.04 * k, 0, 0.7, null, 0, 0.4); } },
    whoosh: { cue: k => { noise(1.6, 'bandpass', 300, 0.24 * k, 0, 0.8, null, 1800, 0.3); for (let i = 0; i < 12; i++) g.tick(R(0.2, 1.5), 0.25 * k, null, R(4000, 7000)); },
      bed: (c, o) => bedNoise(c, o, 'bandpass', 900, 0.7, 0.025, 0.5, 0.5),
      grain: (k, o) => { if (Math.random() < 0.4) g.tick(R(0, 0.1), 0.15 * k, o, R(4000, 7000)); } },
  };
  /* aturan pemetaan teks peringatan ke profil bunyi; aturan yang lebih spesifik diletakkan lebih dulu */
  const RULES = [
    [/detektor .*berbunyi|detektor gas personal/, 'detector'],
    [/pemantik/, 'igniter'],
    [/memberi peringatan/, 'devbeep'],
    [/kavitasi|seperti kerikil|menggiling kerikil/, 'gravel'],
    [/water hammer|steam hammer|liquid hammer|hydraulic shock|hentakan|benturan cairan|benturan air|slugging/, 'hammer'],
    [/ketukan|knocking|benturan logam|dentang/, 'knock'],
    [/letusan keras|ledakan kecil|dentuman keras/, 'bang'],
    [/puffing|dentuman kecil|letupan|backfire/, 'puff'],
    [/dentuman(?! keras| kecil)/, 'hammer'],
    [/busur listrik|kilatan|flashover/, 'arc'],
    [/karet terbakar/, 'squeal'],
    [/dengung|berdengung|meraung|berputar terbalik|terus berbunyi/, 'hum'],
    [/derit|berderit|tertarik kencang|berbunyi kasar/, 'creak'],
    [/truk mulai bergerak/, 'engine'],
    [/katup pengaman .*mendesis|katup relief/, 'relief'],
    [/menyembur|semburan|memekakkan|mendesis keras/, 'jet'],
    [/mendesis|desis|suara gas/, 'hiss'],
    [/menetes|merembes|rembesan/, 'drip'],
    [/meluap|tumpah|menggenang/, 'splash', /lebih berat dari udara/],
    [/kipas .*berputar maksimum/, 'fan'],
    [/nyala .*padam|flare .*padam/, 'flameout'],
    [/(pompa|kompresor|fan|hvac|blower)[^.;]*(berhenti|diam)|turbin \S+ trip/, 'winddown'],
    [/menyala penuh|tetap menyala/, 'burner'],
    [/bergetar|getaran|gemuruh|bekerja berat|bekerja penuh|tersendat|menggembung/, 'rumble'],
    [/api jet|kebakaran jet|flash fire|bola api|kebakaran kilat|menjilat/, 'roar'],
    [/percikan|membara|hangus|terbakar|meleleh|api dari|menyambar/, 'crackle'],
    [/memanas|sangat panas|memerah|mengelupas|menggelembung|panas berlebih/, 'sizzle'],
    [/asap/, 'smoke'],
    [/lebih berat dari udara/, 'hiss'],
    [/^bau /, 'odour'],
  ];
  const BASE = { leak: 'hiss', toxic: 'toxic', spill: 'splash', vibration: 'rumble', heat: 'sizzle', smoke: 'smoke', fire: 'crackle', arc: 'arc', dust: 'whoosh', explosion: 'bang' };
  /* jenis yang bunyi dasarnya selalu ikut, karena bunyi itu melekat pada fenomenanya */
  const ALWAYS = { smoke: 1, toxic: 1, dust: 1 };
  function classify(type, text) {
    /* "mudah terbakar" dan "tidak terbakar" bukan tanda api */
    const t = (text || '').toLowerCase().replace(/(mudah|tidak) terbakar/g, '$1-nyala'), out = [];
    if (type === 'dust') out.push('whoosh');
    for (const [re, name, not] of RULES) {
      if (out.length >= 3) break;
      if (re.test(t) && !(not && not.test(t)) && !out.includes(name)) out.push(name);
    }
    const drop = n => { const i = out.indexOf(n); if (i >= 0) out.splice(i, 1); };
    if (out.includes('hammer')) drop('bang');
    if (type === 'dust') drop('jet');
    /* bau saja tidak dihitung sebagai bunyi fisik, jadi bunyi dasar jenisnya tetap ditambahkan */
    const strong = out.filter(n => n !== 'odour');
    if (type === 'fire') { if (!out.includes('roar') && !out.includes('crackle')) out.unshift('crackle'); }
    else if ((ALWAYS[type] || !strong.length) && BASE[type] && !out.includes(BASE[type])) out.push(BASE[type]);
    return out.slice(0, 3);
  }
  const SEV_K = { warn: 0.6, crit: 0.85, final: 1 };
  let bus = null, beds = [], tickT = 0;
  /* bunyi terjadwal ikut dibatalkan oleh stopBeds, misalnya saat pemain keluar sebelum laporan terbuka */
  const pend = new Set();
  function soon(fn, ms) { const t = setTimeout(() => { pend.delete(t); if (enabled) fn(); }, ms); pend.add(t); }
  function getBus(c) {
    if (!bus) { bus = c.createGain(); bus.gain.value = document.hidden ? 0 : 1; bus.connect(c.destination); }
    return bus;
  }
  function startBed(name, sev) {
    const c = getCtx(); const p = P[name];
    if (!c || !enabled || !p || (!p.bed && !p.grain)) return;
    const k = SEV_K[sev] || 0.6;
    const cur = beds.find(b => b.name === name);
    if (cur) { cur.k = Math.max(cur.k, k); cur.out.gain.setTargetAtTime(cur.k, c.currentTime, 0.4); return; }
    const out = c.createGain(); out.gain.value = 0.0001; out.connect(getBus(c));
    out.gain.setTargetAtTime(k, c.currentTime, 0.6);
    const b = { name, k, out, nodes: p.bed ? p.bed(c, out) : [], grain: p.grain };
    beds.push(b);
    /* paling banyak dua bunyi latar; yang terlama diredam lebih dulu */
    while (beds.length > 2) stopBed(beds.shift(), 0.8);
    if (!tickT) tickT = setInterval(() => { beds.forEach(x => { if (x.grain) x.grain(x.k, x.out, x); }); }, 120);
  }
  function stopBed(b, fade) {
    const c = getCtx(); if (!c) return;
    b.out.gain.setTargetAtTime(0.0001, c.currentTime, Math.max(0.05, fade / 3));
    b.grain = null;
    setTimeout(() => { b.nodes.forEach(n => { try { n.stop(); } catch (e) { /* sudah berhenti */ } }); b.out.disconnect(); }, fade * 1000 + 200);
  }
  function stopBeds(fade) {
    pend.forEach(t => clearTimeout(t)); pend.clear();
    beds.forEach(b => stopBed(b, fade === undefined ? 0.8 : fade));
    beds = [];
    clearInterval(tickT); tickT = 0;
  }
  document.addEventListener('visibilitychange', () => {
    if (!bus || !ctx) return;
    bus.gain.setTargetAtTime(document.hidden ? 0 : 1, ctx.currentTime, 0.1);
  });

  return {
    setEnabled(v) { enabled = !!v; if (!enabled) stopBeds(0.1); },
    /* peringatan abnormalitas: bunyi pemicu sesuai isi peringatan, lalu bunyi latar sesuai tingkat bahaya */
    abnormal(w) {
      const names = classify(w.type, w.text), k = SEV_K[w.sev] || 0.6;
      names.forEach((n, i) => { const p = P[n]; if (p && p.cue) soon(() => p.cue(k * (i ? 0.75 : 1)), 150 + i * 220); });
      /* bunyi latar paling banyak dua; yang paling spesifik dimulai terakhir agar tidak tergeser */
      names.filter(n => P[n] && (P[n].bed || P[n].grain)).slice(0, 2).reverse().forEach(n => startBed(n, w.sev));
      return names;
    },
    /* insiden: ledakan dengan puing, atau kobaran api, lalu sirene tanggap darurat */
    incident(w) {
      const t = (w.text || '').toLowerCase();
      if (w.type === 'explosion') {
        stopBeds(0.15);
        this.boom();
        for (let i = 0; i < 14; i++) g.tick(R(0.35, 2.2), R(0.6, 1.2), null, R(1500, 4500));
        if (/\bapi\b|terbakar|menyala/.test(t)) soon(() => startBed('roar', 'final'), 1200);
        else if (/uap .*menyembur|uap panas|uap bertekanan/.test(t)) soon(() => startBed('jet', 'final'), 900);
        soon(() => this.siren(), 2200);
      } else {
        stopBeds(0.4);
        const names = classify(w.type, w.text);
        if (w.type === 'fire') {
          P.roar.cue(1); startBed('roar', 'final');
          if (names.includes('arc')) { P.arc.cue(0.8); startBed('arc', 'final'); }
        }
        else names.forEach((n, i) => { const p = P[n]; if (p && p.cue) soon(() => p.cue(1), i * 200); startBed(n, 'final'); });
        if (w.type === 'toxic') startBed('detector', 'final');
        soon(() => this.siren(), 700);
      }
    },
    stopBeds,
    classify,
    /* alat uji: nama bunyi latar yang sedang aktif */
    _beds: () => beds.map(b => b.name),
    /* alat uji: merender bunyi pemicu atau latar secara offline lalu mengembalikan RMS dan puncaknya */
    _measure(name, part, k, dur) {
      const sr = 22050, len = Math.round(sr * (dur || 2)), oc = new OfflineAudioContext(1, len, sr), p = P[name];
      const was = enabled; enabled = true; ctxOverride = oc;
      try {
        if (!p) this[name]();
        else if (part === 'bed') { const o = oc.createGain(); o.gain.value = k || 1; o.connect(oc.destination); if (p.bed) p.bed(oc, o); }
        else if (p.cue) p.cue(k || 1);
      } finally { ctxOverride = null; enabled = was; }
      return oc.startRendering().then(buf => {
        const d = buf.getChannelData(0); let ss = 0, pk = 0;
        for (let i = 0; i < d.length; i++) { ss += d[i] * d[i]; pk = Math.max(pk, Math.abs(d[i])); }
        return { rms: Math.sqrt(ss / d.length), peak: pk };
      });
    },
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
    warn() { tone(880, 0.16, 'square', 0.04); tone(660, 0.2, 'square', 0.04, 0.2); },
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
