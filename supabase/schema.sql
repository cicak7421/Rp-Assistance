-- TicketForge Supabase Schema
-- Run this in Supabase SQL Editor

-- ── TICKET CONFIGS ────────────────────────────────────────────────────────────
create table if not exists ticket_configs (
  id            text primary key,              -- cfg_<timestamp>
  guild_id      text not null,
  created_by    text not null,                 -- Discord user ID
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  -- Config fields (mirror dari Express version)
  label         text not null,
  emoji         text,
  category      text,
  channel_id    text,
  ping_role     text,
  log_channel   text,
  greeting      text,
  max_open      int default 3,
  allow_reopen  boolean default true,
  enabled       boolean default true
);

create index if not exists ticket_configs_guild_id_idx on ticket_configs (guild_id);

-- ── TICKET EVENTS ─────────────────────────────────────────────────────────────
create table if not exists ticket_events (
  id            bigserial primary key,
  guild_id      text not null,
  ticket_id     text,                          -- t_<timestamp>
  type          text not null,                 -- open | close | claim | delete
  user_id       text,
  config_id     text,
  channel_id    text,
  status        text,                          -- open | closed
  created_at    timestamptz default now()
);

create index if not exists ticket_events_guild_id_idx on ticket_events (guild_id);
create index if not exists ticket_events_created_at_idx on ticket_events (created_at desc);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Semua akses lewat service_role key dari backend, bukan langsung dari browser
alter table ticket_configs enable row level security;
alter table ticket_events  enable row level security;

-- Service role bypass RLS by default, jadi tidak perlu policy tambahan.
-- Kalau mau expose ke client-side, tambah policy di sini.
