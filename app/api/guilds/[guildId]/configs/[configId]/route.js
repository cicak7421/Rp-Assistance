// app/api/guilds/[guildId]/configs/[configId]/route.js
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

// PUT /api/guilds/:guildId/configs/:configId
export async function PUT(request, { params }) {
  const session = await getSessionOrUnauth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { guildId, configId } = await params;
  const body = await request.json();
  const sb = getSupabase();

  const updates = {
    updated_at: new Date().toISOString(),
  };

  // Only update fields yang dikirim
  if (body.label       !== undefined) updates.label        = body.label;
  if (body.emoji       !== undefined) updates.emoji        = body.emoji;
  if (body.category    !== undefined) updates.category     = body.category;
  if (body.channelId   !== undefined) updates.channel_id   = body.channelId;
  if (body.pingRole    !== undefined) updates.ping_role    = body.pingRole;
  if (body.logChannel  !== undefined) updates.log_channel  = body.logChannel;
  if (body.greeting    !== undefined) updates.greeting     = body.greeting;
  if (body.maxOpen     !== undefined) updates.max_open     = body.maxOpen;
  if (body.allowReopen !== undefined) updates.allow_reopen = body.allowReopen;
  if (body.enabled     !== undefined) updates.enabled      = body.enabled;

  const { data, error } = await sb
    .from("ticket_configs")
    .update(updates)
    .eq("id", configId)
    .eq("guild_id", guildId)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "Config not found" }, { status: 404 });

  return Response.json(toClient(data));
}

// DELETE /api/guilds/:guildId/configs/:configId
export async function DELETE(request, { params }) {
  const session = await getSessionOrUnauth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { guildId, configId } = await params;
  const sb = getSupabase();

  const { error } = await sb
    .from("ticket_configs")
    .delete()
    .eq("id", configId)
    .eq("guild_id", guildId);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
