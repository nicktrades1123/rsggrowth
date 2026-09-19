// Minimal structural types keep Pages Functions portable without a runtime dependency.
export interface Statement {
  bind(...values: unknown[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes: number } }>;
}
export interface Database {
  prepare(sql: string): Statement;
}
export interface ServerEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  RSG_ALLOWED_ORIGIN?: string;
  CAREER_SUBMISSIONS_ENABLED?: string;
  RSG_REVIEWS_DB?: Database;
  RSG_REVIEWS_ADMIN_TOKEN?: string;
}
export type Context = { request: Request; env: ServerEnv };
export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
    },
  });
}
export function originAllowed(request: Request, env: ServerEnv) {
  const allowed = env.RSG_ALLOWED_ORIGIN || "https://rsggrowth.com";
  const production = ["https://rsggrowth.com", "https://www.rsggrowth.com"];
  return (
    request.headers.get("Origin") === allowed ||
    (production.includes(allowed) && production.includes(request.headers.get("Origin") || ""))
  );
}
export async function readJson(
  request: Request,
  limit = 16384,
): Promise<unknown> {
  if (
    !request.headers
      .get("Content-Type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new Error("body");
  if (Number(request.headers.get("Content-Length")) > limit)
    throw new Error("body");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("body");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new Error("body");
      }
      chunks.push(chunk.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
export function createLimiter(max = 10) {
  const windows = new Map<string, { count: number; expires: number }>();
  return (request: Request) => {
    const now = Date.now();
    for (const [key, item] of windows)
      if (item.expires <= now) windows.delete(key);
    const key = request.headers.get("CF-Connecting-IP") || "unknown";
    const item = windows.get(key);
    if (item) return ++item.count > max;
    // Fail closed at capacity; keep memory bounded under address churn.
    if (windows.size >= 5000) return true;
    windows.set(key, { count: 1, expires: now + 15 * 60 * 1000 });
    return false;
  };
}
export async function hash(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

