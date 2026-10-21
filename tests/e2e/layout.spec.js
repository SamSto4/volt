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
