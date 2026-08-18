type Level = "info" | "warn" | "error";

const sensitive = /(authorization|cookie|password|secret|token|service.?role|card)/i;

function sanitize(value: unknown): unknown {
  if (value instanceof Error) return { name: value.name, message: value.message };
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sensitive.test(key) ? "[redacted]" : sanitize(item)]));
  return typeof value === "string" && value.length > 500 ? `${value.slice(0, 500)}…` : value;
}

export function log(level: Level, service: string, message: string, context: Record<string, unknown> = {}) {
  const payload = JSON.stringify({ timestamp: new Date().toISOString(), level, service, message, ...sanitize(context) as object });
  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
}
