// app/api/guilds/[guildId]/tickets/route.js
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function GET(request, { params }) {
  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, sessionOptions);
  if (!session.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { guildId } = await params;
  const sb = getSupabase();

  // Total counts
  const { data: allTickets, error } = await sb
    .from("ticket_events")
    .select("id, type, status, user_id, config_id, channel_id, created_at")
    .eq("guild_id", guildId)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const total  = allTickets.filter(t => t.type === "open").length;
  const open   = allTickets.filter(t => t.status === "open").length;
  const closed = allTickets.filter(t => t.status === "closed").length;
  const recent = allTickets.slice(0, 10);

  return Response.json({ total, open, closed, recent });
}
