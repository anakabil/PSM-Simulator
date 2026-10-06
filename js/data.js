/* =====================================================================
   PSM Simulator - Data permainan
   Katalog barier beserta kit per jenis fasilitas, program inspeksi dan
   pengujian (ITPM), model biaya, sektor industri, jenis peringatan
   lapangan, dan credit. Skenario berada di js/scenarios/*.js dan
   ditambahkan ke SCENARIOS setelah berkas ini dimuat.
   ===================================================================== */

const APP_INFO = {
  name: 'PSM Simulator',
  version: '1.3.0',
  tagline: 'Simulasi Keselamatan Proses: Pahami, Kenali, Lindungi',
};

const BRAND = {
  logo: 'assets/psm-logo.png',
  emblem: 'assets/psm-emblem.png',
  company: 'assets/nusa-safety-logo.png',
  menuBg: 'assets/menu-bg.jpg',
  music: 'assets/audio/measured-flow.mp3',
};

const CREDITS = {
  organisasi: 'Nusa Safety | PT. Nusa Rendra Jayatama',
  tahun: '2026',
  musik: 'Measured Flow',
  referensi: [
    'Undang-Undang No. 1 Tahun 1970 tentang Keselamatan Kerja.',
    'Peraturan Pemerintah No. 50 Tahun 2012 tentang Penerapan Sistem Manajemen Keselamatan dan Kesehatan Kerja (SMK3).',
    'Keputusan Menteri Tenaga Kerja No. KEP.187/MEN/1999 tentang Pengendalian Bahan Kimia Berbahaya di Tempat Kerja.',
    'Peraturan Menteri Ketenagakerjaan No. 37 Tahun 2016 tentang Keselamatan dan Kesehatan Kerja Bejana Tekanan dan Tangki Timbun.',
    'Peraturan Menteri ESDM No. 18 Tahun 2018 tentang Pemeriksaan Keselamatan Instalasi dan Peralatan pada Kegiatan Usaha Minyak dan Gas Bumi.',
    'Peraturan Menteri ESDM No. 10 Tahun 2021 tentang Keselamatan Ketenagalistrikan.',
    'Undang-Undang Uap Tahun 1930 (Stoom Ordonnantie) dan Peraturan Uap Tahun 1930 (Stoom Verordening).',
    'Peraturan Menteri Ketenagakerjaan No. 12 Tahun 2015 tentang Keselamatan dan Kesehatan Kerja Listrik di Tempat Kerja.',
    'Peraturan Menteri Ketenagakerjaan No. 5 Tahun 2018 tentang Keselamatan dan Kesehatan Kerja Lingkungan Kerja.',
    'Peraturan Menteri Tenaga Kerja dan Transmigrasi No. Per.04/MEN/1980 tentang Syarat-syarat Pemasangan dan Pemeliharaan Alat Pemadam Api Ringan.',
    'Peraturan Menteri Tenaga Kerja No. Per.02/MEN/1983 tentang Instalasi Alarm Kebakaran Automatik.',
    'Keputusan Menteri Tenaga Kerja No. KEP.186/MEN/1999 tentang Unit Penanggulangan Kebakaran di Tempat Kerja.',
    'Peraturan Menteri Pekerjaan Umum No. 26/PRT/M/2008 tentang Persyaratan Teknis Sistem Proteksi Kebakaran pada Bangunan Gedung dan Lingkungan.',
    'Peraturan Menteri PUPR No. 10 Tahun 2021 tentang Pedoman Sistem Manajemen Keselamatan Konstruksi.',
    'Badan Standardisasi Nasional (2000). SNI 03-1745-2000 Tata cara perencanaan dan pemasangan sistem pipa tegak dan slang untuk pencegahan bahaya kebakaran pada bangunan rumah dan gedung.',
    'Badan Standardisasi Nasional (2000). SNI 03-3985-2000 Tata cara perencanaan, pemasangan dan pengujian sistem deteksi dan alarm kebakaran untuk pencegahan bahaya kebakaran pada bangunan gedung.',
    'Badan Standardisasi Nasional (2000). SNI 03-3989-2000 Tata cara perencanaan dan pemasangan sistem sprinkler otomatik untuk pencegahan bahaya kebakaran pada bangunan gedung.',
    'Dinas Penanggulangan Kebakaran dan Penyelamatan Provinsi DKI Jakarta. Data kejadian kebakaran menurut penyebab, dengan korsleting listrik sebagai penyebab terbanyak.',
    'OSHA 29 CFR 1910.119, Process Safety Management of Highly Hazardous Chemicals.',
    'CCPS (2001). Layer of Protection Analysis: Simplified Process Risk Assessment. AIChE.',
    'CCPS (2007). Guidelines for Risk Based Process Safety. AIChE/Wiley.',
    'CCPS & Energy Institute (2018). Bow Ties in Risk Management. AIChE/Wiley.',
    'IEC 61511-1 (2016). Functional safety: Safety instrumented systems for the process industry sector.',
    'IEC 61882 (2016). Hazard and operability studies (HAZOP studies), Application guide.',
    'IEC 60079-29-2 (2015). Gas detectors: Selection, installation, use and maintenance of detectors for flammable gases and oxygen.',
    'ANSI/ISA-18.2 (2016). Management of Alarm Systems for the Process Industries.',
    'ANSI/ISA-101.01 (2015). Human Machine Interfaces for Process Automation Systems.',
    'ISA-5.1 (2009). Instrumentation Symbols and Identification.',
    'ISO 20816-1 (2016). Mechanical vibration: Measurement and evaluation of machine vibration.',
    'API RP 14C, Analysis, Design, Installation, and Testing of Safety Systems for Offshore Production Facilities.',
    'API 510, Pressure Vessel Inspection Code; API 653, Tank Inspection, Repair, Alteration, and Reconstruction; API RP 576, Inspection of Pressure-relieving Devices.',
    'API RP 2350, Overfill Protection for Storage Tanks in Petroleum Facilities.',
    'NFPA 25, Standard for the Inspection, Testing, and Maintenance of Water-Based Fire Protection Systems; NFPA 58, Liquefied Petroleum Gas Code.',
    'API Std 2510, Design and Construction of LPG Installations; API Std 650, Welded Tanks for Oil Storage.',
    'IEC 60076-7 (2018). Power transformers, Part 7: Loading guide for mineral-oil-immersed power transformers.',
    'IEEE C57.104 (2019). IEEE Guide for the Interpretation of Gases Generated in Mineral Oil-Immersed Transformers.',
    'NFPA 85, Boiler and Combustion Systems Hazards Code; NFPA 86, Standard for Ovens and Furnaces.',
    'NFPA 850, Recommended Practice for Fire Protection for Electric Generating Plants and High Voltage Direct Current Converter Stations; NFPA 855, Standard for the Installation of Stationary Energy Storage Systems; NFPA 70B, Standard for Electrical Equipment Maintenance.',
    'NFPA 652, Standard on the Fundamentals of Combustible Dust; NFPA 61, Standard for the Prevention of Fires and Dust Explosions in Agricultural and Food Processing Facilities; NFPA 68, Standard on Explosion Protection by Deflagration Venting; NFPA 69, Standard on Explosion Prevention Systems.',
    'NFPA 13, Standard for the Installation of Sprinkler Systems; NFPA 15, Standard for Water Spray Fixed Systems for Fire Protection; NFPA 2001, Standard on Clean Agent Fire Extinguishing Systems; NFPA 96, Standard for Ventilation Control and Fire Protection of Commercial Cooking Operations; NFPA 17A, Standard for Wet Chemical Extinguishing Systems.',
    'IIAR 2, Standard for Safe Design of Closed-Circuit Ammonia Refrigeration Systems; ASHRAE 15, Safety Standard for Refrigeration Systems.',
    'NIOSH. Pocket Guide to Chemical Hazards: Ammonia (nilai IDLH 300 ppm).',
    'U.S. Chemical Safety Board (2009). Investigation Report: Sugar Dust Explosion and Fire, Imperial Sugar Company, Port Wentworth, Georgia.',
    'U.S. Chemical Safety Board (2015). Key Lessons for Preventing Hydraulic Shock in Industrial Refrigeration Systems: Anhydrous Ammonia Release at Millard Refrigerated Services, Theodore, Alabama.',
    'DNV GL (2020). McMicken Battery Energy Storage System Event Technical Analysis and Recommendations. Arizona Public Service.',
  ],
};

