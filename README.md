# JADI BOT WA — Proyek Utama

Landing page + daftar + login + dashboard + bot engine. Ini yang diakses publik/user.

Proyek admin (approve akun) **terpisah**, ada di zip `jadibotwa-admin.zip` — deploy sebagai project Vercel sendiri, jangan digabung ke sini.

## Deploy

1. Jalankan `schema.sql` di Supabase SQL Editor (kalau belum)
2. Push folder ini ke GitHub (repo terpisah dari admin)
3. Import ke Vercel → New Project
4. Isi Environment Variables sesuai `.env.example` (value udah keisi, tinggal copy)
5. Deploy

## Bot Engine (Termux di HP sendiri + ngrok)

Folder `bot-engine/` dijalanin dari **Termux** (aplikasi terminal Android), bukan dari layanan cloud — biar gratis 100% tanpa kartu.

1. Pindahin folder `bot-engine/` ke Termux
2. `pkg install nodejs libvips ffmpeg -y` lalu `npm install`
3. `export BOT_SECRET=jbw9x2Kp7mQeR4vLdN8t` lalu `node index.js`
4. Buka tunnel publik pakai **localtunnel** (gratis, gak perlu kartu, murni JavaScript jadi kompatibel di Termux):
   ```
   node tunnel.js
   ```
   URL publiknya bakal muncul di layar, contoh: `https://jadibotcidwa.loca.lt`
5. Copy URL ngrok itu → isi ke `BOT_ENGINE_URL` di Environment Variables Vercel → redeploy
6. Biar HP gak "bunuh" proses pas layar mati: `termux-wake-lock` + matiin battery optimization buat Termux di Settings HP

⚠️ **Catatan jujur**: karena bot-engine jalan di HP sendiri (bukan server cloud), bot cuma aktif selama HP-nya nyala & Termux jalan. Kalau HP mati/restart/kehabisan baterai, bot ikut mati sampai HP nyala lagi dan Termux+ngrok dijalanin ulang. Cocok buat skala personal/kecil.

## Alur pemakaian

1. User daftar di `/daftar` → status pending
2. Admin approve lewat proyek admin (zip terpisah)
3. User login → `/dashboard` → connect nomor WA → tautkan di WhatsApp → klik Aktifkan
4. Command bot: `.menu`, `.stiker`, `.stikertext`, `.pdf`, `.kalkulasi`
