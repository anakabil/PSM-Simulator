# PSM Simulator by Nusa Safety

Permainan simulasi keselamatan proses (Process Safety Management) berbasis web untuk Nusa Safety, PT. Nusa Rendra Jayatama. Pemain diberi P&ID sebuah unit proses dan mempelajari kondisi normalnya. Setelah itu pemain menjalankan proses produksi dan mengenali abnormalitas dari tren serta peringatan lapangan. Tahap berikutnya adalah memasang barier pencegahan dan mitigasi dengan anggaran terbatas, lalu mengendalikan escalation factor setiap barier, yaitu kondisi yang dapat melumpuhkannya tanpa terlihat, melalui inspeksi, pengujian, dan perawatan. Hasil akhir disajikan sebagai diagram bow-tie.

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
| 1. Kondisi Normal | Memahami proses produksi | Klik tiap peralatan di P&ID, tekan tombol Jalankan (misalnya Jalankan Proses Produksi, Jalankan Operasi Gedung, atau Jalankan Operasi AMP sesuai fasilitas), ubah set point, amati isi bejana dan tren, lalu kuis lima soal dengan urutan pilihan diacak |
| 2. Abnormalitas | Mengenali deviasi (HAZOP) | Lima kejadian dari salah satu variasi abnormalitas; tekan tombol Jalankan; saat terjadi kegagalan muncul peringatan lapangan bertahap (getaran, kebocoran gas, gas beracun, panas berlebih, tumpahan, asap, busur listrik, awan debu, kebakaran, ledakan); hentikan dan laporkan node, parameter, guideword CCPS, penyebab, konsekuensi; kejadian ke-3 dan ke-5 berawal dari obrolan tim yang memuat kesalahan manusia, sehingga laporan juga meminta jenis kesalahannya |
| 3. Barier Pencegahan | Mencegah kehilangan kontainmen atau kehilangan kendali energi | Pasang perangkat yang sesuai sektor, misalnya PT/LT/TT/FT, PSV, SIF, trip level/suhu/aliran, BMS, interlock draft, relai proteksi, BMS baterai, monitor sabuk elevator, sakelar tekanan tinggi kompresor, atau detektor LPG dengan katup solenoid; pilih escalation factor setiap perangkat beserta kontrolnya dari daftar lengkap, serta escalation factor peralatan kritis seperti korosi bejana, keausan mesin berputar, atau degradasi isolasi |
| 4. Barier Mitigasi | Mencegah eskalasi menjadi bencana | Pasang detektor gas/api/asap, ESD, deluge, sprinkler, hidran, pemadam gas bersih, wet chemical, tanggul, venting dan isolasi ledakan, ventilasi darurat, tirai air, presurisasi tangga, alarm umum; kendalikan escalation factor-nya, misalnya sensor detektor teracuni, nozel tersumbat, katup darurat lengket, atau personel yang tidak terlatih |

Menu awal: New Game, Continue, Configuration, Credit.

### Variasi abnormalitas

Setiap skenario menyimpan kumpulan kejadian berisi lima kegagalan teknis dan tiga kasus faktor manusia, lalu menyusunnya menjadi lima variasi. Setiap variasi berisi lima kejadian dengan kasus faktor manusia selalu berada pada urutan ke-3 dan ke-5, sedangkan urutan ke-1, ke-2, dan ke-4 diisi kegagalan teknis. Kedua kasus faktor manusia dalam satu variasi memicu ancaman bow-tie yang berbeda dan memakai jenis kesalahan yang berbeda. Permainan baru memakai variasi berikutnya secara bergiliran, dimulai dari variasi acak, sehingga mencoba ulang skenario yang sama memberi jenis dan urutan abnormalitas yang berbeda. Nomor variasi tampil di kartu Kejadian pada Tahap 2, dan variasi terakhir per skenario disimpan di `localStorage` dengan kunci `psm_sim_var_v1`.

Kegagalan teknis kelima pada setiap skenario dipilih agar penyebabnya berbeda dari empat kegagalan lainnya dan banyak memakai guideword kualitatif CCPS, misalnya air yang ikut masuk ke minyak trafo atau ke rak baterai (As well as), pembersihan H2S yang hanya berjalan sebagian atau satu fasa listrik yang hilang (Part of), aliran balik minyak dari jalur ekspor atau debu yang keluar dari peralatan saat kipas aspirasi trip (Reverse), dan air umpan yang terbuang melalui tube economizer yang bocor (Other than). Kasus faktor manusia sering menghasilkan deviasi yang sama dengan salah satu kegagalan teknis tetapi dengan penyebab yang berbeda. Satu variasi memuat paling banyak satu pasangan seperti itu sebagai pembanding, sehingga pemain belajar bahwa tren yang sama dapat berasal dari kegagalan peralatan maupun tindakan manusia dan penyebabnya harus dibaca dari bukti lain, misalnya obrolan tim atau peringatan lapangan.

Setiap kejadian dirancang agar alarm DCS muncul lebih dulu daripada peringatan lapangan pertama, dengan selang minimal 4 detik sebelum peringatan kritis, sehingga pemain yang memantau tren selalu memiliki kesempatan mendeteksi lebih awal. Isi obrolan tim juga diselaraskan dengan nilai tren pada saat pesan tampil.

### Guideword HAZOP menurut CCPS

