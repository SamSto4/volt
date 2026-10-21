import { expect, test } from "@playwright/test";

// Keyboard behavior on the Try it page, in a real browser: jsdom has no real
// <dialog> focus trap, no layout and no :focus-visible, so these can only be
// checked here.

test.beforeEach(async ({ page }) => {
  await page.goto("/try");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("every Tab stop shows a visible focus indicator, and none is hidden under anything", async ({ page }) => {
  /** @type {string[]} */
  const problems = [];
  let stops = 0;
  // Walk the page with Tab until focus comes back around (or 200 stops).
  for (; stops < 200; stops++) {
    await page.keyboard.press("Tab");
    const stop = await page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused || focused === document.body) return null;
      // A visually hidden control (the radios inside a segmented control)
      // draws its focus ring on its label, so check that instead.
      const hidden = focused.getBoundingClientRect().width <= 1;
      const element = (hidden && focused.closest("label")) || focused;
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      // What's actually painted at the middle of the element: it, or something inside it.
      const atCenter = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return {
        name: `${element.tagName.toLowerCase()} "${(focused.getAttribute("aria-label") ?? element.textContent ?? "").trim().slice(0, 40)}"`,
        outlined: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2,
        covered: atCenter !== null && atCenter !== element && !element.contains(atCenter),
        isFooterLink: element.closest("footer") !== null,
      };
    });
    if (!stop) break;
    if (!stop.outlined) problems.push(`no focus outline: ${stop.name}`);
    if (stop.covered) problems.push(`covered by something else: ${stop.name}`);
    if (stop.isFooterLink) break; // the last stop on the page
  }
  expect(problems).toEqual([]);
  // Sanity check: the walk actually went through the gallery.
  expect(stops).toBeGreaterThan(40);
});

test("the dialog traps focus, closes on Escape and gives focus back to its trigger", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Delete page" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Delete the Pricing page?" });
  await expect(dialog).toBeVisible();
  // Cancel is the first button, so it's what the browser focuses: the safe choice.
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  // Tab cycles inside the dialog; it never reaches the page behind it. (The
  // browser may step out to its own toolbar, which leaves focus on <body>.)
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Tab");
    const where = await dialog.evaluate((element) =>
      element.contains(document.activeElement) ? "dialog" : document.activeElement === document.body ? "browser" : "page",
    );
    expect(where).not.toBe("page");
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("⌘K jumps to the command panel; arrows move and Enter chooses", async ({ page }) => {
  const search = page.getByRole("combobox", { name: "Search the example project" });
  // The shortcut's listener is attached after the page hydrates, and a slow CI
  // runner can press before that. So press, and press again until it lands.
  await expect(async () => {
    await page.keyboard.press("ControlOrMeta+k");
    await expect(search).toBeFocused({ timeout: 500 });
  }).toPass();
  await search.pressSequentially("phone");
  // Fuzzy matching ranks the word match first; looser matches follow.
  // (Scoped to the panel's list: the page's selects have <option>s too.)
  const results = page.getByRole("listbox", { name: "Results" }).getByRole("option");
  await expect(results.first()).toContainText("Preview at phone width");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");
  await expect(page.getByText("You chose “Preview at phone width”.", { exact: false })).toBeVisible();
});

test("removing a section shows a toast whose Undo puts it back", async ({ page }) => {
  const list = page.getByRole("list", { name: "Sections on the page" });
  await page.getByRole("button", { name: "Remove Pricing" }).click();
  await expect(list.getByText("Pricing")).toHaveCount(0);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(list.getByRole("listitem")).toHaveText([/Hero/, /Pricing/, /FAQ/]);
});
