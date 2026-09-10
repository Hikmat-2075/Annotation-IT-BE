# Annotation-IT-BE

Backend API untuk sistem anotasi data transaksi e-grocery, digunakan untuk membangun dataset pelabelan **bundle produk** (kelompok item yang sering dibeli bersamaan) beserta jenis relasinya. Anotator menganalisis riwayat transaksi pengguna, mengelompokkan item ke dalam bundle, dan memberi label tipe korelasi (komplementer, kemiripan, kontekstual, atau berbasis event) lengkap dengan alasannya. Hasil anotasi dapat diekspor (JSON/CSV) untuk keperluan pelatihan model rekomendasi produk.

> Proyek ini dikembangkan sebagai bagian dari program **Kerja Praktik**.

## Tech Stack

- **Framework:** NestJS 11 (TypeScript)
- **Database:** MongoDB (Mongoose 9)
- **Autentikasi:** JWT (access & refresh token) dengan Passport
- **Validasi:** class-validator, class-transformer, Joi (validasi environment variable)
- **Penyimpanan file:** AWS S3 (S3-compatible object storage) via `@aws-sdk/client-s3` + Multer untuk upload foto profil
- **Dokumentasi API:** Swagger (`@nestjs/swagger`)
- **Keamanan:** bcrypt untuk hashing password
- **Deployment:** Docker & Docker Compose
- **Testing:** Jest

## Fitur Utama

**Autentikasi & Profil**
- Registrasi & login annotator dengan JWT (access + refresh token)
- Lihat dan perbarui profil, termasuk unggah foto profil ke S3

**Manajemen Annotator**
- CRUD data annotator lengkap dengan foto profil
- Statistik performa per annotator

**Manajemen Item & Transaksi**
- Import data item produk (bulk)
- Import data transaksi pengguna (bulk)
- Penugasan transaksi ke annotator secara acak (batch) maupun manual
- Melihat transaksi yang sedang ditugaskan ke annotator yang login
- Statistik distribusi status transaksi

**Proses Anotasi**
- Pengajuan (submit) hasil anotasi bundle untuk suatu transaksi, termasuk penentuan status korelasi dan tipe relasi antar item
- Riwayat anotasi per annotator maupun seluruh pengguna
- Ekspor hasil anotasi ke format JSON dan CSV
- Statistik distribusi korelasi dan ringkasan hasil anotasi

**Data Seeding**
- Script seeder untuk mengisi data awal (items, annotators, transactions, annotations) baik untuk lingkungan development maupun production

## Instalasi & Menjalankan Proyek

### Prasyarat
- Node.js
- MongoDB (lokal atau via Docker)
- Akun/endpoint S3-compatible storage (untuk fitur upload gambar)

### Langkah instalasi

```bash
# 1. Clone repository
git clone <repository-url>
cd backend-anotation

# 2. Install dependencies
npm install

# 3. Salin file environment dan sesuaikan nilainya
cp .env.example .env
```

Variabel environment yang perlu diisi di `.env`: `PORT`, `DATABASE_URI`, `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION`, `NODE_ENV`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL`, `APP_NAME`, `APP_VERSION`.

```bash
# 4. Jalankan dalam mode development
npm run start:dev

# 5. (Opsional) Isi data awal
npm run seed:all
```

### Menjalankan dengan Docker

```bash
docker compose up -d
```

### Build untuk production

```bash
npm run build
npm run start:prod
```

## Struktur Folder Singkat

```
src/
├── auth/             # Registrasi, login, refresh token, profil
├── annotators/        # Manajemen data annotator
├── items/             # Manajemen data item produk
├── transactions/       # Manajemen & penugasan transaksi
├── annotations/        # Proses & hasil anotasi bundle
└── database/
    └── seeders/         # Script pengisian data awal
```