Pilihan guideword pada formulir laporan mengikuti tujuh guideword asli HAZOP beserta maknanya pada CCPS (2008), Guidelines for Hazard Evaluation Procedures edisi ketiga, yang sejalan dengan IEC 61882.

| Guideword | Makna |
|---|---|
| Tidak ada (No) | Negasi tujuan desain, misalnya tidak ada aliran atau nyala |
| Lebih (More) | Kenaikan kuantitatif, misalnya tekanan, suhu, level, aliran, atau arus lebih besar |
| Kurang (Less) | Penurunan kuantitatif |
| Serta (As well as) | Kenaikan kualitatif: tujuan tercapai tetapi disertai sesuatu yang tidak dikehendaki, misalnya kontaminan, fasa tambahan, atau material asing |
| Sebagian (Part of) | Penurunan kualitatif: hanya sebagian tujuan tercapai, misalnya salah satu komponen tidak ada |
| Kebalikan (Reverse) | Kebalikan logis dari tujuan desain, misalnya aliran balik |
| Selain (Other than) | Substitusi menyeluruh, misalnya material salah atau arus melalui jalur yang tidak dirancang |

Makna guideword yang dipilih tampil langsung di bawah isian formulir. Jawaban setiap kejadian ditinjau terhadap makna tersebut. Contohnya, oksigen yang masuk ke biogas dan logam asing yang ikut umpan hammer mill dibaca sebagai As well as, bukan Other than, karena tujuan desainnya tetap tercapai tetapi disertai komponen yang tidak dikehendaki.

### Penilaian Tahap 2

Setiap laporan bernilai 100 poin (node, parameter, guideword, penyebab, konsekuensi masing-masing 20). Pada kasus faktor manusia, bobotnya menjadi node, parameter, guideword, dan konsekuensi masing-masing 15, penyebab 20, serta jenis kesalahan manusia 20. Laporan yang tepat dan dikirim sebelum peringatan kritis mendapat bonus deteksi dini +10. Laporan yang baru dikirim setelah insiden terjadi mendapat penalti -20.

Formulir laporan dapat diperkecil lewat tombol di kanan atas. Selama diperkecil, pemain bisa kembali membaca P&ID, tren, peringatan lapangan, dan pop-up peralatan, lalu melanjutkan isian tanpa kehilangan jawaban. Formulir juga menyediakan tiga petunjuk berurutan, yaitu variabel proses yang paling awal menyimpang, gambaran mekanisme kegagalan, dan lokasi node. Setiap petunjuk mengurangi 5 poin dari laporan tersebut, kecuali pada Mode Mudah yang membebaskan biaya petunjuk.

### Kasus faktor manusia dalam obrolan tim

Setiap permainan memuat dua kasus yang berawal dari tindakan manusia, yaitu kejadian ke-3 dan ke-5, misalnya pekerjaan di luar kewenangan, bypass tanpa izin, perubahan tanpa MOC, atau langkah yang terlupa. Kasus ini disampaikan sebagai obrolan antara tim operasi, tim maintenance, pengawas, kontraktor, atau pihak luar. Selama operasi berjalan, pesan muncul sebagai balon obrolan yang menunjuk peralatan tempat tokoh berada dan tercatat di kartu Obrolan Tim pada panel samping. Tombol Lihat Komik membuka seluruh percakapan sebagai panel komik dan menjeda simulasi selama dibaca.

Bila beberapa pesan tampil pada waktu yang berdekatan, setiap balon diletakkan di sisi peralatan yang masih kosong, berturut-turut atas, kanan, kiri, atau bawah, tanpa menutupi balon lain, spanduk peringatan, tombol zoom, maupun bilah aksi, dan sedapat mungkin tanpa menutupi pembacaan DCS. Di ponsel, balon boleh turun ke area tren di bawah P&ID. Lama tampil setiap balon mengikuti kecepatan baca dalam waktu nyata: 1,5 detik untuk memindahkan pandangan ditambah 150 kata per menit, minimal 4,5 detik dan maksimal 15 detik. Angka 150 kata per menit dipilih di bawah kecepatan efektif membaca siswa SMA sekitar 250 kata per menit (Tarigan, 1985) dan rata-rata membaca senyap orang dewasa 238 kata per menit (Brysbaert, 2019), karena pemain membaca sambil memantau proses. Pesan berikutnya baru tampil bila masih ada tempat, maksimal tiga balon di layar lebar dan dua balon di tablet tegak maupun ponsel, dengan jeda minimal 1,2 detik, sehingga tidak ada balon yang dilepas sebelum sempat dibaca. Selama kasus obrolan berlangsung, simulasi berjalan paling cepat pada kecepatan normal walaupun Configuration diatur ke 2x.

Sebagian pesan muncul sebelum deviasi terlihat di tren, sehingga pemain yang membaca obrolan dengan cermat dapat mengenali pemicunya lebih awal. Pada formulir laporan, pemain memilih jenis kesalahan manusia menurut klasifikasi Reason (1990) dan HSE UK HSG48 (1999), yaitu slip, lapse, mistake, atau violation. Hasil laporan menampilkan pelajaran kasus, kendali yang seharusnya berlaku, dan komik lengkap dengan label kasusnya. Pada bow-tie hasil akhir, faktor manusia ditampilkan sebagai label kuning di bawah ancaman yang dipicunya.

