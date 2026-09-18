import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const route = "/industries/contractors-home-services/";
test("contractor discovery, metadata, and diagnostic routes are connected", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Contractors & Home Services" }).click();
  await expect(page).toHaveURL(new RegExp(`${route}$`));
  await expect(page.locator("h1")).toHaveText(
    "Build the business behind the work.",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    `https://rsggrowth.com${route}`,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /index, follow/,
  );
  const schema = JSON.parse(
    await page.locator('script[type="application/ld+json"]').innerText(),
  );
  expect(schema["@type"]).toBe("Service");
  expect(schema.url).toBe(`https://rsggrowth.com${route}`);
  const links = await page
    .locator('main a[href^="/"]')
    .evaluateAll((elements) => [
      ...new Set(elements.map((el) => el.getAttribute("href")!)),
    ]);
  for (const href of links)
    expect((await request.get(href)).status()).toBe(200);
  expect(await (await request.get("/sitemap.xml")).text()).toContain(
    `https://rsggrowth.com${route}`,
  );
  await page.goto("/who-we-serve/");
  await page
    .getByRole("link", { name: "Explore contractor business support" })
    .click();
  await expect(page).toHaveURL(new RegExp(`${route}$`));
  await page
    .getByRole("link", { name: "Start a Business Diagnostic" })
    .last()
    .click();
  await expect(page.getByLabel("Your name", { exact: true })).toBeVisible();
});

test("new content fits narrow mobile and tablet widths", async ({ page }) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/", "/about/", "/who-we-serve/", route]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${path} at ${width}`,
      ).toBeTruthy();
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  }
});
