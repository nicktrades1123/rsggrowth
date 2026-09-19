import { z } from "zod";
import { classification } from "../../../src/lib/reviews.ts";
import {
  createLimiter,
  hash,
  json,
  readJson,
  type Context,
} from "../../../src/server/http.ts";
const limited = createLimiter(60);
async function authorized(request: Request, secret?: string) {
  if (!secret || secret.length < 32) return false;
  const supplied =
    request.headers.get("Authorization")?.replace(/^Bearer /, "") || "";
  if (supplied.length > 256) return false;
  const a = await hash(secret),
    b = await hash(supplied);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    practice: z.enum(["career", "business"]),
    service: z.string(),
    expiresInDays: z.number().int().min(1).max(90).default(30),
  }),
  z.object({
    action: z.literal("list"),
    status: z
      .enum(["pending", "approved", "rejected", "archived"])
      .default("pending"),
    offset: z.number().int().min(0).max(100000).default(0),
  }),
  z.object({
    action: z.literal("moderate"),
    id: z.uuid(),
    status: z.enum(["approved", "rejected", "archived"]),
  }),
  z.object({ action: z.literal("revoke"), id: z.uuid() }),
]);
export async function onRequest({ request, env }: Context) {
  if (request.method !== "POST")
    return json({ error: "Method not allowed." }, 405);
  if (limited(request)) return json({ error: "Please try again later." }, 429);
  // Server-to-server bearer authentication, no cookies, no browser admin UI.
  if (!(await authorized(request, env.RSG_REVIEWS_ADMIN_TOKEN)))
    return json({ error: "Unauthorized." }, 401);
  if (!env.RSG_REVIEWS_DB)
    return json({ error: "Review storage is unavailable." }, 503);
  let parsed;
  try {
    parsed = actionSchema.safeParse(await readJson(request, 4096));
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  if (!parsed.success) return json({ error: "Invalid operation." }, 400);
  const d = parsed.data;
  const db = env.RSG_REVIEWS_DB;
  try {
    if (d.action === "create") {
      const category = classification.safeParse(d);
      if (!category.success)
        return json({ error: "Invalid classification." }, 400);
      const token = Array.from(
        crypto.getRandomValues(new Uint8Array(32)),
        (b) => b.toString(16).padStart(2, "0"),
      ).join("");
      const id = crypto.randomUUID(),
        now = Date.now(),
        expires = now + d.expiresInDays * 86400000;
      await db
        .prepare(
          "INSERT INTO review_invitations (id, token_hash, practice, service, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(id, await hash(token), d.practice, d.service, now, expires)
        .run();
      // Origin is deployment configuration, never derived from a user-controlled Host header.
      const origin = env.RSG_ALLOWED_ORIGIN || "https://rsggrowth.com";
      return json({
        id,
        url: `${origin}/review/#${token}`,
        expiresAt: new Date(expires).toISOString(),
      });
    }
    if (d.action === "list") {
      const result = await db
        .prepare(
          "SELECT r.*, i.practice, i.service FROM reviews r JOIN review_invitations i ON i.id = r.invitation_id WHERE r.status = ? ORDER BY r.submitted_at, r.id LIMIT 50 OFFSET ?",
        )
        .bind(d.status, d.offset)
        .all();
      return json({
        reviews: result.results,
        nextOffset: result.results.length === 50 ? d.offset + 50 : null,
      });
    }
    if (d.action === "revoke") {
      const result = await db
        .prepare("UPDATE review_invitations SET revoked_at = ? WHERE id = ?")
        .bind(Date.now(), d.id)
        .run();
      return json({ updated: result.meta.changes > 0 });
    }
    const result = await db
      .prepare(
        `UPDATE reviews SET status = ?, approved_at = ? WHERE id = ?
      AND (? != 'approved' OR (consent = 1 AND invitation_id IN (SELECT id FROM review_invitations WHERE revoked_at IS NULL)))`,
      )
      .bind(
        d.status,
        d.status === "approved" ? Date.now() : null,
        d.id,
        d.status,
      )
      .run();
    if (!result.meta.changes)
      return json(
        { error: "Review missing, revoked, or lacks publication consent." },
        409,
      );
    return json({ updated: true });
  } catch {
    return json({ error: "Operation could not be completed." }, 503);
  }
}