Tokoh yang tampil adalah Raka (operator panel), Dimas (operator lapangan), Tono (helper), Joko (teknisi mekanikal), Wawan (teknisi instrumen dan listrik), Rudi (teknisi gedung), Hendra (supervisor shift), Sari (petugas HSE), Bayu (kontraktor), Agus (sopir truk tangki), Lina (manajer restoran tenant), dan Yanto (petugas security). Jabatan tokoh dapat disesuaikan per skenario. Semua tokoh dan percakapan bersifat fiksi untuk pelatihan.

| Skenario | Pelapor utama | Jenis | Kasus |
|---|---|---|---|
| Separator Produksi Migas | Tim Operasi | Violation | Bypass LCV-102 dibuka tanpa koordinasi lalu ditinggalkan |
|  | Tim Maintenance | Lapse | Katup blok hilir PCV-101 tidak dibuka kembali setelah perbaikan |
|  | Tim Operasi | Slip | Katup hisap P-101 tertutup karena tertukar dengan katup drain |
| Penyimpanan dan Pengisian LPG | Pihak Luar | Violation | Sopir mengisi sendiri dan melepas sensor overfill |
|  | Tim Operasi | Lapse | Truk diberi tanda jalan sebelum loading arm dilepas |
|  | Tim Operasi | Mistake | Target penerimaan dinaikkan ke 95 persen karena salah memahami batas isi |
| Reaktor Batch Eksotermik | Pengawas | Violation | Resep dan set trip diubah tanpa MOC |
|  | Tim Operasi | Slip | Output TCV-201 diturunkan karena faceplate tertukar dengan FIC-201 |
|  | Tim Maintenance | Lapse | Spade blind di jalur vent tidak dilepas setelah pembersihan kondensor |
| Kolom Distilasi Aromatik | Tim Maintenance | Slip | Katup isolasi air pendingin tertukar karena label pudar |
|  | Tim Maintenance | Lapse | LIC-402 ditinggal dalam mode manual setelah stroke test |
|  | Tim Operasi | Mistake | Set point suhu dasar dinaikkan karena salah memahami batas operasi |
| Boiler PLTU Batu Bara | Tim Operasi | Mistake | Pesawat uap dijaga helper tanpa lisensi yang mematikan pompa air umpan |
|  | Tim Maintenance | Lapse | Damper udara sekunder burner tidak dibuka kembali setelah pembersihan nozzle |
|  | Tim Operasi | Violation | Suhu keluar mill dinaikkan melampaui batas SOP demi mengejar beban |
| Trafo Daya Gardu Induk | Tim Maintenance | Lapse | Fuse kipas pendingin dicabut dan lupa dipasang kembali |
|  | Tim Maintenance | Mistake | Setting relai penyulang memakai data CT lama karena gambar belum direvisi |
|  | Tim Maintenance | Slip | Sakelar arah mesin pompa minyak di posisi KURAS saat hendak mengisi konservator |
| PLT Biogas POME | Tim Operasi | Mistake | Injeksi udara scrubber dibuka melampaui batas |
|  | Tim Operasi | Lapse | Pembuangan kondensat manual KO-701 terlupa karena operator dialihkan ke tugas lain |
|  | Pengawas | Violation | Biogas sengaja ditahan di bawah cover tanpa flare karena keluhan warga |
| PLTS dan BESS | Tim Maintenance | Violation | Proteksi tegangan sel BMS dimatikan dengan password vendor |
|  | Kontraktor | Mistake | Konektor PV beda merek dipasangkan karena dikira kompatibel |
|  | Tim Maintenance | Lapse | Baut busbar modul pengganti belum dikencangkan dengan kunci torsi |
| Lini Produksi Pakan Ternak | Pengawas | Violation | Sensor kecepatan sabuk elevator dijumper demi target produksi |
|  | Tim Operasi | Slip | Set point laju umpan terketik 42 t/j, bukan 24 t/j |
|  | Pengawas | Mistake | Jagung basah diterima ke silo karena dikira dapat dikeringkan kipas aerasi |
| Refrigerasi Amonia Cold Storage | Tim Maintenance | Mistake | Teknisi baru membuka katup gas panas secara manual saat defrost |
|  | Tim Operasi | Slip | Breaker pompa air kondensor yang sedang beroperasi dimatikan alih-alih pompa cadangan |
|  | Pengawas | Violation | Setting trip suhu discharge kompresor dinaikkan tanpa MOC demi beban pendinginan |
| Proteksi Kebakaran Gedung Komersial | Kontraktor | Violation | Pengelasan tenant tanpa izin kerja panas dan zona detektor dimatikan |
|  | Pihak Luar | Mistake | Selang air dipakai sebagai pengganti selang LPG karena dikira sama saja |
|  | Tim Maintenance | Lapse | Pompa transfer solar yang dijalankan manual lupa dimatikan karena teknisi dialihkan ke lift macet |
| Asphalt Mixing Plant | Tim Operasi | Violation | Kunci override BMS dipakai helper untuk melewati purge |
|  | Tim Operasi | Mistake | Konveyor umpan dihentikan karena dikira burner otomatis turun mengikuti umpan |
|  | Tim Operasi | Lapse | Pompa oli termal lupa dinyalakan kembali setelah listrik padam sesaat |

