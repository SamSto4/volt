import { expect, test } from "@playwright/test";

// Drag and drop in a real browser (CLAUDE.md "E2E"): the unit tests fire
// synthetic drag events in jsdom, which has no real DnD, no layout, and no
// scaled iframe. These use Chrome's own drag and drop, across the palette
// (the page) and the canvas (an iframe).

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/editor");
  await page.getByRole("button", { name: /Landing page/ }).click();
  await expect(page.frameLocator("iframe").locator("[data-block-id]").first()).toBeVisible();
});

/** The palette card for a component. */
const card = (/** @type {import("@playwright/test").Page} */ page, /** @type {string} */ name) =>
  page.getByRole("complementary", { name: "Components and layers" }).locator("[draggable=true]", { hasText: name }).first();

/** A slot on the canvas, like "actions" or "items". */
const slot = (/** @type {import("@playwright/test").Page} */ page, /** @type {string} */ name) =>
  page.frameLocator("iframe").locator(`[data-slot-target$=":${name}"]`).first();

const blocks = (/** @type {import("@playwright/test").Page} */ page) => page.frameLocator("iframe").locator("[data-block-id]");

test("drags a component from the palette into a slot that takes it", async ({ page }) => {
  const before = await blocks(page).count();
  await card(page, "Button").dragTo(slot(page, "actions"), { targetPosition: { x: 20, y: 10 } });
  await expect(blocks(page)).toHaveCount(before + 1);
  await expect(page.getByRole("status", { name: "Editor announcements", includeHidden: true })).toContainText("Button added to Hero · Actions");
});

test("reorders a block by dragging it within its slot", async ({ page }) => {
  const labels = () =>
    page.frameLocator("iframe").locator("[data-slot-target$=':items'] [role=button][aria-pressed]").evaluateAll((els) => els.map((el) => el.getAttribute("aria-label")));
  expect(await labels()).toEqual(["Card: Fast to set up", "Card: Works on any screen", "Card: Keyboard first"]);
  const items = slot(page, "items");
  const box = await items.boundingBox();
  await page.frameLocator("iframe").locator("[data-slot-target$=':items'] [data-block-id]").first().dragTo(items, {
    targetPosition: { x: (box?.width ?? 100) - 10, y: (box?.height ?? 100) - 10 },
  });
  expect(await labels()).toEqual(["Card: Works on any screen", "Card: Keyboard first", "Card: Fast to set up"]);
});

test("a drop on a slot that doesn't take the component adds nothing, and says why and where it fits", async ({ page }) => {
  const before = await blocks(page).count();
  // A Badge is an inline mark; the hero's Actions takes buttons.
  await card(page, "Badge").dragTo(slot(page, "actions"), { targetPosition: { x: 20, y: 10 } });
  await expect(blocks(page)).toHaveCount(before);
  await expect(page.locator("[data-slot=toast]")).toContainText("Badge wasn't added. Drop it on a highlighted slot: Hero · Above the headline");
});

test("while dragging, every slot that takes the component is outlined and the others are not", async ({ page }) => {
  const source = await card(page, "Button").boundingBox();
  const target = await slot(page, "actions").boundingBox();
  if (!source || !target) throw new Error("couldn't measure the drag");
  await page.mouse.move(source.x + 40, source.y + 20);
  await page.mouse.down();
  await page.mouse.move(source.x + 80, source.y + 30, { steps: 4 });
  // Over the canvas, but not yet over a slot that takes it.
  await page.mouse.move(target.x + target.width / 2, target.y - 40, { steps: 10 });
  await expect(slot(page, "actions")).toHaveClass(/outline-dashed/);
  await expect(slot(page, "items")).not.toHaveClass(/outline-dashed/);
  await page.mouse.up();
});
