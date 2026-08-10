export function safeNextPath(value: string | null | undefined, fallback = "/conta") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
