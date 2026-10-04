


## SKPL-PRINGMONI-V1.0

## DOKUMEN
## SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK

## PRINGMONI

## Untuk:
## Muhamad Ulin Nuha
(Resto & Cafe PringSewu Osing)


Disusun oleh:
## Faizatul Izzah     362458302002
## Muhammad Pandiyani    362458302005
## Kevin Maulana Atmaja   362458302011
## Melandri Fadillah Simanjuntak  362458302113
## Maulana Akbar Farhansyah    362458302114





## PROGRAM STUDI TEKNOLOGI REKAYASA PERANGKAT LUNAK
## JURUSAN BISNIS DAN INFORMATIKA
## POLITEKNIK NEGERI BANYUWANGI







## QUARTA CODE
## Nomor Dokumen Halaman
## SKPL-PRINGMONI-V1.0

## Revisi
## {kode
revisi}




## DAFTAR PERUBAHAN

## Revisi Deskripsi
A Pembuatan draf awal dokumen Spesifikasi Kebutuhan Perangkat
Lunak (SKPL) PRINGMONI V1.0.


B Penambahan rincian kebutuhan fungsional dan non-fungsional sistem
(PM-FR dan PM-NFR) serta pendefinisian aktor utama.
C Perbaikan dan penyesuaian  alur use case serta diagram aktivitas
untuk modul pemesanan dan pengelolaan menu.
D Koreksi total pada skenario UC.08 (Memvalidasi Pembayaran) dan
UC.09 (Membatalkan Pesanan) agar deskripsi serta alurnya tidak
tertukar, lengkap dengan integrasi aturan refund dan otorisasi Owner.
E Penyesuaian kode requirement (PM-FR) pada bab analisis skenario
use case dan diagram aktivitas.
## F
## G



## INDEX
## TGL
## - A B C D E F G
Ditulis oleh

## Diperiksa
oleh

## Disetujui
oleh




## DAFTAR HALAMAN PERUBAHAN

## Halaman Revisi Halaman Revisi
## 1
## 2
## 3
## 4-5
## 6-8
## 9-13
## A, B
## A, C
## B
## B, C
## C, D
## C, D
## 14
## 15-20
## 21-35
## 36-50
## -
## -
## C, D
## D, E
## E
## -
## -
## -



## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 3 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## DAFTAR ISI

- Pendahuluan.................................................................................................................................4
1.1. Latar Belakang Pengembangan.............................................................................................4
1.2. Tujuan Pengembangan..........................................................................................................4
1.3. Definisi, Istilah, dan Singkatan.............................................................................................5
1.4. Referensi...............................................................................................................................5
- Kebutuhan Perangkat Lunak.....................................................................................................6
2.1. Gambaran dan Deskripsi Umum Perangkat Lunak...............................................................6
2.2. Fungsi Utama Perangkat Lunak............................................................................................7
2.3. Model Use Case....................................................................................................................9
2.3.1. Definisi Actor dan Karakteristik Pengguna.................................................................9
2.3.2. Definisi Use Case.........................................................................................................9
2.3.3. Diagram Use Case......................................................................................................14
- Model Analisis............................................................................................................................15
3.1. Skenario Use Case dan Diagram Activity...........................................................................15
3.2. Analisis Class dan Realisasi Use Case................................................................................36
- Model Perancangan...................................................................................................................50
4.1. Deskripsi Atribut dan Method Class...................................................................................50
4.2. Struktur Class dan Class Diagram.......................................................................................55
4.3. Interaksi Objek Perangkat Lunak dan Sequence Diagram..................................................56
4.4. Rancangan User Interface...................................................................................................65
4.5. Struktur Basis Data.............................................................................................................80
- Traceability Use Case.................................................................................................................81


## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 4 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## 1. Pendahuluan
## 1.1. Latar Belakang Pengembangan
Cafe dan Resto Pringsewu Osing merupakan salah satu destinasi kuliner di Rogojampi,
Banyuwangi, yang melayani berbagai segmen pelanggan, mulai dari keluarga, pasangan,
kelompok teman, hingga rombongan acara atau komunitas. Restoran ini menyediakan berbagai
pilihan area makan, seperti meja dan kursi untuk keluarga, pondok atau gazebo untuk suasana
yang lebih santai, serta area lesehan yang menggunakan meja tanpa kursi. Keberagaman fasilitas
tersebut menuntut pengelolaan operasional yang baik agar pelayanan kepada pelanggan dapat
berjalan secara optimal.
Dalam operasionalnya, proses pemesanan makanan dan minuman masih dilakukan secara manual,
baik melalui waiter maupun oleh pelanggan yang melakukan pemesanan langsung di kasir.
Pelanggan harus menunggu pelayan untuk memperoleh menu, menyampaikan pesanan, maupun
meminta informasi terkait status pesanan. Pada jam-jam sibuk, kondisi ini sering menimbulkan
antrean, keterlambatan pelayanan, serta meningkatkan risiko kesalahan pencatatan pesanan dan
nomor meja. Selain itu, proses pembayaran yang masih memerlukan verifikasi manual di kasir
dapat memperlambat transaksi dan berdampak pada kelancaran pelayanan restoran.
Berdasarkan permasalahan tersebut, diperlukan suatu sistem yang mampu mendukung digitalisasi
proses pemesanan, pemantauan operasional restoran, serta pengelolaan transaksi kasir yang dapat
menghitung total pembayaran dan kembalian pelanggan secara otomatis. Oleh karena itu,
dikembangkan aplikasi PRINGMONI berbasis QR Code yang memungkinkan pelanggan
melakukan pemesanan secara mandiri melalui perangkat mobile dengan memindai QR Code pada
meja. Sistem ini juga menyediakan fitur pemantauan pesanan secara real-time bagi owner, cashier,
dan waiter. Dengan demikian, kesalahan pencatatan dapat diminimalkan, alur pelayanan menjadi
lebih cepat, pengelolaan operasional lebih terstruktur, serta kualitas pengalaman pelanggan dapat
ditingkatkan.
## 1.2. Tujuan Pengembangan
Tujuan dari pengembangan perangkat lunak ini adalah:
- Mempermudah pelanggan dalam melakukan pemesanan makanan dan minuman secara
mandiri melalui QR Code.
- Mengurangi antrean dan waktu tunggu pelanggan pada proses pemesanan.
- Meminimalkan kesalahan pencatatan pesanan dan nomor meja melalui sistem digital
berbasis token.
- Mempermudah pemantauan status pesanan antar item secara langsung.
- Mendukung pengelolaan transaksi pembayaran tunai dan non-tunai (QRIS/Transfer)
dengan perhitungan total dan kembalian otomatis.
- Menyediakan laporan pendapatan, analitik menu, serta logging aktivitas untuk mendukung
operasional restoran yang terstruktur dan terdigitalisasi.


1.3. Definisi, Istilah, dan Singkatan


## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 5 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## Istilah / Singkatan Definisi
PRINGMONI Nama aplikasi yang dikembangkan untuk mendukung pemesanan
dan monitoring operasional Cafe dan Resto Pringsewu Osing.
Nomor Meja  Identitas unik yang digunakan untuk membedakan setiap meja
atau area pelanggan di restoran.
QR Code  Kode dua dimensi yang dapat dipindai menggunakan kamera
perangkat mobile untuk mengakses halaman pemesanan sesuai
meja pelanggan.
Self-Order  Metode pemesanan mandiri yang dilakukan pelanggan tanpa
bantuan waiter melalui sistem yang tersedia.
Real-Time  Kondisi ketika data pada sistem diperbarui dan ditampilkan secara
langsung setelah terjadi perubahan.

## 1.4. Referensi
Referensi yang digunakan sebagai acuan dalam penyusunan dokumen adalah sebagai berikut:
- Hasil wawancara dengan Owner Cafe dan Resto Pringsewu Osing mengenai kebutuhan
sistem.
Tersedia pada: link
- IEEE Std 830-1993, IEEE Recommended Practice for Software Requirements
## Specifications.










## 2. Kebutuhan Perangkat Lunak

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 6 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



2.1. Gambaran dan Deskripsi Umum Perangkat Lunak
PRINGMONI merupakan sistem pemesanan dan monitoring restoran berbasis QR Code
yang digunakan oleh Customer, Waiter, Cashier, dan Owner. Customer dapat melakukan
pemesanan secara mandiri melalui pemindaian QR Code pada meja. Data pesanan yang
dibuat pelanggan akan diproses oleh sistem dan dapat dipantau secara real-time oleh Waiter,
Cashier, dan Owner sesuai hak akses masing-masing.

Gambar 2.1 – Gambaran Umum Sistem PRINGMONI
Visualisasi pada Gambar 2.1 menegaskan pembagian peran pengguna dalam ekosistem
PRINGMONI. Akses pelanggan berpusat pada modul pemesanan berbasis kode respons
cepat (QR), sedangkan hak akses bagi pihak manajemen beserta staf (waiter dan kasir)
diarahkan pada kendali penuh terhadap manajemen menu, pemrosesan antrean hidangan,
hingga rekapitulasi pembayaran.


## 2.2. Fungsi Utama Perangkat Lunak


## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 7 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code

Kebutuhan Fungsional Kebutuhan Non-Fungsional



## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 8 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code

- (PM-FR-01) Sistem harus dapat
melakukan login dan logout dengan
akses berbasis role.
- (PM-NFR-01) Sistem harus
merespon request dalam waktu
kurang dari 5 detik.
- (PM-FR-02) Sistem harus dapat
mengelola akun user, termasuk
menambah, mengubah, dan
menghapus akun.
- (PM-NFR-02) Sistem harus mampu
menangani minimal 50 user aktif
secara bersamaan.
- (PM-FR-03) Sistem harus dapat
mengelola menu, termasuk
menambah, mengubah, menghapus,
dan mengatur ketersediaan menu.
- (PM-NFR-03) Sistem harus
melindungi data sensitif
menggunakan enkripsi atau hashing.
- (PM-FR-04) Sistem harus
menampilkan daftar menu dan
mengelompokkan berdasarkan
kategori.
- (PM-NFR-04) Sistem harus
menerapkan mekanisme rate limiting
dan throttling.
- (PM-FR-05) Sistem harus mengelola
data meja, termasuk menambah,
mengubah, menghapus, dan
mengatur ketersediaan meja.
- (PM-NFR-05) Sistem harus
memiliki uptime minimal 95% saat
jam operasional.
- (PM-FR-06) Sistem harus membuat
pesanan melalui pindai QR code atau
input oleh kasir.
- (PM-NFR-06) Sistem harus
melakukan backup data secara
otomatis berkala (harian dan
mingguan) serta menyimpan riwayat
backup untuk jangka waktu tertentu.
- (PM-FR-O7) Sistem harus dapat
mengelola item pesanan, termasuk
menambah, mengubah, dan
menghapus item.
-   (PM-NFR-07) Sistem harus
menjamin integritas data transaksi agar tidak
hilang saat terjadi gangguan (error) dan
menyediakan mekanisme pemulihan data
(data recovery) secara cepat hingga kondisi
stabil terakhir.
melakukan recovery jika terjadi error.



## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 9 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code

- (PM-FR-08) Sistem harus dapat
memproses pembatalan pesanan,
baik yang disertai dengan
pengembalian dana (refund) maupun
tanpa pengembalian dana.

- (PM-FR-09) Sistem harus
menghitung total harga pesanan
secara otomatis, termasuk
kembalian.

- (PM-FR-10) Sistem harus
memproses pembayaran secara tunai
atau nontunai.

- (PM-FR-11) Sistem harus mencetak
atau menampilkan struk pembayaran
dan menyimpan riwayat transaksi.

- (PM-FR-12) Sistem harus mencatat
log aktivitas pengguna dan sistem
secara otomatis.

- (PM-FR-13) Sistem harus
menampilkan laporan penjualan.

- (PM-FR-14) Sistem harus
mendukung pembaruan status
pesanan untuk alur pelayanan.

- (PM-FR-15) Sistem harus
menyediakan fitur lupa password
melalui verifikasi email.

- (PM-FR-16) Sistem harus
menyediakan fitur untuk melihat dan
mengunduh QR code meja.




## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 10 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code

- (PM-FR-17) Sistem harus
menyediakan fitur manajemen shift
kerja untuk pencatatan operasional.

- (PM-FR-18) Sistem harus
menyediakan fitur pengelolaan dan
pemrosesan dana refund yang
memerlukan konfirmasi.

- (PM-FR-19) Sistem dapat
memindahkan meja atau lokasi
pesanan yang sudah dipindai
sebelumnya.



## 2.3. Model Use Case
2.3.1. Definisi Actor dan Karakteristik Pengguna

