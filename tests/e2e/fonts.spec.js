import { expect, test } from "@playwright/test";

// Volt's type pairing (DESIGN.md §3): Playfair Display for headlines, Inter
// for everything else. jsdom doesn't apply CSS, so only a real browser can
// tell that headlines fell back to the body font, which once shipped unseen.

test("headlines use the display font and body text uses Inter", async ({ page }) => {
  await page.goto("/");
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    const family = (/** @type {string} */ selector) => getComputedStyle(/** @type {Element} */ (document.querySelector(selector))).fontFamily;
    return {
      headline: family("h1"),
      sectionTitle: family("h2"),
      body: family("main p"),
      // true only once the font file has actually loaded, not just been named.
      loaded: document.fonts.check('700 56px "Playfair Display"'),
    };
  });
  expect(fonts.headline).toMatch(/^"Playfair Display"/);
  expect(fonts.sectionTitle).toMatch(/^"Playfair Display"/);
  expect(fonts.body).toMatch(/^Inter/);
  expect(fonts.loaded).toBe(true);
});