/* ---------------------------------------------------------------------
   Profil perusahaan. Sumber: halaman resmi nusasafety.co.id (beranda,
   About, serta Training dan Sertifikasi BNSP), dihimpun 6 Oktober 2026.
   --------------------------------------------------------------------- */
const COMPANY = {
  legalName: 'PT. Nusa Rendra Jayatama',
  brand: 'Nusa Safety',
  website: 'https://nusasafety.co.id',
  websiteLabel: 'nusasafety.co.id',
  taglines: ['A Resilient Company', 'Partner in Safety & Sustainability'],
  profile: [
    'PT. Nusa Rendra Jayatama, dengan merek Nusa Safety, adalah perusahaan konsultan dan pelatihan di bidang Keselamatan, Kesehatan Kerja, dan Lingkungan (HSE). Perusahaan menyediakan solusi menyeluruh yang memadukan kepatuhan teknis dengan implementasi praktis.',
    'Tim Nusa Safety terdiri atas tenaga ahli berpengalaman dari sektor konstruksi, minyak dan gas, serta manufaktur.',
  ],
  services: [
    { icon: 'shield', name: 'Sistem SMK3 dan ISO', desc: 'Konsultasi sistem manajemen SMK3 dan standar ISO.' },
    { icon: 'gauge', name: 'Kajian Rekayasa', desc: 'Kajian teknis (engineering studies).' },
    { icon: 'book', name: 'Pelatihan Bersertifikat', desc: 'Pelatihan intensif untuk meningkatkan kompetensi, dengan sertifikasi BNSP sesuai SKKNI.' },
    { icon: 'wrench', name: 'Inspeksi Peralatan', desc: 'Inspeksi peralatan (equipment inspection).' },
    { icon: 'check', name: 'Audit Keselamatan', desc: 'Audit keselamatan (safety audit).' },
  ],
  source: 'situs resmi nusasafety.co.id',
};

/* ---------------------------------------------------------------------
   Katalog perangkat (barier).
   cat  : 'prevent' = pencegahan (kiri bow-tie), 'mitigate' = mitigasi.
   cost : satuan anggaran.
   pfd  : probability of failure on demand saat barier diuji berkala.
          Nilai indikatif mengikuti rentang tipikal CCPS (2001).
   itpm : program inspeksi dan pengujian yang sesuai.
   kit  : kelompok skenario yang menampilkan perangkat ini di Kotak Alat,
          termasuk pengecoh yang masuk akal. Tanpa kit berarti 'proses'.
   --------------------------------------------------------------------- */
