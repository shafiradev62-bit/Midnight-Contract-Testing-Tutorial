# Panduan Testing Kontrak Midnight! 🚀

Halo! Ini adalah panduan lengkap buat kamu yang pengen belajar testing kontrak Compact di jaringan Midnight dengan mudah dan terstruktur.

Repo ini dibuat untuk mengikuti bounty dari Midnight Network: [Tutorial: Testing Compact Contracts](https://github.com/midnightntwrk/contributor-hub/issues/312)

## Apa yang Ada di Sini? 📦

- **Simulator Kontrak**: Alat buat ngetes logika kontrak secara lokal tanpa harus deploy!
- **Tes Otomatis**: Pakai Vitest buat testing yang cepat dan terpercaya
- **CI/CD Otomatis**: GitHub Actions yang ngerun tes setiap kamu ngirim perubahan
- **TypeScript**: Biar kodenya lebih aman dan mudah dipahami
- **Contoh Kode**: Ada contoh kontrak token sederhana beserta tesnya!

## Yang Kamu Butuhkan 📋

- Node.js versi 18 ke atas
- npm (atau yarn)
- Teks editor kesayanganmu!

## Cara Mulai Cepat! ⚡

```bash
# 1. Download repo ini
git clone https://github.com/shafiradev62-bit/Midnight-Contract-Testing-Tutorial.git
cd Midnight-Contract-Testing-Tutorial

# 2. Install semua yang dibutuhkan
npm install

# 3. Jalanin tes buat lihat apakah semua berjalan
npm test

# 4. Kalo mau develop, pake mode watch
npm run dev

# 5. Lihat seberapa banyak kode yang ke-tes
npm run test:coverage
```

## Isi Repo 📁

```
midnight-contract-testing-tutorial/
├── .github/
│   └── workflows/
│       └── ci.yml          # Settingan GitHub Actions
├── src/
│   └── contract-simulator.ts  # Kode simulator kontrak
├── tests/
│   └── contract-simulator.test.ts  # Kode tes
├── TUTORIAL_DRAFT.md       # Panduan lengkapnya!
├── README.md
└── ... file lain
```

## Panduan Lengkapnya 📖

Baca [TUTORIAL_DRAFT.md](./TUTORIAL_DRAFT.md) buat panduan langkah demi langkah tentang:
1. Setting proyek dari awal
2. Bikin simulator kontrak sendiri
3. Nulis tes yang bagus
4. Ngeset GitHub Actions biar otomatis

## Info Penting 📌

- Repo: https://github.com/shafiradev62-bit/Midnight-Contract-Testing-Tutorial
- Bounty: https://github.com/midnightntwrk/contributor-hub/issues/312

Selamat belajar dan semoga berhasil! 🎉

## Lisensi

MIT
