import { z } from "zod";
import { serviceKeys, type PublicReview } from "../../../src/lib/reviews.ts";
import { publicReviewSql } from "../../../src/server/reviews.ts";
import { json, type Context } from "../../../src/server/http.ts";
export async function onRequest({ request, env }: Context) {
  if (request.method !== "GET")
    return json({ error: "Method not allowed." }, 405);
  const url = new URL(request.url);
  const filter = z
    .object({
      practice: z.enum(["career", "business"]),
      service: z.union([z.enum(serviceKeys), z.literal("")]),
    })
    .safeParse({
      practice: url.searchParams.get("practice"),
      service: url.searchParams.get("service") || "",
    });
  if (!filter.success) return json({ error: "Invalid filter." }, 400);
  if (!env.RSG_REVIEWS_DB) return json({ reviews: [] });
  try {
    const { practice, service } = filter.data;
    const result = await env.RSG_REVIEWS_DB.prepare(publicReviewSql)
      .bind(practice, service, service)
      .all<PublicReview>();
    return json({ reviews: result.results });
  } catch {
    return json({ error: "Client experiences are unavailable." }, 503);
  }
}

