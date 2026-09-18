import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/",
  "/what-we-do/",
  "/who-we-serve/",
  "/about/",
  "/business-diagnostic/",
  "/contact/",
  "/privacy/",
  "/terms/",
];
test("all pages render with metadata, no horizontal overflow, and accessible landmarks", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://rsggrowth.com${route}`,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      `${route}: ${JSON.stringify(results.violations)}`,
    ).toEqual([]);
  }
  expect(errors).toEqual([]);
});
test("diagnostic validates, retains answers when going back, and prepares an honest email handoff", async ({
  page,
}) => {
  const submissions: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") submissions.push(request.url());
  });
  await page.goto("/business-diagnostic/");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("form").getByRole("alert")).toBeFocused();
  await expect(
    page.getByText("Enter a valid email address.").last(),
  ).toBeVisible();
  await page
    .getByLabel("Your name", { exact: true })
    .pressSequentially("Test Owner");
  await expect(page.getByLabel("Your name", { exact: true })).toHaveValue(
    "Test Owner",
  );
  await expect(page.getByLabel("Your name", { exact: true })).toBeFocused();
  await page
    .getByLabel("Email address", { exact: true })
    .fill("owner@example.com");
  await page
    .getByLabel("Business name", { exact: true })
    .fill("Example Business");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByRole("heading", { name: "Where is your focus?" }),
  ).toBeFocused();
  await page
    .getByLabel("What stage is your business in?")
    .selectOption("Managing growth");
  await page.getByLabel("How large is your team?").selectOption("2–10 people");
  await page.getByLabel("Finance", { exact: true }).check();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("Business name", { exact: true })).toHaveValue(
    "Example Business",
  );
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Finance", { exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByLabel("What is your main business challenge right now?")
    .fill("We need a clearer cash flow plan.");
  await page
    .getByLabel("What would you like to work toward?")
    .fill("A practical plan for the next year.");
  await page
    .getByLabel("When are you looking to get started?")
    .selectOption("In the next 1–3 months");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Prepare my diagnostic" }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText(
    "Please confirm",
  );
  await page.getByLabel(/I agree that RSG may contact/).check();
  const reviewAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(reviewAxe.violations).toEqual([]);
  await page.getByRole("button", { name: "Prepare my diagnostic" }).click();
  await expect(
    page.getByRole("heading", { name: "Your diagnostic is prepared." }),
  ).toBeFocused();
  await expect(page.getByText("It has not been sent to RSG.")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open email draft" }),
  ).toHaveAttribute("href", /^mailto:grow@rsggrowth\.com\?subject=/);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my answers" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "RSG-business-diagnostic.txt",
  );
  expect(submissions).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
  await page.getByRole("button", { name: "Edit my answers" }).click();
  await expect(
    page.getByRole("heading", { name: "Review your diagnostic." }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Your name", { exact: true })).toHaveValue("");
});
test("skip link and responsive navigation work with keyboard", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  if (isMobile) {
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toBeHidden();
  }
});
test("custom 404 export offers recovery links", async ({ page }) => {
  await page.goto("/404.html");
  await expect(
    page.getByRole("heading", { name: "A different direction." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Back to Home" }),
  ).toHaveAttribute("href", "/");
});

test("home fits a narrow 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