const C_LB = '#29abe2', C_DB = '#1565a6', C_BK = '#26323d', C_ST = '#5d6b78';
const ALL_KITS = ['proses', 'boiler', 'amp', 'trafo', 'bess', 'biogas', 'debu', 'amonia', 'gedung'];
const DEVICES = {
  /* ------- Pencegahan ------- */
  PT:    { code: 'PT',   name: 'Transmitter Tekanan + Alarm (PAH/PAL)', cat: 'prevent', cost: 2, color: C_LB, pfd: 0.1, itpm: 'CAL', kit: ['proses', 'boiler', 'biogas', 'amonia'],
           desc: 'Mengukur tekanan dan memberi alarm tinggi/rendah ke operator di ruang kendali sehingga operator dapat bertindak sebelum trip. Lapisan proteksi berbasis respons operator.' },
  LT:    { code: 'LT',   name: 'Transmitter Level + Alarm (LAH/LAL)', cat: 'prevent', cost: 2, color: C_LB, pfd: 0.1, itpm: 'CAL', kit: ['proses', 'boiler', 'amp', 'trafo', 'biogas', 'amonia', 'gedung'],
           desc: 'Mengukur level cairan dan memberi alarm tinggi/rendah. Memungkinkan operator mengoreksi sebelum level mencapai batas bahaya.' },
  TT:    { code: 'TT',   name: 'Transmitter Suhu + Alarm (TAH)', cat: 'prevent', cost: 2, color: C_LB, pfd: 0.1, itpm: 'CAL', kit: ALL_KITS,
           desc: 'Mengukur suhu dan memberi alarm suhu tinggi ke operator. Penting pada proses eksotermik, peralatan bersuhu tinggi, sambungan listrik, dan material yang dapat memanas sendiri.' },
  FT:    { code: 'FT',   name: 'Transmitter Aliran + Pembatas Laju Umpan', cat: 'prevent', cost: 2, color: C_LB, pfd: 0.1, itpm: 'CAL', kit: ['proses', 'boiler', 'amp', 'debu'],
           desc: 'Mengukur laju alir dan membatasi laju umpan agar tidak melebihi kapasitas pendinginan, reaksi, atau penggilingan.' },
  PSV:   { code: 'PSV',  name: 'Pressure Safety Valve (PSV)', cat: 'prevent', cost: 3, color: C_BK, pfd: 0.01, itpm: 'RELIEF', kit: ['proses', 'boiler', 'amonia'],
           desc: 'Katup pengaman tekanan yang membuka otomatis saat tekanan melebihi set point untuk mencegah bejana pecah. Lapisan proteksi mekanis terakhir sebelum kehilangan kontainmen.' },
  RD:    { code: 'RD',   name: 'Rupture Disc (Cakram Pecah)', cat: 'prevent', cost: 2, color: C_BK, pfd: 0.01, itpm: 'RELIEF',
           desc: 'Cakram yang pecah pada tekanan tertentu untuk melepaskan tekanan dengan sangat cepat. Cocok untuk kenaikan tekanan yang sangat cepat seperti reaksi runaway.' },
  SIS:   { code: 'SIS',  name: 'SIF Tekanan Tinggi (PSHH → SDV)', cat: 'prevent', cost: 4, color: C_DB, pfd: 0.01, itpm: 'SIF', kit: ['proses', 'boiler'],
           desc: 'Safety Instrumented Function: sakelar tekanan tinggi-tinggi (PSHH) menutup shutdown valve (SDV) pada sumber tekanan atau sumber panas secara otomatis. Lapisan proteksi independen (IPL) sesuai IEC 61511.' },
  LSHH:  { code: 'LSHH', name: 'Trip Level Tinggi-Tinggi (LSHH → tutup inlet)', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['proses', 'amp', 'biogas', 'amonia', 'gedung'],
           desc: 'Proteksi overfill: sakelar level tinggi-tinggi yang menutup katup masuk atau menghentikan pompa pengisi secara otomatis. Mencegah luapan tangki dan cairan terbawa ke mesin.' },
  LSLL:  { code: 'LSLL', name: 'Trip Level Rendah-Rendah (LSLL → tutup outlet)', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.1, itpm: 'SIF',
           desc: 'Proteksi level rendah: menutup katup keluar cairan atau menghentikan pompa bila level terlalu rendah, sehingga gas bertekanan tidak menerobos ke sistem hilir (gas blow-by) dan pompa tidak berjalan kering.' },
  TSHH:  { code: 'TSHH', name: 'Trip Suhu Tinggi-Tinggi (TSHH → stop umpan/panas)', cat: 'prevent', cost: 4, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['proses', 'boiler', 'amp', 'amonia'],
           desc: 'SIF suhu: menghentikan umpan, sumber panas, atau mesin secara otomatis saat suhu melewati batas tinggi-tinggi. Pada reaktor mencegah reaksi runaway; pada sistem pembakaran, pengering, dan kompresor mencegah panas berlebih.' },
  FSLL:  { code: 'FSLL', name: 'Trip Aliran Rendah (FSLL → stop umpan/pemanas)', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['proses', 'amp'],
           desc: 'Menghentikan umpan reaktan atau sumber panas secara otomatis bila aliran media pendingin atau fluida pembawa panas hilang, karena panas tidak lagi dapat dibuang atau dibawa keluar.' },
  AGI:   { code: 'AGI',  name: 'Interlock Agitator (stop umpan bila agitator mati)', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF',
           desc: 'Mencegah akumulasi reaktan tak tercampur yang dapat bereaksi serentak saat agitator hidup kembali.' },
  NRV:   { code: 'NRV',  name: 'Check Valve (Non-Return Valve)', cat: 'prevent', cost: 1, color: C_ST, pfd: 0.1, itpm: 'MECH', kit: ['proses', 'boiler', 'amp', 'biogas', 'amonia'],
           desc: 'Mencegah aliran balik (reverse flow) dari sistem bertekanan tinggi ke sistem bertekanan rendah atau ke pompa yang berhenti.' },
  EFV:   { code: 'EFV',  name: 'Excess Flow Valve', cat: 'prevent', cost: 2, color: C_ST, pfd: 0.1, itpm: 'MECH', kit: ['proses', 'gedung'],
           desc: 'Menutup otomatis bila laju alir melampaui batas, misalnya saat selang atau pipa hilir pecah.' },
  BRK:   { code: 'BRK',  name: 'Breakaway Coupling (Loading Arm)', cat: 'prevent', cost: 2, color: C_ST, pfd: 0.1, itpm: 'MECH',
           desc: 'Sambungan yang putus dan menutup sendiri bila truk bergerak saat masih tersambung, sehingga tidak terjadi pelepasan besar.' },
  GRND:  { code: 'GRND', name: 'Grounding & Bonding + Interlock', cat: 'prevent', cost: 1, color: C_ST, pfd: 0.1, itpm: 'MECH', kit: ['proses', 'bess', 'debu'],
           desc: 'Menghilangkan muatan statis dan menyamakan potensial logam sebagai sumber nyala. Interlock mencegah pompa atau mesin menyala bila klem grounding belum terpasang.' },
  N2:    { code: 'N2',   name: 'Nitrogen Blanketing', cat: 'prevent', cost: 2, color: C_ST, pfd: 0.1, itpm: 'MECH',
           desc: 'Mengisi ruang uap tangki dengan nitrogen agar campuran uap berada di luar rentang mudah terbakar.' },
  COD:   { code: 'COD',  name: 'Analyzer CO + Alarm (deteksi pembaraan dini)', cat: 'prevent', cost: 2, color: C_LB, pfd: 0.1, itpm: 'CAL', kit: ['boiler', 'debu'],
           desc: 'Memantau kenaikan karbon monoksida di coal mill, bunker, atau silo. CO naik jauh sebelum api terlihat ketika material curah mulai membara, sehingga operator sempat melakukan inerting atau mengosongkan peralatan dengan aman.' },
  BMS:   { code: 'BMS',  name: 'Burner Management System (flame scanner → tutup bahan bakar)', cat: 'prevent', cost: 4, color: C_DB, pfd: 0.01, itpm: 'SIF', kit: ['boiler', 'amp'],
           desc: 'Sistem pengaman pembakaran: purge ruang bakar sebelum penyalaan, pemantauan nyala dengan flame scanner, dan penutupan katup bahan bakar ganda dalam hitungan detik saat nyala hilang. Mencegah akumulasi bahan bakar yang meledak saat penyalaan ulang (NFPA 85 dan NFPA 86).' },
  LWCO:  { code: 'LWCO', name: 'Low Water Cut-Off Drum (LSLL → trip burner)', cat: 'prevent', cost: 4, color: C_DB, pfd: 0.01, itpm: 'SIF', kit: ['boiler'],
           desc: 'Trip pembakaran otomatis bila level air drum mencapai rendah-rendah, sebelum pipa dinding air kekurangan pendinginan dan pecah. Merupakan perlengkapan pengaman wajib pada ketel uap.' },
  DFI:   { code: 'DFI',  name: 'Interlock Draft (trip burner bila ID fan mati)', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['boiler', 'amp'],
           desc: 'Menghentikan burner secara otomatis bila kipas isap (ID fan) mati atau tekanan ruang bakar menjadi positif, sehingga api dan gas panas tidak menyembur balik ke arah operator.' },
  MAG:   { code: 'MAG',  name: 'Pemisah Magnet (Magnetic Separator)', cat: 'prevent', cost: 1, color: C_ST, pfd: 0.1, itpm: 'MECH', kit: ['boiler', 'debu'],
           desc: 'Menangkap logam asing seperti baut dan potongan besi dari aliran material sebelum masuk ke mill atau penggiling, sehingga tidak terjadi percikan api dan kerusakan mesin.' },
  BAM:   { code: 'BAM',  name: 'Monitor Kecepatan & Kelurusan Sabuk Elevator', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['debu'],
           desc: 'Sensor kecepatan, kelurusan sabuk, dan suhu bantalan pada bucket elevator yang menghentikan motor bila sabuk selip atau bergeser, sebelum gesekan menimbulkan panas penyulut debu (NFPA 61).' },
  SDE:   { code: 'SDE',  name: 'Deteksi Percikan & Pemadam Otomatis di Ducting', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['debu'],
           desc: 'Detektor inframerah mendeteksi percikan atau bara di dalam ducting dan menyemprotkan kabut air dalam hitungan milidetik, sehingga sumber nyala tidak mencapai dust collector.' },
  DIFR:  { code: '87T',  name: 'Relai Diferensial Trafo (87T → trip PMT)', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.01, itpm: 'RELAY', kit: ['trafo'],
           desc: 'Membandingkan arus sisi primer dan sekunder trafo. Selisih arus menandakan gangguan internal, dan relai membuka pemutus (PMT) kedua sisi dalam puluhan milidetik sebelum busur listrik menguraikan minyak dalam jumlah besar.' },
  BUCH:  { code: 'BUCH', name: 'Relai Buchholz & Relai Tekanan Mendadak', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'RELAY', kit: ['trafo'],
           desc: 'Dipasang pada pipa antara tangki dan konservator. Mendeteksi akumulasi gas hasil penguraian minyak, aliran minyak mendadak, atau minyak yang hilang, lalu memberi alarm dan men-trip trafo.' },
  WTI:   { code: 'WTI',  name: 'Indikator Suhu Belitan & Minyak + Trip (WTI/OTI)', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'RELAY', kit: ['trafo'],
           desc: 'Mengukur suhu minyak atas dan suhu titik terpanas belitan, menyalakan kipas pendingin bertahap, memberi alarm, dan men-trip trafo bila suhu melewati batas sehingga isolasi kertas tidak rusak.' },
  PRD:   { code: 'PRD',  name: 'Pressure Relief Device Tangki Trafo', cat: 'prevent', cost: 2, color: C_BK, pfd: 0.01, itpm: 'RELIEF', kit: ['trafo'],
           desc: 'Katup pelepas tekanan pada tutup tangki yang membuka dalam hitungan milidetik saat tekanan naik mendadak akibat busur listrik internal, sehingga tangki tidak robek dan minyak dilepas secara terarah.' },
  OCR:   { code: 'OCR',  name: 'Relai Arus Lebih & Gangguan Tanah + Pemutus', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'RELAY', kit: ['trafo', 'bess', 'debu', 'gedung'],
           desc: 'Membuka pemutus (PMT, ACB, atau MCCB) bila arus melebihi setelan akibat beban lebih, hubung singkat, atau gangguan tanah. Tidak bereaksi terhadap panas lokal pada sambungan kendur selama arus beban masih normal.' },
  ARC:   { code: 'ARC',  name: 'Proteksi Busur Listrik (Arc Fault) → pemutus cepat', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'RELAY', kit: ['trafo', 'bess'],
           desc: 'Mendeteksi kilatan cahaya atau pola arus khas busur listrik, termasuk busur DC pada larik surya, lalu memutus sirkuit dalam hitungan milidetik sebelum busur menyulut isolasi dan material di sekitarnya.' },
  BMSB:  { code: 'BMSB', name: 'Battery Management System + Proteksi Overcharge & Suhu', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['bess'],
           desc: 'Memantau tegangan dan suhu setiap sel, menghentikan pengisian bila sel mendekati batas tegangan, dan membuka kontaktor rak bila suhu atau tegangan keluar batas aman. Barier utama terhadap penyalahgunaan listrik pada baterai litium.' },
  HVR:   { code: 'HVR',  name: 'HVAC Cadangan (N+1) dengan Pergantian Otomatis', cat: 'prevent', cost: 2, color: C_ST, pfd: 0.1, itpm: 'MECH', kit: ['bess'],
           desc: 'Unit pendingin udara kedua yang mengambil alih secara otomatis saat unit utama gagal, sehingga suhu kontainer baterai tetap pada rentang operasi 20 hingga 30 °C.' },
  PVRV:  { code: 'PVRV', name: 'Katup Pengaman Tekanan-Vakum Cover Digester', cat: 'prevent', cost: 2, color: C_BK, pfd: 0.01, itpm: 'RELIEF', kit: ['biogas'],
           desc: 'Melepas biogas secara terarah melalui titik tinggi saat tekanan di bawah cover melampaui batas, dan memasukkan udara secukupnya saat terjadi vakum, sehingga membran tidak robek di tepi kolam.' },
  FIG:   { code: 'FIG',  name: 'Flare Otomatis: Start, Penyalaan & Pemantauan Nyala', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['biogas'],
           desc: 'Membuka katup ke flare saat tekanan digester tinggi atau gas engine berhenti, menyalakan pilot secara otomatis, dan menyalakan ulang bila nyala padam, sehingga biogas tidak pernah dilepas tanpa dibakar.' },
  O2T:   { code: 'O2T',  name: 'Analyzer O2 Biogas + Trip Blower & Injeksi Udara', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['biogas'],
           desc: 'Mengukur kadar oksigen dalam biogas dan menghentikan injeksi udara scrubber serta blower bila oksigen mendekati batas, mencegah terbentuknya campuran biogas dan udara yang mudah meledak di dalam sistem.' },
  FARR:  { code: 'FA',   name: 'Flame Arrester pada Jalur Biogas', cat: 'prevent', cost: 1, color: C_ST, pfd: 0.1, itpm: 'MECH', kit: ['biogas'],
           desc: 'Elemen logam berpori yang memadamkan nyala api yang merambat balik di dalam pipa, sehingga nyala dari flare atau engine tidak masuk ke digester dan scrubber.' },
  HPCO:  { code: 'HPCO', name: 'Sakelar Tekanan Tinggi Kompresor (stop kompresor)', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['amonia'],
           desc: 'Menghentikan kompresor secara otomatis bila tekanan kondensasi melampaui batas, sebelum katup pengaman membuka dan melepas amonia (ASHRAE 15, IIAR 2).' },
  DEFI:  { code: 'DEFI', name: 'Interlock Urutan Defrost & Katup Gas Panas Bertahap', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['amonia'],
           desc: 'Memastikan koil evaporator dikosongkan dan tekanannya disamakan sebelum gas panas dimasukkan secara bertahap, mencegah hentakan hidraulik (hydraulic shock) yang dapat meretakkan koil.' },
  GSO:   { code: 'GSO',  name: 'Detektor Gas LPG + Katup Solenoid Otomatis', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['gedung'],
           desc: 'Detektor gas di dapur yang menutup katup solenoid pada jalur LPG secara otomatis saat konsentrasi gas mencapai sekitar 20 persen LEL, sehingga kebocoran berhenti sebelum campuran mudah meledak terbentuk.' },
  GRF:   { code: 'GRF',  name: 'Hood dengan Filter Lemak (Baffle Filter)', cat: 'prevent', cost: 1, color: C_ST, pfd: 0.1, itpm: 'MECH', kit: ['gedung'],
           desc: 'Filter baffle logam pada hood menangkap uap lemak sebelum masuk ke ducting exhaust, sehingga endapan lemak di ducting berkurang dan api dari kompor tidak mudah merambat ke dalam ducting (NFPA 96).' },
  /* ------- Mitigasi ------- */
  GD:    { code: 'GD',   name: 'Detektor Gas (Flammable/Toxic)', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'DET', kit: ['proses', 'biogas', 'amonia'],
           desc: 'Mendeteksi kebocoran gas mudah terbakar atau beracun, misalnya hidrokarbon, H2S, dan amonia, pada tahap awal dan mengaktifkan alarm atau ESD sebelum awan gas membesar atau mencapai sumber nyala.' },
  FD:    { code: 'FD',   name: 'Detektor Api/Nyala (Flame Detector)', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'DET', kit: ['proses', 'boiler', 'amp', 'trafo', 'biogas', 'debu'],
           desc: 'Mendeteksi nyala api atau panas secara cepat dan memicu alarm, sistem proteksi kebakaran aktif, serta ESD.' },
  ESD:   { code: 'ESD',  name: 'Sistem Emergency Shutdown (ESD)', cat: 'mitigate', cost: 3, color: C_DB, pfd: 0.01, itpm: 'EMER', kit: ['proses', 'boiler', 'amp', 'bess', 'biogas', 'amonia'],
           desc: 'Tombol dan logika ESD untuk mengisolasi unit secara serentak saat darurat: menghentikan pompa dan kompresor, menutup SDV, atau memutus sumber listrik dari lokasi yang aman.' },
  BDV:   { code: 'BDV',  name: 'Blowdown Valve ke Flare', cat: 'mitigate', cost: 4, color: C_DB, pfd: 0.1, itpm: 'EMER',
           desc: 'Melepaskan tekanan bejana ke flare dengan cepat (depressurisasi darurat) untuk mengurangi inventori dan risiko pecah saat terpapar api.' },
  DELUGE:{ code: 'DLG',  name: 'Sistem Deluge / Water Spray', cat: 'mitigate', cost: 3, color: C_LB, pfd: 0.1, itpm: 'FIRE', kit: ['proses', 'boiler', 'trafo'],
           desc: 'Menyemprotkan air ke permukaan peralatan untuk pendinginan dan pemadaman saat terpapar api, mencegah kegagalan bejana, BLEVE, atau penjalaran kebakaran ke peralatan di sekitarnya.' },
  DIKE:  { code: 'DIKE', name: 'Tanggul (Bund/Dike) Penampung Tumpahan', cat: 'mitigate', cost: 3, color: C_BK, pfd: 0.01, itpm: 'PASSIVE', kit: ['proses', 'boiler', 'amp', 'gedung'],
           desc: 'Menampung tumpahan cairan dari tangki sehingga tidak menyebar ke area lain dan luas genangan api terbatas.' },
  FOAM:  { code: 'FOAM', name: 'Sistem Busa (Foam) Tangki', cat: 'mitigate', cost: 3, color: C_LB, pfd: 0.1, itpm: 'FIRE', kit: ['proses', 'amp'],
           desc: 'Memadamkan kebakaran cairan mudah terbakar pada permukaan tangki dengan menutup permukaan cairan.' },
  FW:    { code: 'FW',   name: 'Hidran & Monitor Air Pemadam', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'FIRE', kit: ['proses', 'boiler', 'amp', 'biogas', 'debu', 'amonia'],
           desc: 'Sarana pemadaman manual dan pendinginan peralatan sekitar oleh tim tanggap darurat.' },
  EIV:   { code: 'EIV',  name: 'Katup Isolasi Darurat Jarak Jauh (ROSOV)', cat: 'mitigate', cost: 3, color: C_DB, pfd: 0.1, itpm: 'EMER', kit: ['proses', 'biogas', 'amonia'],
           desc: 'Katup yang dapat ditutup dari jarak aman untuk menghentikan sumber kebocoran dan membatasi jumlah pelepasan.' },
  SCRUB: { code: 'SCRB', name: 'Scrubber Darurat (Vent Treatment)', cat: 'mitigate', cost: 3, color: C_DB, pfd: 0.1, itpm: 'EMER', kit: ['proses', 'amonia'],
           desc: 'Menetralkan atau menyerap uap beracun yang dilepaskan melalui vent darurat atau katup pengaman sebelum mencapai atmosfer.' },
  QUENCH:{ code: 'QNC',  name: 'Sistem Quench / Injeksi Inhibitor', cat: 'mitigate', cost: 4, color: C_DB, pfd: 0.1, itpm: 'EMER',
           desc: 'Menghentikan reaksi runaway dengan menyuntikkan inhibitor atau pelarut dingin ke dalam reaktor.' },
  ALARM: { code: 'ALM',  name: 'Alarm Umum & Rencana Tanggap Darurat', cat: 'mitigate', cost: 1, color: C_BK, pfd: 0.1, itpm: 'DRILL', kit: ALL_KITS,
           desc: 'Sirene, titik kumpul, dan prosedur evakuasi untuk melindungi pekerja dan masyarakat sekitar.' },
  SPK:   { code: 'SPK',  name: 'Sistem Sprinkler Otomatis', cat: 'mitigate', cost: 3, color: C_LB, pfd: 0.05, itpm: 'FIRE', kit: ['bess', 'debu', 'gedung'],
           desc: 'Kepala sprinkler pecah pada suhu tertentu dan menyemprotkan air untuk mengendalikan atau memadamkan api pada tahap awal. Pada kebakaran baterai litium, air juga mendinginkan modul di sekitarnya agar thermal runaway tidak merambat (SNI 03-3989-2000, NFPA 13, NFPA 855).' },
  HYD:   { code: 'HYD',  name: 'Hidran Gedung & Pipa Tegak (Standpipe)', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'FIRE', kit: ['gedung'],
           desc: 'Kotak hidran dengan selang di setiap lantai yang terhubung ke pipa tegak dan pompa kebakaran, dipakai penghuni terlatih dan petugas pemadam (SNI 03-1745-2000).' },
  GAS:   { code: 'GAS',  name: 'Sistem Pemadam Gas Bersih (FM-200 / IG-541)', cat: 'mitigate', cost: 3, color: C_LB, pfd: 0.05, itpm: 'FIRE', kit: ['trafo', 'bess', 'gedung'],
           desc: 'Gas pemadam yang tidak menghantarkan listrik dan tidak meninggalkan residu, efektif untuk ruang tertutup berisi panel listrik. Gas ini tidak mendinginkan, sehingga tidak menghentikan thermal runaway berantai pada baterai litium (NFPA 2001).' },
  WETC:  { code: 'WETC', name: 'Sistem Pemadam Hood Dapur (Wet Chemical)', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'FIRE', kit: ['gedung'],
           desc: 'Nozel di hood dan ducting yang menyemprotkan bahan kimia basah saat suhu tinggi terdeteksi, membentuk lapisan sabun di permukaan minyak panas sekaligus menutup suplai gas ke kompor (NFPA 17A, NFPA 96).' },
  APAR:  { code: 'APAR', name: 'Alat Pemadam Api Ringan (APAR) sesuai Kelas Kebakaran', cat: 'mitigate', cost: 1, color: C_LB, pfd: 0.1, itpm: 'FIRE', kit: ['amp', 'biogas', 'debu', 'gedung'],
           desc: 'Pemadam portabel untuk api tahap awal. Jenis dan jaraknya disesuaikan dengan kelas kebakaran (A, B, C, atau K), wajib dipasang dan diperiksa berkala menurut Permenakertrans No. Per.04/MEN/1980.' },
  SD:    { code: 'SD',   name: 'Detektor Asap & Panas + Panel Alarm Kebakaran', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'DET', kit: ['trafo', 'bess', 'gedung'],
           desc: 'Detektor asap dan panas otomatis yang terhubung ke panel alarm kebakaran (MCFA), membunyikan alarm, dan memicu sistem pemadam serta pengendalian asap (SNI 03-3985-2000, Permenaker No. Per.02/MEN/1983).' },
  PRES:  { code: 'PRES', name: 'Kipas Presurisasi Tangga & Exhaust Asap', cat: 'mitigate', cost: 3, color: C_DB, pfd: 0.1, itpm: 'EMER', kit: ['gedung'],
           desc: 'Menjaga tangga darurat bertekanan positif dan membuang asap dari koridor saat kebakaran, sehingga jalur evakuasi tetap bebas asap.' },
  SHAFT: { code: 'SHFT', name: 'Shaft & Kompartemen Tahan Api 2 Jam', cat: 'mitigate', cost: 2, color: C_BK, pfd: 0.01, itpm: 'PASSIVE', kit: ['gedung'],
           desc: 'Selubung dinding tahan api untuk ducting dapur dan bukaan antarlantai, sehingga api dan asap tidak merambat vertikal ke lantai lain.' },
  FWALL: { code: 'FWL',  name: 'Dinding Tahan Api (Firewall) Antarperalatan', cat: 'mitigate', cost: 3, color: C_BK, pfd: 0.01, itpm: 'PASSIVE', kit: ['trafo', 'bess'],
           desc: 'Dinding beton tahan api di antara trafo atau kontainer baterai yang berdekatan, mencegah kebakaran satu unit merambat ke unit lain (NFPA 850, NFPA 855).' },
  OPIT:  { code: 'PIT',  name: 'Bak Penampung Minyak dengan Lapisan Kerikil', cat: 'mitigate', cost: 2, color: C_BK, pfd: 0.01, itpm: 'PASSIVE', kit: ['trafo'],
           desc: 'Bak di bawah trafo yang menampung seluruh volume minyak. Lapisan kerikil memadamkan minyak menyala yang jatuh dan membatasi luas genangan api.' },
  NIFPS: { code: 'NIFP', name: 'Nitrogen Injection Fire Prevention (NIFPS)', cat: 'mitigate', cost: 4, color: C_DB, pfd: 0.1, itpm: 'EMER', kit: ['trafo'],
           desc: 'Saat gangguan internal terdeteksi, sistem membuang sebagian minyak dari atas tangki, menutup katup konservator, dan menginjeksikan nitrogen untuk mengaduk dan mendinginkan minyak, mencegah tangki meledak dan terbakar.' },
  OGD:   { code: 'OGD',  name: 'Detektor Off-Gas Baterai (H2 / CO)', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'DET', kit: ['bess'],
           desc: 'Mendeteksi gas yang keluar dari sel saat elektrolit menguap atau terurai, sering sebelum asap terlihat, lalu memutus rak, menyalakan ventilasi exhaust, dan memberi alarm.' },
  DVENT: { code: 'DVNT', name: 'Panel Venting Ledakan (Deflagration Vent)', cat: 'mitigate', cost: 3, color: C_BK, pfd: 0.01, itpm: 'PASSIVE', kit: ['bess', 'debu'],
           desc: 'Panel yang membuka pada tekanan rendah dan mengarahkan bola api ledakan ke area aman, sehingga kontainer atau peralatan tidak pecah dan melontarkan pecahan (NFPA 68).' },
  EXV:   { code: 'EXV',  name: 'Ventilasi Exhaust Darurat (aktif oleh detektor gas)', cat: 'mitigate', cost: 2, color: C_DB, pfd: 0.1, itpm: 'EMER', kit: ['bess', 'amonia'],
           desc: 'Kipas exhaust berkapasitas besar yang otomatis menyala saat detektor gas aktif, menjaga konsentrasi gas tetap di bawah batas mudah terbakar atau batas paparan (NFPA 69, IIAR 2).' },
  EISO:  { code: 'EISO', name: 'Katup Isolasi Ledakan di Ducting (Flap/Valve)', cat: 'mitigate', cost: 2, color: C_DB, pfd: 0.1, itpm: 'EMER', kit: ['debu'],
           desc: 'Menutup ducting dalam hitungan milidetik saat ledakan terjadi, sehingga nyala ledakan tidak merambat dari dust collector ke ruang produksi dan memicu ledakan sekunder (NFPA 69).' },
  SUPP:  { code: 'SUPP', name: 'Sistem Supresi Ledakan Kimia (HRD)', cat: 'mitigate', cost: 4, color: C_DB, pfd: 0.1, itpm: 'EMER', kit: ['debu'],
           desc: 'Sensor tekanan mendeteksi awal ledakan dan tabung bertekanan menyemprotkan serbuk pemadam dalam hitungan milidetik, sehingga ledakan padam sebelum tekanannya merusak peralatan.' },
  INERT: { code: 'INRT', name: 'Sistem Inerting (Uap / CO2 / N2)', cat: 'mitigate', cost: 3, color: C_DB, pfd: 0.1, itpm: 'EMER', kit: ['boiler', 'debu'],
           desc: 'Menginjeksikan uap air, CO2, atau nitrogen ke mill, bunker, atau silo saat pembaraan terdeteksi, menurunkan kadar oksigen di bawah batas yang dibutuhkan untuk kebakaran dan ledakan debu.' },
  WCUR:  { code: 'WCUR', name: 'Tirai Semprot Air (Water Curtain) Penyerap Amonia', cat: 'mitigate', cost: 3, color: C_LB, pfd: 0.1, itpm: 'FIRE', kit: ['amonia'],
           desc: 'Semprotan air berbentuk tirai di sekitar sumber pelepasan. Amonia sangat mudah larut dalam air sehingga konsentrasi awan gas yang menyebar ke area kerja dan permukiman berkurang.' },
  SCBA:  { code: 'SCBA', name: 'Alat Bantu Napas (SCBA) & Detektor Gas Personal', cat: 'mitigate', cost: 1, color: C_BK, pfd: 0.1, itpm: 'DRILL', kit: ['biogas', 'amonia'],
           desc: 'Alat pelindung pernapasan mandiri dan detektor gas yang dikenakan pekerja untuk evakuasi dan penyelamatan di area beracun. Efektif hanya bila pekerja terlatih dan alat selalu siap pakai.' },
};

