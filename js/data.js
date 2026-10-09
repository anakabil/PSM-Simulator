/* =====================================================================
   PSM Simulator - Data permainan
   Katalog barier beserta kit per jenis fasilitas, escalation factor
   dan kontrolnya, guideword HAZOP, model biaya, sektor industri, jenis
   peringatan lapangan, dan kredit. Skenario berada di js/scenarios/*.js dan
   ditambahkan ke SCENARIOS setelah berkas ini dimuat.
   ===================================================================== */

const APP_INFO = {
  name: 'PSM Simulator',
  version: '1.4.0',
  tagline: 'Simulasi Keselamatan Proses: Pahami, Kenali, Lindungi',
};

const BRAND = {
  logo: 'assets/psm-logo.png',
  /* versi latar transparan untuk bilah atas yang gelap */
  logoDark: 'assets/psm-logo-dark.png',
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
    'Undang-Undang No. 30 Tahun 2009 tentang Ketenagalistrikan beserta perubahannya.',
    'Peraturan Pemerintah No. 50 Tahun 2012 tentang Penerapan Sistem Manajemen Keselamatan dan Kesehatan Kerja (SMK3).',
    'Keputusan Menteri Tenaga Kerja No. KEP.187/MEN/1999 tentang Pengendalian Bahan Kimia Berbahaya di Tempat Kerja.',
    'Peraturan Menteri Ketenagakerjaan No. 37 Tahun 2016 tentang Keselamatan dan Kesehatan Kerja Bejana Tekanan dan Tangki Timbun.',
    'Peraturan Menteri ESDM No. 18 Tahun 2018 tentang Pemeriksaan Keselamatan Instalasi dan Peralatan pada Kegiatan Usaha Minyak dan Gas Bumi.',
    'Peraturan Menteri ESDM No. 10 Tahun 2021 tentang Keselamatan Ketenagalistrikan.',
    'Undang-Undang Uap Tahun 1930 (Stoom Ordonnantie) dan Peraturan Uap Tahun 1930 (Stoom Verordening).',
    'Peraturan Menteri Ketenagakerjaan No. 4 Tahun 2025 tentang Operator Pesawat Uap.',
    'Peraturan Menteri Ketenagakerjaan No. 12 Tahun 2015 tentang Keselamatan dan Kesehatan Kerja Listrik di Tempat Kerja.',
    'Peraturan Menteri Ketenagakerjaan No. 5 Tahun 2018 tentang Keselamatan dan Kesehatan Kerja Lingkungan Kerja.',
    'Peraturan Menteri Tenaga Kerja dan Transmigrasi No. Per.04/MEN/1980 tentang Syarat-syarat Pemasangan dan Pemeliharaan Alat Pemadam Api Ringan.',
    'Peraturan Menteri Tenaga Kerja No. Per.02/MEN/1983 tentang Instalasi Alarm Kebakaran Automatik.',
    'Keputusan Menteri Tenaga Kerja No. KEP.186/MEN/1999 tentang Unit Penanggulangan Kebakaran di Tempat Kerja.',
    'Peraturan Menteri Pekerjaan Umum No. 26/PRT/M/2008 tentang Persyaratan Teknis Sistem Proteksi Kebakaran pada Bangunan Gedung dan Lingkungan.',
    'Peraturan Menteri PUPR No. 10 Tahun 2021 tentang Pedoman Sistem Manajemen Keselamatan Konstruksi.',
    'Peraturan Badan Pemeriksa Keuangan No. 1 Tahun 2017 tentang Standar Pemeriksaan Keuangan Negara, khususnya aspek ekonomi, efisiensi, dan efektivitas pada pemeriksaan kinerja.',
    'Badan Standardisasi Nasional (2000). SNI 03-1745-2000 Tata cara perencanaan dan pemasangan sistem pipa tegak dan slang untuk pencegahan bahaya kebakaran pada bangunan rumah dan gedung.',
    'Badan Standardisasi Nasional (2000). SNI 03-3985-2000 Tata cara perencanaan, pemasangan dan pengujian sistem deteksi dan alarm kebakaran untuk pencegahan bahaya kebakaran pada bangunan gedung.',
    'Badan Standardisasi Nasional (2000). SNI 03-3989-2000 Tata cara perencanaan dan pemasangan sistem sprinkler otomatik untuk pencegahan bahaya kebakaran pada bangunan gedung.',
    'Dinas Penanggulangan Kebakaran dan Penyelamatan Provinsi DKI Jakarta. Data kejadian kebakaran menurut penyebab, dengan korsleting listrik sebagai penyebab terbanyak.',
    'OSHA 29 CFR 1910.119, Process Safety Management of Highly Hazardous Chemicals.',
    'CCPS (2001). Layer of Protection Analysis: Simplified Process Risk Assessment. AIChE.',
    'CCPS (2008). Guidelines for Hazard Evaluation Procedures (edisi ketiga). AIChE/Wiley.',
    'CCPS (2007). Guidelines for Risk Based Process Safety. AIChE/Wiley.',
    'CCPS (2008). Guidelines for the Management of Change for Process Safety. AIChE/Wiley.',
    'CCPS & Energy Institute (2018). Bow Ties in Risk Management. AIChE/Wiley.',
    'Reason, J. (1990). Human Error. Cambridge University Press.',
    'Tarigan, H. G. (1985). Membaca sebagai Suatu Keterampilan Berbahasa. Angkasa.',
    'Brysbaert, M. (2019). How many words do we read per minute? A review and meta-analysis of reading rate. Journal of Memory and Language, 109, 104047.',
    'Health and Safety Executive (1999). Reducing Error and Influencing Behaviour (HSG48, edisi kedua). HSE Books.',
    'Health and Safety Executive (2001). Reducing Risks, Protecting People: HSE\'s Decision-Making Process. HSE Books.',
    'Vaughan, D. (1996). The Challenger Launch Decision: Risky Technology, Culture, and Deviance at NASA. University of Chicago Press.',
    'IEC 61511-1 (2016). Functional safety: Safety instrumented systems for the process industry sector.',
    'IEC 61882 (2016). Hazard and operability studies (HAZOP studies), Application guide.',
    'IEC 60079-29-2 (2015). Gas detectors: Selection, installation, use and maintenance of detectors for flammable gases and oxygen.',
    'ANSI/ISA-18.2 (2016). Management of Alarm Systems for the Process Industries.',
    'ANSI/ISA-101.01 (2015). Human Machine Interfaces for Process Automation Systems.',
    'ISA-5.1 (2009). Instrumentation Symbols and Identification.',
    'ISO 20816-1 (2016). Mechanical vibration: Measurement and evaluation of machine vibration.',
    'API RP 14C, Analysis, Design, Installation, and Testing of Safety Systems for Offshore Production Facilities.',
    'API 510, Pressure Vessel Inspection Code; API 570, Piping Inspection Code; API 653, Tank Inspection, Repair, Alteration, and Reconstruction; API RP 576, Inspection of Pressure-relieving Devices.',
    'API RP 2350, Overfill Protection for Storage Tanks in Petroleum Facilities.',
    'NFPA 25, Standard for the Inspection, Testing, and Maintenance of Water-Based Fire Protection Systems; NFPA 58, Liquefied Petroleum Gas Code.',
    'API Std 2510, Design and Construction of LPG Installations; API Std 650, Welded Tanks for Oil Storage.',
    'IEC 60076-7 (2018). Power transformers, Part 7: Loading guide for mineral-oil-immersed power transformers.',
    'IEEE C57.104 (2019). IEEE Guide for the Interpretation of Gases Generated in Mineral Oil-Immersed Transformers.',
    'NFPA 85, Boiler and Combustion Systems Hazards Code; NFPA 86, Standard for Ovens and Furnaces.',
    'NFPA 850, Recommended Practice for Fire Protection for Electric Generating Plants and High Voltage Direct Current Converter Stations; NFPA 855, Standard for the Installation of Stationary Energy Storage Systems; NFPA 70B, Standard for Electrical Equipment Maintenance.',
    'NFPA 652, Standard on the Fundamentals of Combustible Dust; NFPA 61, Standard for the Prevention of Fires and Dust Explosions in Agricultural and Food Processing Facilities; NFPA 68, Standard on Explosion Protection by Deflagration Venting; NFPA 69, Standard on Explosion Prevention Systems.',
    'NFPA 13, Standard for the Installation of Sprinkler Systems; NFPA 15, Standard for Water Spray Fixed Systems for Fire Protection; NFPA 2001, Standard on Clean Agent Fire Extinguishing Systems; NFPA 96, Standard for Ventilation Control and Fire Protection of Commercial Cooking Operations; NFPA 17A, Standard for Wet Chemical Extinguishing Systems.',
    'NFPA 51B, Standard for Fire Prevention During Welding, Cutting, and Other Hot Work.',
    'NFPA 654, Standard for the Prevention of Fire and Dust Explosions from the Manufacturing, Processing, and Handling of Combustible Particulate Solids.',
    'IEC 62852 (2014). Connectors for DC-application in photovoltaic systems: Safety requirements and tests.',
    'IIAR 2, Standard for Safe Design of Closed-Circuit Ammonia Refrigeration Systems; ASHRAE 15, Safety Standard for Refrigeration Systems.',
    'NIOSH. Pocket Guide to Chemical Hazards: Ammonia (nilai IDLH 300 ppm).',
    'U.S. Chemical Safety Board (2009). Investigation Report: Sugar Dust Explosion and Fire, Imperial Sugar Company, Port Wentworth, Georgia.',
    'U.S. Chemical Safety Board (2015). Key Lessons for Preventing Hydraulic Shock in Industrial Refrigeration Systems: Anhydrous Ammonia Release at Millard Refrigerated Services, Theodore, Alabama.',
    'DNV GL (2020). McMicken Battery Energy Storage System Event Technical Analysis and Recommendations. Arizona Public Service.',
    'Kementerian Perdagangan, Industri, dan Energi Republik Korea (2019). Hasil investigasi penyebab kebakaran sistem penyimpanan energi baterai (ESS), diumumkan Juni 2019.',
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
  email: 'admin@nusasafety.co.id',
  instagram: 'nusasafety',
  taglines: ['A Resilient Company', 'Partner in Safety & Sustainability'],
  profile: [
    'PT. Nusa Rendra Jayatama, dengan merek Nusa Safety, adalah perusahaan jasa konsultasi dan pelatihan di bidang keselamatan, kesehatan kerja, dan lingkungan (HSE). Perusahaan menyediakan solusi menyeluruh yang memadukan kepatuhan teknis dengan implementasi praktis.',
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
   Jeda iklan singkat (after scene) setelah satu misi selesai dan sebelum
   misi berikutnya dimulai. Pesan dirotasi setiap kali jeda tampil. Isi
   mengacu pada layanan di COMPANY dan penawaran pengembangan simulator,
   modul pelatihan interaktif, serta video pelatihan dari Nusa Safety.
   --------------------------------------------------------------------- */
const PROMO = {
  label: 'Jeda sebelum misi berikutnya',
  seconds: 5,
  cta: 'Diskusikan kebutuhan Anda bersama kami:',
  messages: [
    { title: 'Tertarik menghadirkan simulator seperti ini di perusahaan Anda?',
      body: 'Nusa Safety mengembangkan simulator keselamatan proses, modul pelatihan interaktif, dan video pelatihan sesuai kebutuhan perusahaan. Skenario, instalasi, dan prosedurnya dapat disesuaikan dengan fasilitas serta sistem izin kerja Anda, sehingga pekerja berlatih menghadapi risiko yang benar-benar ada di tempat kerjanya.' },
    { title: 'Tingkatkan kompetensi tim Anda dengan pelatihan bersertifikat BNSP',
      body: 'Nusa Safety menyelenggarakan pelatihan intensif dengan sertifikasi BNSP sesuai SKKNI. Pelatihan dibawakan oleh tenaga ahli berpengalaman dari sektor konstruksi, minyak dan gas, serta manufaktur.' },
    { title: 'Pastikan peralatan dan barier keselamatan Anda siap saat dibutuhkan',
      body: 'Sebagaimana terlihat dalam misi ini, barier yang tidak terpelihara dapat gagal tanpa terlihat. Nusa Safety menyediakan kajian rekayasa, inspeksi peralatan, dan audit keselamatan untuk membantu memastikan peralatan serta sistem pengaman di fasilitas Anda tetap layak dan sesuai ketentuan.' },
    { title: 'Memerlukan pendampingan penerapan SMK3 dan sistem ISO?',
      body: 'Nusa Safety memberikan konsultasi sistem manajemen SMK3 dan standar ISO dengan memadukan kepatuhan teknis dan implementasi praktis, sehingga sistem tidak berhenti pada dokumen, tetapi benar-benar berjalan di lapangan.' },
  ],
};

/* ---------------------------------------------------------------------
   Katalog perangkat (barier).
   cat  : 'prevent' = pencegahan (kiri bow-tie), 'mitigate' = mitigasi.
   cost : satuan anggaran.
   pfd  : probability of failure on demand saat barier diuji berkala.
          Nilai indikatif mengikuti rentang tipikal CCPS (2001).
   itpm : escalation factor utama perangkat dan kontrolnya (lihat ITPM).
   kit  : kelompok skenario yang menampilkan perangkat ini di Kotak Alat,
          termasuk pengecoh yang masuk akal. Tanpa kit berarti 'proses'.
   --------------------------------------------------------------------- */
const C_LB = '#29abe2', C_DB = '#1565a6', C_BK = '#26323d', C_ST = '#5d6b78';
const ALL_KITS = ['proses', 'boiler', 'amp', 'trafo', 'bess', 'biogas', 'debu', 'amonia', 'gedung'];
const DEVICES = {
  /* ------- Pencegahan ------- */
  PT:    { code: 'PT',   name: 'Transmitter Tekanan dengan Alarm (PAH/PAL)', cat: 'prevent', cost: 2, color: C_LB, pfd: 0.1, itpm: 'CAL', kit: ['proses', 'boiler', 'biogas', 'amonia'],
           desc: 'Mengukur tekanan dan memberi alarm tinggi/rendah ke operator di ruang kendali sehingga operator dapat bertindak sebelum trip. Perangkat ini merupakan lapisan proteksi berbasis respons operator.' },
  LT:    { code: 'LT',   name: 'Transmitter Level dengan Alarm (LAH/LAL)', cat: 'prevent', cost: 2, color: C_LB, pfd: 0.1, itpm: 'CAL', kit: ['proses', 'boiler', 'amp', 'trafo', 'biogas', 'amonia', 'gedung'],
           desc: 'Mengukur level cairan dan memberi alarm tinggi/rendah. Alarm ini memungkinkan operator melakukan koreksi sebelum level mencapai batas bahaya.' },
  TT:    { code: 'TT',   name: 'Transmitter Suhu dengan Alarm (TAH)', cat: 'prevent', cost: 2, color: C_LB, pfd: 0.1, itpm: 'CAL', kit: ALL_KITS,
           desc: 'Mengukur suhu dan memberi alarm suhu tinggi ke operator. Penting pada proses eksotermik, peralatan bersuhu tinggi, sambungan listrik, dan material yang dapat memanas sendiri.' },
  FT:    { code: 'FT',   name: 'Transmitter Aliran dengan Pembatas Laju Umpan', cat: 'prevent', cost: 2, color: C_LB, pfd: 0.1, itpm: 'CAL', kit: ['proses', 'boiler', 'amp', 'debu'],
           desc: 'Mengukur laju alir dan membatasi laju umpan agar tidak melebihi kapasitas pendinginan, reaksi, atau penggilingan.' },
  PSV:   { code: 'PSV',  name: 'Pressure Safety Valve (PSV)', cat: 'prevent', cost: 3, color: C_BK, pfd: 0.01, itpm: 'RELIEF', kit: ['proses', 'boiler', 'amonia'],
           desc: 'Katup pengaman tekanan yang membuka secara otomatis saat tekanan melebihi set point untuk mencegah bejana pecah. Perangkat ini merupakan lapisan proteksi mekanis terakhir sebelum kehilangan kontainmen.' },
  RD:    { code: 'RD',   name: 'Rupture Disc (Cakram Pecah)', cat: 'prevent', cost: 2, color: C_BK, pfd: 0.01, itpm: 'RDISC',
           desc: 'Cakram yang pecah pada tekanan tertentu untuk melepaskan tekanan dengan sangat cepat. Perangkat ini cocok untuk kenaikan tekanan yang sangat cepat, seperti pada reaksi runaway.' },
  SIS:   { code: 'SIS',  name: 'SIF Tekanan Tinggi (PSHH menutup SDV)', cat: 'prevent', cost: 4, color: C_DB, pfd: 0.01, itpm: 'SIF', kit: ['proses', 'boiler'],
           desc: 'Safety Instrumented Function: sakelar tekanan tinggi-tinggi (PSHH) menutup shutdown valve (SDV) pada sumber tekanan atau sumber panas secara otomatis. Fungsi ini merupakan lapisan proteksi independen (IPL) sesuai IEC 61511.' },
  LSHH:  { code: 'LSHH', name: 'Trip Level Tinggi-Tinggi (LSHH menutup inlet)', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['proses', 'amp', 'biogas', 'amonia', 'gedung'],
           desc: 'Proteksi overfill: sakelar level tinggi-tinggi yang menutup katup masuk atau menghentikan pompa pengisi secara otomatis. Mencegah luapan tangki dan cairan terbawa ke mesin.' },
  LSLL:  { code: 'LSLL', name: 'Trip Level Rendah-Rendah (LSLL menutup outlet)', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.1, itpm: 'SIF',
           desc: 'Proteksi level rendah: menutup katup keluar cairan atau menghentikan pompa bila level terlalu rendah, sehingga gas bertekanan tidak menerobos ke sistem hilir (gas blow-by) dan pompa tidak berjalan kering.' },
  TSHH:  { code: 'TSHH', name: 'Trip Suhu Tinggi-Tinggi (TSHH menghentikan umpan/panas)', cat: 'prevent', cost: 4, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['proses', 'boiler', 'amp', 'amonia'],
           desc: 'SIF suhu: menghentikan umpan, sumber panas, atau mesin secara otomatis saat suhu melewati batas tinggi-tinggi. Pada reaktor, fungsi ini mencegah reaksi runaway, sedangkan pada sistem pembakaran, pengering, dan kompresor, fungsi ini mencegah panas berlebih.' },
  FSLL:  { code: 'FSLL', name: 'Trip Aliran Rendah (FSLL menghentikan umpan/pemanas)', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['proses', 'amp'],
           desc: 'Menghentikan umpan reaktan atau sumber panas secara otomatis bila aliran media pendingin atau fluida pembawa panas hilang, karena panas tidak lagi dapat dibuang atau dibawa keluar.' },
  AGI:   { code: 'AGI',  name: 'Interlock Agitator (hentikan umpan bila agitator mati)', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF',
           desc: 'Mencegah akumulasi reaktan tak tercampur yang dapat bereaksi serentak saat agitator hidup kembali.' },
  NRV:   { code: 'NRV',  name: 'Check Valve (Non-Return Valve)', cat: 'prevent', cost: 1, color: C_ST, pfd: 0.1, itpm: 'MECH', kit: ['proses', 'boiler', 'amp', 'biogas', 'amonia'],
           desc: 'Mencegah aliran balik (reverse flow) dari sistem bertekanan tinggi ke sistem bertekanan rendah atau ke pompa yang berhenti.' },
  EFV:   { code: 'EFV',  name: 'Excess Flow Valve', cat: 'prevent', cost: 2, color: C_ST, pfd: 0.1, itpm: 'MECH', kit: ['proses', 'gedung'],
           desc: 'Menutup secara otomatis bila laju alir melampaui batas, misalnya saat selang atau pipa hilir pecah.' },
  BRK:   { code: 'BRK',  name: 'Breakaway Coupling (Loading Arm)', cat: 'prevent', cost: 2, color: C_ST, pfd: 0.1, itpm: 'MECH',
           desc: 'Sambungan yang putus dan menutup sendiri bila truk bergerak saat masih tersambung, sehingga tidak terjadi pelepasan besar.' },
  GRND:  { code: 'GRND', name: 'Grounding dan Bonding dengan Interlock', cat: 'prevent', cost: 1, color: C_ST, pfd: 0.1, itpm: 'BOND', kit: ['proses', 'bess', 'debu'],
           desc: 'Menghilangkan muatan statis dan menyamakan potensial antarbagian logam sehingga tidak menjadi sumber nyala. Interlock mencegah pompa atau mesin menyala bila klem grounding belum terpasang.' },
  N2:    { code: 'N2',   name: 'Nitrogen Blanketing', cat: 'prevent', cost: 2, color: C_ST, pfd: 0.1, itpm: 'UTIL',
           desc: 'Mengisi ruang uap tangki dengan nitrogen agar campuran uap berada di luar rentang mudah terbakar.' },
  COD:   { code: 'COD',  name: 'Analyzer CO dengan Alarm (deteksi pembaraan dini)', cat: 'prevent', cost: 2, color: C_LB, pfd: 0.1, itpm: 'ANZ', kit: ['boiler', 'debu'],
           desc: 'Memantau kenaikan karbon monoksida di coal mill, bunker, atau silo. Kadar CO naik jauh sebelum api terlihat ketika material curah mulai membara, sehingga operator sempat melakukan inerting atau mengosongkan peralatan dengan aman.' },
  BMS:   { code: 'BMS',  name: 'Burner Management System (flame scanner menutup katup bahan bakar)', cat: 'prevent', cost: 4, color: C_DB, pfd: 0.01, itpm: 'BURN', kit: ['boiler', 'amp'],
           desc: 'Sistem pengaman pembakaran: purge ruang bakar sebelum penyalaan, pemantauan nyala dengan flame scanner, dan penutupan katup bahan bakar ganda dalam hitungan detik saat nyala hilang. Mencegah akumulasi bahan bakar yang meledak saat penyalaan ulang (NFPA 85 dan NFPA 86).' },
  LWCO:  { code: 'LWCO', name: 'Low Water Cut-Off Drum (LSLL men-trip burner)', cat: 'prevent', cost: 4, color: C_DB, pfd: 0.01, itpm: 'LWCT', kit: ['boiler'],
           desc: 'Trip pembakaran otomatis bila level air drum mencapai rendah-rendah, sebelum pipa dinding air kekurangan pendinginan dan pecah. Perangkat ini merupakan perlengkapan pengaman wajib pada ketel uap.' },
  DFI:   { code: 'DFI',  name: 'Interlock Draft (trip burner bila ID fan mati)', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['boiler', 'amp'],
           desc: 'Menghentikan burner secara otomatis bila kipas isap (ID fan) mati atau tekanan ruang bakar menjadi positif, sehingga api dan gas panas tidak menyembur balik ke arah operator.' },
  MAG:   { code: 'MAG',  name: 'Pemisah Magnet (Magnetic Separator)', cat: 'prevent', cost: 1, color: C_ST, pfd: 0.1, itpm: 'ELEM', kit: ['boiler', 'debu'],
           desc: 'Menangkap logam asing seperti baut dan potongan besi dari aliran material sebelum masuk ke mill atau penggiling, sehingga tidak terjadi percikan api dan kerusakan mesin.' },
  BAM:   { code: 'BAM',  name: 'Monitor Kecepatan dan Kelurusan Sabuk Elevator', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['debu'],
           desc: 'Sensor kecepatan, kelurusan sabuk, dan suhu bantalan pada bucket elevator yang menghentikan motor bila sabuk selip atau bergeser, sebelum gesekan menimbulkan panas penyulut debu (NFPA 61).' },
  SDE:   { code: 'SDE',  name: 'Deteksi Percikan dan Pemadam Otomatis di Ducting', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.1, itpm: 'SPARK', kit: ['debu'],
           desc: 'Detektor inframerah mendeteksi percikan atau bara di dalam ducting dan menyemprotkan kabut air dalam hitungan milidetik, sehingga sumber nyala tidak mencapai dust collector.' },
  DIFR:  { code: '87T',  name: 'Relai Diferensial Trafo (87T men-trip PMT)', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.01, itpm: 'RELAY', kit: ['trafo'],
           desc: 'Membandingkan arus sisi primer dan sekunder trafo. Selisih arus menandakan gangguan internal, dan relai membuka pemutus (PMT) kedua sisi dalam puluhan milidetik sebelum busur listrik menguraikan minyak dalam jumlah besar.' },
  BUCH:  { code: 'BUCH', name: 'Relai Buchholz dan Relai Tekanan Mendadak', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'TRAFO', kit: ['trafo'],
           desc: 'Dipasang pada pipa antara tangki dan konservator. Mendeteksi akumulasi gas hasil penguraian minyak, aliran minyak mendadak, atau minyak yang hilang, lalu memberi alarm dan men-trip trafo.' },
  WTI:   { code: 'WTI',  name: 'Indikator Suhu Belitan dan Minyak dengan Trip (WTI/OTI)', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'TRAFO', kit: ['trafo'],
           desc: 'Mengukur suhu minyak atas dan suhu titik terpanas belitan, menyalakan kipas pendingin bertahap, memberi alarm, dan men-trip trafo bila suhu melewati batas sehingga isolasi kertas tidak rusak.' },
  PRD:   { code: 'PRD',  name: 'Pressure Relief Device Tangki Trafo', cat: 'prevent', cost: 2, color: C_BK, pfd: 0.01, itpm: 'TRAFO', kit: ['trafo'],
           desc: 'Katup pelepas tekanan pada tutup tangki yang membuka dalam hitungan milidetik saat tekanan naik mendadak akibat busur listrik internal, sehingga tangki tidak robek dan minyak dilepas secara terarah.' },
  OCR:   { code: 'OCR',  name: 'Relai Arus Lebih dan Gangguan Tanah dengan Pemutus', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'RELAY', kit: ['trafo', 'bess', 'debu', 'gedung'],
           desc: 'Membuka pemutus (PMT, ACB, atau MCCB) bila arus melebihi setelan akibat beban lebih, hubung singkat, atau gangguan tanah. Tidak bereaksi terhadap panas lokal pada sambungan kendur selama arus beban masih normal.' },
  ARC:   { code: 'ARC',  name: 'Proteksi Busur Listrik (Arc Fault) dengan Pemutus Cepat', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'RELAY', kit: ['trafo', 'bess'],
           desc: 'Mendeteksi kilatan cahaya atau pola arus khas busur listrik, termasuk busur DC pada larik surya, lalu memutus sirkuit dalam hitungan milidetik sebelum busur menyulut isolasi dan material di sekitarnya.' },
  BMSB:  { code: 'BMSB', name: 'Battery Management System dengan Proteksi Overcharge dan Suhu', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.1, itpm: 'BATT', kit: ['bess'],
           desc: 'Memantau tegangan dan suhu setiap sel, menghentikan pengisian bila sel mendekati batas tegangan, dan membuka kontaktor rak bila suhu atau tegangan keluar batas aman. Sistem ini merupakan barier utama terhadap penyalahgunaan listrik pada baterai litium.' },
  HVR:   { code: 'HVR',  name: 'HVAC Cadangan (N+1) dengan Pergantian Otomatis', cat: 'prevent', cost: 2, color: C_ST, pfd: 0.1, itpm: 'UTIL', kit: ['bess'],
           desc: 'Unit pendingin udara kedua yang mengambil alih secara otomatis saat unit utama gagal, sehingga suhu kontainer baterai tetap pada rentang operasi 20 hingga 30 °C.' },
  PVRV:  { code: 'PVRV', name: 'Katup Pengaman Tekanan-Vakum Cover Digester', cat: 'prevent', cost: 2, color: C_BK, pfd: 0.01, itpm: 'RELIEF', kit: ['biogas'],
           desc: 'Melepas biogas secara terarah melalui titik tinggi saat tekanan di bawah cover melampaui batas, dan memasukkan udara secukupnya saat terjadi vakum, sehingga membran tidak robek di tepi kolam.' },
  FIG:   { code: 'FIG',  name: 'Flare Otomatis: Start, Penyalaan, dan Pemantauan Nyala', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['biogas'],
           desc: 'Membuka katup ke flare saat tekanan digester tinggi atau gas engine berhenti, menyalakan pilot secara otomatis, dan menyalakan ulang bila nyala padam, sehingga biogas tidak pernah dilepas tanpa dibakar.' },
  O2T:   { code: 'O2T',  name: 'Analyzer O2 Biogas dengan Trip Blower dan Injeksi Udara', cat: 'prevent', cost: 3, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['biogas'],
           desc: 'Mengukur kadar oksigen dalam biogas dan menghentikan injeksi udara scrubber serta blower bila oksigen mendekati batas, mencegah terbentuknya campuran biogas dan udara yang mudah meledak di dalam sistem.' },
  FARR:  { code: 'FA',   name: 'Flame Arrester pada Jalur Biogas', cat: 'prevent', cost: 1, color: C_ST, pfd: 0.1, itpm: 'ELEM', kit: ['biogas'],
           desc: 'Elemen logam berpori yang memadamkan nyala api yang merambat balik di dalam pipa, sehingga nyala dari flare atau engine tidak masuk ke digester dan scrubber.' },
  HPCO:  { code: 'HPCO', name: 'Sakelar Tekanan Tinggi Kompresor (menghentikan kompresor)', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['amonia'],
           desc: 'Menghentikan kompresor secara otomatis bila tekanan kondensasi melampaui batas, sebelum katup pengaman membuka dan melepas amonia (ASHRAE 15, IIAR 2).' },
  DEFI:  { code: 'DEFI', name: 'Interlock Urutan Defrost dan Katup Gas Panas Bertahap', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['amonia'],
           desc: 'Memastikan koil evaporator dikosongkan dan tekanannya disamakan sebelum gas panas dimasukkan secara bertahap, mencegah hentakan hidraulik (hydraulic shock) yang dapat meretakkan koil.' },
  GSO:   { code: 'GSO',  name: 'Detektor Gas LPG dengan Katup Solenoid Otomatis', cat: 'prevent', cost: 2, color: C_DB, pfd: 0.1, itpm: 'SIF', kit: ['gedung'],
           desc: 'Detektor gas di dapur yang menutup katup solenoid pada jalur LPG secara otomatis saat konsentrasi gas mencapai sekitar 20 persen LEL, sehingga kebocoran berhenti sebelum campuran mudah meledak terbentuk.' },
  GRF:   { code: 'GRF',  name: 'Hood dengan Filter Lemak (Baffle Filter)', cat: 'prevent', cost: 1, color: C_ST, pfd: 0.1, itpm: 'ELEM', kit: ['gedung'],
           desc: 'Filter baffle logam pada hood menangkap uap lemak sebelum masuk ke ducting exhaust, sehingga endapan lemak di ducting berkurang dan api dari kompor tidak mudah merambat ke dalam ducting (NFPA 96).' },
  /* ------- Mitigasi ------- */
  GD:    { code: 'GD',   name: 'Detektor Gas (Flammable/Toxic)', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'DET', kit: ['proses', 'biogas', 'amonia'],
           desc: 'Mendeteksi kebocoran gas mudah terbakar atau beracun, misalnya hidrokarbon, H2S, dan amonia, pada tahap awal dan mengaktifkan alarm atau ESD sebelum awan gas membesar atau mencapai sumber nyala.' },
  FD:    { code: 'FD',   name: 'Detektor Api/Nyala (Flame Detector)', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'FLMD', kit: ['proses', 'boiler', 'amp', 'trafo', 'biogas', 'debu'],
           desc: 'Mendeteksi nyala api atau panas secara cepat dan memicu alarm, sistem proteksi kebakaran aktif, serta ESD.' },
  ESD:   { code: 'ESD',  name: 'Sistem Emergency Shutdown (ESD)', cat: 'mitigate', cost: 3, color: C_DB, pfd: 0.01, itpm: 'EMER', kit: ['proses', 'boiler', 'amp', 'bess', 'biogas', 'amonia'],
           desc: 'Tombol dan logika ESD untuk mengisolasi unit secara serentak saat keadaan darurat: menghentikan pompa dan kompresor, menutup SDV, atau memutus sumber listrik dari lokasi yang aman.' },
  BDV:   { code: 'BDV',  name: 'Blowdown Valve ke Flare', cat: 'mitigate', cost: 4, color: C_DB, pfd: 0.1, itpm: 'EMER',
           desc: 'Melepaskan tekanan bejana ke flare dengan cepat (depressurisasi darurat) untuk mengurangi inventori dan risiko pecah saat terpapar api.' },
  DELUGE:{ code: 'DLG',  name: 'Sistem Deluge/Water Spray', cat: 'mitigate', cost: 3, color: C_LB, pfd: 0.1, itpm: 'FIRE', kit: ['proses', 'boiler', 'trafo'],
           desc: 'Menyemprotkan air ke permukaan peralatan untuk pendinginan dan pemadaman saat terpapar api, mencegah kegagalan bejana, BLEVE, atau penjalaran kebakaran ke peralatan di sekitarnya.' },
  DIKE:  { code: 'DIKE', name: 'Tanggul (Bund/Dike) Penampung Tumpahan', cat: 'mitigate', cost: 3, color: C_BK, pfd: 0.01, itpm: 'PASSIVE', kit: ['proses', 'boiler', 'amp', 'gedung'],
           desc: 'Menampung tumpahan cairan dari tangki sehingga tidak menyebar ke area lain dan luas genangan api terbatas.' },
  FOAM:  { code: 'FOAM', name: 'Sistem Busa (Foam) Tangki', cat: 'mitigate', cost: 3, color: C_LB, pfd: 0.1, itpm: 'FOAMQ', kit: ['proses', 'amp'],
           desc: 'Memadamkan kebakaran cairan mudah terbakar pada permukaan tangki dengan menutup permukaan cairan.' },
  FW:    { code: 'FW',   name: 'Hidran dan Monitor Air Pemadam', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'FIRE', kit: ['proses', 'boiler', 'amp', 'biogas', 'debu', 'amonia'],
           desc: 'Sarana pemadaman manual dan pendinginan peralatan di sekitarnya oleh tim tanggap darurat.' },
  EIV:   { code: 'EIV',  name: 'Katup Isolasi Darurat Jarak Jauh (ROSOV)', cat: 'mitigate', cost: 3, color: C_DB, pfd: 0.1, itpm: 'EMER', kit: ['proses', 'biogas', 'amonia'],
           desc: 'Katup yang dapat ditutup dari jarak aman untuk menghentikan sumber kebocoran dan membatasi jumlah pelepasan.' },
  SCRUB: { code: 'SCRB', name: 'Scrubber Darurat (Vent Treatment)', cat: 'mitigate', cost: 3, color: C_DB, pfd: 0.1, itpm: 'QNCH', kit: ['proses', 'amonia'],
           desc: 'Menetralkan atau menyerap uap beracun yang dilepaskan melalui vent darurat atau katup pengaman sebelum mencapai atmosfer.' },
  QUENCH:{ code: 'QNC',  name: 'Sistem Quench/Injeksi Inhibitor', cat: 'mitigate', cost: 4, color: C_DB, pfd: 0.1, itpm: 'QNCH',
           desc: 'Menghentikan reaksi runaway dengan menyuntikkan inhibitor atau pelarut dingin ke dalam reaktor.' },
  ALARM: { code: 'ALM',  name: 'Alarm Umum dan Rencana Tanggap Darurat', cat: 'mitigate', cost: 1, color: C_BK, pfd: 0.1, itpm: 'DRILL', kit: ALL_KITS,
           desc: 'Sirene, titik kumpul, dan prosedur evakuasi untuk melindungi pekerja dan masyarakat sekitar.' },
  SPK:   { code: 'SPK',  name: 'Sistem Sprinkler Otomatis', cat: 'mitigate', cost: 3, color: C_LB, pfd: 0.05, itpm: 'FIRE', kit: ['bess', 'debu', 'gedung'],
           desc: 'Kepala sprinkler pecah pada suhu tertentu dan menyemprotkan air untuk mengendalikan atau memadamkan api pada tahap awal. Pada kebakaran baterai litium, air juga mendinginkan modul di sekitarnya agar thermal runaway tidak merambat (SNI 03-3989-2000, NFPA 13, NFPA 855).' },
  HYD:   { code: 'HYD',  name: 'Hidran Gedung dan Pipa Tegak (Standpipe)', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'FIRE', kit: ['gedung'],
           desc: 'Kotak hidran dengan selang di setiap lantai yang terhubung ke pipa tegak dan pompa kebakaran, digunakan oleh penghuni terlatih dan petugas pemadam (SNI 03-1745-2000).' },
  GAS:   { code: 'GAS',  name: 'Sistem Pemadam Gas Bersih (FM-200/IG-541)', cat: 'mitigate', cost: 3, color: C_LB, pfd: 0.05, itpm: 'CLEAN', kit: ['trafo', 'bess', 'gedung'],
           desc: 'Gas pemadam yang tidak menghantarkan listrik dan tidak meninggalkan residu, efektif untuk ruang tertutup berisi panel listrik. Gas ini tidak mendinginkan, sehingga tidak menghentikan thermal runaway berantai pada baterai litium (NFPA 2001).' },
  WETC:  { code: 'WETC', name: 'Sistem Pemadam Hood Dapur (Wet Chemical)', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'KITCH', kit: ['gedung'],
           desc: 'Nozel di hood dan ducting yang menyemprotkan bahan kimia basah saat suhu tinggi terdeteksi, membentuk lapisan sabun di permukaan minyak panas sekaligus menutup suplai gas ke kompor (NFPA 17A, NFPA 96).' },
  APAR:  { code: 'APAR', name: 'Alat Pemadam Api Ringan (APAR) sesuai Kelas Kebakaran', cat: 'mitigate', cost: 1, color: C_LB, pfd: 0.1, itpm: 'EXTG', kit: ['amp', 'biogas', 'debu', 'gedung'],
           desc: 'Pemadam portabel untuk api tahap awal. Jenis dan jarak penempatannya disesuaikan dengan kelas kebakaran (A, B, C, atau K). APAR wajib dipasang dan diperiksa secara berkala menurut Permenakertrans No. Per.04/MEN/1980.' },
  SD:    { code: 'SD',   name: 'Detektor Asap dan Panas dengan Panel Alarm Kebakaran', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'SMKD', kit: ['trafo', 'bess', 'gedung'],
           desc: 'Detektor asap dan panas otomatis yang terhubung ke panel alarm kebakaran (MCFA), membunyikan alarm, dan memicu sistem pemadam serta pengendalian asap (SNI 03-3985-2000, Permenaker No. Per.02/MEN/1983).' },
  PRES:  { code: 'PRES', name: 'Kipas Presurisasi Tangga dan Exhaust Asap', cat: 'mitigate', cost: 3, color: C_DB, pfd: 0.1, itpm: 'VENT', kit: ['gedung'],
           desc: 'Menjaga tangga darurat bertekanan positif dan membuang asap dari koridor saat kebakaran, sehingga jalur evakuasi tetap bebas asap.' },
  SHAFT: { code: 'SHFT', name: 'Shaft dan Kompartemen Tahan Api 2 Jam', cat: 'mitigate', cost: 2, color: C_BK, pfd: 0.01, itpm: 'FRWL', kit: ['gedung'],
           desc: 'Selubung dinding tahan api untuk ducting dapur dan bukaan antarlantai, sehingga api dan asap tidak merambat vertikal ke lantai lain.' },
  FWALL: { code: 'FWL',  name: 'Dinding Tahan Api (Firewall) Antarperalatan', cat: 'mitigate', cost: 3, color: C_BK, pfd: 0.01, itpm: 'FRWL', kit: ['trafo', 'bess'],
           desc: 'Dinding beton tahan api di antara trafo atau kontainer baterai yang berdekatan, mencegah kebakaran satu unit merambat ke unit lain (NFPA 850, NFPA 855).' },
  OPIT:  { code: 'PIT',  name: 'Bak Penampung Minyak dengan Lapisan Kerikil', cat: 'mitigate', cost: 2, color: C_BK, pfd: 0.01, itpm: 'PASSIVE', kit: ['trafo'],
           desc: 'Bak di bawah trafo yang menampung seluruh volume minyak. Lapisan kerikil memadamkan minyak menyala yang jatuh dan membatasi luas genangan api.' },
  NIFPS: { code: 'NIFP', name: 'Nitrogen Injection Fire Prevention (NIFPS)', cat: 'mitigate', cost: 4, color: C_DB, pfd: 0.1, itpm: 'INRT', kit: ['trafo'],
           desc: 'Saat gangguan internal terdeteksi, sistem membuang sebagian minyak dari atas tangki, menutup katup konservator, dan menginjeksikan nitrogen untuk mengaduk dan mendinginkan minyak, mencegah tangki meledak dan terbakar.' },
  OGD:   { code: 'OGD',  name: 'Detektor Off-Gas Baterai (H2/CO)', cat: 'mitigate', cost: 2, color: C_LB, pfd: 0.1, itpm: 'DET', kit: ['bess'],
           desc: 'Mendeteksi gas yang keluar dari sel saat elektrolit menguap atau terurai, sering kali sebelum asap terlihat, lalu memutus rak, menyalakan ventilasi exhaust, dan memberi alarm.' },
  DVENT: { code: 'DVNT', name: 'Panel Venting Ledakan (Deflagration Vent)', cat: 'mitigate', cost: 3, color: C_BK, pfd: 0.01, itpm: 'DVNT', kit: ['bess', 'debu'],
           desc: 'Panel yang membuka pada tekanan rendah dan mengarahkan bola api ledakan ke area aman, sehingga kontainer atau peralatan tidak pecah dan melontarkan pecahan (NFPA 68).' },
  EXV:   { code: 'EXV',  name: 'Ventilasi Exhaust Darurat (aktif oleh detektor gas)', cat: 'mitigate', cost: 2, color: C_DB, pfd: 0.1, itpm: 'VENT', kit: ['bess', 'amonia'],
           desc: 'Kipas exhaust berkapasitas besar yang otomatis menyala saat detektor gas aktif, menjaga konsentrasi gas tetap di bawah batas mudah terbakar atau batas paparan (NFPA 69, IIAR 2).' },
  EISO:  { code: 'EISO', name: 'Katup Isolasi Ledakan di Ducting (Flap/Valve)', cat: 'mitigate', cost: 2, color: C_DB, pfd: 0.1, itpm: 'EXPL', kit: ['debu'],
           desc: 'Menutup ducting dalam hitungan milidetik saat ledakan terjadi, sehingga nyala ledakan tidak merambat dari dust collector ke ruang produksi dan memicu ledakan sekunder (NFPA 69).' },
  SUPP:  { code: 'SUPP', name: 'Sistem Supresi Ledakan Kimia (HRD)', cat: 'mitigate', cost: 4, color: C_DB, pfd: 0.1, itpm: 'EXPL', kit: ['debu'],
           desc: 'Sensor tekanan mendeteksi awal ledakan dan tabung bertekanan menyemprotkan serbuk pemadam dalam hitungan milidetik, sehingga ledakan padam sebelum tekanannya merusak peralatan.' },
  INERT: { code: 'INRT', name: 'Sistem Inerting (Uap/CO2/N2)', cat: 'mitigate', cost: 3, color: C_DB, pfd: 0.1, itpm: 'INRT', kit: ['boiler', 'debu'],
           desc: 'Menginjeksikan uap air, CO2, atau nitrogen ke mill, bunker, atau silo saat pembaraan terdeteksi, menurunkan kadar oksigen di bawah batas yang dibutuhkan untuk kebakaran dan ledakan debu.' },
  WCUR:  { code: 'WCUR', name: 'Tirai Semprot Air (Water Curtain) Penyerap Amonia', cat: 'mitigate', cost: 3, color: C_LB, pfd: 0.1, itpm: 'FIRE', kit: ['amonia'],
           desc: 'Semprotan air berbentuk tirai di sekitar sumber pelepasan. Amonia sangat mudah larut dalam air sehingga konsentrasi awan gas yang menyebar ke area kerja dan permukiman berkurang.' },
  SCBA:  { code: 'SCBA', name: 'Alat Bantu Napas (SCBA) dan Detektor Gas Personal', cat: 'mitigate', cost: 1, color: C_BK, pfd: 0.1, itpm: 'RESP', kit: ['biogas', 'amonia'],
           desc: 'Alat pelindung pernapasan mandiri dan detektor gas yang dikenakan pekerja untuk evakuasi dan penyelamatan di area beracun. Efektif hanya bila pekerja terlatih dan alat selalu siap pakai.' },
};

/* ---------------------------------------------------------------------
   Model biaya indikatif. Biaya perangkat dan program disimpan dalam
   satuan anggaran agar penilaian tidak bergantung pada kurs. Satu satuan
   setara USD 25.000 yang mencakup pengadaan, pemasangan, dan rekayasa;
   untuk kontrol escalation factor (inspeksi, pengujian, dan perawatan), satu satuan mewakili biaya
   pelaksanaan selama satu siklus 5 tahun. Angka ini kasar, hanya untuk
   pelatihan, dan bukan acuan pengadaan. Kurs dapat diubah pemain di
   layar Pengaturan.
   --------------------------------------------------------------------- */
const COST_MODEL = { usdPerUnit: 25000, idrPerUsd: 16000 };

/* Faktor penurunan keandalan barier yang tidak diuji. Tanpa pengujian
   berkala, kegagalan tersembunyi (dangerous undetected) menumpuk dan
   PFDavg yang mendekati lambda_DU x interval uji / 2 terus naik. */
const UNTESTED_FACTOR = 10;

/* ---------------------------------------------------------------------
   Escalation factor (EF) dan kontrolnya. Mengikuti CCPS & Energy
   Institute (2018), Bow Ties in Risk Management: escalation factor
   adalah kondisi yang melemahkan atau menggagalkan barier, misalnya
   sensor yang menyimpang atau katup yang lengket, sedangkan kontrolnya
   berupa inspeksi, pengujian, dan perawatan preventif (ITPM) yang
   menemukan kegagalan tersembunyi sebelum barier dibutuhkan.
   Nama konstanta ITPM dan kunci itpm dipertahankan agar data simpanan
   permainan tetap terbaca.
   ef     : escalation factor yang ditangani.
   name   : kontrol escalation factor.
   target 'device'    : diterapkan pada perangkat barier terpasang.
   target 'equipment' : diterapkan pada peralatan proses (Tahap 3).
   fits / fitsEq      : perangkat atau jenis peralatan yang sesuai.
   grp    : keluarga barier, dipakai untuk mengelompokkan Kotak Alat.
   Semua EF tahap yang sama tampil di setiap skenario, termasuk yang
   tidak cocok dengan peralatan di skenario tersebut, sehingga pemain
   harus menilai sendiri escalation factor yang relevan.
   --------------------------------------------------------------------- */
const ITPM = {
  /* ------- Tahap 3: barier pencegahan ------- */
  CAL:     { code: 'KAL', stage: 3, cost: 1, target: 'device', grp: 'Instrumen dan Alarm', fits: ['PT', 'LT', 'TT', 'FT'],
             ef: 'Transmitter menyimpang (drift) dan alarm gagal berbunyi',
             name: 'Kalibrasi transmitter dan uji fungsi alarm',
             desc: 'Transmitter yang menyimpang dapat membaca normal saat proses sebenarnya abnormal, dan alarm yang tidak pernah diuji dapat gagal berbunyi atau tenggelam dalam banjir alarm. Kontrolnya adalah kalibrasi berkala, uji fungsi alarm pada set point, dan pengelolaan alarm menurut ANSI/ISA-18.2.' },
  ANZ:     { code: 'ANZ', stage: 3, cost: 1, target: 'device', grp: 'Instrumen dan Alarm', fits: ['COD'],
             ef: 'Sel sensor analyzer menua dan sistem sampel tersumbat',
             name: 'Kalibrasi analyzer gas dengan gas standar (zero dan span)',
             desc: 'Sel sensor analyzer CO atau O2 menua, terkontaminasi, atau filter sampelnya tersumbat debu sehingga kenaikan gas terlambat terbaca. Kontrolnya adalah kalibrasi zero dan span dengan gas standar, pemeriksaan sistem sampel, dan penggantian sel sesuai umur pakai.' },
  SIF:     { code: 'PRF', stage: 3, cost: 1, target: 'device', grp: 'Trip Otomatis dan Interlock', fits: ['SIS', 'LSHH', 'LSLL', 'TSHH', 'FSLL', 'AGI', 'DFI', 'BAM', 'FIG', 'O2T', 'HPCO', 'DEFI', 'GSO'],
             ef: 'Kegagalan tersembunyi pada sensor, logic solver, atau elemen akhir trip',
             name: 'Proof test SIF dan interlock',
             desc: 'Kegagalan berbahaya yang tidak terdeteksi, misalnya sensor macet, relai logika rusak, atau katup trip lengket, baru terungkap saat trip dibutuhkan. Kontrolnya adalah proof test berkala seluruh rangkaian dari sensor hingga elemen akhir. Interval proof test menentukan PFDavg sesuai IEC 61511.' },
  BURN:    { code: 'BRN', stage: 3, cost: 1, target: 'device', grp: 'Trip Otomatis dan Interlock', fits: ['BMS'],
             ef: 'Flame scanner keliru membaca nyala atau katup bahan bakar bocor',
             name: 'Uji flame scanner, kebocoran katup bahan bakar, dan urutan purge',
             desc: 'Flame scanner yang kotor atau salah arah dapat melihat nyala burner lain atau dinding yang berpijar, sedangkan katup bahan bakar ganda yang bocor membiarkan bahan bakar menumpuk di ruang bakar. Kontrolnya adalah uji fungsi flame scanner, uji kebocoran katup bahan bakar, dan uji urutan purge sesuai NFPA 85 dan NFPA 86.' },
  LWCT:    { code: 'LWC', stage: 3, cost: 1, target: 'device', grp: 'Trip Otomatis dan Interlock', fits: ['LWCO'],
             ef: 'Ruang pelampung LWCO tersumbat kerak dan lumpur',
             name: 'Blowdown kolom LWCO dan uji trip level rendah',
             desc: 'Kerak dan lumpur dari air ketel dapat menahan pelampung atau elektroda LWCO sehingga trip tidak terjadi saat air drum turun. Kontrolnya adalah blowdown kolom pelampung secara rutin oleh operator pesawat uap, uji trip dengan menurunkan level secara terkendali, dan pemeriksaan bagian dalam saat pemeriksaan berkala ketel.' },
  BATT:    { code: 'BMV', stage: 3, cost: 1, target: 'device', grp: 'Trip Otomatis dan Interlock', fits: ['BMSB'],
             ef: 'Sensor sel baterai menyimpang dan kontaktor rak lengket',
             name: 'Uji fungsi BMS: validasi sensor sel dan uji buka kontaktor',
             desc: 'Sensor tegangan dan suhu sel yang menyimpang membuat BMS terlambat memutus, sedangkan kontaktor rak yang lengket tidak membuka saat diperintah. Kontrolnya adalah validasi pembacaan sensor dengan alat ukur acuan, uji perintah buka kontaktor, dan peninjauan log alarm BMS (NFPA 855).' },
  SPARK:   { code: 'SPD', stage: 3, cost: 1, target: 'device', grp: 'Trip Otomatis dan Interlock', fits: ['SDE'],
             ef: 'Lensa detektor percikan kotor dan nozel kabut tersumbat',
             name: 'Uji detektor percikan dan uji semprot nozel pemadam',
             desc: 'Debu yang menempel pada lensa detektor inframerah menurunkan kepekaan, sedangkan nozel kabut air yang tersumbat tidak memadamkan bara di ducting. Kontrolnya adalah pembersihan lensa, uji detektor dengan sumber uji, dan uji semprot nozel secara berkala (NFPA 69).' },
  RELIEF:  { code: 'UJR', stage: 3, cost: 1, target: 'device', grp: 'Pelepas Tekanan', fits: ['PSV', 'PVRV'],
             ef: 'Katup pengaman lengket, set point bergeser, atau saluran masuk tersumbat',
             name: 'Uji bangku dan sertifikasi ulang katup pengaman',
             desc: 'Korosi, endapan, dan polimer dapat membuat PSV atau katup tekanan-vakum lengket atau membuka di atas set point. Kontrolnya adalah pelepasan, uji bangku (pop test), perbaikan, dan sertifikasi ulang secara berkala, serta pemeriksaan saluran masuk dan keluar. Praktik ini mengacu pada API RP 576 dan ketentuan pemeriksaan keselamatan peralatan.' },
  RDISC:   { code: 'RDP', stage: 3, cost: 1, target: 'device', grp: 'Pelepas Tekanan', fits: ['RD'],
             ef: 'Rupture disc menipis karena korosi atau kelelahan, atau terpasang terbalik',
             name: 'Inspeksi holder dan penggantian rupture disc terjadwal',
             desc: 'Rupture disc tidak dapat diuji tanpa merusaknya. Korosi dan siklus tekanan menurunkan tekanan pecahnya, sedangkan disc yang terpasang terbalik pecah jauh di atas tekanan desain. Kontrolnya adalah inspeksi holder dan arah pemasangan, serta penggantian sesuai interval pabrikan (API RP 576).' },
  MECH:    { code: 'MEK', stage: 3, cost: 1, target: 'device', grp: 'Perangkat Mekanis', fits: ['NRV', 'EFV', 'BRK'],
             ef: 'Katup mekanis bocor balik atau gagal menutup',
             name: 'Uji kebocoran balik dan uji fungsi penutupan katup mekanis',
             desc: 'Dudukan check valve yang aus atau tersangkut kotoran membiarkan aliran balik, excess flow valve dapat macet terbuka, dan breakaway coupling yang aus tidak menutup saat terlepas. Kontrolnya adalah uji kebocoran balik, uji fungsi penutupan, dan penggantian komponen aus sesuai jadwal pabrikan.' },
  BOND:    { code: 'GRD', stage: 3, cost: 1, target: 'device', grp: 'Perangkat Mekanis', fits: ['GRND'],
             ef: 'Tahanan grounding naik dan klem interlock rusak',
             name: 'Uji tahanan grounding dan bonding serta uji interlock klem',
             desc: 'Korosi sambungan, kabel bonding yang putus, atau klem yang aus membuat muatan statis tidak tersalur, dan interlock tidak lagi mendeteksi klem yang terpasang. Kontrolnya adalah pengukuran tahanan grounding dan bonding secara berkala serta uji fungsi interlock klem (Permenaker No. 12 Tahun 2015).' },
  ELEM:    { code: 'ELM', stage: 3, cost: 1, target: 'device', grp: 'Perangkat Mekanis', fits: ['FARR', 'GRF', 'MAG'],
             ef: 'Elemen penahan tersumbat atau jenuh (flame arrester, filter, magnet)',
             name: 'Pembersihan dan inspeksi elemen penahan terjadwal',
             desc: 'Elemen flame arrester dapat tersumbat atau rusak sehingga nyala lolos, filter lemak menjadi jenuh, dan permukaan magnet tertutup serpihan logam sehingga daya tangkapnya turun. Kontrolnya adalah pembersihan dan inspeksi elemen dengan frekuensi yang disesuaikan dengan tingkat kotoran.' },
  UTIL:    { code: 'UTL', stage: 3, cost: 1, target: 'device', grp: 'Perangkat Mekanis', fits: ['N2', 'HVR'],
             ef: 'Pasokan pendukung gagal: nitrogen habis atau unit cadangan tidak mengambil alih',
             name: 'Uji pergantian otomatis dan pemeriksaan pasokan utilitas',
             desc: 'Barier yang bergantung pada utilitas gagal tanpa terlihat bila pasokan nitrogen habis, regulator macet, atau unit HVAC cadangan tidak menyala saat unit utama berhenti. Kontrolnya adalah pemantauan pasokan, uji regulator, dan uji pergantian otomatis secara berkala.' },
  RELAY:   { code: 'RLY', stage: 3, cost: 1, target: 'device', grp: 'Proteksi Listrik', fits: ['DIFR', 'OCR', 'ARC'],
             ef: 'Setelan relai bergeser dan pemutus lambat membuka',
             name: 'Uji injeksi sekunder relai dan uji waktu buka pemutus',
             desc: 'Setelan yang berubah, catu daya DC yang melemah, atau mekanisme pemutus yang kering pelumas membuat gangguan terlambat diputus. Kontrolnya adalah uji injeksi sekunder relai, uji koordinasi setelan, dan uji waktu buka pemutus. Kegiatan ini merupakan bagian dari sistem manajemen keselamatan ketenagalistrikan menurut Permen ESDM No. 10 Tahun 2021.' },
  TRAFO:   { code: 'TRP', stage: 3, cost: 1, target: 'device', grp: 'Proteksi Listrik', fits: ['BUCH', 'WTI', 'PRD'],
             ef: 'Kontak proteksi mekanis trafo macet dan indikator suhu menyimpang',
             name: 'Uji fungsi proteksi mekanis trafo (Buchholz, WTI/OTI, PRD)',
             desc: 'Kontak relai Buchholz dapat macet atau kabelnya putus, termometer belitan menyimpang, dan pressure relief device trafo lengket karena cat atau korosi. Kontrolnya adalah uji injeksi udara pada relai Buchholz, kalibrasi WTI dan OTI, serta uji fungsi PRD dan kontak alarmnya saat pemeliharaan trafo.' },
  /* ------- Tahap 3: integritas peralatan proses ------- */
  VESSEL:  { code: 'BTK', stage: 3, cost: 2, target: 'equipment', grp: 'Integritas Peralatan', fitsEq: ['vessel', 'reactor', 'tank', 'truck', 'hx', 'column', 'heater'],
             ef: 'Korosi, penipisan dinding, dan retak pada bejana atau tangki',
             name: 'Pemeriksaan dan pengujian bejana tekan atau tangki',
             desc: 'Pemeriksaan visual, pengukuran ketebalan dinding dengan ultrasonik, dan uji hidrostatik berkala untuk mendeteksi korosi dan retak sebelum terjadi kebocoran. Pemeriksaan ini diwajibkan oleh Permenaker No. 37 Tahun 2016, sedangkan praktik teknisnya mengacu pada API 510 dan API 653.' },
  ROT:     { code: 'VIB', stage: 3, cost: 1, target: 'equipment', grp: 'Integritas Peralatan', fitsEq: ['pump', 'compressor', 'motor', 'fan', 'generator', 'turbine', 'mill', 'elevator', 'drum', 'cooler', 'conveyor'],
             ef: 'Keausan bantalan, ketidakseimbangan, dan seal mesin berputar bocor',
             name: 'Pemantauan getaran dan perawatan prediktif',
             desc: 'Pemantauan getaran dan suhu bantalan, inspeksi seal mekanis, serta analisis tren untuk mendeteksi kerusakan mesin berputar sebelum seal bocor atau mesin terlalu panas. Praktik ini mengacu pada ISO 20816.' },
  ELEC:    { code: 'LIS', stage: 3, cost: 2, target: 'equipment', grp: 'Integritas Peralatan', fitsEq: ['transformer', 'panel', 'battery'],
             ef: 'Degradasi isolasi, sambungan kendur, dan mutu minyak trafo menurun',
             name: 'Pemeliharaan prediktif peralatan listrik',
             desc: 'Uji DGA dan kualitas minyak trafo, uji tahanan isolasi, termografi inframerah pada sambungan dan busbar, serta pemeriksaan kapasitas dan keseimbangan sel baterai. Kegiatan ini mengacu pada Permenaker No. 12 Tahun 2015 tentang K3 Listrik dan Permen ESDM No. 10 Tahun 2021.' },
  KETEL:   { code: 'KTL', stage: 3, cost: 2, target: 'equipment', grp: 'Integritas Peralatan', fitsEq: ['furnace'],
             ef: 'Penipisan dan kerak pada pipa dinding air ketel',
             name: 'Pemeriksaan dan pengujian pesawat uap',
             desc: 'Pemeriksaan bagian dalam dan luar ketel, pengukuran ketebalan pipa dinding air, uji hidrostatik, serta uji fungsi katup pengaman dan gelas penduga oleh ahli K3 pesawat uap. Pemeriksaan ini diwajibkan oleh Undang-Undang Uap 1930 dan Peraturan Uap 1930.' },
  DUCT:    { code: 'HDC', stage: 3, cost: 1, target: 'equipment', grp: 'Integritas Peralatan', fitsEq: ['hood'],
             ef: 'Endapan lemak menumpuk di hood dan ducting dapur',
             name: 'Pembersihan dan inspeksi hood serta ducting dapur',
             desc: 'Pembersihan endapan lemak pada hood, filter, dan ducting exhaust secara berkala dengan frekuensi sesuai volume memasak, serta inspeksi kebocoran dan akses pembersihan ducting (NFPA 96).' },
  VALVE:   { code: 'KTP', stage: 3, cost: 1, target: 'equipment', grp: 'Integritas Peralatan', fitsEq: ['valve'],
             ef: 'Katup lengket, bocor melalui dudukan, atau aktuatornya bocor',
             name: 'Uji langkah katup dan perawatan aktuator',
             desc: 'Katup kendali dan katup manual dapat lengket karena endapan, bocor melalui dudukan, atau aktuatornya bocor udara sehingga tidak mengikuti perintah. Kontrolnya adalah uji langkah (stroke test), pemeriksaan posisioner, dan perawatan aktuator terjadwal.' },
  PIPE:    { code: 'PIP', stage: 3, cost: 1, target: 'equipment', grp: 'Integritas Peralatan', fitsEq: ['manifold'],
             ef: 'Erosi dan korosi pada manifold dan perpipaan',
             name: 'Pengukuran ketebalan dan inspeksi perpipaan',
             desc: 'Pasir dari sumur dan aliran berkecepatan tinggi mengikis dinding manifold, terutama pada belokan dan sambungan, sedangkan air terproduksi memicu korosi internal. Kontrolnya adalah pengukuran ketebalan dengan ultrasonik pada titik pemantauan dan inspeksi berkala menurut API 570.' },
  FLARE:   { code: 'FLR', stage: 3, cost: 1, target: 'equipment', grp: 'Integritas Peralatan', fitsEq: ['flare'],
             ef: 'Pilot flare padam dan ujung flare rusak',
             name: 'Inspeksi sistem flare dan uji penyalaan pilot',
             desc: 'Pilot yang padam, saluran pilot yang tersumbat, atau ujung flare yang rusak membuat gas pelepasan tidak terbakar sempurna. Kontrolnya adalah pemantauan nyala pilot, uji sistem penyalaan, dan inspeksi ujung flare saat unit berhenti.' },
  SILO:    { code: 'SLO', stage: 3, cost: 1, target: 'equipment', grp: 'Integritas Peralatan', fitsEq: ['silo'],
             ef: 'Material menggantung dan endapan lama menumpuk di dinding silo',
             name: 'Inspeksi dan pembersihan silo terjadwal',
             desc: 'Material yang menggantung (bridging) dan endapan lama di dinding silo dapat memanas sendiri, mengeras, atau runtuh tiba-tiba. Kontrolnya adalah inspeksi dinding dan pembersihan terjadwal dengan prosedur masuk ruang terbatas.' },
  FILTER:  { code: 'FLT', stage: 3, cost: 1, target: 'equipment', grp: 'Integritas Peralatan', fitsEq: ['filter'],
             ef: 'Kantong filter sobek atau tersumbat dan debu menumpuk di housing',
             name: 'Inspeksi kantong filter dan pemantauan tekanan diferensial',
             desc: 'Kantong filter yang sobek melepas debu ke lingkungan, sedangkan kantong yang tersumbat menaikkan tekanan diferensial dan menumpuk debu halus di dalam housing. Kontrolnya adalah pemantauan tekanan diferensial, inspeksi kantong, dan pembersihan housing secara terjadwal (NFPA 652).' },
  /* ------- Tahap 4: barier mitigasi ------- */
  DET:     { code: 'BMP', stage: 4, cost: 1, target: 'device', grp: 'Deteksi', fits: ['GD', 'OGD'],
             ef: 'Sensor detektor gas jenuh, teracuni, atau kedaluwarsa',
             name: 'Bump test dan kalibrasi detektor gas',
             desc: 'Sensor katalitik dapat teracuni silikon atau H2S, sedangkan sensor elektrokimia mengering dan kehilangan kepekaan tanpa tanda dari luar. Kontrolnya adalah bump test dan kalibrasi berkala dengan gas uji, serta penggantian sensor sesuai umur pakai (IEC 60079-29-2).' },
  FLMD:    { code: 'FDT', stage: 4, cost: 1, target: 'device', grp: 'Deteksi', fits: ['FD'],
             ef: 'Jendela detektor api kotor atau pandangannya terhalang',
             name: 'Uji detektor api dengan lampu uji dan pembersihan jendela optik',
             desc: 'Jendela optik detektor api yang tertutup minyak, debu, atau uap garam menurunkan jangkauan deteksi, dan perubahan tata letak dapat menghalangi pandangan detektor. Kontrolnya adalah uji fungsi dengan lampu uji, pembersihan jendela optik, dan peninjauan cakupan deteksi.' },
  SMKD:    { code: 'SDT', stage: 4, cost: 1, target: 'device', grp: 'Deteksi', fits: ['SD'],
             ef: 'Detektor asap dan panas berdebu atau panel alarm dalam kondisi gangguan',
             name: 'Uji detektor asap dan panas serta uji panel alarm kebakaran',
             desc: 'Debu dan serangga di ruang detektor menurunkan kepekaan atau memicu alarm palsu, lalu zona yang sering berbunyi palsu cenderung dinonaktifkan. Kontrolnya adalah uji detektor dengan aerosol atau sumber panas uji, pembersihan, dan uji fungsi panel alarm (SNI 03-3985-2000 dan Permenaker No. Per.02/MEN/1983).' },
  FIRE:    { code: 'FPS', stage: 4, cost: 1, target: 'device', grp: 'Proteksi Kebakaran Aktif', fits: ['DELUGE', 'FW', 'SPK', 'HYD', 'WCUR'],
             ef: 'Pompa kebakaran gagal start, katup tertutup, atau nozel tersumbat',
             name: 'Inspeksi dan uji sistem pemadam berbasis air',
             desc: 'Sistem pemadam berbasis air gagal bila pompa kebakaran tidak start, katup pengendali tertutup tanpa diketahui, atau nozel dan kepala sprinkler tersumbat kerak. Kontrolnya adalah uji aliran sprinkler dan deluge, uji jalan pompa kebakaran, pemeriksaan posisi katup, dan pemeriksaan nozel menurut NFPA 25.' },
  FOAMQ:   { code: 'BSA', stage: 4, cost: 1, target: 'device', grp: 'Proteksi Kebakaran Aktif', fits: ['FOAM'],
             ef: 'Konsentrat busa terdegradasi dan proporsioner menyimpang',
             name: 'Uji mutu konsentrat busa dan uji proporsioner',
             desc: 'Konsentrat busa dapat terdegradasi atau terkontaminasi selama penyimpanan, dan proporsioner yang menyimpang menghasilkan larutan busa terlalu encer untuk menutup permukaan cairan yang terbakar. Kontrolnya adalah uji mutu konsentrat tahunan, uji proporsi larutan busa, dan pemeriksaan pembangkit busa.' },
  CLEAN:   { code: 'GSB', stage: 4, cost: 1, target: 'device', grp: 'Proteksi Kebakaran Aktif', fits: ['GAS'],
             ef: 'Tabung gas pemadam kehilangan isi dan ruang tidak lagi kedap',
             name: 'Penimbangan tabung dan uji integritas ruang (door fan test)',
             desc: 'Kebocoran lambat mengurangi isi tabung, sedangkan lubang kabel baru pada dinding atau plafon membuat gas pemadam cepat keluar sebelum konsentrasi padam tercapai. Kontrolnya adalah penimbangan atau pemeriksaan tekanan tabung secara berkala dan uji integritas ruang (NFPA 2001).' },
  KITCH:   { code: 'WCH', stage: 4, cost: 1, target: 'device', grp: 'Proteksi Kebakaran Aktif', fits: ['WETC'],
             ef: 'Nozel hood tersumbat lemak dan tabung wet chemical kosong',
             name: 'Inspeksi sistem pemadam hood dapur setiap enam bulan',
             desc: 'Lemak dapat menutup nozel pemadam di hood dan ducting, segel tabung dapat rusak, dan katup penutup gas otomatis dapat macet. Kontrolnya adalah inspeksi dan servis sistem pemadam hood setiap enam bulan oleh petugas kompeten (NFPA 17A, NFPA 96).' },
  EXTG:    { code: 'APR', stage: 4, cost: 1, target: 'device', grp: 'Proteksi Kebakaran Aktif', fits: ['APAR'],
             ef: 'APAR kehilangan tekanan, kedaluwarsa, atau tidak sesuai kelas kebakaran',
             name: 'Pemeriksaan APAR berkala (minimal dua kali setahun)',
             desc: 'APAR yang kehilangan tekanan, isinya menggumpal, terhalang barang, atau tidak sesuai kelas kebakaran tidak dapat dipakai saat api masih kecil. Kontrolnya adalah pemeriksaan berkala minimal dua kali setahun dan penempatan sesuai kelas kebakaran (Permenakertrans No. Per.04/MEN/1980).' },
  EMER:    { code: 'UFD', stage: 4, cost: 1, target: 'device', grp: 'Isolasi dan Sistem Darurat', fits: ['ESD', 'BDV', 'EIV'],
             ef: 'Katup darurat lambat menutup atau logika ESD gagal',
             name: 'Uji fungsi ESD dan partial stroke test katup darurat',
             desc: 'Katup darurat yang jarang bergerak dapat lengket atau menutup lebih lambat dari waktu yang diasumsikan, dan logika ESD dapat rusak tanpa terdeteksi. Kontrolnya adalah uji fungsi logika ESD, partial dan full stroke test, serta pengukuran waktu tutup katup.' },
  QNCH:    { code: 'SQN', stage: 4, cost: 1, target: 'device', grp: 'Isolasi dan Sistem Darurat', fits: ['SCRUB', 'QUENCH'],
             ef: 'Sirkulasi scrubber atau injeksi quench gagal karena pompa, nozel, atau bahan habis',
             name: 'Uji sirkulasi scrubber dan uji injeksi quench',
             desc: 'Pompa sirkulasi yang macet, nozel yang tersumbat, atau larutan penetral dan inhibitor yang habis atau kedaluwarsa membuat sistem darurat ini tidak bekerja saat dibutuhkan. Kontrolnya adalah uji sirkulasi berkala, pemeriksaan konsentrasi larutan, dan uji injeksi quench.' },
  INRT:    { code: 'INR', stage: 4, cost: 1, target: 'device', grp: 'Isolasi dan Sistem Darurat', fits: ['INERT', 'NIFPS'],
             ef: 'Pasokan gas inert habis atau katup injeksi macet',
             name: 'Uji injeksi gas inert dan pemeriksaan tekanan tabung',
             desc: 'Tabung nitrogen atau CO2 yang bocor perlahan, uap yang tidak tersedia saat dibutuhkan, atau katup injeksi yang macet membuat sistem inerting gagal. Kontrolnya adalah pemeriksaan tekanan tabung, uji injeksi berkala, dan uji fungsi katup serta logika pemicunya.' },
  VENT:    { code: 'VNT', stage: 4, cost: 1, target: 'device', grp: 'Isolasi dan Sistem Darurat', fits: ['PRES', 'EXV'],
             ef: 'Kipas darurat gagal start atau damper macet',
             name: 'Uji fungsi kipas presurisasi dan ventilasi exhaust darurat',
             desc: 'Kipas darurat yang jarang dijalankan dapat gagal start, sabuknya kendur, atau dampernya macet sehingga asap dan gas tidak terbuang. Kontrolnya adalah uji jalan berkala, pengukuran tekanan atau laju aliran, dan uji pemicuan otomatis dari detektor.' },
  EXPL:    { code: 'LDK', stage: 4, cost: 1, target: 'device', grp: 'Isolasi dan Sistem Darurat', fits: ['SUPP', 'EISO'],
             ef: 'Sensor tekanan ledakan atau aktuator penahan ledakan gagal',
             name: 'Inspeksi dan uji sistem supresi serta isolasi ledakan',
             desc: 'Sensor tekanan yang tertutup debu, tabung supresi yang kehilangan tekanan, atau katup isolasi yang macet membuat ledakan tidak tertahan. Kontrolnya adalah inspeksi dan uji berkala oleh petugas kompeten, termasuk pemeriksaan tekanan tabung dan kebersihan sensor (NFPA 69).' },
  PASSIVE: { code: 'PSF', stage: 4, cost: 1, target: 'device', grp: 'Barier Pasif', fits: ['DIKE', 'OPIT'],
             ef: 'Tanggul atau bak penampung retak, atau katup drain dibiarkan terbuka',
             name: 'Inspeksi tanggul, bak penampung, dan katup drain',
             desc: 'Tanggul yang retak atau katup drain yang dibiarkan terbuka setelah membuang air hujan membuat tumpahan mengalir keluar dari area penampungan. Kontrolnya adalah inspeksi retak dan kebocoran, penguncian katup drain dalam posisi normal tertutup, dan pembersihan kerikil pada bak penampung minyak.' },
  FRWL:    { code: 'FRW', stage: 4, cost: 1, target: 'device', grp: 'Barier Pasif', fits: ['SHAFT', 'FWALL'],
             ef: 'Selubung tahan api berlubang akibat penetrasi kabel atau pipa tanpa penyekat',
             name: 'Inspeksi integritas dinding dan selubung tahan api',
             desc: 'Penetrasi kabel atau pipa baru yang tidak ditutup penyekat tahan api, serta pintu tahan api yang diganjal terbuka, membuat api dan asap merambat ke kompartemen lain. Kontrolnya adalah inspeksi integritas dinding dan selubung tahan api secara berkala dan setiap selesai pekerjaan modifikasi.' },
  DVNT:    { code: 'DVP', stage: 4, cost: 1, target: 'device', grp: 'Barier Pasif', fits: ['DVENT'],
             ef: 'Panel venting ledakan tertahan, berkarat, atau terhalang',
             name: 'Inspeksi panel venting ledakan dan area pelepasannya',
             desc: 'Panel venting yang dicat, berkarat, ditahan baut tambahan, atau terhalang barang di depannya tidak membuka pada tekanan yang dirancang. Kontrolnya adalah inspeksi berkala panel, penahan, dan area pelepasan yang harus bebas dari orang dan barang (NFPA 68).' },
  DRILL:   { code: 'DRL', stage: 4, cost: 1, target: 'device', grp: 'Tanggap Darurat', fits: ['ALARM'],
             ef: 'Sirene tidak terdengar dan personel tidak terlatih evakuasi',
             name: 'Uji sirene dan latihan tanggap darurat berkala',
             desc: 'Sirene yang rusak atau tidak terdengar di area bising dan personel yang tidak pernah berlatih membuat evakuasi terlambat dan kacau. Kontrolnya adalah uji sirene berkala, simulasi evakuasi, dan latihan gabungan dengan tim pemadam. PP No. 50 Tahun 2012 mensyaratkan prosedur keadaan darurat diuji secara berkala.' },
  RESP:    { code: 'SCB', stage: 4, cost: 1, target: 'device', grp: 'Tanggap Darurat', fits: ['SCBA'],
             ef: 'Tabung SCBA kosong dan detektor gas personal tidak terkalibrasi',
             name: 'Pemeriksaan SCBA, bump test detektor personal, dan latihan pemakaian',
             desc: 'Tabung SCBA yang tekanannya turun, masker yang rusak, dan detektor gas personal yang tidak terkalibrasi baru diketahui saat keadaan darurat. Kontrolnya adalah pemeriksaan SCBA berkala, bump test detektor personal sebelum dipakai, dan latihan pemakaian.' },
};

/* Nama jenis peralatan untuk keterangan escalation factor peralatan. */
const EQ_TYPE_NAMES = {
  vessel: 'bejana tekan', reactor: 'reaktor', tank: 'tangki', truck: 'truk tangki', hx: 'penukar panas', column: 'kolom', heater: 'pemanas oli termal',
  pump: 'pompa', compressor: 'kompresor', motor: 'motor/agitator', fan: 'kipas/blower', generator: 'generator', turbine: 'turbin', mill: 'mill/penggiling',
  elevator: 'bucket elevator', drum: 'drum pengering', cooler: 'kondensor/unit HVAC', conveyor: 'konveyor',
  transformer: 'transformator', panel: 'panel listrik', battery: 'kontainer baterai', furnace: 'ketel uap', hood: 'hood dapur',
  valve: 'katup', manifold: 'manifold perpipaan', flare: 'flare', silo: 'silo', filter: 'dust collector atau filter',
};

const PARAMS = {
  P: 'Tekanan', L: 'Level', T: 'Suhu', F: 'Aliran', C: 'Komposisi/Reaksi', E: 'Listrik (Arus/Tegangan)',
};
/* Guideword HAZOP mengikuti tujuh guideword asli dan maknanya pada CCPS (2008),
   Guidelines for Hazard Evaluation Procedures edisi ketiga, sejalan dengan IEC 61882.
   Urutan objek menentukan urutan pilihan di formulir laporan. */
const GUIDEWORDS = {
  none: 'Tidak ada (No)',
  high: 'Lebih (More)',
  low: 'Kurang (Less)',
  aswell: 'Serta (As well as)',
  partof: 'Sebagian (Part of)',
  reverse: 'Kebalikan (Reverse)',
  other: 'Selain (Other than)',
};
const GUIDE_INFO = {
  none: 'Negasi tujuan desain: fungsi, aliran, atau reaksi yang dimaksud tidak terjadi sama sekali.',
  high: 'Kenaikan kuantitatif: nilai parameter melebihi tujuan desain, misalnya tekanan, suhu, level, aliran, atau arus lebih besar.',
  low: 'Penurunan kuantitatif: nilai parameter di bawah tujuan desain.',
  aswell: 'Kenaikan kualitatif: tujuan desain tercapai, tetapi disertai sesuatu yang tidak dikehendaki, misalnya kontaminan, fasa tambahan, atau material asing.',
  partof: 'Penurunan kualitatif: hanya sebagian tujuan desain tercapai, misalnya salah satu komponen atau tahapan tidak ada.',
  reverse: 'Kebalikan logis dari tujuan desain, misalnya aliran balik atau proses berjalan ke arah sebaliknya.',
  other: 'Substitusi menyeluruh: yang terjadi sama sekali berbeda dari tujuan desain, misalnya material salah, operasi yang tidak semestinya, atau arus melalui jalur yang tidak dirancang.',
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
  { key: 'migas', name: 'Minyak dan Gas Bumi' },
  { key: 'petrokimia', name: 'Petrokimia' },
  { key: 'listrik', name: 'Ketenagalistrikan' },
  { key: 'ebt', name: 'Energi Baru Terbarukan' },
  { key: 'manufaktur', name: 'Manufaktur' },
  { key: 'properti', name: 'Properti dan Konstruksi EPC' },
];

/* ---------------------------------------------------------------------
   Kasus faktor manusia pada Tahap 2. Satu kejadian per skenario dipicu
   tindakan manusia dan disampaikan melalui obrolan antartim bergaya komik.
   Semua tokoh adalah fiksi.
   team : ops = operasi, mtc = maintenance, mgmt = pengawas, hse = HSE,
          ktr = kontraktor, ext = pihak luar.
   hat  : helmet, cap, hijab, hair, short (penutup kepala atau rambut pada avatar).
   --------------------------------------------------------------------- */
const TEAMS = {
  ops: { name: 'Tim Operasi', color: '#1565a6' },
  mtc: { name: 'Tim Pemeliharaan', color: '#00838f' },
  mgmt: { name: 'Pengawas', color: '#455a64' },
  hse: { name: 'Tim HSE', color: '#2e7d32' },
  ktr: { name: 'Kontraktor', color: '#e65100' },
  ext: { name: 'Pihak Luar', color: '#6d4c41' },
};
const CAST = {
  raka:   { name: 'Raka',   role: 'Operator Panel',            team: 'ops',  hat: 'short',  helmet: '#2b2622', suit: '#0d47a1', skin: '#e9b98f', headset: true },
  dimas:  { name: 'Dimas',  role: 'Operator Lapangan',         team: 'ops',  hat: 'helmet', helmet: '#fdd835', suit: '#1565c0', skin: '#c68d62' },
  tono:   { name: 'Tono',   role: 'Asisten Lapangan',          team: 'ops',  hat: 'helmet', helmet: '#fdd835', suit: '#5c6bc0', skin: '#a8714a' },
  joko:   { name: 'Joko',   role: 'Teknisi Mekanik',           team: 'mtc',  hat: 'helmet', helmet: '#1e88e5', suit: '#37474f', skin: '#b67b52' },
  wawan:  { name: 'Wawan',  role: 'Teknisi Instrumen dan Listrik', team: 'mtc', hat: 'helmet', helmet: '#1e88e5', suit: '#455a64', skin: '#dba67a' },
  rudi:   { name: 'Rudi',   role: 'Teknisi Gedung',            team: 'mtc',  hat: 'cap',    helmet: '#0277bd', suit: '#0277bd', skin: '#c99068' },
  hendra: { name: 'Hendra', role: 'Supervisor Shift',          team: 'mgmt', hat: 'helmet', helmet: '#fafafa', suit: '#546e7a', skin: '#e0ae85', glasses: true },
  sari:   { name: 'Sari',   role: 'Petugas HSE',               team: 'hse',  hat: 'hijab',  helmet: '#43a047', suit: '#2e7d32', skin: '#e3b089', scarf: '#26a69a' },
  bayu:   { name: 'Bayu',   role: 'Kontraktor',                team: 'ktr',  hat: 'helmet', helmet: '#fb8c00', suit: '#6d4c41', skin: '#b5784c' },
  agus:   { name: 'Agus',   role: 'Sopir Truk Tangki',         team: 'ext',  hat: 'cap',    helmet: '#757575', suit: '#8d6e63', skin: '#a66b42' },
  lina:   { name: 'Lina',   role: 'Manajer Restoran (Penyewa)', team: 'ext',  hat: 'hair',   helmet: '#4e342e', suit: '#ad1457', skin: '#eac09a' },
  yanto:  { name: 'Yanto',  role: 'Petugas Keamanan',          team: 'ext',  hat: 'cap',    helmet: '#283593', suit: '#283593', skin: '#be8459' },
};
/* Klasifikasi kesalahan manusia mengikuti Reason (1990) dan HSE UK HSG48 (1999). */
const HF_TYPES = {
  slip: { name: 'Slip', desc: 'Tindakan tidak sesuai niat, misalnya salah memilih katup atau tombol yang mirip.' },
  lapse: { name: 'Lapse', desc: 'Lupa melakukan langkah yang seharusnya, misalnya lupa memasang kembali atau menutup kembali.' },
  mistake: { name: 'Mistake', desc: 'Keputusan keliru karena salah memahami situasi atau kurang pengetahuan, walaupun tindakannya sesuai niat.' },
  violation: { name: 'Violation', desc: 'Sengaja menyimpang dari aturan atau prosedur yang diketahui, misalnya demi mengejar waktu atau target.' },
};

/* Skenario didefinisikan di js/scenarios/*.js dan ditambahkan ke sini. */
const SCENARIOS = [];


const STAGES = [
  { n: 1, short: 'Kondisi Normal', title: 'Tahap 1: Identifikasi Kondisi Normal', icon: 'book',
    desc: 'Pelajari setiap peralatan, jalankan proses produksi, dan pahami bagaimana proses dijaga pada kondisi normal.' },
  { n: 2, short: 'Abnormalitas', title: 'Tahap 2: Identifikasi Abnormalitas', icon: 'alert',
    desc: 'Jalankan proses produksi, amati tren dan peringatan lapangan saat terjadi kegagalan, lalu tentukan deviasi, penyebab, dan konsekuensinya dengan pendekatan HAZOP.' },
  { n: 3, short: 'Barier Pencegahan', title: 'Tahap 3: Barier Pencegahan', icon: 'shield',
    desc: 'Pasang instrumen deteksi dan proteksi untuk mencegah abnormalitas berkembang menjadi kehilangan kontainmen, lalu kendalikan escalation factor, yaitu kondisi yang dapat melumpuhkan barier dan peralatan tanpa terlihat.' },
  { n: 4, short: 'Barier Mitigasi', title: 'Tahap 4: Barier Mitigasi', icon: 'fire',
    desc: 'Pasang perangkat untuk mencegah eskalasi insiden menjadi bencana, yaitu deteksi, isolasi, proteksi kebakaran, dan tanggap darurat, lengkap dengan pengendalian escalation factor-nya.' },
];
