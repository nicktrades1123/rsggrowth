// Run only on the operator's trusted machine. Never bundle this into the site.
const [action, ...args] = process.argv.slice(2);
const origin = process.env.RSG_ADMIN_ORIGIN || "https://rsggrowth.com";
const token = process.env.RSG_REVIEWS_ADMIN_TOKEN;
if (!token || token.length < 32)
  throw new Error(
    "Set RSG_REVIEWS_ADMIN_TOKEN in this shell; do not pass it as an argument.",
  );
const url = new URL(origin);
if (
  url.protocol !== "https:" &&
  !["localhost", "127.0.0.1"].includes(url.hostname)
)
  throw new Error("HTTPS required.");
let body;
switch (action) {
  case "create":
    body = {
      action,
      practice: args[0],
      service: args[1],
      expiresInDays: Number(args[2] || 30),
    };
    break;
  case "list":
    body = {
      action,
      status: args[0] || "pending",
      offset: Number(args[1] || 0),
    };
    break;
  case "approve":
  case "reject":
  case "archive":
    body = {
      action: "moderate",
      id: args[0],
      status: { approve: "approved", reject: "rejected", archive: "archived" }[
        action
      ],
    };
    break;
  case "revoke":
    body = { action, id: args[0] };
    break;
  default:
    throw new Error(
      "Usage: create <career|business> <service> [days] | list [status] [offset] | approve/reject/archive <review-id> | revoke <invitation-id>",
    );
}
const response = await fetch(new URL("/api/reviews/admin", origin), {
  method: "POST",
  redirect: "error",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(body),
  signal: AbortSignal.timeout(15000),
});
if (!response.ok)
  throw new Error(
    `Operation failed (${response.status}). Check authentication, configuration, consent, and record ID.`,
  );
// Output is private operator data: never redirect into public files or CI logs.
console.log(JSON.stringify(await response.json(), null, 2));