/* ---------------------------------------------------------------------
   Model biaya indikatif. Biaya perangkat dan program disimpan dalam
   satuan anggaran agar penilaian tidak bergantung pada kurs. Satu satuan
   setara USD 25.000 yang mencakup pengadaan, pemasangan, dan rekayasa;
   untuk program inspeksi dan pengujian, satu satuan mewakili biaya
   pelaksanaan selama satu siklus 5 tahun. Angka ini kasar, hanya untuk
   pelatihan, dan bukan acuan pengadaan. Kurs dapat diubah pemain di
   layar Configuration.
   --------------------------------------------------------------------- */
const COST_MODEL = { usdPerUnit: 25000, idrPerUsd: 16000 };

/* Faktor penurunan keandalan barier yang tidak diuji. Tanpa pengujian
   berkala, kegagalan tersembunyi (dangerous undetected) menumpuk dan
   PFDavg yang mendekati lambda_DU x interval uji / 2 terus naik. */
const UNTESTED_FACTOR = 10;

/* ---------------------------------------------------------------------
   Program inspeksi, pengujian, dan perawatan preventif (ITPM).
   target 'device'    : diterapkan pada perangkat barier terpasang.
   target 'equipment' : diterapkan pada peralatan proses (Tahap 3).
   --------------------------------------------------------------------- */
