/* Uji waktu kejadian Tahap 2 tanpa peramban.
   Pemakaian: node tools/sim-events.js [id skenario] [id kejadian]
   Memuat js/data.js, skenario, dan js/sim.js, lalu menjalankan setiap kejadian beberapa kali
   (derau proses acak) dengan langkah 0,1 detik seperti di permainan. Untuk setiap kejadian
   dicetak waktu alarm DCS pertama (relatif terhadap awal kejadian), variabel yang pertama
   keluar batas, waktu peringatan lapangan, dan margin deteksi dini, yaitu selang antara alarm
   DCS pertama dan peringatan kritis pertama. Kasus faktor manusia juga menampilkan jadwal
   obrolan relatif terhadap awal kejadian. */
const fs = require('fs'); const vm = require('vm'); const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(js\/(?:data|scenarios\/[^"]+|sim)\.js)"><\/script>/g)].map(m => m[1]);
const ctx = { performance: { now: () => 0 }, requestAnimationFrame: () => 0, cancelAnimationFrame: () => 0, console };
vm.createContext(ctx);
vm.runInContext(files.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n;\n') + '\n;this.__out = { SCENARIOS, Simulator };', ctx);
const { SCENARIOS, Simulator } = ctx.__out;
const [onlyScn, onlyEv] = process.argv.slice(2);
const TRIALS = 15, DT = 0.1;
const med = a => { const b = a.filter(x => x !== null).sort((p, q) => p - q); return b.length ? b[Math.floor(b.length / 2)] : null; };
const fmt = x => x === null ? '-' : x.toFixed(1);
let problems = 0;
for (const scn of SCENARIOS) {
  if (onlyScn && scn.id !== onlyScn) continue;
  console.log(`\n== ${scn.id}: ${scn.title}`);
  for (const ev of scn.events) {
    if (onlyEv && ev.id !== onlyEv) continue;
    const fin = ev.warnings.find(w => w.sev === 'final');
    const crit = ev.warnings.find(w => w.sev !== 'warn');
    const alarmT = [], firstVar = {};
    for (let k = 0; k < TRIALS; k++) {
      const sim = new Simulator(scn, { speed: 1 });
      const delay = ev.start !== undefined ? ev.start : 7;
      while (sim.t < delay) sim.step(DT);
      sim.startEvent(ev);
      let at = null, v0 = null;
      while (sim.eventElapsed() < fin.t + 0.05) {
        sim.step(DT);
        if (at === null) {
          const bad = Object.keys(scn.vars).find(id => sim.status(id) !== 'normal');
          if (bad) { at = sim.eventElapsed(); v0 = bad; }
        }
      }
      alarmT.push(at);
      if (v0) firstVar[v0] = (firstVar[v0] || 0) + 1;
    }
    const a = med(alarmT);
    const margin = a === null || !crit ? null : crit.t - a;
    const flags = [];
    if (a === null) flags.push('TIDAK ADA ALARM DCS');
    else if (a > ev.warnings[0].t) flags.push('alarm DCS sesudah peringatan lapangan pertama');
    if (margin !== null && margin < 4) flags.push('margin deteksi dini sempit');
    if (flags.length) problems++;
    const vars = Object.entries(firstVar).sort((p, q) => q[1] - p[1]).map(([id, n]) => `${id}${n < TRIALS ? ` (${n}/${TRIALS})` : ''}`).join(', ');
    console.log(`${ev.id}${ev.hf ? ' [HF ' + ev.hf.type + ', ancaman ' + ev.hf.threat + ']' : ' [teknis, ancaman ' + ev.threat + ']'} alarm DCS t=${fmt(a)} s (${vars || '-'}), peringatan ${ev.warnings.map(w => w.t + w.sev[0]).join(' ')}, margin dini ${fmt(margin)} s${flags.length ? '  <-- ' + flags.join('; ') : ''}`);
    if (ev.chat) console.log(`   obrolan relatif awal kejadian: ${ev.chat.map(m => m.t - ev.start).join(', ')}`);
  }
}
console.log(problems ? `\n${problems} kejadian perlu ditinjau` : '\nSemua kejadian memiliki alarm DCS sebelum peringatan lapangan dan margin deteksi dini yang memadai');
