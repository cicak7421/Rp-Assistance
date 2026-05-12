// lib/session.js
// iron-session config untuk Next.js API routes
import { getIronSession } from "iron-session";

export const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "ticketforge_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  },
};

/**
 * Get session dari request/response Next.js Route Handler
 * @param {Request} req
 * @param {Response} res
 */
export async function getSession(req, res) {
  return getIronSession(req, res, sessionOptions);
}

/**
 * Middleware helper: cek auth, return session.user atau null
 */
export async function requireAuth(req, res) {
  const session = await getSession(req, res);
  if (!session.user) return null;
  return session;
}
