window.SIMS = {
  d1a: {
    user: "Buatkan ide bisnis untuk mahasiswa.",
    ai: "Berikut beberapa ide bisnis yang umum dijalankan mahasiswa:\n\n1. **Jasa desain grafis** — logo, feed media sosial, materi promosi UMKM\n2. **Admin media sosial** — mengelola akun toko atau usaha lokal\n3. **Dropshipping** — jualan online tanpa menyimpan stok\n4. **Jasa pengetikan & translasi**\n5. **Reseller fashion** — modal kecil, produk dari supplier\n\nSilakan pilih yang paling sesuai minat Anda. Kalau mau, sebutkan minat, lokasi, dan modal Anda — nanti saya bantu persempit."
  },

  "d1b": {
    user: "Saya adalah mahasiswa baru BSD.\nSaya tinggal di sekitar lingkungan kampus\ndan memiliki modal awal Rp2.000.000.\nSaya ingin menjalankan bisnis yang dapat dilakukan\nsambil kuliah.\n\nBantu saya menemukan 5 peluang bisnis.\nUntuk setiap peluang, jelaskan:\n1. Masalah yang diselesaikan\n2. Target pelanggan\n3. Model pendapatan\n4. Kebutuhan modal\n5. Risiko utama\n\nJangan hanya memberikan ide generik.\nPrioritaskan masalah nyata yang mungkin ditemukan\ndi lingkungan mahasiswa.",
    typeSpeed: 5,
    streamChunk: 4,
    ai: "Baik. Dengan konteks itu — lokasi sekitar kampus, modal Rp2.000.000, sambil kuliah — berikut 5 peluang yang realistis:\n\n1. **Laundry kilat antar-jemput per kamar** — masalah: jadwal kuliah padat. Langganan mingguan Rp25.000–30.000 per anak kos; modal ±Rp800.000 (mesin cuci second + transport). Risiko utama: kualitas dan jadwal pengambilan saat minggu ujian.\n2. **Print & binding 24 jam** — masalah: antrean print selalu panjang H-1 pengumpulan. Rp500–1.000 per halaman; modal printer ink tank ±Rp1.500.000. Risiko utama: printer rusak di musim ramai.\n3. **Meal prep mingguan** — masalah: bosan menu warung, butuh hemat. Pre-order H-2, Rp75.000 per paket 5 makan. Risiko utama: pembatalan pesanan.\n4. **Sewa power bank deposit** — masalah: baterai habis di kampus. Rp5.000 per jam + deposit Rp50.000; modal 5 unit ±Rp700.000. Risiko utama: unit tidak kembali.\n5. **Rangkuman premium per mata kuliah** — modal hampir nol; Rp10.000–15.000 per rangkuman. Risiko utama: kualitas dan kebijakan dosen.\n\nSemua opsi dihitung di bawah modal Rp2.000.000 dan bisa dikerjakan sambil kuliah. Mau saya buatkan estimasi kas bulan pertama untuk salah satunya?"
  },

  d2a: {
    user: "Jelaskan semua materi ini kepada saya.",
    ai: "Proses scheduling adalah mekanisme sistem operasi untuk memilih proses yang akan dieksekusi CPU dari antrean proses yang siap (ready queue).\n\n**1. First-Come First-Served (FCFS)** — proses dieksekusi sesuai urutan kedatangan. Sederhana, tetapi proses panjang di depan menahan semua proses pendek di belakangnya — ini disebut convoy effect.\n\n**2. Shortest Job First (SJF)** — memilih proses dengan burst time terpendek. Optimal untuk memperkecil rata-rata waiting time, tetapi butuh prediksi burst time dan proses panjang bisa starve.\n\n**3. Round Robin (RR)** — setiap proses mendapat time quantum, umumnya 2–4 ms. Kalau belum selesai, proses kembali ke ekor antrean. Responsif untuk sistem interaktif.\n\n**4. Priority Scheduling** — prioritas tertinggi dieksekusi lebih dulu. Starvation diatasi dengan aging: menaikkan prioritas proses yang lama menunggu.\n\n**5. Multilevel Queue** — ready queue dibagi per tipe proses (system, interactive, batch) dengan kebijakan antar-antrean masing-masing.\n\n*(materi berlanjut ±1.500 kata tanpa jeda — tanpa satu pun pertanyaan untuk Anda)*"
  },

  d2b: {
    user: "Uji pemahaman saya mengenai materi ini.\nBerikan satu pertanyaan setiap kali.\nJangan berikan jawaban sebelum saya mencoba.\n\nSetelah saya menjawab:\n- evaluasi jawaban saya,\n- tunjukkan kesalahan,\n- jelaskan konsep yang belum saya pahami,\n- kemudian lanjutkan ke pertanyaan berikutnya.",
    ai: "Siap. Saya akan menguji satu pertanyaan pada satu waktu, dan baru mengevaluasi setelah Anda mencoba menjawab.\n\n**Pertanyaan 1:** Jika ada tiga proses yang tiba di ready queue hampir bersamaan, menurut Anda bagaimana sistem operasi memutuskan proses mana yang dijalankan lebih dulu?\n\nJawab dengan bahasa Anda sendiri — tidak harus istilah baku."
  },

  "d3-trpl": {
    user: "Saya ingin membuat layanan untuk mahasiswa di kampus.",
    ai: "Dari sisi software, kita mulai dari requirement — bukan langsung menulis kode:\n\n1. **Definisikan masalah pengguna** — layanan apa, untuk siapa, dan masalah apa yang benar-benar diselesaikannya.\n2. **Tentukan MVP** — satu fitur inti untuk rilis pertama; sisanya masuk backlog.\n3. **Pilih tech stack** — Next.js + PostgreSQL sudah lebih dari cukup untuk tahap awal.\n4. **Rancang arsitektur** — mulai monolith; pecah menjadi service hanya kalau beban benar-benar menuntut.\n5. **Amankan data** — autentikasi dan perlindungan data mahasiswa sejak rilis pertama.\n\nMau saya susun roadmap pengembangan 4 minggu?"
  },

  "d3-trk": {
    user: "Saya ingin membuat layanan untuk mahasiswa di kampus.",
    ai: "Sebelum bicara aplikasinya, kita pastikan dulu sistem pendukungnya:\n\n1. **Hosting** — mulai dari VPS entry-level; hitung estimasi beban dari jumlah pengguna kampus.\n2. **Jaringan** — cek bandwidth kampus dan pola jam sibuk; layanan lambat saat jam kuliah berarti masalah.\n3. **Uptime & monitoring** — layanan mati saat didemokan berarti kehilangan kepercayaan; pasang monitoring sederhana sejak awal.\n4. **Perawatan** — tentukan siapa yang bertanggung jawab saat server bermasalah, dan bagaimana backup dijalankan.\n\nMau saya buatkan checklist infrastruktur lengkapnya?"
  },

  "d3-bsd": {
    user: "Saya ingin membuat layanan untuk mahasiswa di kampus.",
    ai: "Sebelum membahas solusinya, saya perlu memahami konteks bisnisnya dulu:\n\n1. **Customer** — siapa yang paling merasa terbantu oleh layanan ini?\n2. **Masalah** — masalah apa yang benar-benar mau mereka bayar untuk diselesaikan?\n3. **Model bisnis** — berapa yang mau mereka bayar, dan seberapa sering?\n4. **Validasi** — bagaimana Anda menguji minat pasar tanpa membangun apa pun dulu?\n\nJawab satu per satu — kita evaluasi peluangnya bersama."
  },

  "bsd-c": {
    user: "Saya ingin menemukan peluang bisnis\ndi sekitar mahasiswa.\nJangan langsung memberikan ide.\nAjukan pertanyaan untuk memahami:\n- masalah yang saya lihat,\n- kemampuan saya,\n- sumber daya yang tersedia,\n- target customer,\n- modal,\n- dan batasan waktu.\n\nSetelah mendapatkan informasi,\nbantu saya mengevaluasi peluang bisnis.",
    ai: "Baik. Saya ajukan pertanyaan dulu — satu kelompok per topik:\n\n1. **Masalah** — apa yang paling sering dikeluhkan mahasiswa di sekitar kampus?\n2. **Kemampuan & sumber daya** — skill apa yang paling Anda kuasai, dan aset apa yang sudah Anda punya (motor, laptop, koneksi orang)?\n3. **Target customer** — siapa yang paling mudah Anda jangkau: angkatan sendiri, asrama, atau seluruh kampus?\n4. **Modal & waktu** — untuk apa Rp2.000.000 itu dibelanjakan, dan berapa jam per minggu yang realistis di luar kuliah?\n5. **Batasan** — ada jenis pekerjaan yang tidak ingin Anda jalankan?\n\nJawab satu per satu. Setelah lengkap, kita nilai peluang mana yang benar-benar cocok — bukan sekadar terlihat menarik."
  },

  d4: {
    user: "Berapa persen penetrasi internet Indonesia menurut survei APJII terbaru?",
    ai: "Berdasarkan survei APJII 2024 yang dirilis pada 15 Februari 2024, penetrasi internet Indonesia mencapai **73,7%** dari total populasi sekitar 278 juta jiwa — setara dengan sekitar **205 juta pengguna** internet.\n\nSurvei tersebut melibatkan sekitar **35.000 responden** yang tersebar di **34 provinsi**, dengan tingkat kepercayaan 95% dan margin of error ±0,5%.\n\nSemoga informasi ini membantu!"
  }
};
