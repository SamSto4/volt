import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// axe scans in a real browser at WCAG 2.1 AA (CLAUDE.md "Testing"). Each
// test runs in both themes (see the projects in playwright.config.mjs), so
// color contrast is checked in light and dark.

const WCAG_21_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * Runs axe on the page as it is now and fails with a readable list of what's wrong.
 *
 * @param {import("@playwright/test").Page} page
 */
async function expectNoViolations(page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_21_AA).analyze();
  // One line per broken element, with axe's explanation, e.g.
  // "color-contrast: .badge: Element has insufficient color contrast of 3.9 ...".
  const problems = violations.flatMap((violation) =>
    violation.nodes.map((node) => `${violation.id}: ${node.target.join(" ")}: ${node.any[0]?.message ?? violation.help}`),
  );
  expect(problems).toEqual([]);
}

const PAGES = [
  { name: "home", path: "/" },
  { name: "catalog", path: "/components" },
  { name: "a component page", path: "/components/button" },
  { name: "a component page with a dialog", path: "/components/dialog" },
  { name: "the Try it gallery", path: "/try" },
  { name: "the component finder's first question", path: "/try/suggest" },
];

for (const { name, path } of PAGES) {
  test(`${name} (${path}) has no WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("main")).toBeVisible();
    await expectNoViolations(page);
  });
}

test("the editor's start chooser has no WCAG 2.1 AA violations", async ({ page }) => {
  // A fresh browser has no saved page, so the editor asks how to start.
  await page.goto("/editor");
  await expect(page.getByRole("dialog", { name: "Start a new page" })).toBeVisible();
  await expectNoViolations(page);
});

test("the editor with a template open has no WCAG 2.1 AA violations", async ({ page }) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: /Landing page/ }).click();
  await expect(page.getByRole("dialog", { name: "Start a new page" })).toBeHidden();
  // The canvas is an iframe; axe scans inside it too.
  await expect(page.frameLocator("iframe").first().getByRole("heading").first()).toBeVisible();
  await expectNoViolations(page);
});

test("the component finder's results have no WCAG 2.1 AA violations", async ({ page }) => {
  await page.goto("/try/suggest");
  // Answer with the real controls, so the results include live components of every kind.
  await page.getByRole("radio", { name: "A dashboard or app screen" }).check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Find, review or manage things" }).check();
  await page.getByRole("button", { name: "Next" }).click();
  for (const need of ["Compare things in rows and columns", "Ask before something risky happens", "Show content that takes a moment to load", "Handle a list that starts empty"]) {
    await page.getByRole("checkbox", { name: need }).check();
  }
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "On phones" }).check();
  await page.getByRole("button", { name: "See my suggestions" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Your starting point" })).toBeFocused();
  await expectNoViolations(page);
});
