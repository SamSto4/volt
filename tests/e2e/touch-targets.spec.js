import { expect, test } from "@playwright/test";

// Controls are at least 40px tall on a phone (the Try it brief; WCAG 2.5.8
// only requires 24px, and Volt aims higher). Measured in a real browser at
// 375px, on every public page, in the states a person can reach by tapping.

test.use({ viewport: { width: 375, height: 900 }, hasTouch: true });

const MIN = 40;

/** Every visible control on the page that is shorter than 40px, as readable lines. */
async function undersized(/** @type {import("@playwright/test").Page} */ page) {
  return page.evaluate((min) => {
    const controls = document.querySelectorAll(
      "button, a[href], select, textarea, summary, [role=tab], input:not([type=hidden])",
    );
    /** @type {string[]} */
    const problems = [];
    for (const element of controls) {
      const style = getComputedStyle(element);
      if (style.visibility === "hidden" || style.display === "none") continue;
      let box = element.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      // Screen-reader-only controls (the radios inside a segmented control) are
      // tapped through their label, so measure the label instead.
      const label = element instanceof HTMLInputElement ? element.closest("label") ?? element.labels?.[0] : null;
      if (element instanceof HTMLInputElement && (element.type === "radio" || element.type === "checkbox") && label) {
        const labelBox = label.getBoundingClientRect();
        if (labelBox.height > box.height) box = labelBox;
      }
      // A link inside running text is exempt (WCAG 2.5.8 "inline" exception).
      if (element instanceof HTMLAnchorElement && element.closest("p, li > span, dd, figcaption") && style.display === "inline") continue;
      // A control can be tappable beyond its painted box (a switch's invisible
      // strip, a label around a small checkbox). Probe 19px above and below
      // its center: if both land on the control (or its label), it's 40px.
      if (box.height < min - 0.5) {
        // elementFromPoint only sees what's on screen, so bring it into view first.
        element.scrollIntoView({ block: "center" });
        box = element.getBoundingClientRect();
        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height / 2;
        const owner = element instanceof HTMLInputElement ? element.labels?.[0] : null;
        const hits = [centerY - 19.5, centerY + 19.5].map((y) => document.elementFromPoint(centerX, y));
        if (hits.every((hit) => hit && (element.contains(hit) || (owner && owner.contains(hit))))) continue;
        const name = (element.getAttribute("aria-label") ?? element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
        problems.push(`${Math.round(box.height)}px ${element.tagName.toLowerCase()} "${name}"`);
      }
    }
    return [...new Set(problems)];
  }, MIN);
}

for (const path of ["/", "/components", "/components/button", "/try", "/try/suggest"]) {
  test(`${path}: every control is at least ${MIN}px tall`, async ({ page }) => {
    await page.goto(path);
    expect(await undersized(page)).toEqual([]);
  });
}

test("the component finder's later questions and results are tappable too", async ({ page }) => {
  await page.goto("/try/suggest");
  /** @type {string[]} */
  const problems = [];
  await page.getByRole("radio", { name: "A pricing or shop page" }).check();
  problems.push(...(await undersized(page)));
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  problems.push(...(await undersized(page))); // the checkbox question
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "See my suggestions" }).click();
  problems.push(...(await undersized(page))); // the results, with live components
  expect([...new Set(problems)]).toEqual([]);
});
