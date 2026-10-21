import { expect, test } from "@playwright/test";

// Layout rules that only a real browser can check (DESIGN.md §4 and §12).

const PAGES = ["/", "/components", "/components/button", "/try", "/try/suggest"];

for (const path of PAGES) {
  test(`${path}: the logo, the headline and the footer share one left edge`, async ({ page }) => {
    await page.goto(path);
    const edges = await page.evaluate(() => {
      const left = (/** @type {Element | null} */ element) => Math.round(element?.getBoundingClientRect().left ?? -1);
      return {
        logo: left(document.querySelector("header a")),
        headline: left(document.querySelector("main h1")),
        footer: left(document.querySelector("footer nav > *")),
      };
    });
    expect(edges.headline).toBe(edges.logo);
    expect(edges.footer).toBe(edges.logo);
  });
}

for (const path of PAGES) {
  test(`${path}: nothing makes the page scroll sideways`, async ({ page }) => {
    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} at ${width}px`).toBe(0);
    }
  });
}

test("the editor's component list never cuts off a name or a category", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/editor");
  await page.getByRole("button", { name: /Landing page/ }).click();
  const palette = page.getByRole("complementary", { name: "Components and layers" });
  const clipped = await palette.evaluate((root) =>
    [...root.querySelectorAll("li [draggable=true] span.truncate")]
      // scrollWidth > clientWidth means the text is wider than its box and got an ellipsis.
      .filter((span) => span.scrollWidth > span.clientWidth)
      .map((span) => span.textContent),
  );
  expect(clipped).toEqual([]);
});

test("the editor opens at a preview width where the page is readable", async ({ page }) => {
  // A laptop: both panels leave about 650px for the canvas. 1280 would be drawn
  // at half size, so the editor starts at 768 instead.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/editor");
  await page.getByRole("button", { name: /Landing page/ }).click();
  await expect(page.getByRole("radio", { name: "768" })).toBeChecked();
  const scale = async () =>
    page.locator("iframe").evaluate((frame) => {
      const transform = getComputedStyle(/** @type {HTMLElement} */ (frame.parentElement)).transform;
      return transform === "none" ? 1 : Number(transform.slice(7).split(",")[0]);
    });
  expect(await scale()).toBeGreaterThanOrEqual(0.75);

  // A big monitor has room for the full desktop width.
  await page.setViewportSize({ width: 1920, height: 1000 });
  await expect(page.getByRole("radio", { name: "1280" })).toBeChecked();
  expect(await scale()).toBeGreaterThanOrEqual(0.75);

  // A width the person picks stays, even when the window grows again.
  await page.getByRole("radio", { name: "375" }).check({ force: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole("radio", { name: "375" })).toBeChecked();
});
