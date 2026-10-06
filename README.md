# PSM Simulator by Nusa Safety

Permainan simulasi keselamatan proses (Process Safety Management) berbasis web untuk Nusa Safety, PT. Nusa Rendra Jayatama. Pemain diberi P&ID sebuah unit proses dan mempelajari kondisi normalnya. Setelah itu pemain menjalankan proses produksi dan mengenali abnormalitas dari tren serta peringatan lapangan. Tahap berikutnya adalah memasang barier pencegahan dan mitigasi dengan anggaran terbatas, lengkap dengan program inspeksi dan pengujian agar barier tetap andal. Hasil akhir disajikan sebagai diagram bow-tie.

Tersedia 12 skenario dari enam sektor industri, yaitu minyak dan gas bumi, petrokimia, ketenagalistrikan, energi baru terbarukan, manufaktur, serta properti dan konstruksi EPC. Dengan demikian kerangka PSM yang sama dapat dilatihkan pada fasilitas yang tidak selalu disebut unit proses, seperti gardu induk, PLTS dengan baterai, cold storage, gedung komersial, dan asphalt mixing plant.

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
| 1. Kondisi Normal | Memahami proses produksi | Klik tiap peralatan di P&ID, tekan tombol Jalankan (misalnya Jalankan Proses Produksi, Jalankan Operasi Gedung, atau Jalankan Operasi AMP sesuai fasilitas), ubah set point, amati isi bejana dan tren, lalu kuis |
| 2. Abnormalitas | Mengenali deviasi (HAZOP) | Tekan tombol Jalankan; saat terjadi kegagalan muncul peringatan lapangan bertahap (getaran, kebocoran gas, gas beracun, panas berlebih, tumpahan, asap, busur listrik, awan debu, kebakaran, ledakan); hentikan dan laporkan node, parameter, guideword, penyebab, konsekuensi |
| 3. Barier Pencegahan | Mencegah kehilangan kontainmen atau kehilangan kendali energi | Pasang perangkat yang sesuai sektor, misalnya PT/LT/TT/FT, PSV, SIF, trip level/suhu/aliran, BMS, interlock draft, relai proteksi, BMS baterai, monitor sabuk elevator, sakelar tekanan tinggi kompresor, atau detektor LPG dengan katup solenoid; terapkan program uji (kalibrasi, proof test, uji PSV, uji relai, uji perangkat mekanis) serta inspeksi peralatan (bejana tekan/tangki, pemantauan getaran, termografi panel, pembersihan ducting dapur) |
| 4. Barier Mitigasi | Mencegah eskalasi menjadi bencana | Pasang detektor gas/api/asap, ESD, deluge, sprinkler, hidran, pemadam gas bersih, wet chemical, tanggul, venting dan isolasi ledakan, ventilasi darurat, tirai air, presurisasi tangga, alarm umum; terapkan bump test detektor, uji sistem pemadam, uji fungsi sistem darurat, inspeksi barier pasif, dan latihan tanggap darurat |

Menu awal: New Game, Continue, Configuration, Credit.

### Penilaian Tahap 2

Setiap laporan bernilai 100 poin (node, parameter, guideword, penyebab, konsekuensi masing-masing 20). Laporan yang tepat dan dikirim sebelum peringatan kritis mendapat bonus deteksi dini +10. Laporan yang baru dikirim setelah insiden terjadi mendapat penalti -20.

Formulir laporan dapat diperkecil lewat tombol di kanan atas. Selama diperkecil, pemain bisa kembali membaca P&ID, tren, peringatan lapangan, dan pop-up peralatan, lalu melanjutkan isian tanpa kehilangan jawaban. Formulir juga menyediakan tiga petunjuk berurutan, yaitu variabel proses yang paling awal menyimpang, gambaran mekanisme kegagalan, dan lokasi node. Setiap petunjuk mengurangi 5 poin dari laporan tersebut, kecuali pada Mode Mudah yang membebaskan biaya petunjuk.

### Pemasangan barier lewat pop-up

Pada Tahap 3 dan 4, titik pemasangan (+) pada P&ID dapat diklik langsung tanpa memilih alat terlebih dahulu. Pop-up pemilih menampilkan perangkat yang sesuai untuk tahap tersebut, dikelompokkan menurut fungsinya, lengkap dengan biaya dan sisa anggaran. Setelah perangkat dipasang, pop-up perangkat menawarkan daftar program inspeksi dan pengujian yang dapat langsung diterapkan, serta tombol untuk mengganti atau melepas perangkat. Pop-up peralatan pada Tahap 3 juga menawarkan program inspeksi peralatan. Kotak Alat di panel kanan tetap tersedia sebagai cara alternatif.

