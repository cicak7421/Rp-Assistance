// app/api/auth/logout/route.js
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function POST() {
  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, sessionOptions);
  session.destroy();
  return Response.json({ ok: true });
}
