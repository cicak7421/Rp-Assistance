// app/api/auth/url/route.js
export const runtime = "nodejs";

export async function GET() {
  const params = new URLSearchParams({
    client_id:     process.env.DISCORD_CLIENT_ID,
    redirect_uri:  process.env.DISCORD_REDIRECT_URI,
    response_type: "code",
    scope:         "identify guilds",
  });

  return Response.json({
    url: `https://discord.com/oauth2/authorize?${params}`,
  });
}