### Anggaran dalam Rupiah atau USD

Biaya perangkat dan program disimpan dalam satuan anggaran agar penilaian tidak bergantung pada kurs. Untuk tampilan, satu satuan dianggap setara USD 25.000, mencakup pengadaan, pemasangan, dan rekayasa. Untuk program inspeksi dan pengujian, satu satuan mewakili biaya pelaksanaan selama satu siklus 5 tahun. Mata uang tampilan (Rupiah atau USD) dan kurs Rupiah per USD (bawaan Rp 16.000) dapat diubah di Configuration. Nilai ini bersifat indikatif untuk pelatihan dan bukan acuan pengadaan.

### Inspeksi, pengujian, dan keandalan barier

Setiap perangkat memiliki PFD desain indikatif mengikuti rentang tipikal CCPS (2001). Barier tanpa program pengujian dianggap menyimpan kegagalan tersembunyi sehingga PFD-nya dinaikkan 10 kali. Hal ini mencerminkan kriteria IPL pada LOPA, yaitu barier harus dapat diaudit melalui pengujian. Panel Keandalan Sistem Proteksi menampilkan keandalan rata-rata yang dapat dikreditkan. Bobot nilai Tahap 3 terdiri dari ketepatan barier 55 %, pengujian barier 25 %, dan inspeksi peralatan kritis 20 %. Bobot nilai Tahap 4 terdiri dari ketepatan barier 65 % dan pengujian barier 35 %. Setiap pemasangan keliru atau tidak perlu dikurangi 8 poin.

## Tampilan

Palet mengikuti logo: silver, hitam, dan biru muda. Warna kuning dan merah hanya dipakai untuk kondisi abnormal, sejalan dengan filosofi HMI berperforma tinggi (ANSI/ISA-101). Peralatan digambar sebagai baja silver bergradien dengan bayangan, dan isi cairan di bejana serta tangki berubah sesuai simulasi. Efek kilatan dan guncangan saat ledakan dapat dimatikan di Configuration, dan otomatis dinonaktifkan bila sistem operasi meminta pengurangan gerak. Latar layar menu, pilihan skenario, konfigurasi, Credit, dan hasil memakai foto kilang yang diolah menjadi monokrom silver dan ditampilkan redup.

Ikon tombol menu digambar sebagai SVG bervolume dengan gradien, bevel, dan kilap, sehingga tetap tajam di layar beresolusi tinggi. Halaman menu memiliki animasi ringan berupa partikel cahaya, sinar latar yang berputar pelan, kilau yang melintas di logo, dan tombol yang muncul berurutan. Semua animasi ini ikut mati bila efek animasi dinonaktifkan atau sistem operasi meminta pengurangan gerak.

Informasi peralatan dan perangkat tampil sebagai pop-up di dekat titik yang diklik pada P&ID. Pop-up memuat deskripsi, nilai proses terkini yang diperbarui langsung, serta status PFD dan program uji pada tahap barier. Pop-up ditutup dengan tombol silang di kanan atas, tombol Escape, klik area kosong, atau otomatis berganti saat peralatan lain diklik.

## Audio

Musik latar memakai lagu Measured Flow yang diputar berulang. Musik baru berbunyi setelah interaksi pertama pengguna, sesuai kebijakan autoplay peramban, lalu naik perlahan selama sekitar 2,5 detik. Rekaman aslinya memakai efek auto-pan, yaitu sebagian instrumen berpindah dari kanal kiri ke kanan dengan periode sekitar 1,1 detik. Efek ini melelahkan bila didengar lewat earphone, sehingga berkas diubah menjadi mono dengan merata-ratakan kedua kanal, pada 128 kbps dan kekerasan sekitar -14 LUFS. Volume default diatur 45 persen pada kurva kuadratik, setara amplitudo 0,2 atau sekitar 14 dB lebih pelan dari berkas tersebut. Saat insiden terjadi di Tahap 2, musik diredam sementara agar alarm dan peringatan tetap terdengar jelas. Musik juga dijeda saat tab peramban tidak aktif. Musik dapat dimatikan lewat tombol pengeras suara di menu dan bilah atas, atau diatur volumenya di Configuration.

## Credit dan profil perusahaan

Layar Credit hanya menampilkan identitas perusahaan, yaitu PT. Nusa Rendra Jayatama dengan merek Nusa Safety, tanpa nama perorangan. Isinya meliputi profil dan layanan yang dihimpun dari situs resmi nusasafety.co.id, kerangka konsep permainan, dan daftar referensi. Data profil tersimpan pada objek `COMPANY` dan daftar referensi pada `CREDITS.referensi` di `js/data.js` sehingga mudah diperbarui.