### Pemasangan barier lewat pop-up

Pada Tahap 3 dan 4, titik pemasangan (+) pada P&ID dapat diklik langsung tanpa memilih alat terlebih dahulu. Pop-up pemilih menampilkan perangkat yang sesuai untuk tahap tersebut, dikelompokkan menurut fungsinya, lengkap dengan biaya dan sisa anggaran. Setelah perangkat dipasang, pop-up perangkat menawarkan daftar escalation factor beserta kontrolnya yang dapat langsung diterapkan, serta tombol untuk mengganti atau melepas perangkat. Pop-up peralatan pada Tahap 3 menawarkan escalation factor peralatan. Kotak Alat di panel kanan tetap tersedia sebagai cara alternatif.

### Anggaran dalam Rupiah atau USD

Biaya perangkat dan kontrol escalation factor disimpan dalam satuan anggaran agar penilaian tidak bergantung pada kurs. Untuk tampilan, satu satuan dianggap setara USD 25.000, mencakup pengadaan, pemasangan, dan rekayasa. Untuk kontrol escalation factor berupa inspeksi, pengujian, dan perawatan, satu satuan mewakili biaya pelaksanaan selama satu siklus 5 tahun. Mata uang tampilan (Rupiah atau USD) dan kurs Rupiah per USD (bawaan Rp 16.000) dapat diubah di Configuration. Nilai ini bersifat indikatif untuk pelatihan dan bukan acuan pengadaan.

### Escalation factor dan keandalan barier

Istilah escalation factor mengikuti CCPS dan Energy Institute (2018), Bow Ties in Risk Management: kondisi yang melemahkan atau menggagalkan barier, misalnya transmitter yang menyimpang, katup pengaman yang lengket, sensor detektor yang teracuni, atau tanggul yang retak. Kontrolnya berupa inspeksi, pengujian, dan perawatan preventif yang menemukan kegagalan tersembunyi sebelum barier dibutuhkan.

Katalog berisi 43 escalation factor beserta kontrolnya: 15 untuk perangkat pencegahan, 10 untuk integritas peralatan proses, dan 18 untuk perangkat mitigasi. Sebelumnya hanya tersedia 15 program inspeksi dan pengujian yang disaring menurut skenario. Setiap perangkat memiliki satu escalation factor utama. Semua escalation factor pada tahap yang sama tampil di setiap skenario, termasuk yang berasal dari jenis fasilitas lain, sehingga pemain harus mencocokkan sendiri teknologi perangkat dengan cara kegagalannya. Pilihan yang keliru tetap dapat diterapkan dan memakai anggaran. Kecocokan hanya ditandai pada Mode Mudah.

Setiap perangkat memiliki PFD desain indikatif mengikuti rentang tipikal CCPS (2001). Barier yang escalation factor-nya tidak dikendalikan dianggap menyimpan kegagalan tersembunyi sehingga PFD-nya dinaikkan 10 kali. Sebelum evaluasi, panel Keandalan Sistem Proteksi menampilkan keandalan yang diklaim, yaitu dengan anggapan setiap kontrol yang dipasang sudah tepat. Saat evaluasi klaim tersebut diverifikasi, dan kontrol yang tidak sesuai dengan escalation factor perangkat tidak dikreditkan, sejalan dengan kriteria IPL pada LOPA yang mensyaratkan barier dapat diaudit. Modal evaluasi menampilkan keandalan yang diklaim dan yang terverifikasi berdampingan.

Pada peralatan proses, semua peralatan di dalam batas unit dapat diberi kontrol escalation factor. Hanya peralatan kritis yang ditetapkan skenario yang dinilai; kontrol yang sesuai jenisnya pada peralatan lain dicatat sebagai tambahan tanpa nilai, sedangkan kontrol yang tidak sesuai jenis peralatan dihitung keliru.

Bobot nilai Tahap 3 terdiri dari ketepatan barier 55 %, escalation factor barier terkendali 25 %, dan escalation factor peralatan kritis 20 %. Bobot nilai Tahap 4 terdiri dari ketepatan barier 65 % dan escalation factor barier terkendali 35 %. Setiap pemasangan barier yang keliru atau tidak perlu dikurangi 8 poin, dan setiap kontrol escalation factor yang keliru dikurangi 4 poin.

### Jeda iklan sebelum misi berikutnya

Setelah satu misi selesai, misi berikutnya didahului jeda singkat berisi pesan Nusa Safety, baik saat pemain menekan Ulangi Skenario maupun saat memilih skenario lain. Kartu jeda memuat label Jeda sebelum misi berikutnya, logo Nusa Safety, judul ajakan, isi pesan, kontak (admin@nusasafety.co.id, www.nusasafety.co.id, dan Instagram @nusasafety), serta tiga tombol: Lanjut yang aktif setelah hitung mundur 5 detik, Profil Nusa Safety yang membuka situs resmi di tab baru, dan Pilih misi untuk kembali ke daftar skenario. Ringkasan misi sebelumnya beserta skornya tampil di bagian bawah kartu.

