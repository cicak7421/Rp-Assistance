# TicketForge — Setup Guide (Vercel + Supabase)

## Arsitektur

```
Discord Bot (Railway/VPS)
  └── panggil API_BASE → Vercel Next.js
        └── baca/tulis data → Supabase PostgreSQL

Browser (User)
  └── buka dashboard → Vercel Next.js
        └── Discord OAuth → session → CRUD configs
```

---

## 1. Setup Supabase

1. Buka [supabase.com](https://supabase.com) → buat project baru
2. Masuk ke **SQL Editor** → paste isi file `supabase/schema.sql` → Run
3. Ke **Settings → API**, copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Setup Discord Application

1. Buka [discord.com/developers/applications](https://discord.com/developers/applications)
2. Pilih aplikasi bot kamu → **OAuth2**
3. Di **Redirects**, tambah:
   ```
   https://NAMA_PROJECT.vercel.app/api/auth/callback
   ```
4. Copy **Client ID** dan **Client Secret**

---

## 3. Deploy ke Vercel

```bash
# Clone / upload folder ticketforge-next ke GitHub

# Install Vercel CLI (opsional)
npm i -g vercel

# Deploy
vercel
```

### Environment Variables di Vercel Dashboard

Masuk ke project Vercel → **Settings → Environment Variables**, tambah:

| Key | Value |
|-----|-------|
| `DISCORD_CLIENT_ID` | Client ID Discord app kamu |
| `DISCORD_CLIENT_SECRET` | Client Secret Discord app |
| `DISCORD_REDIRECT_URI` | `https://nama.vercel.app/api/auth/callback` |
| `SUPABASE_URL` | URL dari Supabase project |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key dari Supabase |
| `SESSION_SECRET` | String random 32+ karakter (`openssl rand -base64 32`) |
| `BOT_SECRET` | String random bebas, harus sama dengan di bot |
| `DASHBOARD_URL` | `https://nama.vercel.app` |

---

## 4. Update Bot Discord

Copy `BOT_ENV_TEMPLATE.env` → jadikan `.env` bot kamu, isi semua nilai:

```env
API_BASE=https://nama.vercel.app   # ← ganti ini!
BOT_SECRET=sama_dengan_vercel_env
```

Bot tidak perlu diubah kodenya — hanya `.env` yang perlu diupdate.

---

## 5. Test

1. Buka `https://nama.vercel.app` → login Discord
2. Pilih server → buat konfigurasi ticket
3. Di Discord, jalankan `/ticket setup` → bot akan fetch config dari Vercel
4. `/ticket panel` → kirim panel ke channel

---

## Struktur File

```
ticketforge-next/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── url/route.js          ← generate OAuth URL
│   │   │   ├── callback/route.js     ← handle OAuth callback
│   │   │   ├── me/route.js           ← get current user
│   │   │   └── logout/route.js       ← destroy session
│   │   ├── guilds/
│   │   │   ├── route.js              ← list admin guilds
│   │   │   └── [guildId]/
│   │   │       ├── configs/
│   │   │       │   ├── route.js      ← GET, POST configs
│   │   │       │   └── [configId]/route.js  ← PUT, DELETE config
│   │   │       └── tickets/route.js  ← ticket stats
│   │   └── internal/
│   │       ├── guilds/[guildId]/configs/route.js  ← untuk bot
│   │       └── tickets/route.js                   ← log dari bot
│   ├── dashboard/page.jsx            ← dashboard UI
│   ├── page.jsx                      ← login page
│   └── layout.jsx
├── lib/
│   ├── supabase.js                   ← Supabase client
│   └── session.js                    ← iron-session config
└── supabase/
    └── schema.sql                    ← buat tabel di Supabase
```
