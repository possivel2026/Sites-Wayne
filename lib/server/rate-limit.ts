type Window = { resetAt: number; count: number };
const windows = new Map<string, Window>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = windows.get(key);
  const next = !current || current.resetAt <= now ? { count: 1, resetAt: now + windowMs } : { count: current.count + 1, resetAt: current.resetAt };
  windows.set(key, next);
  if (windows.size > 5000) for (const [entry, value] of windows) if (value.resetAt <= now) windows.delete(entry);
  return { allowed: next.count <= limit, remaining: Math.max(0, limit - next.count), retryAfterSeconds: Math.max(1, Math.ceil((next.resetAt - now) / 1000)) };
}