Pesan dirotasi setiap kali jeda tampil, yaitu pengembangan simulator, modul pelatihan interaktif, dan video pelatihan yang disesuaikan dengan fasilitas; pelatihan bersertifikat BNSP sesuai SKKNI; kajian rekayasa, inspeksi peralatan, dan audit keselamatan; serta pendampingan SMK3 dan ISO. Isi pesan tersimpan pada objek `PROMO` dan kontak pada `COMPANY` di `js/data.js`. Jeda tampil satu kali untuk setiap misi yang selesai, dicatat di `localStorage` dengan kunci `psm_sim_promo_v1`, dan tidak tampil saat melanjutkan permainan yang belum selesai.

## Tampilan

Bilah atas permainan memakai logo PSM Simulator by Nusa Safety berlatar transparan yang ditempel langsung di atas bilah gelap, tanpa pelat putih dan tanpa teks tambahan. Nama skenario tampil di kepala panel samping. Palet mengikuti logo: silver, hitam, dan biru muda. Warna kuning dan merah hanya dipakai untuk kondisi abnormal, sejalan dengan filosofi HMI berperforma tinggi (ANSI/ISA-101). Peralatan digambar sebagai baja silver bergradien dengan bayangan, dan isi cairan di bejana serta tangki berubah sesuai simulasi. Efek kilatan dan guncangan saat ledakan dapat dimatikan di Configuration, dan otomatis dinonaktifkan bila sistem operasi meminta pengurangan gerak. Latar layar menu, pilihan skenario, konfigurasi, Credit, dan hasil memakai foto kilang yang diolah menjadi monokrom silver dan ditampilkan redup.

Ikon tombol menu digambar sebagai SVG bervolume dengan gradien, bevel, dan kilap, sehingga tetap tajam di layar beresolusi tinggi. Halaman menu memiliki animasi ringan berupa partikel cahaya, sinar latar yang berputar pelan, kilau yang melintas di logo, dan tombol yang muncul berurutan. Semua animasi ini ikut mati bila efek animasi dinonaktifkan atau sistem operasi meminta pengurangan gerak.

Grafik tren memakai latar abu-abu terang dengan teks hitam dan biru tua, sesuai prinsip HMI berperforma tinggi. Setiap kartu tren menampilkan rentang 60 menit operasi, garis nilai normal, pita batas alarm L, LL, H, dan HH, serta indikator arah perubahan, misalnya naik 0,8 bar/mnt atau stabil. Arah perubahan dihitung dengan regresi linear atas 6 menit terakhir. Skala sumbu tegak menyesuaikan nilai yang tampil dengan rentang minimum tertentu, sehingga eskalasi kecil tetap terlihat tanpa membesar-besarkan derau. Simulasi menambahkan fluktuasi proses yang wajar dengan simpangan baku paling besar sepersepuluh jarak ke batas alarm terdekat, sehingga kondisi normal tidak memicu alarm palsu.

Kuis pemahaman berisi lima soal per skenario. Urutan pilihan diacak setiap kali soal tampil, dan pengecoh disusun dari miskonsepsi yang lazim ditemui di lapangan dengan panjang kalimat yang seimbang, sehingga jawaban tidak dapat ditebak dari posisi atau panjangnya.

Informasi peralatan dan perangkat tampil sebagai pop-up di dekat titik yang diklik pada P&ID. Pop-up memuat deskripsi, nilai proses terkini yang diperbarui langsung, serta status PFD dan escalation factor pada tahap barier. Pop-up ditutup dengan tombol silang di kanan atas, tombol Escape, klik area kosong, atau otomatis berganti saat peralatan lain diklik.

## Ponsel dan tablet

Tata letak menyesuaikan ukuran dan orientasi layar.

| Kondisi layar | Tata letak |
|---|---|
| Lebar mulai 1000 px dan tinggi mulai 600 px, misalnya desktop dan tablet mendatar | P&ID dan tren di kiri, panel tahap di kanan |
| Ponsel, tablet tegak, dan layar yang pendek | Bertumpuk: P&ID dengan proporsi tetap 1000 x 560, tren, lalu panel tahap |
| Ponsel tegak | Bertumpuk, ditambah bilah atas dua baris dengan stepper ikon, pop-up sebagai lembar bawah, dan filter sektor berupa strip geser |
| Ponsel mendatar | Bertumpuk dengan bilah atas satu baris, menu dua kolom, dan modal yang lebih rapat |

P&ID dapat diperbesar sampai 4 kali dengan cubit dua jari atau tombol + di pojok kanan bawah. Saat diperbesar, P&ID digeser dengan satu jari, dan tombol tampilkan seluruh P&ID mengembalikan tampilan semula. Di desktop, Ctrl ditambah roda tetikus atau cubit pada trackpad juga memperbesar P&ID. Pop-up peralatan, balon obrolan, dan efek insiden ikut menyesuaikan posisi.

Pada tata letak bertumpuk, Tahap 2 menampilkan bilah aksi yang melayang di bagian bawah layar. Isinya status proses, jam operasi, lampu alarm, tombol Jalankan atau Laporkan, dan tombol komik obrolan, sehingga pemain dapat melapor tanpa menggulir halaman. Spanduk peringatan lapangan juga menempel di bagian atas layar.

Di layar sentuh, petunjuk memakai kata ketuk, bukan klik. Pemilih perangkat dan daftar escalation factor memakai dua ketukan: ketukan pertama menampilkan keterangan, ketukan kedua memasang atau menerapkannya. Target sentuh dibuat sekitar 44 px, dan isian formulir memakai huruf 16 px agar Safari iOS tidak memperbesar halaman saat mengisi. Efek hover hanya berlaku pada perangkat yang memiliki kursor, sehingga tidak tertinggal setelah diketuk.

