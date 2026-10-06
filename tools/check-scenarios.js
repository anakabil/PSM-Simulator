/* Validasi data skenario PSM Simulator.
   Pemakaian: node tools/check-scenarios.js [folder proyek] [-v]
   Membaca urutan skrip di index.html (js/data.js lalu js/scenarios/*.js), memuatnya
   tanpa peramban, lalu memeriksa konsistensi perangkat, program ITPM, skenario, kejadian,
   titik pemasangan, dan anggaran. Opsi -v menampilkan jadwal peringatan tiap kejadian. */
const fs = require('fs'); const vm = require('vm'); const path = require('path');
const args = process.argv.slice(2);
const verbose = args.includes('-v');
const root = path.resolve(args.find(a => a !== '-v') || path.join(__dirname, '..'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(js\/(?:data|scenarios\/[^"]+)\.js)"><\/script>/g)].map(m => m[1]);
let src = files.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n;\n');
src += '\n;this.__out = { DEVICES, ITPM, SCENARIOS, WARN_TYPES, PARAMS, GUIDEWORDS, SECTORS, EQ_TYPE_NAMES, CAST, TEAMS, HF_TYPES };';
const ctx = {}; vm.createContext(ctx); vm.runInContext(src, ctx);
const { DEVICES, ITPM, SCENARIOS, WARN_TYPES, PARAMS, GUIDEWORDS, SECTORS, EQ_TYPE_NAMES, CAST, TEAMS, HF_TYPES } = ctx.__out;
const pidSrc = fs.readFileSync(path.join(root, 'js/pid.js'), 'utf8');
const drawMap = pidSrc.match(/const DRAW = \{([^}]*)\}/);
const DRAWN = drawMap ? [...drawMap[1].matchAll(/(\w+)\s*:/g)].map(m => m[1]) : [];

let errs = 0, warns = 0;
const err = m => { errs++; console.log('GALAT:', m); };
const warn = m => { warns++; console.log('PERINGATAN:', m); };
const bad = /—|–|\*\*/;
const textCheck = (where, str) => { if (typeof str === 'string' && bad.test(str)) err(`${where}: memuat dash panjang atau tanda bintang ganda`); };
console.log(`Berkas dimuat: ${files.length} (${SCENARIOS.length} skenario)`);

for (const [k, d] of Object.entries(DEVICES)) {
  if (!ITPM[d.itpm]) err(`perangkat ${k}: program ${d.itpm} tidak ada`);
  else if (!ITPM[d.itpm].fits.includes(k)) err(`program ${d.itpm} tidak mencantumkan ${k}`);
  const st = d.cat === 'prevent' ? 3 : 4;
  if (ITPM[d.itpm] && ITPM[d.itpm].stage !== st) err(`perangkat ${k}: tahap tidak sama dengan programnya`);
  if (!(d.pfd > 0)) err(`perangkat ${k}: PFD tidak valid`);
  textCheck('perangkat ' + k, d.name); textCheck('perangkat ' + k, d.desc);
}
for (const [k, t] of Object.entries(ITPM)) {
  if (t.target === 'device') t.fits.forEach(f => { if (!DEVICES[f]) err(`program ${k}: perangkat ${f} tidak dikenal`); else if (DEVICES[f].itpm !== k) err(`program ${k} mencantumkan ${f}, tetapi ${f} memakai ${DEVICES[f].itpm}`); });
  else t.fitsEq.forEach(x => { if (!EQ_TYPE_NAMES[x]) err(`program ${k}: jenis peralatan ${x} tanpa nama`); });
  textCheck('program ' + k, t.desc);
}

const ids = new Set();
for (const s of SCENARIOS) {
  if (ids.has(s.id)) err(`id skenario ganda: ${s.id}`); ids.add(s.id);
  if (!SECTORS.some(x => x.key === s.sector)) err(`${s.id}: sektor ${s.sector} tidak dikenal`);
  if (!s.area) err(`${s.id}: area belum diisi`);
  const kits = s.kits || ['proses'];
  const visible = k => (DEVICES[k].kit || ['proses']).some(x => kits.includes(x));
  JSON.stringify(s, (key, val) => { if (typeof val === 'string') textCheck(s.id + '.' + key, val); return val; });
  const eq = Object.fromEntries(s.equipment.map(e => [e.id, e]));
  s.equipment.forEach(e => {
    if (!DRAWN.includes(e.type)) err(`${s.id} ${e.id}: jenis ${e.type} tidak dapat digambar`);
    if (e.level && !s.vars[e.level]) err(`${s.id} ${e.id}: variabel level ${e.level} tidak ada`);
    if (e.flameVar && !s.vars[e.flameVar]) err(`${s.id} ${e.id}: variabel nyala ${e.flameVar} tidak ada`);
    (e.vars || []).forEach(v => { if (!s.vars[v]) err(`${s.id} ${e.id}: variabel ${v} tidak ada`); });
    if (e.x < 0 || e.x > 1000 || e.y < 0 || e.y > 560) warn(`${s.id} ${e.id}: di luar viewBox`);
  });
  Object.entries(s.vars).forEach(([id, v]) => {
    if (!eq[v.node]) err(`${s.id} variabel ${id}: node ${v.node} tidak ada`);
    if (!(v.normal >= v.min && v.normal <= v.max)) err(`${s.id} variabel ${id}: nilai normal di luar rentang`);
    ['lo', 'lolo'].forEach(k => { if (v[k] !== undefined && v[k] >= v.normal) err(`${s.id} variabel ${id}: ${k} tidak boleh di atas normal`); });
    ['hi', 'hihi'].forEach(k => { if (v[k] !== undefined && v[k] <= v.normal) err(`${s.id} variabel ${id}: ${k} tidak boleh di bawah normal`); });
  });
  s.trendVars.forEach(v => { if (!s.vars[v]) err(`${s.id}: variabel tren ${v} tidak ada`); });
  if (s.trendVars.length !== 4) warn(`${s.id}: trendVars sebaiknya berisi 4 variabel`);
  if (!s.vars[s.production.var]) err(`${s.id}: variabel produksi tidak ada`);
  (s.controls || []).forEach(c => {
    if (!(c.def >= c.min && c.def <= c.max)) err(`${s.id} kendali ${c.id}: nilai awal di luar rentang`);
    c.effects.forEach(f => { if (!s.vars[f.var]) err(`${s.id} kendali ${c.id}: variabel ${f.var} tidak ada`); });
  });
  if (s.quiz.length !== 5) warn(`${s.id}: jumlah kuis ${s.quiz.length}, lazimnya 5`);
  let longest = 0;
  s.quiz.forEach((q, i) => {
    if (q.opts.length !== 4 || q.ans < 0 || q.ans > 3) { err(`${s.id}: kuis ${i + 1} harus 4 opsi dengan jawaban 0 sampai 3`); return; }
    const cl = q.opts[q.ans].length, dmax = Math.max(...q.opts.filter((_, j) => j !== q.ans).map(o => o.length));
    if (cl > dmax) longest++;
    if (cl > dmax * 1.35) warn(`${s.id}: kuis ${i + 1} jawaban benar jauh lebih panjang dari pengecoh sehingga mudah ditebak`);
  });
  if (longest > 3) warn(`${s.id}: jawaban benar menjadi opsi terpanjang pada ${longest} dari ${s.quiz.length} soal`);
  const regular = s.events.filter(e => !e.hf), hfEvents = s.events.filter(e => e.hf);
  if (regular.length !== 4) warn(`${s.id}: jumlah kejadian teknis ${regular.length}, lazimnya 4`);
  if (hfEvents.length > 1) warn(`${s.id}: lebih dari satu kasus faktor manusia`);
  hfEvents.forEach(ev => {
    const h = ev.hf;
    if (!HF_TYPES[h.type]) err(`${s.id} ${ev.id}: jenis kesalahan ${h.type} tidak dikenal`);
    if (!TEAMS[h.team]) err(`${s.id} ${ev.id}: tim ${h.team} tidak dikenal`);
    if (s.bowtie.threats[h.threat] === undefined) err(`${s.id} ${ev.id}: indeks ancaman ${h.threat} tidak ada di bow-tie`);
    ['title', 'factor', 'lesson'].forEach(k => { if (!h[k]) err(`${s.id} ${ev.id}: hf.${k} belum diisi`); });
    if (!h.controls || h.controls.length < 2) err(`${s.id} ${ev.id}: hf.controls minimal 2 butir`);
    Object.keys(h.roles || {}).forEach(k => { if (!CAST[k]) err(`${s.id} ${ev.id}: roles memuat tokoh ${k} yang tidak ada di CAST`); });
    if (ev.start === undefined) err(`${s.id} ${ev.id}: kasus faktor manusia memerlukan start`);
    if (!ev.chat || ev.chat.length < 4) err(`${s.id} ${ev.id}: obrolan tim minimal 4 pesan`);
    let lt = -1;
    (ev.chat || []).forEach((m, i) => {
      if (!CAST[m.who]) err(`${s.id} ${ev.id}: pesan ${i + 1} tokoh ${m.who} tidak ada di CAST`);
      if (m.at && !eq[m.at]) err(`${s.id} ${ev.id}: pesan ${i + 1} lokasi ${m.at} tidak ada`);
      if (m.t <= lt) err(`${s.id} ${ev.id}: waktu pesan harus naik`); lt = m.t;
      if (m.mood && !['normal', 'santai', 'ragu', 'panik', 'marah'].includes(m.mood)) err(`${s.id} ${ev.id}: suasana ${m.mood} tidak dikenal`);
      if (m.text.length > 150) warn(`${s.id} ${ev.id}: pesan ${i + 1} terlalu panjang untuk balon komik`);
    });
    if (ev.chat && ev.start !== undefined && !ev.chat.some(m => m.t < ev.start)) warn(`${s.id} ${ev.id}: tidak ada pesan sebelum kejadian dimulai`);
  });
  s.events.forEach(ev => {
    ev.effects.forEach(f => {
      const v = s.vars[f.var];
      if (!v) err(`${s.id} ${ev.id}: variabel efek ${f.var} tidak ada`);
      else if (f.to < v.min || f.to > v.max) err(`${s.id} ${ev.id}: efek ${f.var} ke ${f.to} di luar rentang ${v.min} sampai ${v.max}`);
    });
    ev.answer.node.forEach(n => { if (!eq[n]) err(`${s.id} ${ev.id}: node jawaban ${n} tidak ada`); else if (['muster', 'building'].includes(eq[n].type)) err(`${s.id} ${ev.id}: node jawaban ${n} tidak muncul di daftar node`); });
    if (!ev.hint || ev.hint.length < 20) err(`${s.id} ${ev.id}: petunjuk mekanisme belum diisi`);
    if (ev.hintVar && !s.vars[ev.hintVar]) err(`${s.id} ${ev.id}: hintVar ${ev.hintVar} tidak ada`);
    ev.answer.param.forEach(p => { if (!PARAMS[p]) err(`${s.id} ${ev.id}: parameter ${p} tidak dikenal`); });
    ev.answer.guide.forEach(g => { if (!GUIDEWORDS[g]) err(`${s.id} ${ev.id}: guideword ${g} tidak dikenal`); });
    if (ev.causes.length !== 4 || ev.cons.length !== 4) err(`${s.id} ${ev.id}: penyebab dan konsekuensi masing-masing harus 4 opsi`);
    if (ev.causeAns !== 0 || ev.consAns !== 0) warn(`${s.id} ${ev.id}: causeAns dan consAns lazimnya 0 karena opsi diacak saat tampil`);
    let lastT = -1, finals = 0;
    ev.warnings.forEach(w => {
      if (!WARN_TYPES[w.type]) err(`${s.id} ${ev.id}: jenis peringatan ${w.type} tidak dikenal`);
      if (w.at && !eq[w.at]) err(`${s.id} ${ev.id}: lokasi peringatan ${w.at} tidak ada`);
      if (w.t <= lastT) err(`${s.id} ${ev.id}: waktu peringatan harus naik`); lastT = w.t;
      if (w.sev === 'final') finals++;
    });
    if (finals !== 1 || ev.warnings[ev.warnings.length - 1].sev !== 'final') err(`${s.id} ${ev.id}: harus diakhiri tepat satu peringatan final`);
    if (verbose) {
      const end = Math.max(...ev.effects.map(f => f.delay + f.dur));
      const off = ev.start !== undefined ? ev.start : 0;
      console.log(`  ${s.id} ${ev.id}${ev.hf ? ' [faktor manusia, mulai t=' + off + ']' : ''}: efek matang pada t=${end} s, peringatan pada ${ev.warnings.map(w => w.t + w.sev[0]).join(', ')}${ev.chat ? ', pesan pada ' + ev.chat.map(m => m.t - off).join(', ') + ' (relatif kejadian)' : ''}`);
    }
  });
  const hsIds = new Set();
  s.hotspots.forEach(h => {
    if (hsIds.has(h.id)) err(`${s.id}: titik ganda ${h.id}`); hsIds.add(h.id);
    h.accept.forEach(a => {
      if (!DEVICES[a]) err(`${s.id} ${h.id}: perangkat ${a} tidak dikenal`);
      else {
        if ((DEVICES[a].cat === 'prevent' ? 3 : 4) !== h.stage) err(`${s.id} ${h.id}: perangkat ${a} tidak sesuai tahap`);
        if (!visible(a)) err(`${s.id} ${h.id}: perangkat ${a} tidak tampil pada kit ${kits.join(',')}`);
      }
    });
    if (h.x < 12 || h.x > 988 || h.y < 12 || h.y > 548) warn(`${s.id} ${h.id}: terlalu dekat tepi`);
  });
  [3, 4].forEach(st => {
    const pts = s.hotspots.filter(h => h.stage === st);
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      if (Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) < 34) warn(`${s.id}: ${pts[i].id} dan ${pts[j].id} terlalu berdekatan`);
    }
  });
  s.inspect.forEach(t => {
    if (!eq[t.id]) err(`${s.id}: peralatan inspeksi ${t.id} tidak ada`);
    else if (!ITPM[t.itpm].fitsEq.includes(eq[t.id].type)) err(`${s.id}: jenis ${eq[t.id].type} pada ${t.id} tidak sesuai program ${t.itpm}`);
  });
  const line = [];
  for (const st of [3, 4]) {
    let cost = 0;
    s.hotspots.filter(h => h.stage === st && h.accept.length).forEach(h => {
      cost += Math.min(...h.accept.map(a => DEVICES[a].cost + ITPM[DEVICES[a].itpm].cost));
    });
    if (st === 3) s.inspect.forEach(t => { cost += ITPM[t.itpm].cost; });
    const b = s.budget[st];
    line.push(`tahap ${st} ideal ${cost} / anggaran ${b}`);
    if (b < cost) err(`${s.id} tahap ${st}: anggaran di bawah biaya ideal`);
    if (b > cost + 4) warn(`${s.id} tahap ${st}: anggaran terlalu longgar (${b} dibanding ideal ${cost})`);
  }
  console.log(`${s.id} [${s.sector}]: ${line.join(', ')}`);
  if (s.bowtie.threats.length !== s.events.filter(e => !e.hf).length) warn(`${s.id}: jumlah ancaman bow-tie berbeda dengan jumlah kejadian teknis`);
}
const bySector = {}; SCENARIOS.forEach(s => { bySector[s.sector] = (bySector[s.sector] || 0) + 1; });
console.log('Skenario per sektor:', SECTORS.map(x => `${x.key} ${bySector[x.key] || 0}`).join(', '));
console.log(errs ? `${errs} galat, ${warns} peringatan` : `Semua pemeriksaan lolos (${warns} peringatan)`);
process.exit(errs ? 1 : 0);
