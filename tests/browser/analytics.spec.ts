import { test, expect, type Page } from "@playwright/test";

async function productionHarness(page: Page) {
  // All production-origin HTML/assets come from the local build; the Google
  // script is a stub. Never contact Google or the real production website.
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
    } else if (url.hostname === "www.googletagmanager.com") {
      await route.fulfill({
        contentType: "text/javascript",
        body: "/* GA stub: no network */",
      });
    } else {
      await route.abort();
    }
  });
}
async function events(page: Page) {
  return page.evaluate(() =>
    (window.dataLayer || [])
      .map((item) => Array.from(item as ArrayLike<unknown>))
      .filter((item) => item[0] === "event"),
  );
}

test("production tag loads once, preserves UTMs, and tracks CTA locations across navigation", async ({
  page,
}) => {
  await productionHarness(page);
  await page.goto(
    "https://rsggrowth.com/?utm_source=nextdoor&utm_medium=social&utm_campaign=contractors&utm_content=post",
  );
  await expect(
    page.locator('script[src*="googletagmanager.com/gtag/js"]'),
  ).toHaveCount(1);
  expect(new URL(page.url()).searchParams.get("utm_source")).toBe("nextdoor");
  await page
    .locator(".home-hero")
    .getByRole("link", { name: "Start a Business Diagnostic" })
    .click();
  await expect(page.getByLabel("Your name", { exact: true })).toBeVisible();
  expect(await events(page)).toEqual([
    [
      "event",
      "diagnostic_cta_click",
      {
        source_page: "/",
        cta_location: "hero",
        destination: "/business-diagnostic/",
      },
    ],
  ]);
  const configs = await page.evaluate(() =>
    (window.dataLayer || [])
      .map((item) => Array.from(item as ArrayLike<unknown>))
      .filter((item) => item[0] === "config"),
  );
  expect(configs).toEqual([
    [
      "config",
      "G-R5MV45MJJD",
      { allow_google_signals: false, allow_ad_personalization_signals: false },
    ],
  ]);
  await expect(
    page.locator('script[src*="googletagmanager.com/gtag/js"]'),
  ).toHaveCount(1);
});

test("diagnostic emits no conversion for validation or email preparation and never includes answers", async ({
  page,
}) => {
  await productionHarness(page);
  await page.goto("https://rsggrowth.com/business-diagnostic/");
  await expect(
    page.locator('script[src*="googletagmanager.com/gtag/js"]'),
  ).toHaveCount(1);
  expect(await events(page)).toEqual([]);
  await page.getByRole("button", { name: "Continue" }).click();
  expect(await events(page)).toEqual([]);
  await page.getByLabel("Your name", { exact: true }).fill("Private Owner");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("private@example.com");
  await page
    .getByLabel("Business name", { exact: true })
    .fill("Private Company");
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByLabel("What stage is your business in?")
    .selectOption("Managing growth");
  await page.getByLabel("How large is your team?").selectOption("2–10 people");
  await page.getByLabel("Finance", { exact: true }).check();
  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByLabel("What is your main business challenge right now?")
    .fill("Confidential business challenge");
  await page
    .getByLabel("What would you like to work toward?")
    .fill("Confidential business objective");
  await page
    .getByLabel("When are you looking to get started?")
    .selectOption("Just exploring");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel(/I agree that RSG may contact/).check();
  await page.getByRole("button", { name: "Prepare my diagnostic" }).click();
  const draftLink = page.getByRole("link", { name: "Open email draft" });
  await expect(draftLink).toHaveAttribute("href", "mailto:grow@rsggrowth.com");
  await draftLink.click();
  const captured = await events(page);
  expect(captured.map((item) => item[1])).toEqual([
    "diagnostic_start",
    "diagnostic_step",
    "diagnostic_step",
    "diagnostic_step",
    "contact_email_click",
  ]);
  const serialized = JSON.stringify(captured);
  for (const secret of [
    "Private",
    "private@example.com",
    "Confidential",
    "Managing growth",
    "2–10",
    "Just exploring",
  ])
    expect(serialized).not.toContain(secret);
  await page.getByRole("button", { name: "Clear and start again" }).click();
  await page.evaluate(() => {
    window.gtag = () => {
      throw new Error("blocked analytics");
    };
  });
  await page.getByLabel("Your name", { exact: true }).fill("Still works");
  await expect(page.getByLabel("Your name", { exact: true })).toHaveValue(
    "Still works",
  );
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("form").getByRole("alert")).toBeVisible();
});

test("localhost never loads the production tag", async ({ page }) => {
  let requests = 0;
  await page.route(/google-analytics|googletagmanager/, async (route) => {
    requests++;
    await route.abort();
  });
  await page.goto("/business-diagnostic/");
  await page.getByLabel("Your name", { exact: true }).fill("Local test");
  expect(requests).toBe(0);
  expect(await events(page)).toEqual([]);
});