Permainan dapat dipasang ke layar utama melalui Tambahkan ke Layar Utama di Safari atau Instal aplikasi di Chrome. Dengan cara ini permainan berjalan layar penuh tanpa bilah alamat peramban.

Tata letak dan fungsi diperiksa dengan emulasi Chromium pada 19 ukuran layar, dari ponsel 360 x 740 sampai tablet 1366 x 1024, dalam posisi tegak dan mendatar, termasuk gestur cubit dan geser. Perilaku khusus Safari iOS, seperti kebijakan audio, sebaiknya tetap dicoba langsung pada iPhone atau iPad.

## Audio

Musik latar memakai lagu Measured Flow yang diputar berulang. Musik baru berbunyi setelah interaksi pertama pengguna, sesuai kebijakan autoplay peramban, lalu naik perlahan selama sekitar 2,5 detik. Rekaman aslinya memakai efek auto-pan, yaitu sebagian instrumen berpindah dari kanal kiri ke kanan dengan periode sekitar 1,1 detik. Efek ini melelahkan bila didengar lewat earphone, sehingga berkas diubah menjadi mono dengan merata-ratakan kedua kanal, pada 128 kbps dan kekerasan sekitar -14 LUFS. Volume default diatur 45 persen pada kurva kuadratik, setara amplitudo 0,2 atau sekitar 14 dB lebih pelan dari berkas tersebut. Saat insiden terjadi di Tahap 2, musik diredam sementara agar alarm dan peringatan tetap terdengar jelas. Musik juga dijeda saat tab peramban tidak aktif. Musik dapat dimatikan lewat tombol pengeras suara di menu dan bilah atas, atau diatur volumenya di Configuration.

Audio dibuka pada interaksi pertama yang diakui peramban, yaitu ketukan atau klik, dan pembuka kunci tetap aktif sampai efek suara dan musik benar-benar siap. Di iOS, properti volume elemen audio tidak dapat diubah lewat skrip, sehingga musik dialirkan melalui GainNode WebAudio agar pengaturan volume dan peredaman saat insiden tetap berlaku.

## Credit dan profil perusahaan

Layar Credit hanya menampilkan identitas perusahaan, yaitu PT. Nusa Rendra Jayatama dengan merek Nusa Safety, tanpa nama perorangan. Isinya meliputi profil dan layanan yang dihimpun dari situs resmi nusasafety.co.id, kontak email dan Instagram, kerangka konsep permainan, dan daftar referensi. Data profil tersimpan pada objek `COMPANY` dan daftar referensi pada `CREDITS.referensi` di `js/data.js` sehingga mudah diperbarui.

## Sektor dan skenario

Layar New Game mengelompokkan skenario per sektor dan menyediakan filter sektor. Setiap skenario memiliki kumpulan delapan kejadian, yaitu lima kegagalan teknis dan tiga kasus faktor manusia, yang disusun menjadi lima variasi abnormalitas, lima soal kuis, titik pemasangan barier pencegahan dan mitigasi, serta peralatan kritis yang escalation factor-nya harus dikendalikan.

| Sektor | Skenario | Tingkat | Ancaman utama yang dilatihkan |
|---|---|---|---|
| Minyak dan gas bumi | Unit Separator Produksi Migas | Pemula | Outlet gas terblokir, carry-over ke kompresor, gas blow-by ke sistem air, luapan tangki minyak termasuk aliran balik dari jalur ekspor |
| Minyak dan gas bumi | Penyimpanan dan Pengisian LPG | Lanjutan | Overfill truk tangki dan tangki bullet, paparan panas eksternal (BLEVE), kebakaran seal pompa akibat kavitasi, putusnya loading arm |
| Petrokimia | Reaktor Batch Eksotermik | Menengah | Kehilangan air pendingin, umpan berlebih atau akumulasi monomer saat agitator gagal, vent terblokir, overfill reaktor (reaksi runaway) |
| Petrokimia | Kolom Distilasi Aromatik | Menengah | Kehilangan pendingin kondensor, uap reboiler berlebih atau tube reboiler bocor, luapan drum refluks, kavitasi pompa dasar kolom |
| Ketenagalistrikan | Boiler PLTU Batu Bara | Lanjutan | Air umpan hilang termasuk kebocoran tube economizer, nyala padam dengan bahan bakar tetap masuk, coal mill kepanasan, turbin trip |
| Ketenagalistrikan | Trafo Daya Gardu Induk 150/20 kV | Menengah | Kipas pendingin gagal, gangguan isolasi internal termasuk air yang masuk ke minyak, hubung singkat penyulang, kehilangan minyak trafo |
| Energi baru terbarukan | PLT Biogas Limbah Cair Sawit (POME) | Menengah | Blower trip, udara masuk ke biogas, flare padam atau H2S lolos dari bio-scrubber, kondensat terbawa ke blower (metana dan H2S) |
| Energi baru terbarukan | PLTS dengan Penyimpanan Baterai (BESS) | Lanjutan | HVAC gagal atau air kondensat menetes ke rak, overcharge, gangguan isolasi kabel DC, hubung singkat sel atau sambungan rak panas (thermal runaway) |
| Manufaktur | Lini Produksi Pakan Ternak | Menengah | Sabuk elevator selip, logam asing di hammer mill, pemanasan spontan silo, mill tercekik atau kipas aspirasi trip (ledakan debu) |
| Manufaktur | Refrigerasi Amonia Cold Storage | Lanjutan | Kondensor gagal atau udara terperangkap di kondensor, cairan terhisap kompresor, hentakan hidraulik saat defrost, pendinginan oli gagal |
| Properti dan konstruksi EPC | Proteksi Kebakaran Gedung Komersial | Pemula | Kebocoran LPG dapur, luapan solar tangki harian genset, busbar LVMDP kepanasan karena sambungan kendur atau satu fasa hilang, kebakaran ducting dapur |
| Properti dan konstruksi EPC | Asphalt Mixing Plant Proyek Jalan | Menengah | Burner padam lalu dinyalakan ulang tanpa purging, draft drum hilang karena ID fan mati atau baghouse tersumbat, kebakaran baghouse, pompa oli termal trip |

