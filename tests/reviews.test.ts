import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { onRequest as admin } from "../functions/api/reviews/admin.ts";
import { onRequest as verify } from "../functions/api/reviews/verify.ts";
import { onRequest as submit } from "../functions/api/reviews/submit.ts";
import { onRequest as publicReviews } from "../functions/api/reviews/public.ts";
import { reviewSchema } from "../src/lib/reviews.ts";
import type { Database, Statement, ServerEnv } from "../src/server/http.ts";

// Real SQLite runs the production D1 migration, trigger, constraints, and queries.
function setup() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    readFileSync(
      new URL("../migrations/0001_reviews.sql", import.meta.url),
      "utf8",
    ),
  );
  const db: Database = {
    prepare(sql: string): Statement {
      let args: (string | number | null)[] = [];
      return {
        bind(...values: unknown[]) {
          args = values as typeof args;
          return this;
        },
        async first<T>() {
          return (sqlite.prepare(sql).get(...args) as T) || null;
        },
        async all<T>() {
          return { results: sqlite.prepare(sql).all(...args) as T[] };
        },
        async run() {
          const result = sqlite.prepare(sql).run(...args);
          return { meta: { changes: Number(result.changes) } };
        },
      };
    },
  };
  const env: ServerEnv = {
    RSG_REVIEWS_DB: db,
    RSG_REVIEWS_ADMIN_TOKEN: "test-operator-secret-32-characters-long",
  };
  return { sqlite, env };
}
const review = {
  rating: 3,
  response1: "I can explain my experience more clearly.",
  response2: "A useful conversation about positioning.",
  outcome: "Still searching",
  identity: "first_initial",
  firstName: "Sample",
  lastInitial: "T",
  jobTitle: "Analyst",
  industry: "Services",
  consent: true,
};
function req(body: unknown, auth?: string) {
  return new Request("https://rsggrowth.com/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://rsggrowth.com",
      "CF-Connecting-IP": crypto.randomUUID(),
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: JSON.stringify(body),
  });
}
async function invite(
  env: ServerEnv,
  practice = "career",
  service = "career_positioning",
) {
  const response = await admin({
    request: req(
      { action: "create", practice, service },
      env.RSG_REVIEWS_ADMIN_TOKEN,
    ),
    env,
  });
  assert.equal(response.status, 200);
  const data = (await response.json()) as { id: string; url: string };
  return { ...data, token: new URL(data.url).hash.slice(1) };
}
async function published(env: ServerEnv, practice = "career", service = "") {
  return (
    await publicReviews({
      request: new Request(
        `https://rsggrowth.com/api/reviews/public?practice=${practice}&service=${service}`,
      ),
      env,
    })
  ).json() as Promise<{ reviews: Record<string, unknown>[] }>;
}
test("review lifecycle uses hashed invitations, atomic single-use consumption, consent and moderation gates, and filters", async () => {
  const { sqlite, env } = setup();
  try {
    const invitation = await invite(env);
    assert.match(invitation.token, /^[a-f0-9]{64}$/);
    assert.equal(new URL(invitation.url).pathname, "/review/");
    const stored = sqlite.prepare("SELECT * FROM review_invitations").get()!;
    assert.notEqual(stored.token_hash, invitation.token);
    assert.ok(!JSON.stringify(stored).includes(invitation.token));
    const opened = await verify({
      request: req({ token: invitation.token }),
      env,
    });
    assert.deepEqual(await opened.json(), {
      practice: "career",
      service: "career_positioning",
    });
    const both = await Promise.all([
      submit({ request: req({ token: invitation.token, review }), env }),
      submit({ request: req({ token: invitation.token, review }), env }),
    ]);
    assert.deepEqual(both.map((r) => r.status).sort(), [200, 410]);
    assert.equal(
      (await verify({ request: req({ token: invitation.token }), env })).status,
      410,
    );
    assert.equal((await published(env)).reviews.length, 0);
    const pending = (await (
      await admin({
        request: req({ action: "list" }, env.RSG_REVIEWS_ADMIN_TOKEN),
        env,
      })
    ).json()) as { reviews: { id: string }[] };
    const id = pending.reviews[0].id;
    assert.equal(
      (
        await admin({
          request: req(
            { action: "moderate", id, status: "approved" },
            env.RSG_REVIEWS_ADMIN_TOKEN,
          ),
          env,
        })
      ).status,
      200,
    );
    const visible = await published(env);
    assert.equal(visible.reviews.length, 1);
    assert.equal(visible.reviews[0].rating, 3);
    assert.equal(visible.reviews[0].response2, review.response2);
    assert.equal(visible.reviews[0].publicName, "Sample T.");
    assert.doesNotMatch(
      JSON.stringify(visible),
      /token|invitation|consent_version|submitted_at/,
    );
    assert.equal((await published(env, "business")).reviews.length, 0);
    assert.equal(
      (await published(env, "career", "linkedin")).reviews.length,
      0,
    );
    await admin({
      request: req(
        { action: "moderate", id, status: "rejected" },
        env.RSG_REVIEWS_ADMIN_TOKEN,
      ),
      env,
    });
    assert.equal((await published(env)).reviews.length, 0);
    await admin({
      request: req(
        { action: "moderate", id, status: "approved" },
        env.RSG_REVIEWS_ADMIN_TOKEN,
      ),
      env,
    });
    await admin({
      request: req(
        { action: "revoke", id: invitation.id },
        env.RSG_REVIEWS_ADMIN_TOKEN,
      ),
      env,
    });
    assert.equal((await published(env)).reviews.length, 0);
  } finally {
    sqlite.close();
  }
});
test("invalid, expired, revoked and used tokens fail; malformed payloads and unauthorized administration fail", async () => {
  const { sqlite, env } = setup();
  try {
    for (const action of [
      { action: "create", practice: "career", service: "linkedin" },
      { action: "moderate", id: crypto.randomUUID(), status: "approved" },
    ]) {
      assert.equal((await admin({ request: req(action), env })).status, 401);
      assert.equal(
        (await admin({ request: req(action, "incorrect"), env })).status,
        401,
      );
    }
    assert.equal(
      (
        await admin({
          request: req(
            { action: "create", practice: "career", service: "finance" },
            env.RSG_REVIEWS_ADMIN_TOKEN,
          ),
          env,
        })
      ).status,
      400,
    );
    for (const token of ["invalid", "f".repeat(64)])
      assert.notEqual(
        (await verify({ request: req({ token }), env })).status,
        200,
      );
    const old = await invite(env);
    sqlite
      .prepare("UPDATE review_invitations SET expires_at = 0 WHERE id = ?")
      .run(old.id);
    assert.equal(
      (await verify({ request: req({ token: old.token }), env })).status,
      410,
    );
    assert.equal(
      (await submit({ request: req({ token: old.token, review }), env }))
        .status,
      410,
    );
    const revoked = await invite(env);
    await admin({
      request: req(
        { action: "revoke", id: revoked.id },
        env.RSG_REVIEWS_ADMIN_TOKEN,
      ),
      env,
    });
    assert.equal(
      (await verify({ request: req({ token: revoked.token }), env })).status,
      410,
    );
    for (const body of [
      {},
      { token: old.token, review: { ...review, response1: "x".repeat(20000) } },
      { token: old.token, review, website: "bot" },
    ])
      assert.equal((await submit({ request: req(body), env })).status, 400);
    const original = req({ token: old.token });
    const broken = new Request(original.url, {
      method: "POST",
      headers: original.headers,
      body: "{",
    });
    assert.equal((await submit({ request: broken, env })).status, 400);
    const foreign = req({ token: old.token });
    foreign.headers.set("Origin", "https://evil.example");
    assert.equal((await verify({ request: foreign, env })).status, 403);
    assert.equal(
      (
        await submit({
          request: new Request("https://rsggrowth.com/api/reviews/submit"),
          env,
        })
      ).status,
      405,
    );
  } finally {
    sqlite.close();
  }
});
test("non-consenting feedback stays private even if operator attempts approval; business testimonials classify correctly", async () => {
  const { sqlite, env } = setup();
  try {
    assert.equal(
      reviewSchema.safeParse({ ...review, rating: 0 }).success,
      false,
    );
    const invitation = await invite(env, "business", "contractor_growth");
    assert.equal(
      (
        await submit({
          request: req({
            token: invitation.token,
            review: { ...review, identity: "anonymous", consent: false },
          }),
          env,
        })
      ).status,
      200,
    );
    const r = sqlite.prepare("SELECT * FROM reviews").get()!;
    assert.equal(r.public_name, "Anonymous");
    assert.equal(r.outcome, "");
    assert.equal(
      (
        await admin({
          request: req(
            { action: "moderate", id: r.id, status: "approved" },
            env.RSG_REVIEWS_ADMIN_TOKEN,
          ),
          env,
        })
      ).status,
      409,
    );
    assert.throws(() =>
      sqlite.prepare("UPDATE reviews SET status = 'approved'").run(),
    );
    const second = await invite(env, "business", "contractor_growth");
    await submit({ request: req({ token: second.token, review }), env });
    const next = sqlite
      .prepare("SELECT id FROM reviews WHERE consent = 1")
      .get()!;
    await admin({
      request: req(
        { action: "moderate", id: next.id, status: "approved" },
        env.RSG_REVIEWS_ADMIN_TOKEN,
      ),
      env,
    });
    assert.equal(
      (await published(env, "business", "contractor_growth")).reviews.length,
      1,
    );
    assert.equal((await published(env)).reviews.length, 0);
    await admin({
      request: req(
        { action: "moderate", id: next.id, status: "archived" },
        env.RSG_REVIEWS_ADMIN_TOKEN,
      ),
      env,
    });
    assert.equal((await published(env, "business")).reviews.length, 0);
  } finally {
    sqlite.close();
  }
});

