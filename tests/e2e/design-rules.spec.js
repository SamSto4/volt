import { expect, test } from "@playwright/test";

// Rules from the design checklist (ui-design-studio "quality bar") that need a
// real browser to check: one primary action per screen, short labels that
// don't wrap, and a loading skeleton that matches the layout it stands in for.

const PAGES = ["/", "/components", "/components/button", "/try", "/try/suggest"];

/**
 * The text of every visible primary-styled button or link in the first screen.
 * Specimens (live demos of a component, marked data-specimen) don't count:
 * they're things to try, not actions to take.
 */
async function primaryActions(/** @type {import("@playwright/test").Page} */ page) {
  return page.evaluate(() => {
    // Read the real primary color from the theme, in whichever theme is active.
    const probe = document.createElement("i");
    probe.style.backgroundColor = "var(--primary)";
    document.body.append(probe);
    const primary = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return [...document.querySelectorAll("button, a[href]")]
      .filter((element) => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const onScreen = box.width > 0 && box.height > 0 && box.top < innerHeight && box.bottom > 0;
        return onScreen && style.visibility !== "hidden" && style.backgroundColor === primary && !element.closest("[data-specimen]");
      })
      .map((element) => (element.textContent ?? "").trim());
  });
}

for (const [width, height] of [
  [375, 800],
  [1280, 800],
]) {
  for (const path of PAGES) {
    test(`${path} at ${width}px: at most one primary action in the first screen`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(path);
      // The home page's hero has its one; the others lead with content or specimens.
      const actions = await primaryActions(page);
      expect(actions.length, actions.join(", ")).toBeLessThanOrEqual(1);
      if (path === "/") expect(actions).toEqual(["Open the editor"]);
    });
  }

  test(`/editor at ${width}px: one primary action in the first screen`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/editor");
    await page.getByRole("button", { name: /Landing page/ }).click();
    // The canvas's own buttons are inside an iframe, so they aren't counted here.
    expect(await primaryActions(page)).toEqual(["Export"]);
  });
}

for (const width of [375, 1280]) {
  test(`short labels stay on one line at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    /** @type {string[]} */
    const wrapped = [];
    for (const path of PAGES) {
      await page.goto(path);
      wrapped.push(
        ...(await page.evaluate((where) => {
          const labels = document.querySelectorAll("button, [role=tab], [data-slot=badge], fieldset label");
          return [...labels].flatMap((element) => {
            const box = element.getBoundingClientRect();
            if (box.width === 0 || box.height === 0 || getComputedStyle(element).visibility === "hidden") return [];
            // Labels shorter than a text block are meant to be one line. Count the
            // distinct line tops of the text inside; more than one means it wrapped.
            if (box.height > 60) return [];
            const tops = new Set();
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
              // Visually hidden text (sr-only) is read, not seen: it has no line of its own.
              if (walker.currentNode.parentElement?.closest(".sr-only")) continue;
              const range = document.createRange();
              range.selectNodeContents(walker.currentNode);
              for (const rect of range.getClientRects()) if (rect.width > 0) tops.add(Math.round(rect.top));
            }
            // Text that spans icon and word can differ by a pixel or two in the same line.
            const lines = [...tops].sort((a, b) => a - b).filter((top, index, all) => index === 0 || top - all[index - 1] > 6);
            return lines.length > 1 ? [`${where}: "${(element.textContent ?? "").trim().slice(0, 40)}"`] : [];
          });
        }, path)),
      );
    }
    expect(wrapped).toEqual([]);
  });
}

test("the loading skeleton's blocks sit exactly where the real ones will", async ({ page }) => {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/try");
    const card = page.locator("article", { has: page.locator("#skeleton-title") });
    await card.scrollIntoViewIfNeeded();

    /** Where each block starts and how tall it is, relative to the card's content box. */
    const measure = (/** @type {string} */ selector) =>
      card.evaluate((article, rows) => {
        const wrapper = /** @type {HTMLElement} */ (article.querySelector("[aria-busy]"));
        const base = wrapper.getBoundingClientRect().top;
        const blocks = rows === "[data-metric]" ? [...(article.querySelector(rows)?.children ?? [])] : [...article.querySelectorAll(rows)];
        return {
          wrapper: Math.round(wrapper.getBoundingClientRect().height),
          blocks: blocks.map((block) => [Math.round(block.getBoundingClientRect().top - base), Math.round(block.getBoundingClientRect().height)]),
        };
      }, selector);

    // It starts loading, then shows the numbers; reload to see both.
    await expect(card.locator("[data-metric]")).toBeVisible();
    const ready = await measure("[data-metric]");
    await card.getByRole("button", { name: "Load again" }).click();
    await expect(card.locator("[data-skeleton-row]")).toHaveCount(3);
    const loading = await measure("[data-skeleton-row]");

    expect(loading.blocks, `at ${width}px`).toEqual(ready.blocks);
    expect(loading.wrapper, `at ${width}px`).toBe(ready.wrapper);
  }
});