### Kit perangkat per skenario

Kotak Alat dan pop-up pemilih hanya menampilkan perangkat yang relevan dengan jenis fasilitas, termasuk beberapa pengecoh yang masuk akal. Pengelompokan ini disebut kit dan ditetapkan lewat properti `kit` pada perangkat serta `kits` pada skenario. Kit yang tersedia adalah `proses` (migas dan petrokimia), `boiler`, `trafo`, `biogas`, `bess`, `debu`, `amonia`, `gedung`, dan `amp`. Perangkat umum seperti transmitter suhu dan alarm umum tampil di semua kit.

Pada skenario fasilitas non-produksi, label tombol menyesuaikan jenis operasinya, misalnya Jalankan Operasi Pembangkit, Jalankan Operasi Gardu Induk, Jalankan Operasi Refrigerasi, Jalankan Operasi Gedung, dan Jalankan Operasi AMP.

## Struktur berkas

```
index.html                  halaman utama
manifest.webmanifest        data aplikasi web untuk pemasangan ke layar utama
css/style.css               gaya tampilan (tombol 3D, kartu, P&ID, efek insiden, modal)
js/data.js                  katalog perangkat dan kit, escalation factor dan kontrolnya, guideword CCPS, model biaya, sektor, peringatan lapangan, tim, tokoh, jenis kesalahan manusia, pesan jeda iklan, credit
js/scenarios/*.js           satu berkas per skenario, dinamai <sektor>-<unit>.js (12 berkas)
js/pid.js                   penggambar P&ID SVG (37 jenis simbol), isi cairan, efek insiden, lencana escalation factor, perbesar dan geser
js/sim.js                   mesin simulasi proses, fluktuasi proses, jam operasi, produksi, grafik tren eskalasi
js/game.js                  alur permainan, variasi kejadian, pop-up, penilaian, obrolan tim, penempatan balon dan komik, avatar tokoh, jeda iklan, simpan/lanjutkan, bow-tie
js/audio.js                 efek suara WebAudio dan pemutar musik latar
tools/check-scenarios.js    validasi data skenario dengan Node.js tanpa peramban
tools/sim-events.js         uji waktu alarm DCS dan peringatan setiap kejadian dengan mesin simulasi
assets/psm-logo.png         logo PSM Simulator by Nusa Safety untuk menu dan Credit
assets/psm-logo-dark.png    logo berlatar transparan untuk bilah atas permainan
assets/psm-emblem.png       emblem sumber ikon layar utama
assets/favicon.png          ikon tab peramban
assets/icon-180.png, icon-192.png, icon-512.png  ikon layar utama
assets/nusa-safety-logo.png logo Nusa Safety untuk layar Credit dan jeda iklan
assets/menu-bg.jpg          foto latar menu (monokrom silver)
assets/audio/measured-flow.mp3  musik latar
```

## Menambah skenario

