// app/api/guilds/[guildId]/configs/route.js
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

async function getSessionOrUnauth() {
  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, sessionOptions);
  if (!session.user) return null;
  return session;
}

// GET /api/guilds/:guildId/configs
export async function GET(request, { params }) {
  const session = await getSessionOrUnauth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { guildId } = await params;
  const sb = getSupabase();

  const { data, error } = await sb
    .from("ticket_configs")
    .select("*")
    .eq("guild_id", guildId)
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Konversi snake_case → camelCase agar kompatibel dgn bot & dashboard lama
  return Response.json(data.map(toClient));
}

// POST /api/guilds/:guildId/configs
export async function POST(request, { params }) {
  const session = await getSessionOrUnauth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { guildId } = await params;
  const body = await request.json();
  const sb = getSupabase();

  const row = {
    id:           `cfg_${Date.now()}`,
    guild_id:     guildId,
    created_by:   session.user.id,
    label:        body.label,
    emoji:        body.emoji        ?? null,
    category:     body.category     ?? "TICKETS",
    channel_id:   body.channelId    ?? null,
    ping_role:    body.pingRole     ?? null,
    log_channel:  body.logChannel   ?? null,
    greeting:     body.greeting     ?? null,
    max_open:     body.maxOpen      ?? 3,
    allow_reopen: body.allowReopen  ?? true,
    enabled:      body.enabled      ?? true,
  };

  const { data, error } = await sb
    .from("ticket_configs")
    .insert(row)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json(toClient(data), { status: 201 });
}

// ── Helper: DB row → client object (camelCase) ────────────────────────────────
function toClient(row) {
  return {
    id:          row.id,
    guildId:     row.guild_id,
    createdBy:   row.created_by,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
    label:       row.label,
    emoji:       row.emoji,
    category:    row.category,
    channelId:   row.channel_id,
    pingRole:    row.ping_role,
    logChannel:  row.log_channel,
    greeting:    row.greeting,
    maxOpen:     row.max_open,
    allowReopen: row.allow_reopen,
    enabled:     row.enabled,
  };
}
