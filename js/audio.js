/* Audio sederhana berbasis WebAudio (tanpa berkas eksternal). */
const Sfx = (() => {
  let ctx = null;
  let enabled = true;
  function getCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, gain, when) {
    const c = getCtx();
    if (!c || !enabled) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    const t0 = c.currentTime + (when || 0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.15, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }
  return {
    setEnabled(v) { enabled = !!v; },
    click() { tone(520, 0.07, 'triangle', 0.08); },
    place() { tone(660, 0.08, 'triangle', 0.12); tone(880, 0.12, 'triangle', 0.1, 0.07); },
    remove() { tone(440, 0.1, 'sawtooth', 0.06); },
    success() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.12, i * 0.09)); },
    fail() { tone(220, 0.25, 'sawtooth', 0.1); tone(180, 0.3, 'sawtooth', 0.1, 0.15); },
    alarm() { for (let i = 0; i < 3; i++) { tone(1200, 0.12, 'square', 0.05, i * 0.25); tone(900, 0.12, 'square', 0.05, i * 0.25 + 0.12); } },
    start() { tone(392, 0.12, 'triangle', 0.1); tone(523, 0.2, 'triangle', 0.1, 0.1); },
  };
})();