1. Buat berkas baru di `js/scenarios/`, misalnya `manufaktur-boiler-pabrik.js`, berisi satu objek skenario yang diakhiri `SCENARIOS.push(...)`. Berkas yang sudah ada dapat dijadikan contoh.
2. Daftarkan berkas tersebut di `index.html` sesudah `js/data.js` dan sebelum `js/audio.js`. Urutan baris menentukan urutan tampil di layar New Game.
3. Isi struktur yang sama dengan skenario lain: `sector` (kunci dari `SECTORS`), `area`, `kits`, opsional `op` untuk label tombol Jalankan, `equipment` (opsional `level` untuk isi cairan, `levelFill: 'bulk'` untuk material curah, `flameVar` agar nyala padam mengikuti variabel), `pipes`, `zones` (opsional `style: 'building'` dengan `floors` untuk potongan gedung), opsional `ground` untuk garis permukaan tanah, `vars`, `controls`, `production`, `quiz` (jawaban benar pada indeks yang ditunjuk `ans`, urutan tampil diacak otomatis), `events` (lima kegagalan teknis, masing-masing dengan `threat` berupa indeks ancaman bow-tie, `warnings` bertahap yang diakhiri satu peringatan `final`, serta opsional `hintVar`), `variants` (lima larik berisi lima id kejadian, kasus faktor manusia pada urutan ke-3 dan ke-5), `hotspots`, `inspect`, `budget`, dan `bowtie`. Koordinat memakai viewBox 1000 x 560. Jawaban guideword memakai kunci `none`, `high`, `low`, `aswell`, `partof`, `reverse`, dan `other` sesuai makna CCPS.
4. Untuk kasus faktor manusia, tambahkan tiga kejadian dengan `start` (detik saat deviasi mulai), `hf`, dan `chat`; ketiganya memakai jenis kesalahan dan ancaman bow-tie yang berbeda. Objek `hf` berisi `type` (kunci dari `HF_TYPES`), `team` (kunci dari `TEAMS`), `threat` (indeks ancaman bow-tie yang dipicu), `title`, `factor` (teks singkat untuk label bow-tie), `lesson`, `controls`, serta opsional `roles` untuk mengganti jabatan tokoh. Setiap pesan `chat` berisi `t` (detik sejak operasi dijalankan), `who` (kunci dari `CAST`), opsional `at` (peralatan tempat balon muncul) dan `mood` (`normal`, `santai`, `ragu`, `panik`, atau `marah`), serta `text` maksimal 150 karakter. Jarak antarpesan minimal 3 detik dan pesan terakhir muncul sebelum insiden.
5. Jalankan validasi berikut sebelum commit. `tools/sim-events.js` memastikan alarm DCS setiap kejadian muncul sebelum peringatan lapangan pertama dengan margin deteksi dini minimal 4 detik. Alat ini memeriksa rujukan variabel dan peralatan, kesesuaian perangkat dengan tahap dan kit, urutan peringatan, jarak antartitik pemasangan, kecukupan anggaran terhadap biaya ideal, keseimbangan panjang jawaban kuis, kelengkapan kasus faktor manusia beserta urutan dan panjang pesan obrolan, serta larangan dash panjang dan tanda bintang ganda pada teks.

```bash
node tools/check-scenarios.js        # ringkasan per skenario
node tools/check-scenarios.js -v     # ditambah jadwal peringatan tiap kejadian
node tools/sim-events.js separator   # waktu alarm DCS dan margin deteksi dini tiap kejadian
```

Anggaran normal sebaiknya sekitar 3 satuan di atas biaya ideal, sehingga Mode Sulit (anggaran dikurangi 2) tetap dapat diselesaikan atau sedikit memaksa kompromi.

## Referensi

Daftar referensi lengkap tercantum pada layar Credit. Referensi lokal didahulukan, kemudian standar internasional untuk hal yang belum diatur secara rinci di dalam negeri.

- Umum dan migas: PP No. 50 Tahun 2012, Permenaker No. 37 Tahun 2016, Kepmenaker No. 187/MEN/1999, Permen ESDM No. 18 Tahun 2018, OSHA 29 CFR 1910.119, CCPS (2001, 2007), CCPS (2008) Guidelines for Hazard Evaluation Procedures untuk guideword HAZOP, CCPS/EI (2018) Bow Ties in Risk Management untuk escalation factor, IEC 61511, IEC 61882, ANSI/ISA-18.2, ANSI/ISA-101, API 510, API 570, API 653, API RP 576, API Std 2510, NFPA 25, dan NFPA 58.
- Kecepatan baca untuk durasi balon obrolan: Tarigan (1985) dan Brysbaert (2019).
- Ketenagalistrikan dan EBT: Permen ESDM No. 10 Tahun 2021, Permenaker No. 12 Tahun 2015, Undang-Undang Uap dan Peraturan Uap Tahun 1930, IEC 60076-7, IEEE C57.104, NFPA 85, NFPA 850, NFPA 855, IEC 62852 untuk konektor DC PLTS, laporan DNV GL (2020) tentang insiden BESS McMicken, serta hasil investigasi kebakaran ESS oleh Kementerian Perdagangan, Industri, dan Energi Republik Korea (2019).
- Manufaktur: Permenaker No. 5 Tahun 2018 (NAB amonia 25 ppm), NFPA 652, NFPA 654, NFPA 61, NFPA 68, NFPA 69, IIAR 2, ASHRAE 15, serta laporan CSB tentang Imperial Sugar (2009) dan Millard Refrigerated Services (2015).
- Faktor manusia: Permenaker No. 4 Tahun 2025 tentang Operator Pesawat Uap, UU No. 30 Tahun 2009 tentang Ketenagalistrikan (Pasal 44 ayat 6 tentang sertifikat kompetensi tenaga teknik), PP No. 50 Tahun 2012 Lampiran II tentang sistem izin kerja, Reason (1990), HSE UK HSG48 (1999), Vaughan (1996) tentang normalisasi penyimpangan, CCPS (2008) tentang Management of Change, dan NFPA 51B.
- Properti dan konstruksi: Permen PU No. 26/PRT/M/2008, SNI 03-1745-2000, SNI 03-3985-2000, SNI 03-3989-2000, Permenakertrans No. Per.04/MEN/1980, Permenaker No. Per.02/MEN/1983, Kepmenaker No. Kep.186/MEN/1999, Permen PUPR No. 10 Tahun 2021, NFPA 13, NFPA 96, NFPA 17A, NFPA 2001, dan NFPA 86.

Skenario, nilai parameter, nilai PFD, dan tata letak P&ID disederhanakan untuk tujuan pelatihan dan bukan rancangan rekayasa yang dapat dipakai langsung di lapangan.
