# Raka Aditya · Front-end Developer Portfolio

Portofolio full-stack dengan desain satu halaman, katalog tanaman Tumbuh, dan panel pengelolaan konten. Raka Aditya adalah persona fiktif dari galeri Ruang Karya.

## Fitur

- Halaman publik menampilkan profil, pengalaman, karya terbit, kredit, dan ikon Instagram, LinkedIn, serta GitHub.
- Panel admin menyediakan login, pengelolaan profil, pengalaman, draf dan publikasi karya, serta katalog Tumbuh.
- Katalog Tumbuh memiliki filter kebutuhan cahaya dan panduan perawatan. Admin dapat menyunting isi dan memilih foto dari aset yang tersedia.
- Formulir kontak menyimpan pesan di PostgreSQL. Admin dapat membaca, menandai, dan menghapus pesan di kotak masuk.

Frontend memakai React, TypeScript, Vite, dan CSS Modules. Backend memakai Express, Prisma, dan PostgreSQL. Sesi admin disimpan di PostgreSQL.

## Menjalankan secara lokal

Siapkan Node.js 24 dan PostgreSQL. Buat database kosong dan pengguna PostgreSQL yang memiliki akses untuk menjalankan migrasi pada database itu. Salin `.env.example` menjadi `.env`, lalu isi `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, dan `ADMIN_PASSWORD`.

Gunakan kata sandi admin unik dengan panjang minimal 16 karakter. Buat rahasia sesi dengan perintah berikut.

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

```sh
npm ci
npm run db:migrate
npm run db:seed
npm run admin:provision
npm run dev
```

Buka [portofolio](http://127.0.0.1:5174/), [katalog Tumbuh](http://127.0.0.1:5174/tumbuh), atau [panel admin](http://127.0.0.1:5174/admin). `admin:provision` membuat atau mengganti akun admin dan mengakhiri sesi yang ada. Setelah akun dibuat, kredensial provisioning dapat dikeluarkan dari konfigurasi runtime. `db:seed` mengisi data contoh satu kali.

## Menjalankan hasil build

```sh
npm run build
npm start
```

Express menyajikan hasil build dan API pada host dan port yang sama. Untuk mencoba build secara lokal dengan pengaturan port bawaan, atur `APP_ORIGIN=http://127.0.0.1:4174`. Saat hosting, gunakan origin HTTPS publik yang tepat dan sesuaikan `HOST`, `PORT`, serta `TRUST_PROXY_HOPS` dengan topologi layanan. `TRUST_PROXY_HOPS` bernilai `0` saat klien langsung terhubung ke Express. Jika Express berada di belakang proxy, pastikan proxy tepercaya mengganti header `X-Forwarded-*` sebelum mengatur jumlah hop.

## Struktur

| Folder | Isi |
| --- | --- |
| `src/` | Halaman publik, Tumbuh, panel admin, dan aset |
| `server/` | REST API, sesi, autentikasi, dan koneksi database |
| `shared/` | Skema validasi dan tipe data |
| `prisma/` | Skema database, migrasi, dan data awal |

## Kredit

- Pengembangan proyek oleh [guspriaman](https://github.com/guspriaman) untuk [guspriStack](https://github.com/guspristack).
- Desain publik, potret generatif, dan foto generatif Tumbuh berasal dari prototipe Ruang Karya. Kredit per karya di halaman publik menggunakan persona fiktif Raka Aditya.