const ITPM = {
  CAL:     { code: 'KAL', stage: 3, cost: 1, target: 'device', grp: 'Instrumen & Alarm', fits: ['PT', 'LT', 'TT', 'FT', 'COD'],
             name: 'Kalibrasi Transmitter & Uji Alarm',
             desc: 'Kalibrasi berkala transmitter dan analyzer serta uji fungsi alarm memastikan pembacaan akurat dan alarm aktif pada set point. Instrumen yang menyimpang (drift) dapat membaca normal saat proses sebenarnya abnormal. Pengelolaan alarm mengacu ANSI/ISA-18.2.' },
  SIF:     { code: 'PRF', stage: 3, cost: 1, target: 'device', grp: 'Trip Otomatis & Interlock', fits: ['SIS', 'LSHH', 'LSLL', 'TSHH', 'FSLL', 'AGI', 'BMS', 'LWCO', 'DFI', 'BAM', 'SDE', 'BMSB', 'FIG', 'O2T', 'HPCO', 'DEFI', 'GSO'],
             name: 'Proof Test SIF & Interlock',
             desc: 'Pengujian berkala seluruh rangkaian fungsi instrumentasi keselamatan dan interlock, mulai dari sensor, logic solver, hingga elemen akhir seperti katup, kontaktor, atau motor, untuk menemukan kegagalan tersembunyi. Interval proof test menentukan PFDavg sesuai IEC 61511.' },
  RELIEF:  { code: 'UJR', stage: 3, cost: 1, target: 'device', grp: 'Pelepas Tekanan', fits: ['PSV', 'RD', 'PRD', 'PVRV'],
             name: 'Uji Bangku & Sertifikasi Perangkat Pelepas Tekanan',
             desc: 'Pelepasan, uji bangku (pop test), perbaikan, dan sertifikasi ulang PSV secara berkala, inspeksi rupture disc dan holder, serta uji fungsi PRD trafo dan katup tekanan-vakum. Mengacu API RP 576 dan pemeriksaan keselamatan peralatan.' },
  MECH:    { code: 'MEK', stage: 3, cost: 1, target: 'device', grp: 'Perangkat Mekanis', fits: ['NRV', 'EFV', 'BRK', 'GRND', 'N2', 'MAG', 'HVR', 'FARR', 'GRF'],
             name: 'Inspeksi & Uji Fungsi Perangkat Mekanis',
             desc: 'Uji kebocoran balik check valve, uji fungsi excess flow valve dan breakaway coupling, uji tahanan grounding, pembersihan magnet, flame arrester, dan filter lemak, pemeriksaan regulator nitrogen, serta uji pergantian otomatis unit HVAC cadangan.' },
  RELAY:   { code: 'RLY', stage: 3, cost: 1, target: 'device', grp: 'Proteksi Listrik', fits: ['DIFR', 'BUCH', 'WTI', 'OCR', 'ARC'],
             name: 'Uji Relai Proteksi & Pemutus (Injeksi Sekunder)',
             desc: 'Uji injeksi sekunder relai, uji fungsi kontak Buchholz dan termometer belitan, serta uji waktu buka pemutus untuk memastikan gangguan diputus dalam waktu yang ditetapkan. Bagian dari sistem manajemen keselamatan ketenagalistrikan menurut Permen ESDM No. 10 Tahun 2021.' },
  VESSEL:  { code: 'BTK', stage: 3, cost: 2, target: 'equipment', fitsEq: ['vessel', 'reactor', 'tank', 'truck', 'hx', 'column', 'heater'],
             name: 'Pemeriksaan & Pengujian Bejana Tekan / Tangki',
             desc: 'Pemeriksaan visual, pengukuran ketebalan dinding dengan ultrasonik, dan uji hidrostatik berkala untuk mendeteksi korosi dan retak sebelum terjadi kebocoran. Diwajibkan Permenaker No. 37 Tahun 2016; praktik teknis mengacu API 510 dan API 653.' },
  ROT:     { code: 'VIB', stage: 3, cost: 1, target: 'equipment', fitsEq: ['pump', 'compressor', 'motor', 'fan', 'generator', 'turbine', 'mill', 'elevator', 'drum', 'cooler', 'conveyor'],
             name: 'Pemantauan Getaran & Perawatan Prediktif',
             desc: 'Pemantauan getaran dan suhu bantalan, inspeksi seal mekanis, serta analisis tren untuk mendeteksi kerusakan mesin berputar sebelum seal bocor atau mesin terlalu panas. Mengacu ISO 20816.' },
  ELEC:    { code: 'LIS', stage: 3, cost: 2, target: 'equipment', fitsEq: ['transformer', 'panel', 'battery'],
             name: 'Pemeliharaan Prediktif Peralatan Listrik',
             desc: 'Uji DGA dan kualitas minyak trafo, uji tahanan isolasi, termografi inframerah pada sambungan dan busbar, serta pemeriksaan kapasitas dan keseimbangan sel baterai. Mengacu Permenaker No. 12 Tahun 2015 tentang K3 Listrik dan Permen ESDM No. 10 Tahun 2021.' },
  KETEL:   { code: 'KTL', stage: 3, cost: 2, target: 'equipment', fitsEq: ['furnace'],
             name: 'Pemeriksaan & Pengujian Pesawat Uap (Ketel)',
             desc: 'Pemeriksaan bagian dalam dan luar ketel, pengukuran ketebalan pipa dinding air, uji hidrostatik, serta uji fungsi katup pengaman dan gelas penduga oleh ahli K3 pesawat uap. Diwajibkan Undang-Undang Uap 1930 dan Peraturan Uap 1930.' },
  DUCT:    { code: 'HDC', stage: 3, cost: 1, target: 'equipment', fitsEq: ['hood'],
             name: 'Pembersihan & Inspeksi Hood dan Ducting Dapur',
             desc: 'Pembersihan endapan lemak pada hood, filter, dan ducting exhaust secara berkala dengan frekuensi sesuai volume memasak, serta inspeksi kebocoran dan akses pembersihan ducting (NFPA 96).' },
  DET:     { code: 'BMP', stage: 4, cost: 1, target: 'device', grp: 'Deteksi', fits: ['GD', 'FD', 'SD', 'OGD'],
             name: 'Bump Test & Kalibrasi Detektor',
             desc: 'Bump test dan kalibrasi detektor gas, uji fungsi detektor api dengan lampu uji, serta uji detektor asap dan panas dengan aerosol atau sumber panas uji. Mengacu IEC 60079-29-2 dan SNI 03-3985-2000.' },
  FIRE:    { code: 'FPS', stage: 4, cost: 1, target: 'device', grp: 'Proteksi Kebakaran Aktif', fits: ['DELUGE', 'FOAM', 'FW', 'SPK', 'HYD', 'GAS', 'WETC', 'APAR', 'WCUR'],
             name: 'Inspeksi & Uji Sistem Proteksi Kebakaran',
             desc: 'Uji aliran sprinkler dan deluge, uji pompa kebakaran, uji konsentrat busa, pemeriksaan nozel tersumbat, uji integritas ruang dan penimbangan tabung pemadam gas, serta pemeriksaan APAR minimal dua kali setahun. Mengacu NFPA 25 dan Permenakertrans No. Per.04/MEN/1980.' },
  EMER:    { code: 'UFD', stage: 4, cost: 1, target: 'device', grp: 'Isolasi & Sistem Darurat', fits: ['ESD', 'BDV', 'EIV', 'QUENCH', 'SCRUB', 'NIFPS', 'PRES', 'EXV', 'EISO', 'SUPP', 'INERT'],
             name: 'Uji Fungsi Sistem Darurat & Partial Stroke Test',
             desc: 'Uji fungsi logika ESD, partial dan full stroke test katup darurat, pengukuran waktu tutup katup, uji sirkulasi scrubber atau injeksi quench, serta uji fungsi kipas presurisasi, ventilasi darurat, katup isolasi ledakan, dan sistem inerting.' },
  PASSIVE: { code: 'PSF', stage: 4, cost: 1, target: 'device', grp: 'Barier Pasif', fits: ['DIKE', 'SHAFT', 'FWALL', 'OPIT', 'DVENT'],
             name: 'Inspeksi Barier Pasif',
             desc: 'Inspeksi retak dan kebocoran tanggul atau bak penampung, kondisi katup drainase yang harus normal tertutup, integritas dinding dan selubung tahan api, serta kondisi panel venting ledakan.' },
  DRILL:   { code: 'DRL', stage: 4, cost: 1, target: 'device', grp: 'Tanggap Darurat', fits: ['ALARM', 'SCBA'],
             name: 'Latihan Tanggap Darurat Berkala',
             desc: 'Uji sirene, simulasi evakuasi, latihan gabungan dengan tim pemadam, serta pemeriksaan dan latihan pemakaian alat bantu napas. PP No. 50 Tahun 2012 mensyaratkan prosedur keadaan darurat diuji secara berkala.' },
};