## ACTOR KARAKTERISTIK PENGGUNA
Customer Melakukan pemesanan makanan melalui QR code pada meja
dan melihat status pesanan.
Owner Mengelola data sistem seperti menu, akun pengguna, meja,
memantau laporan penjualan, melihat aktivitas restoran, dan
mengawasi operasional sistem.
Kasir Mengelola transaksi pembayaran pelanggan, mencetak struk,
dan memvalidasi pembayaran pesanan.
Waiter Mengonfirmasi pesanan pelanggan, membantu pesanan, dan
memantau status pesanan.
## 2.3.2. Definisi Use Case
Analisis Hubungan Actor dan Use Case
Kebutuhan fungsional 1 : (PM-FR-01) Sistem harus dapat melakukan login dan
logout dengan akses berbasis role.
Use-Case  Actor Deskripsi Hubungan
UC.01 - login  cashier, waiter,
owner
Actor (Kasir, Pelayan, dan Pemilik)
memasukkan kredensial ke dalam sistem
untuk memverifikasi identitas dan
mendapatkan hak akses fitur sesuai peran
masing-masing.
Kebutuhan fungsional 2: (PM-FR-02) Sistem harus dapat mengelola akun user,
termasuk menambah, mengubah, dan menghapus akun.
Use-Case  Actor Deskripsi Hubungan
UC.02 - mengelola
akun
owner  Owner berinteraksi dengan sistem untuk
menambah data staf baru, memperbarui
informasi profil, atau menghapus hak akses
akun user staf restoran.
Kebutuhan fungsional 3: (PM-FR-03) Sistem harus dapat mengelola menu, termasuk
menambah, mengubah, menghapus, dan mengatur ketersediaan menu.
Use-Case  Actor Deskripsi Hubungan
UC.03 - mengelola
menu
owner  Owner mengelola data master item kuliner
di dalam database, seperti menambah menu

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 11 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



baru, memperbarui harga, menghapus item,
atau mengubah status ketersediaannya.
Kebutuhan fungsional 4: (PM-FR-04) Sistem harus menampilkan daftar menu dan
mengelompokkan berdasarkan kategori. .
Use-Case  Actor Deskripsi Hubungan
UC.04 - melihat
menu
customer  Customer mengakses dan melihat daftar
menu makanan dan minuman yang
ditampilkan terstruktur berdasarkan
kategori menu tertentu.
Kebutuhan fungsional 5: (PM-FR-05) Sistem harus mengelola data meja, termasuk
menambah, mengubah, menghapus, dan mengatur ketersediaan meja.
Use-Case  Actor Deskripsi Hubungan
UC.05 - mengelola
meja
owner Owner melakukan konfigurasi tata letak
meja fisik restoran, meliputi penambahan
nomor meja, perubahan status penggunaan,
atau penghapusan data meja.
Kebutuhan fungsional 6: (PM-FR-06) Sistem harus membuat pesanan melalui scan
QR atau input oleh kasir.
Use-Case  Actor Deskripsi Hubungan
UC.06 - membuat
pesanan
customer, cashier  Customer (melalui pemindaian kode QR
mandiri) atau Cashier (melalui input
langsung di sistem) memasukkan entri
pesanan baru ke dalam sistem.
UC.07 - memilih
meja
cashier  Sistem memetakan penempatan nomor
meja fisik pelanggan yang dipilih secara
terintegrasi saat proses pemesanan
berlangsung.

Kebutuhan fungsional 7: (PM-FR-O7) Sistem harus mengelola item pesanan,
termasuk menambah, mengubah, dan menghapus item. meja.
Use-Case  Actor Deskripsi Hubungan
UC.08 - membuat
pesanan
customer, cashier  Pengguna memanipulasi daftar item di
dalam keranjang belanjaan (menambah
porsi, atau menghapus item) sebelum
pesanan dikunci untuk diproses.
Kebutuhan fungsional 8: (PM-FR-08) Sistem harus dapat memproses pembatalan

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 12 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



pesanan, baik yang disertai dengan pengembalian dana (refund) maupun tanpa
pengembalian dana.
Use-Case  Actor Deskripsi Hubungan
## UC.9 -
membatalkan
pesanan
cashier, Owner Kasir membatalkan pesanan: pembatalan
setelah bayar memerlukan persetujuan
## Owner.
## UC.10 -
## Memproses
## Refund
Cashier, Owner Sistem memproses pengembalian dana
dengan konfirmasi Owner.
Kebutuhan fungsional 9: (PM-FR-09) Sistem harus menghitung total harga pesanan
secara otomatis, termasuk kembalian.
Use-Case  Actor Deskripsi Hubungan
## UC.11 -
Menghitung total
harga
customer, cashier  Sistem mengkalkulasi subtotal, total, dan
kembalian secara otomatis
Kebutuhan fungsional 10: (PM-FR-10) Sistem harus memproses pembayaran secara
tunai atau nontunai.
Use-Case  Actor Deskripsi Hubungan
## UC.12 -
melakukan
pembayaran
customer, cashier  Customer/Cashier memproses pembayaran
dengan metode tunai atau nontunai
(QRIS/Transfer).
## UC.13 -
## Pembayaran Tunai
customer, cashier  Turunan metode pembayaran menggunakan
uang fisik (seperti QRIS, atau transfer).
UC.14 - Non
## Tunai
customer, cashier  Turunan metode pembayaran transaksi
tanpa uang fisik (QRIS/Transfer).

Kebutuhan fungsional 11: (PM-FR-11) Sistem harus mencetak atau menampilkan
struk pembayaran dan menyimpan riwayat transaksi.
Use-Case  Actor Deskripsi Hubungan
## UC.15 -
## Menampilkan/
mencerak struk
cashier  Sistem menampilkan dan mencetak struk
serta menyimpan riwayat transaksi.
Kebutuhan fungsional 12: (PM-FR-12) Sistem harus mencatat log aktivitas pengguna
dan sistem secara otomatis.

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 13 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Use-Case  Actor Deskripsi Hubungan
UC.16 - melihat
log aktivitas
owner Owner memantau log aktivitas yang
direkam otomatis oleh sistem.
Kebutuhan fungsional 13: (PM-FR-13) Sistem harus menampilkan laporan penjualan.
Use-Case  Actor Deskripsi Hubungan
UC.17 - Melihar
laporan pejualan
Owner Owner melihat laporan pejualan, transaksi,
dan analitik menu.
Kebutuhan fungsional 14: (PM-FR-14) Sistem harus mendukung pembaruan status
pesanan untuk alur pelayanan.

Use-Case  Actor Deskripsi Hubungan
## UC.18 -
## Mengubah Status
## Pesanan
Waiter Waiter memperbarui status pesanan
(Diproses - Selesai) sesuai alur pelayanan.

Kebutuhan fungsional 15: (PM-FR-15) Sistem harus menyediakan fitur lupa password
melalui verifikasi email

Use-Case  Actor Deskripsi Hubungan
UC.19 - Lupa
password
## Owner, Cashier,
dan Waiter
Pengguna mereset password melalui
verifikasi email.

Kebutuhan fungsional 16: (PM-FR-16) Sistem harus menyediakan fitur untuk melihat
dan mengunduh QR code meja


Use-Case  Actor Deskripsi Hubungan
UC.20 - Melihat &
mengunduh QR
meja
Owner, Cashier Owner & Cashier melihat dan mengunduh
QR code meja.

Kebutuhan fungsional 17: (PM-FR-17) Sistem harus menyediakan fitur manajemen
shift kerja untuk pencatatan operasional

Use-Case  Actor Deskripsi Hubungan
UC.21 - Owner Owner mengelola jadwal shift kerja

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 14 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Mengelola shift
kerja
karyawan.

Kebutuhan fungsional 18: (PM-FR-18) Sistem harus menyediakan fitur pengelolaan
dan pemrosesan dana refund yang memerlukan konfirmasi

Use-Case  Actor Deskripsi Hubungan
## UC.22 -
Konfirmasi refund
Owner Owner mengonfirmasi pemrosesan dana
refund.

Kebutuhan fungsional 19: (PM-FR-19) Sistem dapat memindahkan meja atau lokasi
pesanan yang sudah dipindai sebelumnya

Use-Case  Actor Deskripsi Hubungan
UC.23 - Pindah
meja
Customer dan
## Cashier
Customer dan Cashier memindahkan meja
atau lokasi pesanan yang sudah dipindai
sebelumnya







## Analisis Hubungan Antar Use Case
## Use Case
## Utama
## Use Case
## Tambahan
## Jenis
## Hubungan
## Deskripsi Hubungan
## UC.06 -
membuat
pesanan
## UC.04 -
melihat menu
include Proses menampilkan menu
(melihat menu) merupakan
bagian mutlak yang harus
dipanggil saat membuat pesanan
dilakukan.
## UC.06 -
membuat
pesanan
## UC.08  -
mengelola item
pesa
extends Use-case memilih meja
memperluas fungsionalitas dasar
membuat pesanan pada kondisi

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 15 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



penentuan titik koordinat lokasi
meja pelanggan
## UC.06 -
membuat
pesanan
## UC.09 -
mengelola
sistem
include Pengelolaan item
(tambah/ubah/hapus) di keranjang
merupakan bagian mutlak dari
proses membuat pesanan.
## UC.07 -
membuat
pesanan
## UC.12 -
menghitung
total harga
include Perhitungan total harga otomatis
wajib dijalankan saat pesanan
dibuat.
## UC.13  -
melakukan
pembayaran
## UC.07 -
membuat
pesanan
include Alur melakukan pembayaran
mengharuskan adanya pesanan
yang sudah dibuat sebelumnya..
## UC.13  -
melakukan
pembayaran
## UC.12 -
menghitung
total harga
include Pembayaran memerlukan hasil
perhitungan total harga yang
sudah dihitung sistem.
## UC.13  -
melakukan
pembayaran
## UC.14 -
## Pembayaran
tunai
Generalization  Pembayaran tunai merupakan
salah satu bentuk turunan spesifik
dari induk use-case melakukan
pembayaran.
## UC.13  -
melakukan
pembayaran
## UC.15 -
pembayaran
non-tunai
Generalization Pembayaran non-tunai
merupakan salah satu bentuk
turunan spesifik dari induk
use-case melakukan pembayaran.
## UC.10 -
## Membatalkan
pesanan
## UC.07 -
membuat
pesanan
extends Kasir membatalkan pesanan yang
sudah dibuat (sebelum atau
sesudah bayar)
## UC.10 -
## Membatalkan
pesanan
## UC.11 -
## Memproses
refund
extends Pembatalan pesanan setelah bayar
memperluas fungsionalitas
dengan memicu proses refund.
## UC.11 -
## Memproses
refund
## UC.23 -
## Konfirmasi
refund
include Proses refund wajib melalui
konfirmasi owner sebelum dana
dikembalikan.
## UC.16 -
menampilkan/
mencetak
struk
## UC.13  -
melakukan
pembayaran
include Struk hanya dapat
ditampikan/dicetak setelah
pembayaran berhasil diproses.
## UC.24 -
pindah meja
## UC.07 -
membuat
pesanan
extends Waiter mengubah status pesanan
setelah pesanan dibuat.

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 16 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## UC.24 -
pindah meja
## UC.06 -
mengelola
meja
include Proses pindah meja memerlukan
validasi ketersediaan meja tujuan
## UC.03 -
mengelola
akun
UC.01 - Login include Fitur manipulasi data pengguna
hanya dapat diakses owner
setelah validasi login
## UC.04 -
mengelola
menu
UC.01 - Login include Pengelolaan katalog makanan dan
minuman menuntut owner berada
dalam sesi aktif yang
terverivikasi lewat fungsi login.
## UC.06 -
mengelola
meja
UC.01 - Login include Pengaturan ketersediaan meja
restoran menutut owner berada
dalam sesi aktif lewat fungsi
login.
## UC.10 -
membatalkan
pesanan
UC.01 - Login include Kasir diwajibkan melewati
validasi login terlebih dahulu
sebelum diberikan wewenang
membatalkan pesanan.
## UC.11 -
memproses
refund
UC.01 - Login include Proses refund memerlukan
autentikasi kasir/owner yang sah
## UC.13 -
melakukan
pembayaran
UC.01 - Login include Owner wajib terautentikasi
melalui login sebelum diizinkan
membuka data log aktivitas.
## UC.18 -
melihat
laporan
penjualan
UC.01 - Login include Owner wajibb teratentikasi
melalui login sebelum diizinkan
membuka data sensitif laporan
penjualan.
## UC.19 -
mengubah
status pesnan
UC.01 - Login include Waiter wajib lolos autentikasi
login terlebih dahulu untuk dapat
mengakses fitur pembaruan status
pesanan.
## UC.21 -
melihat &
mengunduh
QR meja
UC.01 - Login include Owner wajib login sebelum dapat
melihat dan mengunduh QR code
meja.
## UC.22 -
mengella shift
kerja
UC.01 - Login include Owner wajib login sebelum dapat
mengonfirmasi pemrosesan dana
refund.

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 17 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## UC.02 -
logout
UC.01 - Login include Logout hanya dapat dilakuka jika
pengguna berada dalam sesi login
yang aktif
UC.20 - lupa
password
UC.01 - Login extends Fitur lupa password memperlas
halaman login untuk kondisi
pengguna tidak dapat mengakses
akun.
## 2.3.3. Diagram Use Case

