import { z } from "zod";
import { careerSchema } from "../../src/lib/career.ts";
import {
  createLimiter,
  json,
  originAllowed,
  readJson,
  type Context,
} from "../../src/server/http.ts";

const limited = createLimiter(5);
export async function onRequest({ request, env }: Context) {
  if (request.method !== "POST")
    return json({ error: "Method not allowed." }, 405);
  if (!originAllowed(request, env))
    return json({ error: "Unable to process request." }, 403);
  if (limited(request)) return json({ error: "Please try again later." }, 429);
  const id = z.uuid().safeParse(request.headers.get("Idempotency-Key"));
  if (!id.success) return json({ error: "Invalid request." }, 400);
  let body;
  try {
    body = await readJson(request);
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  if (body && typeof body === "object" && "website" in body && body.website)
    return json({ error: "Invalid request." }, 400);
  const parsed = careerSchema.safeParse(body);
  if (!parsed.success)
    return json({ error: "Please check your answers." }, 400);
  if (
    env.CAREER_SUBMISSIONS_ENABLED !== "true" ||
    !env.RESEND_API_KEY ||
    !env.RESEND_FROM_EMAIL
  )
    return json(
      { error: "Submission is unavailable. Please email grow@rsggrowth.com." },
      503,
    );
  const d = parsed.data;
  const text = [
    "RSG CAREER DIAGNOSTIC",
    "",
    "CONTACT",
    `${d.firstName} ${d.lastName}`,
    d.email,
    d.phone || "Phone not provided",
    d.location || "Location not provided",
    "",
    "CURRENT POSITION",
    d.title,
    d.industry,
    d.experience,
    "",
    "CAREER GOALS",
    d.goals.join("\n"),
    "",
    "JOB SEARCH CHALLENGES",
    d.challenges.join("\n"),
    "",
    "WHAT THEY HAVE TRIED",
    d.efforts.join("\n"),
    "",
    "3–6 MONTH GOAL",
    d.success,
    "",
    "TIMING",
    d.timeline,
    "",
    "ADDITIONAL CONTEXT",
    d.context || "Not provided",
    "",
    "SUBMISSION INFORMATION",
    "Practice: Career Strategy",
    "Contact consent: Yes",
  ].join("\n");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `career/${id.data}`,
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: ["grow@rsggrowth.com"],
        reply_to: d.email,
        subject:
          `New RSG Career Diagnostic — ${d.firstName} ${d.lastName}`.replace(
            /[\r\n]/g,
            " ",
          ),
        text,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("provider");
    const receipt = z
      .object({ id: z.string().min(1).max(100) })
      .safeParse(await response.json());
    if (!receipt.success) throw new Error("receipt");
    return json({ status: "submitted", receiptId: receipt.data.id });
  } catch {
    return json(
      {
        error:
          "Delivery could not be confirmed. Please try again or email grow@rsggrowth.com.",
      },
      502,
    );
  }
}

