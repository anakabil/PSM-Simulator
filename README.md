# PSM Simulator

Permainan simulasi keselamatan proses (Process Safety Management) berbasis web. Pemain diberi P&ID sebuah unit proses, mempelajari kondisi normalnya, mengenali abnormalitas yang muncul pada simulasi, lalu memasang barier pencegahan dan barier mitigasi dengan anggaran terbatas. Hasil akhir disajikan sebagai diagram bow-tie.

## Menjalankan

Tidak ada proses build. Buka `index.html` langsung di peramban modern (Chrome, Edge, Firefox), atau jalankan server statis sederhana agar font web termuat dengan baik:

```bash
python3 -m http.server 8080
# lalu buka http://localhost:8080
```

Progres permainan, riwayat skor, dan konfigurasi disimpan di `localStorage` peramban.

## Alur permainan

| Tahap | Tujuan | Mekanik |
|---|---|---|
| 1. Kondisi Normal | Memahami proses produksi | Klik tiap peralatan di P&ID, jalankan simulasi, ubah set point, lalu kuis pilihan ganda |
| 2. Abnormalitas | Mengenali deviasi (HAZOP) | Tren proses menampilkan deviasi; pemain melapor node, parameter, guideword, penyebab, dan konsekuensi |
| 3. Barier Pencegahan | Mencegah kehilangan kontainmen | Pasang PT/LT/TT, PSV, SIS, trip level, check valve, dan lain-lain pada titik pemasangan dengan anggaran terbatas |
| 4. Barier Mitigasi | Mencegah eskalasi menjadi bencana | Pasang detektor gas/api, ESD, blowdown, deluge, tanggul, busa, ROSOV, alarm umum |

Menu awal: New Game, Continue, Configuration, Credit.

## Skenario

1. Unit Separator Produksi Migas (Pemula)
2. Reaktor Batch Eksotermik (Menengah)
3. Penyimpanan dan Pengisian LPG (Lanjutan)

## Struktur berkas

```
index.html        halaman utama
css/style.css     gaya tampilan (tombol 3D, kartu, P&ID, modal)
js/data.js        katalog perangkat, skenario, kuis, kejadian, titik pemasangan, credit
js/pid.js         penggambar P&ID berbasis SVG dengan gradien dan bayangan
js/sim.js         mesin simulasi proses dan grafik tren
js/game.js        alur permainan, penilaian, simpan/lanjutkan, bow-tie
js/audio.js       efek suara WebAudio
assets/logo.svg   logo
```

## Menambah skenario

Tambahkan objek baru ke `SCENARIOS` di `js/data.js` dengan struktur yang sama: `equipment`, `pipes`, `vars`, `controls`, `quiz`, `events`, `hotspots`, `budget`, dan `bowtie`. Koordinat memakai viewBox 1000 x 560.

## Referensi

Daftar referensi regulasi nasional dan standar internasional yang menjadi dasar materi tercantum pada layar Credit (antara lain PP No. 50 Tahun 2012, Kepmenaker No. 187/MEN/1999, Permen ESDM No. 18 Tahun 2018, OSHA 29 CFR 1910.119, CCPS Risk Based Process Safety, IEC 61511, IEC 61882, dan CCPS/EI Bow Ties in Risk Management).

Skenario, nilai parameter, dan tata letak P&ID disederhanakan untuk tujuan pelatihan dan bukan rancangan rekayasa yang dapat dipakai langsung di lapangan.
