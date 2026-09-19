import { reviewSubmissionSchema } from "../../../src/lib/reviews.ts";
import {
  createLimiter,
  hash,
  json,
  originAllowed,
  readJson,
  type Context,
} from "../../../src/server/http.ts";
const limited = createLimiter(10);
export async function onRequest({ request, env }: Context) {
  if (request.method !== "POST")
    return json({ error: "Method not allowed." }, 405);
  if (!originAllowed(request, env))
    return json({ error: "Unable to process request." }, 403);
  if (limited(request)) return json({ error: "Please try again later." }, 429);
  if (!env.RSG_REVIEWS_DB)
    return json({ error: "Feedback is temporarily unavailable." }, 503);
  let input;
  try {
    input = reviewSubmissionSchema.safeParse(await readJson(request));
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  if (!input.success)
    return json({ error: "Please check your feedback." }, 400);
  const d = input.data.review;
  const publicName =
    d.identity === "anonymous"
      ? "Anonymous"
      : d.firstName +
        (d.identity === "first_initial" ? ` ${d.lastInitial}.` : "");
  try {
    const now = Date.now();
    const id = crypto.randomUUID();
    const result = await env.RSG_REVIEWS_DB.prepare(
      `INSERT INTO reviews
      (id, invitation_id, rating, original_response1, original_response2, outcome, identity, public_name, job_title, industry, consent, consent_version, status, created_at, submitted_at)
      SELECT ?, id, ?, ?, ?, CASE WHEN practice = 'career' THEN ? ELSE '' END, ?, ?, ?, ?, ?, '2026-09-v1', 'pending', ?, ?
      FROM review_invitations WHERE token_hash = ? AND expires_at > ? AND used_at IS NULL AND revoked_at IS NULL`,
    )
      .bind(
        id,
        d.rating,
        d.response1,
        d.response2,
        d.outcome,
        d.identity,
        publicName,
        d.jobTitle,
        d.industry,
        d.consent ? 1 : 0,
        now,
        now,
        await hash(input.data.token),
        now,
      )
      .run();
    if (result.meta.changes < 1)
      return json(
        { error: "This invitation is unavailable or already used." },
        410,
      );
    return json({ status: "submitted" });
  } catch {
    return json(
      {
        error:
          "Feedback could not be confirmed. Please contact grow@rsggrowth.com before trying again.",
      },
      503,
    );
  }
}

