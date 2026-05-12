// app/api/auth/me/route.js
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

  return Response.json(session.user);
}