## Sektor dan skenario

Layar New Game mengelompokkan skenario per sektor dan menyediakan filter sektor. Setiap skenario memiliki empat kejadian kegagalan, lima soal kuis, titik pemasangan barier pencegahan dan mitigasi, serta peralatan kritis untuk program inspeksi.

| Sektor | Skenario | Tingkat | Ancaman utama yang dilatihkan |
|---|---|---|---|
| Minyak dan gas bumi | Unit Separator Produksi Migas | Pemula | Outlet gas terblokir, carry-over ke kompresor, gas blow-by ke sistem air, luapan tangki minyak |
| Minyak dan gas bumi | Penyimpanan dan Pengisian LPG | Lanjutan | Overfill truk tangki dan tangki bullet, paparan panas eksternal (BLEVE), putusnya loading arm |
| Petrokimia | Reaktor Batch Eksotermik | Menengah | Kehilangan air pendingin, umpan berlebih, vent terblokir, overfill reaktor (reaksi runaway) |
| Petrokimia | Kolom Distilasi Aromatik | Menengah | Kehilangan pendingin kondensor, uap reboiler berlebih, luapan drum refluks, kavitasi pompa dasar kolom |
| Ketenagalistrikan | Boiler PLTU Batu Bara | Lanjutan | Air umpan hilang, nyala padam dengan bahan bakar tetap masuk, coal mill kepanasan, turbin trip |
| Ketenagalistrikan | Trafo Daya Gardu Induk 150/20 kV | Menengah | Kipas pendingin gagal, gangguan isolasi internal, hubung singkat penyulang, kebocoran minyak trafo |
| Energi baru terbarukan | PLT Biogas Limbah Cair Sawit (POME) | Menengah | Blower trip, udara masuk ke biogas, flare padam, kondensat terbawa ke blower (metana dan H2S) |
| Energi baru terbarukan | PLTS dengan Penyimpanan Baterai (BESS) | Lanjutan | HVAC gagal, overcharge, gangguan isolasi kabel DC, hubung singkat internal sel (thermal runaway) |
| Manufaktur | Lini Produksi Pakan Ternak | Menengah | Sabuk elevator selip, logam asing di hammer mill, pemanasan spontan silo, mill tercekik (ledakan debu) |
| Manufaktur | Refrigerasi Amonia Cold Storage | Lanjutan | Kondensor gagal, cairan terhisap kompresor, hentakan hidraulik saat defrost, pendinginan oli gagal |
| Properti dan konstruksi EPC | Proteksi Kebakaran Gedung Komersial | Pemula | Kebocoran LPG dapur, luapan solar tangki harian genset, sambungan busbar LVMDP kendur, kebakaran ducting dapur |
| Properti dan konstruksi EPC | Asphalt Mixing Plant Proyek Jalan | Menengah | Burner padam lalu dinyalakan ulang tanpa purging, ID fan mati, kebakaran baghouse, pompa oli termal trip |

### Kit perangkat per skenario

Kotak Alat dan pop-up pemilih hanya menampilkan perangkat yang relevan dengan jenis fasilitas, termasuk beberapa pengecoh yang masuk akal. Pengelompokan ini disebut kit dan ditetapkan lewat properti `kit` pada perangkat serta `kits` pada skenario. Kit yang tersedia adalah `proses` (migas dan petrokimia), `boiler`, `trafo`, `biogas`, `bess`, `debu`, `amonia`, `gedung`, dan `amp`. Perangkat umum seperti transmitter suhu dan alarm umum tampil di semua kit.

Pada skenario fasilitas non-produksi, label tombol menyesuaikan jenis operasinya, misalnya Jalankan Operasi Pembangkit, Jalankan Operasi Gardu Induk, Jalankan Operasi Refrigerasi, Jalankan Operasi Gedung, dan Jalankan Operasi AMP.

## Struktur berkas

```
index.html                  halaman utama
css/style.css               gaya tampilan (tombol 3D, kartu, P&ID, efek insiden, modal)
js/data.js                  katalog perangkat dan kit, program ITPM, model biaya, sektor, peringatan lapangan, credit
js/scenarios/*.js           satu berkas per skenario, dinamai <sektor>-<unit>.js (12 berkas)
js/pid.js                   penggambar P&ID SVG (37 jenis simbol), isi cairan, efek insiden, lencana program uji
js/sim.js                   mesin simulasi proses, jam operasi, produksi, grafik tren
js/game.js                  alur permainan, pop-up, penilaian, simpan/lanjutkan, bow-tie
js/audio.js                 efek suara WebAudio dan pemutar musik latar
tools/check-scenarios.js    validasi data skenario dengan Node.js tanpa peramban
assets/psm-logo.png         logo PSM Simulator by Nusa Safety
assets/psm-emblem.png       emblem untuk bilah atas
assets/favicon.png          ikon tab peramban
assets/nusa-safety-logo.png logo Nusa Safety untuk layar Credit
assets/menu-bg.jpg          foto latar menu (monokrom silver)
assets/audio/measured-flow.mp3  musik latar
```