## Gambar 2.2 - Diagram Use Case
## 3. Model Analisis
3.1. Skenario Use Case dan Diagram Activity
## Role Owner, Cashier, Waiter
Nama use-case : Login
Deskripsi : Pengguna masuk ke dalam sistem dengan memasukkan username
dan password yang valid.
## Ketergantungan : -
Aktor : Owner, Cashier, Waiter (Customer tidak login
Prakondisi : Pengguna sudah memiliki akun yang terdaftar di sistem.
Paskakondisi : Pengguna berhasil masuk dan dapat mengakses fitur sesuai
perannya.
Skenario-Skenario:

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 18 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



A. Skenario Normal (SUC.01.01)
## Owner, Cashier, Waiter Sistem
- Membuka halaman menu

- Menampilkan halaman login
- Memasukkan username dan password 4. Memvalidasi data login
- Memilih salah satu menu

- Membuat sesi login pengguna

- Menampilkann dashboard sesuai
peran pengguna

B. Skenario-Skenario Alternatif
A1 – Memperbaiki data login (SUC.01.02)
## Owner, Cashier, Waiter Sistem
- Memasukkan username atau password
yang salah
- Menampilkan informasi kesalahan
pada data login
- Memperbaiki username atau password 4. Memproses kembali validasi data login
- mengirim data login 6. Memeriksa kesesuaian username dan
password

C. Skenario-Skenario Error
E1 – Username atau password salah (SUC.01.03)
## Owner, Cashier, Waiter Sistem
- Mengirim data login 2. Memvalidasi username dan password
- Mendeteksi pesan “Username atau
password salah”

E2 – Data login tidak lengkap (SUC.01.04)
## Owner, Cashier, Waiter Sistem
- Tidak mengisi username atau
password
- Memeriksa kelengkapan data login
- Mendeteksi username atau password
belum di isi
- Menampilkan pesan bahwa username
dan password harus diisi


Pemodelan Aktivitas Sistem (AD.01)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 19 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 3.1.1 - AD.01 Login


## Role Customer
Nama use-case : Melihat menu
Deskripsi : Customer melihat daftar menu yang tersedia di halaman menu
setelah memindai QR code di meja.
## Ketergantungan : -
## Aktor : Customer
Prakondisi : Customer sudah memindai QR code dan halaman menu terbuka.
Paskakondisi : Customer dapat melihat daftar menu dan mulai memilih item.
Skenario-Skenario:
A. Skenario Normal  (SUC.02.01)
## Customer Sistem
- Membuka halaman menu 2. Memuat data menu
- Memilih kategori menu 4. menampilkan daftar kategori menu
- Memilih salah satu menu 6. Menampilkan daftar menu sesuai
kategori
- Menampilkan detail menu


- memvalidasi pesanan



## N.  Skenario Alternatif
A1 – Memuat ulang data  menu (SUC.02.02)
## Customer Sistem

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 20 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Nama use-case : Melihat menu
Deskripsi : Customer melihat daftar menu yang tersedia di halaman menu
setelah memindai QR code di meja.
## Ketergantungan : -
## Aktor : Customer
- Sedang melihat daftar menu
- Meminta pembaruan data menu 3. Memuat ulang data menu
- Menampilkan menu terbaru dan
informasi ketersediaan
A2 – Pencarian menu berdasarkan kata kunci (SUC.02.03)
## Customer Sistem
- Memasukkan kata kunci pencarian  2. Menampilkan menu yang sesuai
dengan kata kunci
-  Jika tidak ditemukan, menampilkan
pesan menu tidak ditemukan

O. Skenario-Skenario Error
E1 – Gagal memuat data menu (SUC.02.04)
## Customer Sistem
- Membuka halaman menu 2. Gagal memuat data menu
- Menampilkan pesan gagal memuat
data menu
E2 – Menu tidak tersedia (SUC.02.05)
## Customer Sistem
- Membuka halaman detail menu 2. Memeriksa ketersediaan menu
- Menampilkan pesan menu tidak
tersedia

Pemodelan Aktivitas Sistem (AD.02)


## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 21 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Nama use-case : Melihat menu
Deskripsi : Customer melihat daftar menu yang tersedia di halaman menu
setelah memindai QR code di meja.
## Ketergantungan : -
## Aktor : Customer
Gambar 3.1.2 - AD.02 Melihat menu


Nama use-case : Membuat pesanan
Deskripsi : Proses customer atau cashier memilih menu dan menambahkannya
ke dalam pesanan.
## Ketergantungan : Melihat Menu (include), Memilih Meja (include)
## Aktor : Customer, Cashier
Prakondisi : Berhasil membuka halaman menu setelah memindai QR di meja
atau kasir membuka input pesanan.
Paskakondisi : Pesanan tersimpan di sistem dan tampil di keranjang.
Skenario-Skenario:
A.  Skenario Normal (SUC.3.01)
## Customer, Cashier Sistem
- Memilih menu 2. Menampilkan detail menu
- Menentukan jumlah pesanan 4. Menampilkan subtotal per item
- Menambahkan menu ke keranjang 6. Menyimpan item beserta jumlah ke
keranjang
- Melihat keranjang pesanan 8. Menampilkan daftar pesanan,
subtotal, dan total harga
- Memvalidasi pesanan
- . Memperbarui data pesanan secara
real-time

## B. Skenario Alternatif
A1 – Menambah lebih dari satu menu (SUC.03.02)
## Customer, Cashier Sistem
- Memilih menu lain 2. Menampilkan detail menu
- Menentukan jumlah pesanan 4. Menampilkan subtotal per item
- Menambahkan menu ke keranjang 6. Memperbarui daftar pesanan di
keranjang


A2 – Mengubah jumlah item pesanan (SUC.03.03)
## Customer, Cashier Sistem
- Mengubah jumlah item pada
keranjang
- Memperbarui jumlah item
- Menghitung ulang subtotal dan total
harga
-  Menampilkan informasi pesanan
terbaru

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 22 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Nama use-case : Membuat pesanan
Deskripsi : Proses customer atau cashier memilih menu dan menambahkannya
ke dalam pesanan.
## Ketergantungan : Melihat Menu (include), Memilih Meja (include)
## Aktor : Customer, Cashier


A3 – Menghapus item pesanan (SUC.03.04)
## Customer Sistem
- Menghapus item dari keranjang  2. Menghapus item dari daftar pesanan
- Menghitung ulang total harga
- Menampilkan informasi pesanan
terbaru


C.  Skenario-Skenario Error
E1 – Menu tidak tersedia (SUC.03.05)
## Customer, Cashier Sistem
-  Memilih menu 2. Mengecek ketersediaan menu
- Menampilkan pesan menu sedang
tidak tersedia
E2 – Meja penuh atau tidak tersedia (SUC.03.06)
## Customer Sistem
- Memilih meja (scan QR/manual) 2. Mengecek ketersediaan meja
- Jika meja penuh, menampilkan pesan
meja tidak tersedia, silahkan pilih meja
lain


## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 23 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Nama use-case : Membuat pesanan
Deskripsi : Proses customer atau cashier memilih menu dan menambahkannya
ke dalam pesanan.
## Ketergantungan : Melihat Menu (include), Memilih Meja (include)
## Aktor : Customer, Cashier
Pemodelan Aktivitas Sistem  (AD.03)

Gambar 3.1.3 - AD.03 Membuat pesanan



Nama use-case : Memilih meja
Deskripsi : Sistem memetakan penempatan nomor meja fisik pelanggan yang
dipilih secara terintegrasi saat proses pemesanan berlangsung
## Ketergantungan : Membuat Pesanan (include)
## Aktor : Customer, Cashier
Prakondisi : Proses pembuatan pesanan sedang berlangsung.
Paskakondisi : Informasi meja tersimpan pada pesanan.
Skenario-Skenario:
A. Skenario Normal (SUC.04.01)
## Customer, Cashier Sistem
- Mengisi atau memilih nomor meja 2. Menampilkan daftar meja yang
tersedia
- Menentukan meja yang digunakan 4. Memvalidasi ketersediaan meja
- Menyimpan informasi meja pada
pesanan

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 24 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




B.   Skenario-Skenario Alternatif
A1 – Mencari meja (SUC.04.02)
## Customer, Cashier Sistem
- Memasukkan nomor meja 2. Menampilkan hasil pencarian meja
- Memilih meja 4. Menampilkan detail meja

Skenario-Skenario Error
E1 – Meja tidak tersedia (SUC.04.03)
## Customer, Cashier Sistem
- Memilih meja 2. Memvalidasi ketersediaan meja
- Menampilkan pesan meja tidak
tersedia

Pemodelan Aktivitas Sistem (AD.04)

Gambar 3.1.4 - AD.04 Memilih meja

Nama use-case : Melakukan Pembayaran
Deskripsi : Customer melakukan pembayaran atas pesanan yang sudah dibuat
melalui metode pembayaran yang tersedia.
## Ketergantungan : Membuat Pesanan (include)
## Aktor : Customer
Prakondisi :  Pesanan sudah dibuat dan tersimpan di sistem.
Paskakondisi : Pembayaran berhasil dibuat dan status pesanan berubah menjadi
diproses/dibayar.
Skenario-Skenario:
A. Skenario Normal (SUC.05.01)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 25 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## Customer Sistem
- Membuka tampilan keranjang 2. Menampilkan daftar pesanan dan
total harga
- memilih metode pembayaran

- Menampilkan instruksi
pembayaran

- melakukan pembayaran sesuai
metode
- Memproses pembayaran
- Menyimpan data pembayaran
- Memperbarui status pembayaran
- menampilkan pesan pembayaran
berhasil

B. Skenario-Skenario Alternatif
A1 – Mengganti metode pembayaran (SUC.05.02)
## Customer Sistem
- memilih metode pembayaran 2. memperbarui instruksi
pembayaran
- mengubah metode pembayaran 4. memperbarui metode yang dipilih
- menampilkan instruksi
pembayaran terbaru

C. Skenario-Skenario Error
E1 – Pembayaran gagal (SUC.05.03)
## Customer Sistem
- Melakukan pembayaran 2. Memproses pembayaran
- Mendeteksi pembayaran gagal
- Menampilkan pesan pembayaran
gagal dan meminta pembayaran
diulangi

E2 - Koneksi internet terputus (SUC.05.04)
## Customer Sistem
- Melakukan pembayaran 2. Gagal memproses pembayaran
karena koneksi terputus
- Menampilkan pesan koneksi
internet bermasalah


Pemodelan Aktivitas Sistem (AD.05)

Gambar 3.1.4 - AD.05 Melakukan pembayaran


## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 26 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code





## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 27 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code

Nama use-case : Tunai
Deskripsi : Turunan metode pembayaran menggunakan uang fisik.
Ketergantungan : Melakukan pembayaran (generalization)
## Aktor : Customer
Prakondisi : Metode pembayaran tunai dipilih.
Paskakondisi : Pembayaran tunai menunggu validasi kasir.
Skenario-Skenario:
Skenario normal (SUC.06.01)

## Customer Sistem
- Memilih metode pembayaran tunai 2.  Menampilkan informasi pembayaran
tunai
- Menyerahkan pembayaran tunai 4. Menyimpan metode pembayaran
- Memindai pembayaran menunggu
validasi kasir

Skenario-Skenario Alternatif
A1 – Kasir memvalidasi tunai (SUC.06.02)
## Customer Sistem
- Menyerahkan uang ke kasir 2. Menghitung selisih pembayaran
- Menampilkan informasi kembalian


Skenario-Skenario Error
E1 – Uang kurang (SUC.06.03)
## Customer Sistem
- Menyerahkan uang 2. Memeriksa kecukupan pembayaran
- Menampilkan pesan nominal
pembayaran

Pemodelan Aktivitas Sistem (AD.06)



Nama use-case : Non-Tunai
## Deskripsi

## :
Turunan metode pembayaran transaksi tanpa uang fisik
(QRIS/Transfer).
Ketergantungan : Melakukan Pembayaran (Generalization)
## Aktor : Customer
Prakondisi : Metode pembayaran non-tunai dipilih.
Paskakondisi : Pembayaran non-tunai menunggu validasi kasir.
Skenario-Skenario:
Skenario Normal (SUC.07.01)
## Customer Sistem
- Memilih metode pembayaran
non-tunai
- Menampilkan instruksi pembayaran
- Melakukan pembayaran sesuai
metode
- Memproses transaksi pembayaran

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 28 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code


Gambar 3.1.5 - AD.06 Tunai


Nama use-case : Non-Tunai
- Menyimpan informasi transaksi

- Menandai pembayaran menunggu
validasi kasir

Skenario-Skenario Alternatif
A1 – Pembayaran QRIS/Transfer (SUC.07.02)
## Customer Sistem
- Memilih QRIS/Transfer 2. Menampilkan kode QR atau informasi
transfer
- Melakukan pembayaran 4. Menerima notifikasi pembayaran
- Memperbarui status pembayaran


Skenario-Skenario Error
E1 – Pembayaran gagal (SUC.07.03)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 29 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Nama use-case : Non-Tunai
## Customer Sistem
- Melakukan pembayaran  2. gagal memproses pembayaran
- Menampilkan pesan pembayaran
gagal

Pemodelan Aktivitas Sistem (AD.07)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 30 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 3.1.6 - AD.07 Non-Tunai


Nama use-case : Memvalidasi pembayaran
Deskripsi : Cashier memeriksa dan mengonfirmasi bukti/nominal pembayaran
pelanggan (tunai maupun non-tunai) untuk memperbarui status
transaksi menjadi lunas/dibayar serta menghitung kembalian
otomatis.
Ketergantungan : UC.01 - Login (include), UC.12 - Melakukan Pembayaran
## (include)
## Aktor : Cashier
Prakondisi : Pelanggan telah membuat pesanan dan memilih/mengirimkan
metode pembayaran (tunai/non-tunai).
Paskakondisi : Status pembayaran pesanan diperbarui menjadi "Lunas/Dibayar"
dan transaksi tercatat dalam sistem untuk siap dicetak struknya.
Skenario-Skenario:
Skenario Normal (SUC.08.01)
## Cashier Sistem
- Membuka daftar transaksi/pesanan
yang menunggu validasi pembayaran.
- Menampilkan daftar pesanan dengan
status Pending Payment.

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 31 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



- Memilih pesanan dan mengonfirmasi
nominal tunai yang diterima atau
memverifikasi bukti/notifikasi
non-tunai (QRIS/Transfer).
- Memvalidasi kecukupan nominal atau
keberhasilan transaksi non-tunai.
- Memperbarui status pembayaran
pesanan menjadi "Lunas/Dibayar".

- Menghitung dan menampilkan
nominal kembalian secara otomatis
## (PM-FR-09).
- Menampilkan konfirmasi validasi
pembayaran berhasil.

## Skenario Alternatif
● A1 – Pembayaran Tunai dengan Uang Pas (SUC.08.02)
- Cashier memasukkan nominal uang fisik dari pelanggan yang jumlahnya pas
dengan total tagihan.
- Sistem memvalidasi nominal, memperbarui status menjadi "Lunas/Dibayar",
dan menampilkan kembalian Rp0.
● A2 – Pembayaran Non-Tunai Terverifikasi (SUC.08.03)
- Cashier mengecek status masuknya dana QRIS/E-Wallet pada sistem.
- Cashier menekan tombol konfirmasi pembayaran non-tunai valid.
- Sistem mengubah status pesanan menjadi "Lunas/Dibayar".
## ● Skenario Error
E1 – Nominal Uang Tunai Kurang (SUC.08.04
- Cashier memasukkan nominal uang tunai yang kurang dari total tagihan.
- Sistem mendeteksi kekurangan pembayaran.
- Sistem menampilkan pesan "Nominal pembayaran kurang" dan menolak
memproses validasi.
E1 – Nominal Uang Tunai Kurang (SUC.08.04
- Cashier memeriksa mutasi/notifikasi pembayaran non-tunai dan menemukan
dana belum diterima.
- Cashier memilih opsi "Pembayaran Gagal / Belum Diterima".
- Sistem menampilkan peringatan transaksi non-tunai belum valid dan
meminta pelanggan mengulangi pembayaran.

Pemodelan Aktivitas Sistem (AD.08)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 32 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 3.1.7 - AD.08 Memvalidasi pembayaran


## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 33 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



UC.09 – Membatalkan Pesanan
Nama use-case : Membatalkan Pesanan
Deskripsi : Cashier membatalkan pesanan pelanggan
(PM-FR-08). Pembatalan setelah pembayaran
berhasil memerlukan konfirmasi/otorisasi
persetujuan dari Owner (PM-FR-18).

## Ketergantungan : Login (include)
## Aktor : Cashier, Owner
Prakondisi : Pesanan pelanggan sudah tercatat di sistem.
Paskakondisi : Pesanan dibatalkan (status berubah menjadi
"Dibatalkan") dan memicu proses refund jika
transaksi sudah dibayar.

Skenario-Skenario:
Skenario Normal (SUC.09.01)
## Cashier, Owner Sistem
- Membuka halaman daftar pesanan 2. Menampilkan daftar pesanan aktif
- Memilih pesanan yang akan dibatalkan
dan memasukkan alasan pembatalan.
- Memeriksa status pembayaran
pesanan.

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 34 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



- Mengajukan pembatalan pesanan.  6. Memperbarui status pesanan menjadi
"Dibatalkan".
- Menampilkan konfirmasi pembatalan
berhasil.
## Skenario Alternatif
● A1 – Pembatalan sebelum bayar (SUC.09.02)
## Cashier, Owner Sistem
- Cashier mengajukan pembatalan
pesanan yang belum dibayar.
- Sistem memperbarui status
pesanan menjadi "Dibatalkan"
secara langsung tanpa
memerlukan persetujuan
## Owner.
## ●
A2 – Pembatalan setelah bayar (SUC.09.03)
## Cashier, Owner Sistem
- Cashier mengajukan pembatalan
pesanan yang sudah dibayar
beserta alasan dan bukti refund
## (PM-FR-18).
- Sistem mendeteksi status
"Paid" dan mengirimkan
permintaan konfirmasi
otorisasi kepada Owner.
- Owner menyetujui pembatalan,
lalu sistem memproses status
pembatalan dan refund.

## Skenario Error
● E1 – Refund gagal (SUC.09.04)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 35 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## Cashier, Owner Sistem
- Cashier mengajukan
pembatalan transaksi
yang sudah dibayar.
- Sistem menampilkan pesan
"Pembatalan ditolak oleh Owner" dan
status pesanan tetap diproses.
- Owner menolak
permintaan
pembatalan/refund.

## ●
Pemodelan Aktivitas Sistem (AD.09)
Gambar 3.1.9 – AD.09 Membatalkan Pesanan






UC.10 – Mencetak Struk
Nama use-case : Mencetak Struk
Deskripsi : Sistem mencetak struk pembayaran dan menyimpan
riwayat transaksi.
## Ketergantungan : Login (include)
## Aktor : Cashier

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 36 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Prakondisi : Pembayaran berhasil diproses.
Paskakondisi : Struk tercetak dan riwayat transaksi tersimpan.
Skenario-Skenario:
Skenario Normal (SUC.10.01)
## Cashier Sistem
- Meminta struk pembayaran 2. Menampilkan struk pembayaran
- Menekan tombol cetak 4. Mengirim data struk ke printer
- Menyimpan riwayat transaksi
- Menampilkan status cetak berhasil
## Skenario Alternatif
● A1 – Menampilkan struk digital (SUC.10.02)
## Cashier Sistem
## 1. Meminta
struk
- Menampilkan struk digital di
layar
## Skenario Error
● E1 – Gagal mencetak struk (SUC.10.03)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 37 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## Cashier Sistem
- Menekan tombol
cetak
- Gagal mencetak struk
- Menampilkan pesan gagal mencetak struk
## ●
Pemodelan Aktivitas Sistem (AD.10)
Gambar 3.1.10 – AD.10 Mencetak Struk
UC.11 – Mengubah Status Pesanan
Nama use-case : Mengubah Status Pesanan
Deskripsi : Waiter memperbarui status pesanan pelanggan sesuai
tahap proses pesanan.
## Ketergantungan : Membuat Pesanan (extend)
## Aktor : Waiter
Prakondisi : Pesanan pelanggan telah tercatat dalam sistem.
Paskakondisi : Status pesanan berhasil diperbarui.
Skenario-Skenario:
Skenario Normal (SUC.11.01)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 38 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## Waiter Sistem
- Membuka halaman daftar
pesanan
- Menampilkan daftar pesanan
- Memilih pesanan yang akan
diperbarui
- Menampilkan detail pesanan
- Memilih status baru pesanan 6. Memperbarui status pesanan
- Menyimpan perubahan status
- Menampilkan status pesanan yang telah
diperbarui
## Skenario Alternatif
● A1 – Mencari pesanan (SUC.11.02)
## Waiter Sistem
- Memasukkan informasi pencarian
pesanan
- Menampilkan hasil
pencarian
- Memilih pesanan yang dicari 4. Menampilkan detail
pesanan
## ●
A2 – Memfilter daftar pesanan (SUC.11.03)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 39 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## Waiter Sistem
- Memilih kriteria status
pesanan
- Menampilkan daftar pesanan sesuai
kriteria
- Memilih pesanan 4. Menampilkan detail pesanan
## Skenario Error
● E1 – Gagal memperbarui status pesanan (SUC.11.04)
## Waiter Sistem
- Memilih status pesanan
baru
- Memperbarui status pesanan
- Gagal menyimpan perubahan status
- Menampilkan pesan perubahan status
gagal
## ●
E2 – Pesanan tidak ditemukan (SUC.11.05)
## Waiter Sistem

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 40 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



- Memilih pesanan yang akan
diperbarui
- Mencari data pesanan
- Tidak menemukan data pesanan
- Menampilkan pesan pesanan tidak
ditemukan
## ●
Pemodelan Aktivitas Sistem (AD.11)
Gambar 3.1.11 – AD.11 Mengubah Status Pesanan
UC.12 – Melihat Laporan
Nama use-case : Melihat Laporan
Deskripsi : Owner melihat berbagai laporan dari sistem, termasuk
laporan penjualan, transaksi, dan analitik menu.
## Ketergantungan : Login (include)
## Aktor : Owner
Prakondisi : Owner sudah login ke sistem.
Paskakondisi : Laporan ditampilkan sesuai jenis dan periode yang dipilih.
Skenario-Skenario:
Skenario Normal (SUC.12.01)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 41 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## Owner Sistem
- Membuka menu laporan 2. Menampilkan daftar jenis laporan
- Memilih jenis laporan 4. Menampilkan pilihan periode laporan
- Memilih periode laporan 6. Mengambil data laporan
- Menampilkan laporan sesuai filter
## Skenario Alternatif
● A1 – Mengubah jenis laporan (SUC.12.02)
## Owner Sistem
- Memilih jenis laporan
berbeda
- Mengambil data laporan sesuai
jenis
- Menampilkan laporan sesuai jenis
## ●
A2 – Mengubah periode laporan (SUC.12.03)
## Owner Sistem

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 42 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



- Memilih periode laporan
berbeda
- Mengambil data laporan sesuai
periode
- Menampilkan laporan sesuai
periode
## Skenario Error
● E1 – Data laporan tidak tersedia (SUC.12.04)
## Owner Sistem
- Memilih jenis dan periode
laporan
- Mencari data laporan
- Tidak menemukan data laporan
- Menampilkan pesan data laporan tidak
tersedia
## ●
Pemodelan Aktivitas Sistem (AD.12)
Gambar 3.1.12 – AD.12 Melihat Laporan
UC.13 Pembayaran Tunai

Nama Use Case :  Pembayaran tunai
Deskripsi :  Proses pembayaran transaksi pesanan secara langsung

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 43 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



menggunakan uang fisik (cash) di kasir.
Ketergantungan :  UC.12 - Melakukan Pembayaran (Generalization),
UC.01 - Login (Include)
## Aktor :  Customer, Cashier
Prakondisi :  Pelanggan telah selesai membuat pesanan, memilih
metode pembayaran tunai, dan pesanan tercatat di
sistem kasir.
Paskakondisi : Pembayaran terkonfirmasi lunas, jumlah nominal
diterima dan kembalian (jika ada) tersimpan di sistem,
serta status pesanan diperbarui menjadi diproses.

Skenario-Skenario:
Skenario Normal(SUC.13.01)

Customer/Cashier Sistem
- Customer memilih metode pembayaran
Tunai pada aplikasi/di kasir


- Menampilkan total tagihan pembayaran
- Customer menyerahkan uang tunai kepada
## Cashier
- Cashier membuka menu pemrosesan
pembayaran tunai
- Cashier memasukkan nominal uang yang
diterima dari Customer
- Memvalidasi kecukupan nominal
pembayaran
- Menghitung total kembalian secara otomatis
- Menyimpan data transaksi pembayaran
tunai
- Memperbarui status pesanan menjadi
## Dibayar / Diproses
- Menampilkan konfirmasi pembayaran
berhasil beserta nominal kembalian

## Skenario Alternatif
A1 - Pembayaran Menggunakan Uang Pas (SUC.13.02)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 44 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




## Customer / Cashier Sistem
- Customer menyerahkan uang tunai dengan
nominal pas
- Cashier mengonfirmasi pilihan opsi Uang
## Pas
- Memproses transaksi tanpa menghitung
kembalian ($0)
- Memperbarui status pembayaran menjadi
lunas

## Skenario Error
E1 - Nominal Uang Kurang (SUC.13.03)

## Customer / Cashier Sistem
- Cashier memasukkan nominal uang yang
diterima
- Memeriksa jumlah nominal
- Mendeteksi bahwa jumlah uang yang
dimasukkan kurang dari total tagihan
- Menampilkan pesan peringatan "Nominal
pembayaran kurang"
- Cashier meminta kekurangannya ke
Customer atau mengoreksi nominal input


E2-Gagal Menyimpan Transaksi (SUC.13.04)


Customer/Cashier Sistem
- Cashier mengonfirmasi pembayaran tunai 2. Mengalami kendala koneksi/database saat
menyimpan data
- Menampilkan pesan error "Gagal
memproses transaksi pembayaran tunai,
silakan coba lagi"



## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 45 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



UC.14 – Pembayaran Non-Tunai

Nama use-case Pembayaran Non-Tunai
## Deskripsi
Proses pembayaran transaksi pesanan
menggunakan metode pembayaran
non-tunai seperti QRIS atau transfer.
Ketergantungan Melakukan Pembayaran (Generalization)
## Aktor Customer
Prakondisi Metode pembayaran non-tunai dipilih.
## Paskakondisi
Pembayaran non-tunai menunggu validasi
kasir.
Skenario Normal (SUC.15.01)
## Customer Sistem
- Memilih metode pembayaran non-tunai. 2. Menampilkan instruksi pembayaran.
- Melakukan pembayaran sesuai metode
yang dipilih.
- Memproses transaksi pembayaran.
- Menyimpan informasi transaksi.

- Menandai pembayaran sebagai
menunggu validasi kasir.
Skenario-Skenario Alternatif
A1 – Pembayaran QRIS/Transfer (SUC.14.02)
## Customer Sistem
- Memilih QRIS/Transfer.
- Menampilkan kode QR atau informasi
transfer.
- Melakukan pembayaran. 4. Menerima notifikasi pembayaran
- Memperbarui status pembayaran.
Skenario-Skenario Error
E1 – Data shift tidak lengkap (SUC.14.03)
## Customer Sistem
- Melakukan pembayaran. 2. Gagal memproses pembayaran.
- Menampilkan pesan pembayaran gagal.
Pemodelan Aktivitas Sistem (AD.15)
Gambar 3.1.15 – AD.14 Pembayaran Non-Tunai


## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 46 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



UC.16 – Melihat Log Aktivitas

Nama use-case Melihat Log Aktivitas
## Deskripsi
Owner memantau log aktivitas yang direkam
otomatis oleh sistem.
## Ketergantungan Login (include)
## Aktor Owner
Prakondisi Owner sudah login ke sistem.
## Paskakondisi
Log aktivitas berhasil ditampilkan sesuai data
yang tersedia.
Skenario Normal (SUC.16.01)
## Owner Sistem
- Membuka menu log aktivitas 2. Menampilkan daftar log aktivitas
- Melihat data log aktivitas 4. Menampilkan informasi aktivitas pengguna
- Memilih aktivitas yang ingin dilihat 6. Menampilkan detail aktivitas
Skenario-Skenario Alternatif
A1 – Memfilter log aktivitas (SUC.16.02)
## Owner Sistem
- Memilih kriteria filter 2. Memproses filter log aktivitas

- Menampilkan log sesuai kriteria
A2 – Mencari log aktivitas (SUC.16.03)
## Owner Sistem
- Memasukkan kata kunci pencarian 2. Mencari data log aktivitas

- Menampilkan hasil pencarian
Skenario-Skenario Error
E1 – Data log aktivitas tidak tersedia (SUC.16.04)
## Owner Sistem
- Membuka menu log aktivitas 2. Mencari data log aktivitas

- Tidak menemukan data log aktivitas

- Menampilkan pesan log aktivitas tidak
tersedia
Pemodelan Aktivitas Sistem (AD.16)
Gambar 3.1.16 – AD.16 Melihat Log Aktivitas



## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 47 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



UC.17 – Melihat Laporan

Nama use-case Melihat Laporan
## Deskripsi
Owner melihat laporan penjualan, transaksi,
dan analitik menu.
## Ketergantungan Login (include)
## Aktor Owner
Prakondisi Owner telah login ke sistem.
## Paskakondisi
Laporan berhasil ditampilkan sesuai jenis dan
periode yang dipilih.
Skenario Normal (SUC.17.01)
## Owner Sistem
- Membuka menu laporan 2. Menampilkan daftar jenis laporan
- Memilih jenis laporan 4. Menampilkan pilihan periode laporan
- Memilih periode laporan 6. Mengambil data laporan sesuai filter
- Melihat laporan
- Menampilkan laporan sesuai jenis dan
periode yang dipilih
Skenario-Skenario Alternatif
A1 – Mengubah jenis laporan (SUC.17.02)
## Owner Sistem
- Memilih jenis laporan berbeda 2. Mengambil data sesuai jenis laporan

- Menampilkan laporan sesuai jenis yang
dipilih
A2 – Mengubah periode laporan (SUC.17.03)
## Owner Sistem
- Memilih periode berbeda 2. Mengambil data sesuai periode

- Menampilkan laporan sesuai periode
Skenario-Skenario Error
E1 – Data laporan tidak tersedia (SUC.17.04)
## Owner Sistem
- Memilih jenis dan periode laporan 2. Mencari data laporan

- Tidak menemukan data laporan sesuai filter

- Menampilkan pesan data laporan tidak
tersedia
Pemodelan Aktivitas Sistem (AD.17)
Gambar 3.1.17 – AD.17 Melihat Laporan



## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 48 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



UC.18 – Mengubah Status Pesanan

Nama use-case Mengubah Status Pesanan
## Deskripsi
Waiter memperbarui status pesanan pelanggan
sesuai tahap proses pesanan.
## Ketergantungan Membuat Pesanan (extend)
## Aktor Waiter
Prakondisi Pesanan pelanggan telah tercatat dalam sistem.
Paskakondisi Status pesanan berhasil diperbarui.
Skenario Normal (SUC.18.01)
## Waiter Sistem
- Membuka halaman daftar pesanan 2. Menampilkan daftar pesanan
- Memilih pesanan 4. Menampilkan detail pesanan
- Memilih status baru 6. Memperbarui status pesanan

- Menyimpan perubahan status

- Menampilkan status pesanan yang telah
diperbarui
Skenario-Skenario Alternatif
A1 – Mencari pesanan (SUC.18.02)
## Waiter Sistem
- Memasukkan informasi pencarian 2. Menampilkan hasil pencarian
- Memilih pesanan 4. Menampilkan detail pesanan
A2 – Memfilter daftar pesanan (SUC.18.03)
## Waiter Sistem
- Memilih kriteria status 2. Menampilkan daftar sesuai kriteria
- Memilih pesanan 4. Menampilkan detail pesanan
Skenario-Skenario Error
E1 – Gagal memperbarui status pesanan (SUC.18.04)
## Waiter Sistem
- Memilih status baru 2. Memproses perubahan status

- Gagal menyimpan perubahan

- Menampilkan pesan perubahan status gagal
Pemodelan Aktivitas Sistem (AD.18)
Gambar 3.1.18 – AD.18 Mengubah Status Pesanan





## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 49 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



UC.19 – Lupa Password

Nama use-case Lupa Password
## Deskripsi
Pengguna mereset password melalui verifikasi
email.
## Ketergantungan Login (extend)
Aktor Owner, Cashier, dan Waiter
## Prakondisi
Pengguna memiliki akun terdaftar dan akses ke
email akun.
## Paskakondisi
Password berhasil diperbarui dan dapat
digunakan untuk login kembali.
Skenario Normal (SUC.19.01)
## Owner, Cashier, Waiter Sistem
- Membuka halaman login 2. Menampilkan halaman login
- Memilih menu lupa password 4. Menampilkan form reset password
- Memasukkan email terdaftar 6. Memvalidasi email

- Mengirim tautan reset password
- Membuka tautan reset 9. Menampilkan form password baru
- Memasukkan password baru 11. Memvalidasi password

- Menyimpan password baru

- Menampilkan informasi password berhasil
diperbarui
Skenario-Skenario Alternatif
A1 – Mengirim ulang tautan reset password (SUC.19.02)
## Owner, Cashier, Waiter Sistem
- Memilih opsi kirim ulang 2. Mengirim ulang tautan verifikasi

- Menampilkan informasi tautan berhasil
dikirim
Skenario-Skenario Error
E1 – Email tidak terdaftar (SUC.19.03)
## Owner, Cashier, Waiter Sistem
- Memasukkan email 2. Memvalidasi email

- Mendeteksi email tidak terdaftar

- Menampilkan pesan email tidak terdaftar
Pemodelan Aktivitas Sistem (AD.19)
Gambar 3.1.19 – AD.19 Lupa Password





## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 50 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



UC.20 – Melihat & Mengunduh QR Meja

Nama use-case Melihat & Mengunduh QR Meja
## Deskripsi
Owner dan Cashier melihat serta mengunduh
QR code meja yang digunakan Customer untuk
mengakses halaman menu.
## Ketergantungan Login (include)
## Aktor Owner, Cashier
## Prakondisi
Owner atau Cashier sudah login dan data meja
tersedia.
## Paskakondisi
QR code meja berhasil ditampilkan atau
diunduh.
Skenario Normal (SUC.20.01)
## Owner, Cashier Sistem
- Membuka menu QR meja 2. Menampilkan daftar meja
- Memilih meja 4. Menampilkan QR code meja
- Memilih opsi unduh QR 6. Menghasilkan file QR code

- Mengunduh QR code meja
Skenario-Skenario Alternatif
A1 – Melihat QR meja lain (SUC.20.02)
## Owner, Cashier Sistem
- Memilih meja lain 2. Menampilkan QR code meja yang dipilih
Skenario-Skenario Error
E1 – QR code meja tidak tersedia (SUC.20.03)
## Owner, Cashier Sistem
- Memilih meja 2. Memeriksa QR code meja

- QR code tidak tersedia

- Menampilkan pesan QR code tidak tersedia
Pemodelan Aktivitas Sistem (AD.20)
Gambar 3.1.20 – AD.20 Melihat & Mengunduh QR Meja

UC.22 – Konfirmasi Refund

Nama use-case Konfirmasi Refund
## Deskripsi
Owner mengonfirmasi pemrosesan dana
refund.
## Ketergantungan Memproses Refund (include)
## Aktor Owner

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 51 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## Prakondisi
Terdapat permintaan refund dari transaksi yang
dibatalkan dan Owner sudah login.
## Paskakondisi
Permintaan refund disetujui atau ditolak dan
status refund tercatat dalam sistem.
Skenario Normal (SUC.22.01)
## Owner Sistem
- Membuka daftar permintaan refund 2. Menampilkan daftar permintaan refund
- Memilih permintaan refund 4. Menampilkan detail transaksi
- Memeriksa detail refund
- Menampilkan informasi transaksi dan alasan
refund
- Mengonfirmasi refund 8. Memvalidasi konfirmasi refund

- Memproses dana refund

- Memperbarui status refund

- Menampilkan informasi refund berhasil
diproses
Skenario-Skenario Alternatif
A1 – Menolak permintaan refund (SUC.22.02)
## Owner Sistem
- Memilih permintaan refund 2. Menampilkan detail transaksi
- Memilih opsi tolak refund 4. Meminta konfirmasi penolakan
- Mengonfirmasi penolakan 6. Menyimpan status refund ditolak

- Menampilkan informasi refund ditolak
Skenario-Skenario Error
E1 – Gagal memproses refund (SUC.22.03)
## Owner Sistem
- Mengonfirmasi refund 2. Memproses dana refund

- Gagal memproses dana refund

- Menampilkan pesan gagal memproses refund
Pemodelan Aktivitas Sistem (AD.22)
Gambar 3.1.22 – AD.22 Konfirmasi Refund
UC.23 – Pindah Meja

Nama use-case Pindah Meja
## Deskripsi
Customer atau Cashier memindahkan lokasi
pesanan ke meja lain yang tersedia setelah
pesanan dibuat.
## Ketergantungan
## Membuat Pesanan (extend), Mengelola Meja
## (include)
## Aktor Customer, Cashier
Prakondisi Pesanan telah dibuat dan meja tujuan tersedia.

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 52 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## Paskakondisi
Pesanan berhasil dipindahkan ke meja tujuan
dan data meja diperbarui.
Skenario Normal (SUC.23.01)
## Customer, Cashier Sistem
- Membuka halaman status pesanan
- Menampilkan detail pesanan dan meja saat
ini
- Memilih opsi pindah meja 4. Menampilkan daftar meja yang tersedia
- Memilih meja tujuan 6. Memvalidasi ketersediaan meja
- Mengonfirmasi perpindahan meja 8. Memperbarui meja pada pesanan

- Memperbarui status ketersediaan meja

- Menampilkan informasi meja berhasil
dipindahkan
Skenario-Skenario Alternatif
A1 – Memilih meja tujuan lain (SUC.23.02)
## Customer, Cashier Sistem
- Memilih meja tujuan 2. Memeriksa ketersediaan meja

- Menampilkan informasi meja tidak tersedia
- Memilih meja lain 5. Menampilkan meja yang dipilih
Skenario-Skenario Error
E1 – Meja tujuan tidak tersedia (SUC.23.03)
## Customer, Cashier Sistem
- Memilih meja tujuan 2. Memvalidasi ketersediaan meja

- Mendeteksi meja sedang digunakan

- Menampilkan pesan meja tujuan tidak
tersedia
Pemodelan Aktivitas Sistem (AD.23)
Gambar 3.1.23 – AD.23 Pindah Meja



## Role Owner
Nama use-case : Mengelola Akun
Deskripsi : Owner mengelola data akun pengguna yang meliputi melihat,
menambah, mengubah, dan menghapus akun.
## Ketergantungan : Login
## Aktor : Owner
Prakondisi : Owner sudah login ke sistem
Paskakondisi : Data akun berhasil ditampilkan, ditambahkan, diubah, atau
dihapus sesuai aksi yang dilakukan oleh Owner.

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 53 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Skenario-Skenario:
Skenario Normal (SUC.13.01)
## Owner Sistem
- Membuka menu manajemen akun  2. Menampilkan daftar akun
- Melihat data akun  A1 - Menambah data akun
A2 - Mengubah data akun
A3 - Menghapus data akun

Skenario-Skenario Alternatif
A1 - Menambah  data akun (SUC.13.02)
## Owner Sistem
- Memilih penambahan akun  2. Menampilkan halaman
penambahan akun
- Mengisi data akun

- Memvalidasi data akun
E1 – Data akun tidak lengkap
- Mengonfirmasi penambahan akun 6. Menyimpan data akun
- Menampilkan informasi akun
berhasil ditambahkan

A2 - Mengubah data akun (SUC.13.03)
## Owner Sistem
- Memilih akun yang akan diubah  2. Menampilkan daftar akun
- Mengubah data akun  4. Memvalidasi data akun
E1 – Data akun tidak lengkap
- Mengonfirmasi perubahan akun  6. Menyimpan perubahan data akun
- Menampilkan informasi akun
berhasil diperbarui

A3 - Mengubah data akun (SUC.13.04)
## Owner Sistem
- Memilih akun yang akan dihapus  2. Menampilkan data akun
- Mengonfirmasi penghapusan
akun
- Memvalidasi data akun
- Menghapus data akun
- Menampilkan informasi akun
berhasil dihapus


## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 54 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Skenario-Skenario Error
E1 - Data akun tidak lengkap (SUC.13.05)
## Owner Sistem
- Mengisi atau mengubah data
akun
- Memvalidasi data akun
- Mendeteksi data akun belum
lengkap
- Menampilkan pesan data akun
tidak lengkap
- Menampilkan pesan bahwa akun
berhasil ditambahkan

Pemodelan Aktivitas Sistem (AD.13)

Gambar 3.1.8 - AD.13 Mengelola Akun

Nama use-case : Mengelola Menu
Deskripsi : Owner mengelola data menu yang meliputi melihat, menambah,
mengubah, dan menghapus menu.
## Ketergantungan : Login
## Aktor : Owner
Prakondisi : Owner sudah login ke sistem
Paskakondisi : Data menu berhasil ditampilkan, ditambahkan, diubah, atau
dihapus sesuai aksi yang dilakukan oleh Owner.
Skenario-Skenario:
Skenario Normal (SUC.14.01)
## Owner Sistem

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 55 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



- Membuka manajemen menu

- Menampilkan daftar menu
- Melihat data menu

A1 - Menambah data Menu
A2 - Menghapus data Menu

Skenario-Skenario Alternatif
A1 – Menambah data menu (SUC.14.02)
## Owner Sistem
- Memilih penambahan menu  2. Menampilkan halaman
penambahan menu
- Mengisi data menu  4. Memvalidasi data menu
E1 - Data menu tidak lengkap
E2 - Nama menu sudah terdaftar
- Mengonfirmasi penambahan
menu
- Menyimpan data menu
- Menampilkan informasi menu
berhasil ditambahkan

A2 – Mengubah data menu (SUC.14.03)
## Owner Sistem
- Memilih menu yang akan diubah  2. Menampilkan data menu
- Mengubah data menu  4. Memvalidasi data menu
E1 - Data menu tidak lengkap
E2 - Nama menu sudah terdaftar
- Mengonfirmasi perubahan menu  6. Menyimpan perubahan data menu
- Menampilkan informasi menu
berhasil diperbarui

A3 – Menghapus data menu (SUC.14.04)
## Owner Sistem
- Memilih menu yang akan dihapus  2. Menampilkan data menu
- Mengonfirmasi penghapusan
menu
- Memvalidasi data menu
E1 - Data menu tidak lengkap

- Menghapus data menu
- Menampilkan informasi menu
berhasil dihapus

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 56 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Skenario-Skenario Error
E1 – Data menu tidak lengkap (SUC.14.05)
## Owner Sistem
- Mengisi atau mengubah data menu  2. Memvalidasi data menu
- Mendeteksi data menu belum lengkap
- Menampilkan pesan data menu tidak
lengkap

E2 – Nama menu sudah terdaftar (SUC.14.06)
## Owner Sistem
- Mengisi atau mengubah data
menu
- Memvalidasi data menu
- Mendeteksi nama menu sudah
digunakan
- Menampilkan pesan nama menu
sudah terdaftar

Pemodelan Aktivitas Sistem (AD.14)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 57 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 3.1.14 – AD.14 Mengelola Menu
UC.15 – Mengelola Shift
Nama use-case : Mengelola Shift
Deskripsi : Owner mengelola jadwal shift kerja karyawan.
## Ketergantungan : Login (include)
## Aktor : Owner

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 58 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Prakondisi : Owner sudah login ke sistem.
Paskakondisi : Jadwal shift kerja berhasil diperbarui.
Skenario-Skenario:
Skenario Normal (SUC.15.01)
## Owner Sistem
- Membuka menu shift kerja 2. Menampilkan daftar shift
## 3. Menambah/mengubah/menghapus
shift
- Menyimpan perubahan shift
- Menampilkan informasi shift
berhasil diperbarui
## Skenario Alternatif
● A1 – Menambah shift (SUC.15.02)
## Owner Sistem
- Memilih penambahan
shift
- Menampilkan form
shift
- Mengisi data shift 4. Memvalidasi data
shift

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 59 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



- Menyimpan data
shift
## ●
A2 – Mengubah shift (SUC.15.03)
## Owner Sistem
- Memilih shift yang akan
diubah
- Menampilkan data shift
- Mengubah data shift 4. Menyimpan perubahan
shift
## ●
A3 – Menghapus shift (SUC.15.04)
## Owner Sistem
- Memilih shift yang akan
dihapus
- Menampilkan data
shift
- Mengonfirmasi penghapusan 4. Menghapus data
shift
## Skenario Error
● E1 – Data shift tidak lengkap (SUC.15.05)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 60 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## Owner Sistem
- Mengisi data
shift
- Memvalidasi data shift
- Mendeteksi data shift belum lengkap
- Menampilkan pesan data shift tidak
lengkap
## ●
Pemodelan Aktivitas Sistem (AD.15)
Gambar 3.1.15 – AD.15 Mengelola Shift



Nama use-case : Mengelola Meja
Deskripsi : Owner mengelola data meja yang meliputi melihat, menambah,
mengubah, dan menghapus data meja. .
## Ketergantungan : Login
## Aktor : Owner
Prakondisi : Owner telah berhasil login ke dalam sistem
Paskakondisi : Data meja berhasil ditampilkan, ditambahkan, diubah, atau
dihapus sesuai aksi yang dilakukan oleh Owner.
Skenario-Skenario:
Skenario Normal (SUC.16.01)
## Owner Sistem
- Membuka menu manajemen meja  2. Menampilkan daftar meja
- Melihat data meja  A1 - Menambah data meja
A2 - Mengubah data meja

A3 - Menghapus data meja

Skenario-Skenario Alternatif

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 61 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



A1 – Menambah data meja (SUC.16.02)
## Owner Sistem
- Memilih penambahan meja  2. Menampilkan halaman penambahan
meja
- Mengisi data meja  4. Memvalidasi data meja
E1 - Nomor meja sudah digunakan
E2 - Data meja tidak lengkap
- Mengonfirmasi penambahan meja  6. Menyimpan data meja
- Menampilkan informasi meja berhasil
ditambahkan
- Menampilkan pesan bahwa data meja
berhasil diperbarui

A2 – Mengubah data meja (SUC.16.03)
## Owner Sistem
- Memilih meja yang akan diubah  2. Menampilkan data meja
- Mengubah data meja  4. Memvalidasi data meja
E1 - Nomor meja sudah digunakan
E2 - Data meja tidak lengkap
- Mengonfirmasi perubahan data meja  6. Menyimpan perubahan data meja
- Menampilkan informasi meja berhasil
diperbarui

A3 – Menghapus data meja (SUC.16.04)
## Owner Sistem
- Memilih meja yang akan dihapus  2. Menampilkan data meja
- Mengonfirmasi penghapusan
meja
- Menghapus data meja
- Menampilkan informasi meja
berhasil dihapus

Skenario-Skenario Error
E1 – Nomor meja sudah digunakan (SUC.16.05)
## Owner Sistem
- Mengisi atau mengubah data meja  2. Memvalidasi data meja
- Mendeteksi nomor meja sudah
digunakan
- Menampilkan pesan nomor meja
sudah digunakan

E2 – Data meja tidak lengkap (SUC.16.06)
## Owner Sistem
- Mengisi atau mengubah data 2. Memvalidasi data meja

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 62 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



meja
- Mendeteksi data meja belum
lengkap
- Menampilkan pesan data meja
tidak lengkap

Pemodelan Aktivitas Sistem (AD.16)

Gambar 3.1.16 – AD.16 Mengelola Meja


Nama use-case : Melihat Laporan
Deskripsi : Owner melihat berbagai laporan dari sistem, termasuk:
● Laporan penjualan per hari / bulan
● Laporan transaksi
● Laporan makanan favorit / item terlaris
Use case ini memungkinkan owner memilih periode, jenis laporan,
dan melihat data yang sesuai dengan kebutuhan analisis bisnis
## Ketergantungan : Login
## Aktor : Owner
Prakondisi : Owner telah login ke sistem
Paskakondisi : Laporan berhasil ditampilkan sesuai jenis dan periode yang dipilih
Skenario-Skenario:

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 63 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Skenario Normal (SUC.17.01)
## Owner Sistem
- Membuka menu laporan 2. Menampilkan daftar jenis laporan
- Memilih jenis laporan
A1 - Mengubah jenis laporan
- Menampilkan pilihan periode laporan
A2 - Mengubah periode laporan
E1 - Data laporan tidak tersedia


- Mengambil data laporan sesuai filter
- Melihat laporan  7. Menampilkan laporan sesuai jenis dan
periode yang dipilih

Skenario-Skenario Alternatif
A1 - Mengubah jenis laporan (SUC.17.02)
## Owner Sistem
- Memilih jenis laporan yang berbeda  2. Mengambil data laporan sesuai jenis
laporan yang dipilih
- Melihat laporan  4. Menampilkan laporan sesuai jenis
laporan yang dipilih
A2 - Mengubah periode laporan (SUC.17.03)
## Owner Sistem
- Memilih periode laporan yang
berbeda
- Mengambil data laporan sesuai periode
yang dipilih
- Melihat laporan  4. Menampilkan laporan sesuai periode
laporan yang dipilih

Skenario-Skenario Error
E1 - Data laporan tidak tersedia (SUC.17.04)
## Owner Sistem
- Memilih jenis laporan dan periode
laporan
- Mencari data laporan
- Tidak menemukan data laporan sesuai
filter
- Menampilkan pesan bahwa data
laporan tidak tersedia

Pemodelan Aktivitas Sistem (AD.17)

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 64 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 3.1.11 - AD.17 Melihat Laporan

3.2. Analisis Class dan Realisasi Use Case
## 3.2.1. Login
Nama use-case : Login
## Identifikasi Class
## Nama Class Class Stereotype
(Entity/Boundary/C
ontrol)
## Tanggung Jawab Class
HalamanLogin Boundary Menampilkan halaman login dan pesan error
jika terjadi kesalahan
HalamanDashboar
d
Boundary Menampilkan dashboard sesuai dengan peran
pengguna
AuthController Control Mengatur proses login, validasi input, dan
autentikasi pengguna

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 65 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



User Entity Menyimpan data pengguna seperti username,
password, dan peran
Realisasi Use-Case

## Gambar 3.2.1 - Login
## 3.2.2. Role Customer
Nama use-case : Melihat Menu
## Identifikasi Class
## Nama Class Class Stereotype
(Entity/Boundary/C
ontrol)
## Tanggung Jawab Class
Menu  Entity Menyimpan data menu berupa nama, harga,
deskripsi, dan gambar
KategoriMenu Entity Menyimpan data kategori menu
HalamanMenu Boundary Menampilkan antarmuka halaman menu
kepada customer

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 66 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



HalamanDaftarMenu Boundary Menampilkan daftar menu sesuai kategori
yang dipilih
HalamanDetailMenu  Boundary  Menampilkan nama, harga, deskripsi, dan
gambar menu
MenuController Control Mengatur alur pengambilan data kategori,
daftar menu, dan detail menu
Realisasi Use-Case

## Gambar 3.2.2 - Melihat Menu

Nama use-case : Membuat Pesanan
## Identifikasi Class
## Nama Class Class Stereotype
(Entity/Boundary/
## Control)
## Tanggung Jawab Class
Menu  Entity Menyimpan data menu yang dipilih customer

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 67 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



HalamanDetailMenu Boundary Menampilkan detail menu, jumlah pesanan,
subtotal per item, dan tombol tambah ke
keranjang
HalamanKeranjang Boundary Menampilkan daftar pesanan, subtotal per
item, total harga, dan memperbarui keranjang
secara realtime
KeranjangController Control Mengatur alur penambahan item, perhitungan
subtotal, total harga, dan pembaruan
keranjang
ItemKeranjang  Entity Mengatur proses penambahan item ke
keranjang, perubahan jumlah item,
penghapusan item, perhitungan subtotal, total
harga, dan validasi pesanan
Keranjang Entity Menyimpan kumpulan item pesanan dan
mengelola total harga keseluruhan
Meja Entity Menyimpan data meja beserta status
ketersediaannya
Realisasi Use-Case


## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 68 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## Gambar 3.2.3 - Membuat Pesanan

Nama use-case : Melakukan Pembayaran
## Identifikasi Class
## Nama Class Class Stereotype
(Entity/Boundary/C
ontrol)
## Tanggung Jawab Class
HalamanKeranjang  Boundary Menampilkan daftar pesanan dan total harga
kepada customer
HalamanInstruksiPe
mbayaran
Boundary Menampilkan instruksi pembayaran sesuai
metode yang dipilih
HalamanStatusPem
bayaran
Boundary Menampilkan pesan pembayaran berhasil atau
gagal kepada customer
PembayaranControl
ler
Control Mengatur alur pemilihan metode, pemrosesan,
dan penyimpanan data pembayaran
Keranjang Entity Menyimpan daftar pesanan dan total harga
yang akan dibayar
MetodePembayaran Entity Menyimpan data metode pembayaran yang
tersedia dan dipilih customer
Pembayaran Entity Menyimpan data transaksi pembayaran
beserta status dan hasil pembayaran
Realisasi Use-Case

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 69 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




## Gambar 3.2.4- Melakukan Pembayaran
## 3.2.3. Role Cashier
Nama use-case : Memvalidasi Pembayaran
## Identifikasi Class
## Nama Class Class Stereotype
(Entity/Boundary/Co
ntrol)
## Tanggung Jawab Class
HalamanDaftarPe
sanan
Boundary Menampilkan daftar pesanan pelanggan
dengan status menunggu
HalamanDetailPe
sanan
Boundary Menampilkan detail pesanan, informasi
pembayaran, dan tombol validasi pembayaran
HalamanInformas
iPembayaran
Boundary Menampilkan informasi pembayaran sesuai
metode yang digunakan
## Pembayaran
## Controller
Control Mengatur alur pemilihan pesanan,
pemeriksaan status pembayaran, dan validasi
pembayaran

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 70 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Pesanan Entity Menyimpan data pesanan pelanggan beserta
status pesanan
Pembayaran Entity Menyimpan data pembayaran beserta metode
dan status pembayaran
Realisasi Use-Case

## Gambar 3.2.5 - Memvalidasi Pembayaran

Nama use-case : Membatalkan Pesanan
## Identifikasi Class
## Nama Class Class Stereotype
(Entity/Boundary/Co
ntrol)
## Tanggung Jawab Class
Pesanan Entity Menyimpan data pesanan dan status pesanan
Pembayaran Entity Menyimpan data pembayaran beserta metode
dan status pembayaran
HalamanDaftarPe
sanan
Boundary Menampilkan daftar pesanan yang dapat
dibatalkan

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 71 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



HalamanDetailPe
sanan
Boundary Menampilkan detail pesanan dan informasi
pembatalan pesanan
PembayaranContr
oller
Control Mengatur alur pembatalan pesanan sebelum
maupun setelah pembayaran termasuk proses
refund

Realisasi Use-Case

## Gambar 3.2.6 - Membatalkan Pembayaran


## 3.2.4. Role Waiter
Nama use-case : Mengubah Status Pesanan
## Identifikasi Class
## Nama Class Class Stereotype
(Entity/Boundary/Co
ntrol)
## Tanggung Jawab Class

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 72 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Pesanan Entity Menyimpan data pesanan beserta status
pesanan yang dapat diperbarui
HalamanDaftarPe
sanan
Boundary Menampilkan daftar pesanan yang dapat
dipilih untuk diperbarui
HalamanDetailPe
sanan
Boundary Menampilkan detail pesanan dan informasi
status pesanan
PesananController  Control Mengatur proses pemilihan pesanan,
pembaruan status pesanan, validasi perubahan
status, dan penyimpanan perubahan status
Realisasi Use-Case



## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 73 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 3.2.7 - Mengubah status pesanan

## 3.2.5. Role Owner
Nama use-case : Menambah Akun
## Identifikasi Class
## Nama Class Class Stereotype
(Entity/Boundary/Co
ntrol)
## Tanggung Jawab Class
HalamanManajem
enAkun
Boundary  Menampilkan menu manajemen akun kepada
pengguna
HalamanDaftarAk
un
Boundary Menampilkan daftar akun dan informasi
hasil penambahan akun
FormTambahAku
n
Boundary Menampilkan form pengisian data akun baru
AkunController  Control  Mengatur alur pengisian, validasi data akun,
dan penyimpanan akun baru
Akun Entity Menyimpan data akun pengguna

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 74 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Realisasi Use-Case

Gambar 3.2.8  - Menambah akun
Nama use-case : Menambah Menu
## Identifikasi Class
## Nama Class Class Stereotype
(Entity/Boundary/Co
ntrol)
## Tanggung Jawab Class

HalamanManajemen
## Menu
Boundary  Menampilkan manajemen menu restoran
kepada pengguna

HalamanDaftarMenu
Boundary Menampilkan daftar menu dan
informasi hasil penambahan menu
FormTambahMenu Boundary Menampilkan form pengisian data menu
baru

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 75 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



MenuController  Control  Mengatur alur pengisian, validasi data
menu, dan penyimpanan menu baru
Menu Entity Menyimpan data menu restoran
Realisasi Use-Case

## Gambar 3.2.9 - Menambah Menu
Nama use-case : Menambah Meja
## Identifikasi Class
## Nama Class Class Stereotype
(Entity/Boundary/Co
ntrol)
## Tanggung Jawab Class

HalamanManajemen
## Meja
Boundary  Menampilkan menu  manajemen meja
restoran kepada pengguna

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 76 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



HalamanDaftarMeja  Boundary Menampilkan daftar meja dan
informasi hasil penambahan meja
FormTambahMeja Boundary Menampilkan form pengisian data meja
baru
MejaController  Control  Mengatur alur pengisian, validasi data
meja, dan penyimpanan meja baru
Meja Entity Menyimpan data meja restoran
Realisasi Use-Case

## Gambar 3.2.10 - Menambah Meja
Nama use-case : Melihat Laporan
## Identifikasi Class
## Nama Class Class Stereotype
(Entity/Boundary/Co
ntrol)
## Tanggung Jawab Class

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 77 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Laporan Entity Menyimpan data laporan seperti jenis laporan,
periode, dan isi laporan

LaporanControlle
r
Control Mengatur alur pemilihan jenis laporan,
periode, dan pengambilan data laporan
HalamanLaporan  Boundary  Menampilkan menu utama laporan kepada
pengguna
HalamanDaftarLa
poran
Boundary Menampilkan daftar jenis laporan dan pilihan
laporan
HalamanPilihPeri
ode
Boundary Menampilkan opsi periode laporan yang dapat
dipilih
HalamanTampilL
aporan
Boundary Menampilkan hasil laporan secara lengkap di
layar
Realisasi Use-Case

## Gambar 3.2.11 - Melihat Laporan



## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 78 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code











## 4. Model Perancangan
4.1. Deskripsi Atribut dan Method Class
Daftar Atribut dan Method Class
Daftar atribut:
## Nama Atribut Tipe Data Visibilitas
(Public/Protected/P
rivate)
## User  Interface  Public
UserWithRole Interface  Public
CreateUserInput Interface  Public
UpdateUserInput Interface  Public
UserResponse  Interface  Public
## Meja Interface  Public
KategoriMenu Interface  Public
## Menu Interface  Public
CustomerMenu  Interface  Public
DetailPesananItem Interface  Public
## Pesanan Interface  Public
DashboardStats Interface  Public
ItemLaporanPesanan  Interface  Public
MenuTerlaris Interface  Public
LaporanMenuTerlaris Interface  Public
LaporanKasir Interface  Public
LaporanSummary  Interface  Public
GrafikPoint Interface  Public
PerbandinganData Interface  Public
KategoriAnalisis Interface  Public
AnalisisTambahan  Interface  Public

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 79 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## Nama Atribut Tipe Data Visibilitas
(Public/Protected/P
rivate)
## User  Interface  Public
UserWithRole Interface  Public
CreateUserInput Interface  Public
UpdateUserInput Interface  Public
UserResponse  Interface  Public
## Meja Interface  Public
KategoriMenu Interface  Public
## Menu Interface  Public
BandingData Interface  Public
RoleUser Interface  Public
TipeMeja Interface  Public
StatusMeja  Interface  Public
StatusMenu Interface  Public
StatusPesanan Interface  Public
StatusBayar Interface  Public
MetodePembayaran  Interface  Public
PeriodeLaporan Interface  Public

Daftar method: Users
## Nama Method Visibilitas
(Public/Protected/Priv
ate)
## Keterangan
getUsers() Public (server action) Parameter: none
Return type:
Promise<UserWithRole[]>
Fungsi: Mengambil semua data
users
createUser(data) Public (server action) Parameter: {username, email?,
password, role}
Return type: Promise<{error?
success)>
Fungsi: Membuat user baru dengan
validasi password
updateUser(data) Public (server action) Parameter: {id, username, email?,
role, status, password?}
Return type: Promise<{error?

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 80 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



success}> Fungsi: Mengupdate
data user
deleteUser(id) Public (server action) Parameter: id: number
Return type: Promise
Fungsi: Menghapus user (owner
tidak bisa dihapus)

Daftar method: User
## Nama Method Visibilitas
(Public/Protected/Priv
ate)
## Keterangan
toggleUserStatus(id, status) Public (server action) Parameter: id: number, status:
boolean
Return type: Promise<void>
## Fungsi: Mengaktifkan/nonaktifkan
user
loginAction(prevState,
formData)
Public (server action) Parameter: prevState, formData
Return type: Promise<{success,
error}>
Fungsi: Login menggunakan
NextAuth
logoutAction() Public (server action) Parameter: none
Return type: Promise<void>
Fungsi: Logout dan redirect ke
## /login
forgotPasswordAction(prevSta
te, formData)
Public (server action) Parameter: prevState, formData
Return type: Promise<{error,
success}>
Fungsi: Kirim email reset
password
resetPasswordAction(prevStat
e, formData)
Public (server action) Parameter: prevState, formData
Return type: Promise<{error,
success}>
Fungsi: Verifikasi username untuk
reset password
resetPasswordConfirmAction(
prevState, formData)
Public (server action) Parameter: prevState, formData

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 81 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Return type: Promise<{error,
success}>
Fungsi: Konfirmasi reset password
dengan token

Daftar method: Meja
## Nama Method Visibilitas
(Public/Protected/Priv
ate)
## Keterangan
getMeja() Public (server action) Parameter: none
Return type:
Promise<MejaResult[]>
Fungsi: Mengambil semua data
meja (tanpa soft delete)
getMejaByToken(tokenMeja)  Public (server action) Parameter: tokenMeja: string
Return type: Promise<Meja>
Fungsi: Mencari meja berdasarkan
token
getNextNomorMeja(tipe) Public (server action) Parameter: tipe: TipeMeja
Return type: Promise<string>
Fungsi: Generate nomor meja
berikutnya
createMeja(prevState,
formData)
Public (server action) Parameter: prevState, formData
Return type: Promise<{error?)>
Fungsi: Membuat meja baru
dengan nomor & token otomatis
updateMeja(id, formData) Public (server action) Parameter: id: number, formData
→ Return type: Promise<{error?)>
Fungsi: Mengupdate kapasitas
meja
deleteMeja(id) Public (server action) Parameter: id: number
Return type: Promise<{error?)>
Fungsi: Soft delete meja (jika tidak
terpakai)





## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 82 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Daftar method: Kategori Menu
## Nama Method Visibilitas
(Public/Protected/Priv
ate)
## Keterangan
getKategoriMenus() Public (server action) Parameter: none
Return type:
Promise<KategoriMenu[]>
Fungsi: Mengambil semua
kategori menu aktif
createKategori(data) Public (server action) Parameter: {namaKategori: string}
Return type: Promise<{error}>
Fungsi: Membuat kategori baru
(restore jika sebelumnya di-soft
delete)
updateKategori(id, data) Public (server action) Parameter: id: number,
{namaKategori: string}
Return type: Promise<{error}>
Fungsi: Mengupdate nama
kategori
deleteKategori(id) Public (server action) Parameter: id: number
Return type: Promise<{error}>
Fungsi: Soft delete kategori (jika
tidak digunakan menu aktif)





Daftar method: Menu
## Nama Method Visibilitas
(Public/Protected/Priv
ate)
## Keterangan
getMenus() Public (server action) Parameter: none
Return type:
Promise<MenuWithKategori[]>
Fungsi: Mengambil semua menu
dengan kategori & foto

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 83 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



getMenusForCustomer() Public (server action) Parameter: none
Return type:
Promise<CustomerMenu[]>
Fungsi: Mengambil menu tersedia
untuk customer
createMenu(data) Public (server action) Parameter: CreateMenuInput
Return type: Promise<{error?}>
Fungsi: Membuat menu baru
dengan validasi
updateMenu(data) Public (server action) Parameter: UpdateMenuInput
Return type: Promise<{error?}>
Fungsi: Mengupdate data menu
deleteMenu(id) Public (server action) Parameter: id: number
Return type: Promise<{success}>
Fungsi: Soft delete menu dan
hapus semua foto
toggleStatusMenu(id, status) Public (server action) Parameter: id: number, status:
StatusMenu
Return type: Promise<void>
Fungsi: Mengubah status
ketersediaan menu













Daftar method: MenuFoto
## Nama Method Visibilitas
(Public/Protected/Priv
ate)
## Keterangan

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 84 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



saveMenuFotoUrls(menuId,
urls, fileKeys)
Public (server action) Parameter: menuId, urls[],
fileKeys[]
Return type: Promise<void>
Fungsi: Menyimpan URL foto ke
database
deleteMenuFoto(fotoId) Public (server action) Parameter: fotoId: number
Return type: Promise<void>
Fungsi: Hapus foto dari
penyimpanan & database
getMenuFotos(menuId) Public (server action) Parameter: menuId: number
Return type:
Promise<MenuFoto[]>
Fungsi: Mengambil semua foto
suatu menu
deleteAllMenuFotos(menuId) Private (internal) Parameter: menuId: number
Return type: Promise<void>
Fungsi: Hapus semua foto menu
(dari penyimpanan & DB)
uploadMenuFoto(menuId,
formData)
Public (server action) Parameter: menuId, formData
Return type: Promise<{error?}>
Fungsi: Upload & kompres foto
menu ke UploadThing

Daftar method: Pesanan
## Nama Method Visibilitas
(Public/Protected/Priv
ate)
## Keterangan
createPesanan(data) Public (server action) Parameter: {tokenMeja, items[]}
Return type: Promise<{error?>
Fungsi: Membuat pesanan baru
oleh customer via token meja
getPesananForDashboard(filte
rs?)
Public (server action) Parameter: {status?, tanggal?,
mejaId?}
Return type:
Promise<PesananItem[]>

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 85 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



Fungsi: Mengambil data pesanan
untuk tampilan dashboard
getPesananForCheckout(id) Public (server action) Parameter: id: number
Return type:
Promise<CheckoutData>
Fungsi: Mengambil data pesanan
untuk checkout
getPesananById(id) Public (server action) Parameter: id: number
Return type:
Promise<PesananDetail>
Fungsi: Mengambil detail lengkap
pesanan
getPesananBelumBayar() Public (server action) Parameter: none
Return type:
Promise<KasirPesanan[]>
Fungsi: Mengambil pesanan yang
belum dibayar


## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 86 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



4.2. Struktur Class dan Class Diagram







4.3. Interaksi Objek Perangkat Lunak dan Sequence Diagram
## 4.3.1. Login
Nama use-case: Login

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 87 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## Skenario & Interaksi
## Skenario Interaksi Objek
## Actor System
inputCredentials() - User memasukkan email dan password
- signIn('credentials') View mengirim kredensial ke Auth
## Action
- user.findUnique() Action mencocokkan data user di Prisma
redirectDashboard() - Sistem mengarahkan user ke halaman
## Dashboard

Gambar 4.3.1  - SD.01 Login
## 4.3.2. Customer
Nama use-case: Melihat Menu
## Skenario & Interaksi
## Skenario Interaksi Objek
## Actor System

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 88 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



scanQR(qrData) - Customer mengirim data QR
- validasiToken() View memanggil Action untuk validasi
- getMenus() View meminta data menu dari Action
- menu.findMany() Action mengambil data via Prisma
tampilkanMenu() - Menu ditampilkan ke user via Shadcn UI
scanQR(qrData) - Customer mengirim data QR

Gambar 4.3.2 - SD.02 Melihat Menu
Nama use-case: Membuat Pesanan
## Skenario & Interaksi
## Skenario Interaksi Objek
## Actor System
pilihMenu() - Customer memilih item menu
- createOrder(data) View mengirim data pesanan ke Action
- order.create() Action membuat pesanan baru di Prisma
tampilkanKonfirmas
i()
- UI menampilkan detail pesanan

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 89 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 4.3.3 - SD.03 Membuat Pesanan
Nama use-case: Melakukan Pembayaran
## Skenario & Interaksi
## Skenario Interaksi Objek
## Actor System
pilihMetodeBayar() - Customer memilih metode pembayaran di
## View
- processPayment(id) View mengirim instruksi bayar ke Action
- payment.update() Action mengubah status pembayaran di
## Prisma
tampilkanE-Receipt(
## )
- View menampilkan struk digital ke
## Customer

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 90 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 4.3.4 - SD.04 Melakukan Pembayaran
Nama use-case: Validasi Pembayaran
## Skenario & Interaksi
## Skenario Interaksi Objek
## Actor System
klikKonfirmasi() - Kasir menekan tombol validasi di View
- validatePayment(id) View memanggil fungsi validasi di Action
- payment.update() Action menandai pembayaran 'Verified' di
## Prisma
updateStatusValid() - Status pesanan diperbarui secara real-time
di View

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 91 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 4.3.5 - SD.05 Validasi Pembayaran
Nama use-case: Mengubah Status Pesanan
## Skenario & Interaksi
## Skenario Interaksi Objek
## Actor System
ubahStatus('Selesai') - Waiter/Dapur mengubah status pesanan di
## View
- updateStatus(id) View mengirim perubahan status ke
## Action
- order.update() Action memperbarui status pesanan di
## Prisma
toastStatusUpdated() - Notifikasi perubahan status muncul di
## View

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 92 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 4.3.6 - SD.06 Mengubah Status Pesanan
Nama use-case: Mengelola Menu
## Skenario & Interaksi
## Skenario Interaksi Objek
## Actor System
inputNomorMenu() - Owner memasukkan data menu baru
- createMenu(data) View mengirim data menu baru ke Action
- menu.create() Action menyimpan data menu di Prisma

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 93 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 4.3.7 - SD.07 Mengelola Menu
Nama use-case: Mengelola Meja
## Skenario & Interaksi
## Skenario Interaksi Objek
## Actor System
inputNomorMeja() -

Owner memasukkan data nomor meja
baru
- createTable(data) View mengirim data meja baru ke Action
- table.create() Action menyimpan data meja di Prisma

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 94 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 4.3.8 - SD.08 Mengelola Meja
Nama use-case: Mengelola Akun
## Skenario & Interaksi
## Skenario Interaksi Objek
## Actor System
inputAccount() - Owner memasukkan data akun baru
- createAccount(data) View mengirim data akun baru ke Action
- account.create() Action menyimpan data akun di Prisma

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 95 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 4.3.9 - SD.09 Mengelola Akun
Nama use-case: Melihat Laporan
## Skenario & Interaksi
## Skenario Interaksi Objek
## Actor System
bukaDashboard() - Owner membuka halaman laporan di
## View
- getRevenueData() View meminta data pendapatan dari
## Action
- order.findMany() Action mengambil data transaksi dari
## Prisma
renderChartShadcn() - View menampilkan grafik data
menggunakan Shadcn

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 96 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 4.3.10 - SD.10 Melihat Laporan

## 4.4. Rancangan User Interface
## 4.4.1. Login
## ● Login

Gambar 4.1.1 - Login role


## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 97 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code






## 4.4.2. Role Customer
## ● Daftar Menu

## Gambar 4.1.2 - Daftar Menu
## ● Detail Menu

## Gambar 4.1.3 - Detail Menu

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 98 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## ● Detail Pesanan

## Gambar 4.1.4 - Detail Pesanan
## ● Pembayaran

## Gambar 4.15 - Pembayaran
## ● Bayar Tunai

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 99 dari 115 halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




## Gambar 4.1.6 - Bayar Tunai
## ● Bayar Transfer

## Gambar 4.1.7 - Bayar Transfer
## ● Bayar Qris

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 100 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




## Gambar 4.1.8 - Bayar Qris

## ● Status Pesanan

## Gambar 4.1.9 - Status Pesanan

## 4.4.3. Role Owner
● Dashboard owner

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 101 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




## Gambar 4.1.10 - Dashboard Owner
## ● Pesanan

## Gambar 4.1.11 - Pesanan
## ● Riwayat

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 102 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




## Gambar 4.1.12 - Riwayat
## ● Kelola Menu

## Gambar 4.1.13 - Kelola Menu
## ● Tambah Menu

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 103 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




## Gambar 4.1.14 - Tambah Menu
● Tambah kategori

Gambar 4.1.15 - Tambah kategori
## ● Kelola Meja

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 104 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




Gambar 4.1.16 - Kelola meja
## ● Tambah Meja

Gambar 4.1.17 -Tambah Meja
## ● Kelola Akun

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 105 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




## Gambar 4.1.18 - Kelola Akun



## ● Logging

## Gambar 4.1.19 - Logging
## ● Laporan

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 106 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




## Gambar 4.1.20 - Laporan & Analitik
## 4.4.4. Role Cashier
## ● Dashboard Kasir

## Gambar 4.1.21 - Dashboard Kasir
## ● Kelola Pesanan

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 107 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




## Gambar 4.1.22 - Kelola Pesanan
## ● Riwayat

## Gambar 4.1.23 - Riwayat
## ● Buat Pesanan Baru

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 108 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




## Gambar 4.1.24- Buat Pesanan  Baru
## ● Belum Bayar

## Gambar 4.1.25- Belum Bayar
## ● Riwayat

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 109 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




## Gambar 4.1.26 - Riwayat
## 4.4.5. Role Waiter
## ● Dashboard Waiter

## Gambar 4.1.27 - Dashboard Waiter
## ● Kelola Pesanan

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 110 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code




## Gambar 4.1.28- Kelola Pesanan
## ● Riwayat

## Gambar 4.1.29 - Riwayat





## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 111 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## 4.5. Struktur Basis Data

## Gambar 4.5 - Struktur Basis Data

## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 112 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code



## 5. Traceability Use Case


## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 113 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code

## Use
## Case
## Skenario
## Perancangan
## Sequence Diagram Class Diagram Activity Diagram
## UC.01 SUC.01.04 SD.01 CD.01

## AD.04
## SUC.01.02
## SUC.01.03
## SUC.01.04
## UC.02 SUC.13.01 SD.09 AD.08
## SUC.13.02
## SUC.13.03
## SUC.13.04
## SUC.13.05
## UC.03 SUC.14.01 SD.07 AD.09
## SUC.14.02
## SUC.14.03
## SUC.14.04
## SUC.14.05
## UC.04 SUC.02.01 SD.02 AD.04
## SUC.02.02
## SUC.02.03
## SUC.02.04
## SUC.02.05
## UC.05 SUC.16.01 SD.08 AD.10
## SUC.16.02
## SUC.16.03
## SUC.16.04
## SUC.16.05
## SUC.16.06
## UC.06 SUC.03.01 SD.03 AD.02
## SUC.03.02
## SUC.03.04
## SUC.03.05
## SUC.03.06
## UC.07 SUC.04.01 SD.03 AD.02
## SUC.04.02
## SUC.04.03
## UC.08 SUC.03.01 SD.04 AD.03
## SUC.03.02
## SUC.03.05
## SUC.03.06
## UC.09 SUC.09.01 SD.04 AD.03
## SUC.09.02 SD.05 AD.05

## SUC.09.03



## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 114 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code

## SUC.09.04
## UC.10   SUC.10.01
## SD.04 AD.03
## SUC.10.02
## SD.05 AD.05
## SUC.10.03

## UC.11 SUC.01.01 SD.05 AD.05
## SUC.01.02
## SUC.01.05
## SUC.01.06
## UC.12 SUC.01.01 SD.10 AD.11
## SUC.01.02
## SUC.01.03
## SUC.01.04
## UC.13 SUC.13.01 SD.06 AD.7
## SUC.13.02
## SUC.13.03
## SUC.13.04
## UC.14 SUC.14.01 SD.05 AD.06
## SUC.14.02
## SUC.14.03
## UC.15 SUC.15.01  AD.15
## SUC.15.02
## SUC.15.03
## SUC.15.04
## SUC.15.05
## UC.16 SUC.16.01  AD.16
## SUC.16.02
## SUC.16.03
## SUC.16.04
## UC.17
## SUC.17.01
## AD.17
## SUC.17.02
## SUC.17.03
## SUC.17.04
## UC.18
## SUC.18.01
## AD.18
## SUC.18.02
## SUC.18.03
## SUC.18.04
## SUC.18.05
## UC.19
## SUC.19.01
## AD.19
## SUC.19.02
## SUC.19.03
## UC.20
## SUC.20.01
## AD.20
## SUC.20.02
## SUC.20.03




## Quarta Code
## SKPL-PRINGMONI-V1.0
Halaman 115 dari 115
halaman
Dokumen ini dan informasi yang dimilikinya adalah milik Quarta Code dan bersifat rahasia. Dilarang untuk mereproduksi
dokumen ini tanpa diketahui oleh Quarta Code

## UC.21
## SUC.21.01
## AD.21
## SUC.21.02
## SUC.21.03
## SUC.21.04
## SUC.21.05
## UC.22
## SUC.22.01
## AD.22
## SUC.22.02
## SUC.22.03
## UC.23
## SUC.23.01
## AD.23
## SUC.23.02
## SUC.23.03