/* Nama jenis peralatan untuk keterangan program inspeksi peralatan. */
const EQ_TYPE_NAMES = {
  vessel: 'bejana tekan', reactor: 'reaktor', tank: 'tangki', truck: 'truk tangki', hx: 'penukar panas', column: 'kolom', heater: 'pemanas oli termal',
  pump: 'pompa', compressor: 'kompresor', motor: 'motor/agitator', fan: 'kipas/blower', generator: 'generator', turbine: 'turbin', mill: 'mill/penggiling',
  elevator: 'bucket elevator', drum: 'drum pengering', cooler: 'kondensor/unit HVAC', conveyor: 'konveyor',
  transformer: 'transformator', panel: 'panel listrik', battery: 'kontainer baterai', furnace: 'ketel uap', hood: 'hood dapur',
};

const PARAMS = {
  P: 'Tekanan', L: 'Level', T: 'Suhu', F: 'Aliran', C: 'Komposisi / Reaksi', E: 'Listrik (Arus / Tegangan)',
};
const GUIDEWORDS = {
  high: 'Lebih tinggi (More / High)',
  low: 'Lebih rendah (Less / Low)',
  none: 'Tidak ada (No / None)',
  reverse: 'Terbalik (Reverse)',
  other: 'Selain dari (Other than)',
};

