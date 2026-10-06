# PSM Simulator by Nusa Safety

Permainan simulasi keselamatan proses (Process Safety Management) berbasis web untuk Nusa Safety, PT. Nusa Rendra Jayatama. Pemain diberi P&ID sebuah unit proses dan mempelajari kondisi normalnya. Setelah itu pemain menjalankan proses produksi dan mengenali abnormalitas dari tren serta peringatan lapangan. Tahap berikutnya adalah memasang barier pencegahan dan mitigasi dengan anggaran terbatas, lengkap dengan program inspeksi dan pengujian agar barier tetap andal. Hasil akhir disajikan sebagai diagram bow-tie.

## Menjalankan

Tidak ada proses build. Buka `index.html` di peramban modern (Chrome, Edge, Firefox), atau jalankan server statis sederhana agar font web termuat dengan baik:

```bash
python3 -m http.server 8080
# lalu buka http://localhost:8080
```

Progres permainan, riwayat skor, dan konfigurasi disimpan di `localStorage` peramban.

## Alur permainan

| Tahap | Tujuan | Mekanik |
|---|---|---|
| 1. Kondisi Normal | Memahami proses produksi | Klik tiap peralatan di P&ID, tekan Jalankan Proses Produksi, ubah set point, amati isi bejana dan tren, lalu kuis |
| 2. Abnormalitas | Mengenali deviasi (HAZOP) | Tekan Jalankan Proses Produksi; saat terjadi kegagalan muncul peringatan lapangan bertahap (getaran, kebocoran gas, gas beracun H2S, panas berlebih, tumpahan, kebakaran, ledakan); hentikan dan laporkan node, parameter, guideword, penyebab, konsekuensi |
| 3. Barier Pencegahan | Mencegah kehilangan kontainmen | Pasang PT/LT/TT/FT, PSV, rupture disc, SIF, trip level/suhu/aliran, check valve, dan lain-lain; terapkan program uji (kalibrasi, proof test, uji PSV, uji perangkat mekanis) serta inspeksi peralatan (bejana tekan/tangki, pemantauan getaran) |
| 4. Barier Mitigasi | Mencegah eskalasi menjadi bencana | Pasang detektor gas/api, ESD, blowdown, deluge, tanggul, busa, ROSOV, scrubber, quench, alarm umum; terapkan bump test detektor, uji sistem pemadam, uji fungsi ESD, inspeksi tanggul, dan latihan tanggap darurat |

Menu awal: New Game, Continue, Configuration, Credit.

### Penilaian Tahap 2

Setiap laporan bernilai 100 poin (node, parameter, guideword, penyebab, konsekuensi masing-masing 20). Laporan yang tepat dan dikirim sebelum peringatan kritis mendapat bonus deteksi dini +10. Laporan yang baru dikirim setelah insiden terjadi mendapat penalti -20.

### Inspeksi, pengujian, dan keandalan barier

Setiap perangkat memiliki PFD desain indikatif mengikuti rentang tipikal CCPS (2001). Barier tanpa program pengujian dianggap menyimpan kegagalan tersembunyi sehingga PFD-nya dinaikkan 10 kali. Hal ini mencerminkan kriteria IPL pada LOPA, yaitu barier harus dapat diaudit melalui pengujian. Panel Keandalan Sistem Proteksi menampilkan keandalan rata-rata yang dapat dikreditkan. Bobot nilai Tahap 3 terdiri dari ketepatan barier 55 %, pengujian barier 25 %, dan inspeksi peralatan kritis 20 %. Bobot nilai Tahap 4 terdiri dari ketepatan barier 65 % dan pengujian barier 35 %. Setiap pemasangan keliru atau tidak perlu dikurangi 8 poin.

## Tampilan

Palet mengikuti logo: silver, hitam, dan biru muda. Warna kuning dan merah hanya dipakai untuk kondisi abnormal, sejalan dengan filosofi HMI berperforma tinggi (ANSI/ISA-101). Peralatan digambar sebagai baja silver bergradien dengan bayangan, dan isi cairan di bejana serta tangki berubah sesuai simulasi. Efek kilatan dan guncangan saat ledakan dapat dimatikan di Configuration, dan otomatis dinonaktifkan bila sistem operasi meminta pengurangan gerak.

## Skenario

1. Unit Separator Produksi Migas (Pemula)
2. Reaktor Batch Eksotermik (Menengah)
3. Penyimpanan dan Pengisian LPG (Lanjutan)

## Struktur berkas

```
index.html                  halaman utama
css/style.css               gaya tampilan (tombol 3D, kartu, P&ID, efek insiden, modal)
js/data.js                  katalog perangkat, program ITPM, skenario, kuis, kejadian, peringatan lapangan, credit
js/pid.js                   penggambar P&ID SVG, isi cairan, efek insiden, lencana program uji
js/sim.js                   mesin simulasi proses, jam operasi, produksi, grafik tren
js/game.js                  alur permainan, penilaian, simpan/lanjutkan, bow-tie
js/audio.js                 efek suara WebAudio (alarm, desis, ledakan, api)
assets/psm-logo.png         logo PSM Simulator by Nusa Safety
assets/psm-emblem.png       emblem untuk bilah atas
assets/favicon.png          ikon tab peramban
assets/nusa-safety-logo.png logo Nusa Safety untuk layar Credit
```

## Menambah skenario

Tambahkan objek baru ke `SCENARIOS` di `js/data.js` dengan struktur yang sama: `equipment` (opsional `level` untuk isi cairan), `pipes`, `vars`, `controls`, `production`, `quiz`, `events` (dengan `warnings` bertahap yang diakhiri satu peringatan `final`), `hotspots`, `inspect`, `budget`, dan `bowtie`. Koordinat memakai viewBox 1000 x 560.

## Referensi

Daftar referensi lengkap tercantum pada layar Credit. Di antaranya PP No. 50 Tahun 2012, Permenaker No. 37 Tahun 2016, Kepmenaker No. 187/MEN/1999, Permen ESDM No. 18 Tahun 2018, OSHA 29 CFR 1910.119, CCPS (2001, 2007), IEC 61511, IEC 61882, ANSI/ISA-18.2, ANSI/ISA-101, API 510, API 653, API RP 576, NFPA 25, dan CCPS/EI Bow Ties in Risk Management.

Skenario, nilai parameter, nilai PFD, dan tata letak P&ID disederhanakan untuk tujuan pelatihan dan bukan rancangan rekayasa yang dapat dipakai langsung di lapangan.
