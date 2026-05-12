// app/api/auth/callback/route.js
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { NextResponse } from "next/server";

async function discordRequest(endpoint, token) {
  const res = await fetch(`https://discord.com/api/v10${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Discord API error: ${res.status}`);
  return res.json();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const dashboardUrl = process.env.DASHBOARD_URL || "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(`${dashboardUrl}?error=no_code`);
  }

  try {
    // Exchange code → token
    const tokenRes = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type:    "authorization_code",
        code,
        redirect_uri:  process.env.DISCORD_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error);

    // Fetch user + guilds
    const [user, guilds] = await Promise.all([
      discordRequest("/users/@me", tokenData.access_token),
      discordRequest("/users/@me/guilds", tokenData.access_token),
    ]);

    // Simpan ke session
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    session.user = {
      id:            user.id,
      username:      user.username,
      discriminator: user.discriminator,
      avatar:        user.avatar,
    };
    session.guilds = guilds;
    await session.save();

    return NextResponse.redirect(`${dashboardUrl}/dashboard?login=success`);
  } catch (err) {
    console.error("OAuth error:", err);
    return NextResponse.redirect(`${dashboardUrl}?error=auth_failed`);
  }
}
