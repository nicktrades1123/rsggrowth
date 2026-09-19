import { z } from "zod";
import { tokenSchema } from "../../../src/lib/reviews.ts";
import { findInvitation } from "../../../src/server/reviews.ts";
import {
  createLimiter,
  json,
  originAllowed,
  readJson,
  type Context,
} from "../../../src/server/http.ts";
const limited = createLimiter(30);
export async function onRequest({ request, env }: Context) {
  if (request.method !== "POST")
    return json({ error: "Method not allowed." }, 405);
  if (!originAllowed(request, env))
    return json({ error: "Unable to process request." }, 403);
  if (limited(request)) return json({ error: "Please try again later." }, 429);
  if (!env.RSG_REVIEWS_DB)
    return json({ error: "Feedback is temporarily unavailable." }, 503);
  try {
    const input = z
      .object({ token: tokenSchema })
      .safeParse(await readJson(request, 1024));
    if (!input.success)
      return json({ error: "This invitation is unavailable." }, 400);
    const invitation = await findInvitation(
      env.RSG_REVIEWS_DB,
      input.data.token,
    );
    if (!invitation)
      return json(
        {
          error:
            "This invitation is unavailable. It may be expired, withdrawn, or already used.",
        },
        410,
      );
    return json({ practice: invitation.practice, service: invitation.service });
  } catch {
    return json({ error: "Unable to open this invitation." }, 400);
  }
}

