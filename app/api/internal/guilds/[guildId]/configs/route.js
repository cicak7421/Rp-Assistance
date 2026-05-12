// app/api/internal/guilds/[guildId]/configs/route.js
// Dipanggil oleh Discord bot — auth via x-bot-secret header
export const runtime = "nodejs";

import { getSupabase } from "@/lib/supabase";

function requireBotSecret(request) {
  return request.headers.get("x-bot-secret") === process.env.BOT_SECRET;
}

function toClient(row) {
  return {
    id:          row.id,
    guildId:     row.guild_id,
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

export async function GET(request, { params }) {
  if (!requireBotSecret(request)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { guildId } = await params;
  const sb = getSupabase();

  const { data, error } = await sb
    .from("ticket_configs")
    .select("*")
    .eq("guild_id", guildId)
    .eq("enabled", true)
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json(data.map(toClient));
}
