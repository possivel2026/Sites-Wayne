import "server-only";
import { createHmac, randomBytes } from "node:crypto";

function secret() {
  const value = process.env.STARKIA_RELAY_SECRET;
  if (!value || value.length < 32) throw new Error("starkia_relay_secret_invalid");
  return value;
}

export function createDeviceToken() {
  const token = `nxs_${randomBytes(32).toString("base64url")}`;
  return { token, prefix: token.slice(0, 12), hash: hashDeviceToken(token) };
}

export function hashDeviceToken(token: string) {
  return createHmac("sha256", secret()).update(token).digest("hex");
}

export function bearerToken(header: string | null) {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return /^nxs_[A-Za-z0-9_-]{40,60}$/.test(token) ? token : null;
}

