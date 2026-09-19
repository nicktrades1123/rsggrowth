import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function harness(page: Page) {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "webdriver", { get: () => false }),
  );
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "rsggrowth.com") {
      const response = await route.fetch({
        url: `http://127.0.0.1:3000${url.pathname}${url.search}`,
      });
      await route.fulfill({ response });
    } else if (url.hostname === "www.googletagmanager.com")
      await route.fulfill({
        contentType: "text/javascript",
        body: "/* no external hits */",
      });
    else await route.abort();
  });
}
async function events(page: Page) {
  return page.evaluate(() =>
    (window.dataLayer || [])
      .map((i) => Array.from(i as ArrayLike<unknown>))
      .filter((i) => i[0] === "event"),
  );
}
async function fillCareer(page: Page) {
  await page.getByLabel("First name", { exact: true }).fill("Private");
  await page.getByLabel("Last name", { exact: true }).fill("Candidate");
  await page.getByLabel("Email", { exact: true }).fill("private@example.com");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Current or most recent job title").fill("Analyst");
  await page.getByLabel("Current or most recent industry").fill("Services");
  await page.getByLabel("Approximate years").selectOption("2–5 years");
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("First name", { exact: true })).toHaveValue(
    "Private",
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Find a new job", { exact: true }).check();
  await page.getByLabel("Get more interviews", { exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("I am not getting interviews", { exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Nothing yet", { exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel(/If your job search/)
    .fill("Private career objective for this test.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("When are you looking").selectOption("Within 30 days");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel(/I agree that RSG may contact/).check();
}
test("careers metadata, contextual navigation, sitemap, and mobile accessibility", async ({
  page,
  request,
}) => {
  test.setTimeout(90000);
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/careers/");
    await expect(page.locator("h1")).toHaveText(
      "Your Career Is Not a Resume. It’s a Story.",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://rsggrowth.com/careers/",
  );
  await expect(page.locator("header .nav-cta")).toHaveAttribute(
    "href",
    "/careers/diagnostic/",
  );
  await page
    .locator("main")
    .getByRole("link", { name: "Start Your Career Diagnostic" })
    .first()
    .click();
  await expect(page.getByLabel("First name", { exact: true })).toBeVisible();
  await page.goto("/what-we-do/");
  await expect(page.locator("header .nav-cta")).toHaveAttribute(
    "href",
    "/business-diagnostic/",
  );
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/careers/</loc>");
  expect(sitemap).toContain("/careers/diagnostic/</loc>");
  expect(sitemap).not.toContain("/review/");
});
test("career validation, failure retention, duplicate prevention and confirmed-only analytics", async ({
  page,
}) => {
  await harness(page);
  let attempts = 0;
  await page.route("**/api/career-diagnostic", async (route) => {
    attempts++;
    await new Promise((r) => setTimeout(r, 300));
    await route.fulfill({
      status: attempts === 1 ? 503 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        attempts === 1
          ? { error: "unavailable" }
          : { status: "submitted", receiptId: "test-receipt" },
      ),
    });
  });
  await page.goto("https://rsggrowth.com/careers/");
  await page
    .locator("main")
    .getByRole("link", { name: "Start Your Career Diagnostic" })
    .first()
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("#intake-errors")).toBeFocused();
  expect((await events(page)).map((e) => e[1])).toEqual(["career_cta_click"]);
  await fillCareer(page);
  expect(
    (await events(page)).filter((e) => e[1] === "career_diagnostic_step"),
  ).toHaveLength(7);
  await page
    .getByRole("button", { name: "Submit Career Diagnostic", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Your answers are still here",
  );
  await expect(page.locator(".review")).toContainText("private@example.com");
  expect(
    (await events(page)).filter((e) => e[1] === "career_diagnostic_submit"),
  ).toHaveLength(0);
  await page
    .getByRole("button", { name: "Submit Career Diagnostic", exact: true })
    .dblclick();
  await expect(
    page.getByRole("heading", { name: "Thanks. We’ll take a look." }),
  ).toBeVisible();
  expect(attempts).toBe(2);
  const captured = await events(page);
  expect(
    captured.filter((e) => e[1] === "career_diagnostic_submit"),
  ).toHaveLength(1);
  expect(
    captured.filter((e) => e[1] === "career_diagnostic_start"),
  ).toHaveLength(1);
  expect(JSON.stringify(captured)).not.toMatch(
    /Private|Candidate|private@example|career objective|test-receipt/,
  );
});
test("private review strips token, never loads GA, starts unrated/unconsented, and submits on mobile", async ({
  page,
}) => {
  await harness(page);
  const token = "a".repeat(64);
  let requestBody: Record<string, unknown> | undefined;
  await page.route("**/api/reviews/verify", (route) =>
    route.fulfill({
      json: { practice: "career", service: "career_positioning" },
    }),
  );
  await page.route("**/api/reviews/submit", async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({ json: { status: "submitted" } });
  });
  await page.goto(`https://rsggrowth.com/review/#${token}`);
  await expect(
    page.getByRole("button", { name: "Submit feedback" }),
  ).toBeVisible();
  expect(page.url()).toBe("https://rsggrowth.com/review/");
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  expect(await events(page)).toEqual([]);
  await expect(page.locator('input[name="rating"]:checked')).toHaveCount(0);
  await expect(page.getByLabel(/I give RSG permission/)).not.toBeChecked();
  await page.getByRole("button", { name: "Submit feedback" }).click();
  await expect(page.locator("#intake-errors")).toBeFocused();
  await page.getByRole("radio", { name: "3 stars", exact: true }).check();
  await page
    .getByLabel("What changed or improved after working with RSG?")
    .fill("Test feedback about clearer positioning.");
  await page
    .getByLabel("What would you tell someone considering working with RSG?")
    .fill("Test feedback about the experience.");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Submit feedback" }).click();
  await expect(
    page.getByRole("heading", { name: "Thank you — we really appreciate it." }),
  ).toBeVisible();
  expect(requestBody?.token).toBe(token);
  expect((requestBody?.review as { consent: boolean }).consent).toBe(false);
  expect(await events(page)).toEqual([]);
});
test("invalid review invitation is safe and empty testimonials remain absent", async ({
  page,
}) => {
  await page.goto("/review/#bad");
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "invitation is unavailable",
  );
  await expect(
    page.getByRole("button", { name: "Submit feedback" }),
  ).toHaveCount(0);
  await page.route("**/api/reviews/public?**", (route) =>
    route.fulfill({ json: { reviews: [] } }),
  );
  await page.goto("/careers/");
  await expect(
    page.getByRole("region", { name: "Client Experiences" }),
  ).toHaveCount(0);
});
test("approved client experiences render as literal text in their appropriate section", async ({
  page,
}) => {
  await page.route("**/api/reviews/public?**", (route) =>
    route.fulfill({
      json: {
        reviews: [
          {
            id: "test-only",
            practice: "career",
            service: "career_positioning",
            rating: 3,
            response1: "Test positioning feedback",
            response2: "<script>not executable</script>",
            outcome: "Still searching",
            publicName: "Anonymous",
            jobTitle: "",
            industry: "",
          },
        ],
      },
    }),
  );
  await page.goto("/careers/");
  const section = page.getByRole("region", { name: "Client Experiences" });
  await expect(section).toContainText("<script>not executable</script>");
  await expect(section.locator("script")).toHaveCount(0);
  await expect(section).toContainText(
    "Client-reported outcome: Still searching",
  );
});