/* Jenis peringatan lapangan pada Tahap 2. */
const WARN_TYPES = {
  leak:      { title: 'Kebocoran Gas' },
  toxic:     { title: 'Gas Beracun' },
  heat:      { title: 'Panas Berlebih' },
  vibration: { title: 'Getaran Abnormal' },
  spill:     { title: 'Tumpahan Cairan' },
  fire:      { title: 'Kebakaran' },
  explosion: { title: 'Ledakan' },
  smoke:     { title: 'Asap' },
  arc:       { title: 'Busur Listrik' },
  dust:      { title: 'Awan Debu' },
};

/* Sektor industri untuk pengelompokan skenario. */
const SECTORS = [
  { key: 'migas', name: 'Minyak & Gas Bumi' },
  { key: 'petrokimia', name: 'Petrokimia' },
  { key: 'listrik', name: 'Ketenagalistrikan' },
  { key: 'ebt', name: 'Energi Baru Terbarukan' },
  { key: 'manufaktur', name: 'Manufaktur' },
  { key: 'properti', name: 'Properti & Konstruksi EPC' },
];

/* Skenario didefinisikan di js/scenarios/*.js dan ditambahkan ke sini. */
const SCENARIOS = [];


const STAGES = [
  { n: 1, short: 'Kondisi Normal', title: 'Tahap 1: Identifikasi Kondisi Normal', icon: 'book',
    desc: 'Pelajari setiap peralatan, jalankan proses produksi, dan pahami bagaimana proses dijaga pada kondisi normal.' },
  { n: 2, short: 'Abnormalitas', title: 'Tahap 2: Identifikasi Abnormalitas', icon: 'alert',
    desc: 'Jalankan proses produksi, amati tren dan peringatan lapangan saat terjadi kegagalan, lalu tentukan deviasi, penyebab, dan konsekuensinya dengan pendekatan HAZOP.' },
  { n: 3, short: 'Barier Pencegahan', title: 'Tahap 3: Barier Pencegahan', icon: 'shield',
    desc: 'Pasang instrumen deteksi dan proteksi untuk mencegah abnormalitas berkembang menjadi kehilangan kontainmen, lalu terapkan program inspeksi dan pengujian agar barier dan peralatan tetap andal.' },
  { n: 4, short: 'Barier Mitigasi', title: 'Tahap 4: Barier Mitigasi', icon: 'fire',
    desc: 'Pasang perangkat untuk mencegah eskalasi insiden menjadi bencana, yaitu deteksi, isolasi, proteksi kebakaran, dan tanggap darurat, lengkap dengan program pengujiannya.' },
];
