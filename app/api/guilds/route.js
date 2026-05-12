// app/api/guilds/route.js
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, sessionOptions);

  if (!session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guilds = session.guilds || [];

  // Filter guild where user is ADMINISTRATOR (0x8) or MANAGE_GUILD (0x20)
  const adminGuilds = guilds.filter(
    (g) => parseInt(g.permissions) & 0x8 || parseInt(g.permissions) & 0x20
  );

  return Response.json(adminGuilds);
}