## Menambah skenario

1. Buat berkas baru di `js/scenarios/`, misalnya `manufaktur-boiler-pabrik.js`, berisi satu objek skenario yang diakhiri `SCENARIOS.push(...)`. Berkas yang sudah ada dapat dijadikan contoh.
2. Daftarkan berkas tersebut di `index.html` sesudah `js/data.js` dan sebelum `js/audio.js`. Urutan baris menentukan urutan tampil di layar New Game.
3. Isi struktur yang sama dengan skenario lain: `sector` (kunci dari `SECTORS`), `area`, `kits`, opsional `op` untuk label tombol Jalankan, `equipment` (opsional `level` untuk isi cairan, `levelFill: 'bulk'` untuk material curah, `flameVar` agar nyala padam mengikuti variabel), `pipes`, `zones` (opsional `style: 'building'` dengan `floors` untuk potongan gedung), opsional `ground` untuk garis permukaan tanah, `vars`, `controls`, `production`, `quiz`, `events` (dengan `warnings` bertahap yang diakhiri satu peringatan `final`, serta opsional `hintVar`), `hotspots`, `inspect`, `budget`, dan `bowtie`. Koordinat memakai viewBox 1000 x 560.
4. Jalankan validasi berikut sebelum commit. Alat ini memeriksa rujukan variabel dan peralatan, kesesuaian perangkat dengan tahap dan kit, urutan peringatan, jarak antartitik pemasangan, kecukupan anggaran terhadap biaya ideal, serta larangan dash panjang dan tanda bintang ganda pada teks.

```bash
node tools/check-scenarios.js        # ringkasan per skenario
node tools/check-scenarios.js -v     # ditambah jadwal peringatan tiap kejadian
```

Anggaran normal sebaiknya sekitar 3 satuan di atas biaya ideal, sehingga Mode Sulit (anggaran dikurangi 2) tetap dapat diselesaikan atau sedikit memaksa kompromi.

## Referensi

Daftar referensi lengkap tercantum pada layar Credit. Referensi lokal didahulukan, kemudian standar internasional untuk hal yang belum diatur secara rinci di dalam negeri.

- Umum dan migas: PP No. 50 Tahun 2012, Permenaker No. 37 Tahun 2016, Kepmenaker No. 187/MEN/1999, Permen ESDM No. 18 Tahun 2018, OSHA 29 CFR 1910.119, CCPS (2001, 2007), CCPS/EI Bow Ties in Risk Management, IEC 61511, IEC 61882, ANSI/ISA-18.2, ANSI/ISA-101, API 510, API 653, API RP 576, API Std 2510, NFPA 25, dan NFPA 58.
- Ketenagalistrikan dan EBT: Permen ESDM No. 10 Tahun 2021, Permenaker No. 12 Tahun 2015, Undang-Undang Uap dan Peraturan Uap Tahun 1930, IEC 60076-7, IEEE C57.104, NFPA 85, NFPA 850, NFPA 855, serta laporan DNV GL (2020) tentang insiden BESS McMicken.
- Manufaktur: Permenaker No. 5 Tahun 2018 (NAB amonia 25 ppm), NFPA 652, NFPA 61, NFPA 68, NFPA 69, IIAR 2, ASHRAE 15, serta laporan CSB tentang Imperial Sugar (2009) dan Millard Refrigerated Services (2015).
- Properti dan konstruksi: Permen PU No. 26/PRT/M/2008, SNI 03-1745-2000, SNI 03-3985-2000, SNI 03-3989-2000, Permenakertrans No. Per.04/MEN/1980, Permenaker No. Per.02/MEN/1983, Kepmenaker No. Kep.186/MEN/1999, Permen PUPR No. 10 Tahun 2021, NFPA 13, NFPA 96, NFPA 17A, NFPA 2001, dan NFPA 86.

Skenario, nilai parameter, nilai PFD, dan tata letak P&ID disederhanakan untuk tujuan pelatihan dan bukan rancangan rekayasa yang dapat dipakai langsung di lapangan.
