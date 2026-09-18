import { diagnosticSchema } from "../../src/lib/diagnostic.ts";

interface Env {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  RSG_ALLOWED_ORIGIN?: string;
}
type PagesContext = { request: Request; env: Env };
type PagesFunction<T = Env> = (context: {
  request: Request;
  env: T;
}) => Response | Promise<Response>;

const MAX_BODY_BYTES = 16 * 1024;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requests = new Map<string, { count: number; expires: number }>();

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function originAllowed(request: Request, env: Env): boolean {
  const origin = request.headers.get("Origin");
  const expected = env.RSG_ALLOWED_ORIGIN || "https://rsggrowth.com";
  return origin === expected || origin === "https://www.rsggrowth.com";
}

function rateLimited(request: Request): boolean {
  const key = request.headers.get("CF-Connecting-IP") || "unknown";
  const now = Date.now();
  const current = requests.get(key);
  if (!current || current.expires <= now) {
    requests.set(key, { count: 1, expires: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function emailText(data: Record<string, unknown>): string {
  const value = (key: string) => String(data[key] ?? "");
  return [
    "NEW BUSINESS DIAGNOSTIC",
    "",
    "CONTACT",
    `Name: ${value("name")}`,
    `Business: ${value("company")}`,
    `Email: ${value("email")}`,
    `Role: ${value("role") || "Not provided"}`,
    "",
    "BUSINESS PROFILE",
    `Stage: ${value("stage")}`,
    `Team size: ${value("teamSize")}`,
    "",
    "PRIORITIES",
    value("priorities"),
    "",
    "CURRENT CHALLENGE",
    value("challenge"),
    "",
    "12-MONTH SUCCESS",
    value("goal"),
    "",
    "TIMING",
    value("timeline"),
    "",
    `Submitted: ${new Date().toISOString()}`,
  ].join("\n");
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!originAllowed(request, env))
    return json({ error: "Unable to process request." }, 403);
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > MAX_BODY_BYTES)
    return json({ error: "Unable to process request." }, 413);
  if (rateLimited(request))
    return json({ error: "Please try again later." }, 429);
  if (
    !request.headers
      .get("Content-Type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return json({ error: "Unable to process request." }, 415);
  }
  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES)
      return json({ error: "Unable to process request." }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Unable to process request." }, 400);
  }
  if (!body || typeof body !== "object" || ("website" in body && body.website))
    return json({ error: "Unable to process request." }, 400);
  const parsed = diagnosticSchema.safeParse(body);
  if (!parsed.success)
    return json({ error: "Please check the information and try again." }, 400);
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL)
    return json(
      {
        error:
          "Submission is temporarily unavailable. Please email grow@rsggrowth.com.",
      },
      503,
    );
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: ["grow@rsggrowth.com"],
        reply_to: parsed.data.email,
        subject:
          `New RSG Business Diagnostic — ${parsed.data.company || ""}`.trim(),
        text: emailText({
          ...parsed.data,
          priorities: parsed.data.priorities.join(", "),
        }),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      return json(
        {
          error:
            "Submission is temporarily unavailable. Please email grow@rsggrowth.com.",
        },
        502,
      );
    return json({ status: "submitted", receiptId: crypto.randomUUID() });
  } catch {
    return json(
      {
        error:
          "Submission is temporarily unavailable. Please email grow@rsggrowth.com.",
      },
      502,
    );
  }
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== "POST")
    return json({ error: "Method not allowed." }, 405);
  return onRequestPost(context);
};
