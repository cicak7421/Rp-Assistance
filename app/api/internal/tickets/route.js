// app/api/internal/tickets/route.js
// Dipanggil oleh Discord bot untuk log ticket events
export const runtime = "nodejs";

import { getSupabase } from "@/lib/supabase";

function requireBotSecret(request) {
  return request.headers.get("x-bot-secret") === process.env.BOT_SECRET;
}

export async function POST(request) {
  if (!requireBotSecret(request)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { guildId, event } = await request.json();

  if (!guildId || !event) {
    return Response.json({ error: "Missing guildId or event" }, { status: 400 });
  }

  const sb = getSupabase();

  const { error } = await sb.from("ticket_events").insert({
    guild_id:   guildId,
    ticket_id:  `t_${Date.now()}`,
    type:       event.type,
    user_id:    event.userId    ?? null,
    config_id:  event.configId  ?? null,
    channel_id: event.channelId ?? null,
    status:     event.status    ?? null,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
