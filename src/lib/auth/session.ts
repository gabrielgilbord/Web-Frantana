import { createHmac, timingSafeEqual, randomBytes, scryptSync } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "frantana_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12h

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return "dev-only-insecure-secret-change-me-32chars";
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function hashPassword(password: string, salt?: string) {
  const usedSalt = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, usedSalt, 64).toString("hex");
  return `${usedSalt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64).toString("hex");
  try {
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(next, "hex"));
  } catch {
    return false;
  }
}

export function createSessionToken(email: string) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      exp: Date.now() + MAX_AGE_SECONDS * 1000,
    }),
    "utf8"
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!payload || !signature) return null;
  const expected = sign(payload);
  try {
    if (
      !timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))
    ) {
      return null;
    }
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { email?: string; exp?: number };
    if (!data.email || !data.exp) return null;
    if (Number(data.exp) < Date.now()) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

export async function setAdminSession(email: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getAdminSession() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export function getConfiguredAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@frantana.es";
  const password = process.env.ADMIN_PASSWORD ?? "changeme-frantana-admin";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  return { email, password, passwordHash };
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
