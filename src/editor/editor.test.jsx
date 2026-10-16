// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { PageCanvas } from "./canvas";
import { EditorProvider } from "./editor-context";
import { Editor } from "./editor";

/**
 * @param {Element} container
 * @param {{ iframes?: boolean }} [options]
 */
async function scan(container, options = {}) {
  /** @type {import("axe-core").AxeResults | undefined} */
  let results;
  await act(async () => {
    results = await axe.run(container, {
      ...options,
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
      rules: { "color-contrast": { enabled: false } },
    });
  });
  return (results?.violations ?? []).map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`);
}

// End-to-end-style tests of the real editor in jsdom: the panels live in the
// main document, the page lives inside the canvas iframe (see frame.jsx).

afterEach(() => localStorage.clear());

async function setup() {
  const user = userEvent.setup();
  const utils = render(<Editor />);
  const iframe = /** @type {HTMLIFrameElement} */ (await screen.findByTitle(/Page canvas/));
  await waitFor(() => expect(iframe.contentDocument?.querySelector("main")).not.toBeNull());
  /** Queries scoped to the page inside the canvas. */
  const canvas = () => within(/** @type {HTMLElement} */ (iframe.contentDocument?.body));
  const properties = () => within(screen.getByRole("complementary", { name: "Properties" }));
  const palette = () => within(screen.getByRole("complementary", { name: "Components and layers" }));
  const status = () => screen.getByRole("status", { hidden: true });
  return { ...utils, user, iframe, canvas, properties, palette, status };
}

describe("Editor", () => {
  it("opens the example page with the hero selected", async () => {
    const { canvas, properties } = await setup();
    expect(canvas().getByRole("heading", { level: 1 })).toHaveTextContent("Launch pages people actually finish reading");
    expect(properties().getByText("Selected section")).toBeInTheDocument();
    expect(properties().getByText("Hero")).toBeInTheDocument();
  });

  it("adds a component with 'Add to page', selects it and announces where it went", async () => {
    const { user, palette, properties, status, canvas } = await setup();
    await user.click(palette().getByRole("button", { name: "Add Button to page" }));
    expect(status()).toHaveTextContent("Button added to Hero · Actions, position 3 of 3.");
    expect(properties().getByText("Selected block")).toBeInTheDocument();
    expect(canvas().getAllByRole("button", { name: /^Button: Get started/ })).toHaveLength(2);
  });

  it("edits a block's props in the inspector and updates the canvas", async () => {
    const { user, canvas, properties } = await setup();
    fireEvent.click(canvas().getByRole("button", { name: "Button: Get started" }));
    const label = properties().getByRole("textbox", { name: "Label" });
    await user.clear(label);
    await user.type(label, "Start free trial");
    expect(canvas().getByRole("button", { name: "Button: Start free trial" })).toBeInTheDocument();
  });

  it("undoes and redoes with the toolbar, and typing a field is one undo step", async () => {
    const { user, canvas, properties } = await setup();
    fireEvent.click(canvas().getByRole("button", { name: "Button: Get started" }));
    const label = properties().getByRole("textbox", { name: "Label" });
    await user.clear(label);
    await user.type(label, "Go");

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(canvas().getByRole("button", { name: "Button: Get started" })).toBeInTheDocument();
    // The inspector follows the undo too.
    expect(properties().getByRole("textbox", { name: "Label" })).toHaveValue("Get started");
    await user.click(screen.getByRole("button", { name: "Redo" }));
    expect(canvas().getByRole("button", { name: "Button: Go" })).toBeInTheDocument();
  });

  it("selects a block on the canvas and deletes it with the keyboard", async () => {
    const { canvas, status } = await setup();
    const card = canvas().getByRole("button", { name: "Card: Works on any screen" });
    fireEvent.click(card);
    expect(card).toHaveAttribute("aria-pressed", "true");
    fireEvent.keyDown(card, { key: "Delete" });
    expect(status()).toHaveTextContent("Card removed from Features · Items.");
    expect(canvas().queryByRole("button", { name: "Card: Works on any screen" })).not.toBeInTheDocument();
  });

  it("moves a block with the action bar and keeps focus on the button", async () => {
    const { user, canvas, properties, status } = await setup();
    fireEvent.click(canvas().getByRole("button", { name: "Card: Fast to set up" }));
    const moveDown = properties().getByRole("button", { name: "Move down" });
    await user.click(moveDown);
    expect(status()).toHaveTextContent("Card moved to Features · Items, position 2 of 3.");
    expect(moveDown).toHaveFocus();
    expect(properties().getByText(/position 2 of 3/)).toBeInTheDocument();
  });

  it("adds a component from a slot's + menu", async () => {
    const { canvas, status } = await setup();
    fireEvent.click(canvas().getByRole("button", { name: "Add to Above the headline" }));
    fireEvent.click(canvas().getByRole("button", { name: "Avatar" }));
    expect(status()).toHaveTextContent("Avatar added to Hero · Above the headline, position 2 of 2.");
  });

  it("in 'Try it' mode the page is fully interactive", async () => {
    const { user, canvas } = await setup();
    await user.click(screen.getByRole("radio", { name: "Try it" }));
    // No editing wrappers: the real accordion header is a button you can press.
    const question = canvas().getByRole("button", { name: "Can I return an item?" });
    fireEvent.click(question);
    expect(question).toHaveAttribute("aria-expanded", "true");
    expect(canvas().queryByRole("button", { name: /^Card:/ })).not.toBeInTheDocument();
  });

  it("shows the page code and highlights the selected block's lines", async () => {
    const { user, canvas } = await setup();
    await user.click(screen.getByRole("radio", { name: "Split" }));
    fireEvent.click(canvas().getByRole("button", { name: "Badge: New" }));
    const code = screen.getByLabelText("Page code");
    const highlighted = [...code.querySelectorAll("span.bg-primary-tint")].map((line) => line.textContent?.trim());
    expect(highlighted).toEqual(['<Badge variant="highlight">New</Badge>']);
  });

  describe("drag and drop", () => {
    /** A stand-in for the browser's DataTransfer: jsdom doesn't have one. */
    const dataTransfer = () => ({ setData() {}, getData: () => "", effectAllowed: "", dropEffect: "" });

    /** @param {HTMLIFrameElement} iframe @param {number} sectionIndex @param {string} target e.g. "items" */
    const slotIn = (iframe, sectionIndex, target) => {
      const sections = iframe.contentDocument?.querySelectorAll("[data-section-id]") ?? [];
      const id = sections[sectionIndex]?.getAttribute("data-section-id");
      return /** @type {HTMLElement} */ (iframe.contentDocument?.querySelector(`[data-slot-target="${id}:${target}"]`));
    };

    it("drops a component from the palette into a slot that takes it", async () => {
      const { iframe, palette, status, canvas } = await setup();
      const card = /** @type {HTMLElement} */ (palette().getByRole("button", { name: "Add Card to page" }).closest("li"));
      const features = slotIn(iframe, 1, "items");

      fireEvent.dragStart(card, { dataTransfer: dataTransfer() });
      // preventDefault on dragover is how a target accepts: fireEvent returns false.
      expect(fireEvent.dragOver(features, { dataTransfer: dataTransfer() })).toBe(false);
      expect(features).toHaveClass("bg-primary-tint");
      fireEvent.drop(features, { dataTransfer: dataTransfer() });

      expect(status()).toHaveTextContent("Card added to Features · Items, position 1 of 4.");
      expect(canvas().getAllByRole("button", { name: /^Card:/ })).toHaveLength(4);
      // The new block flashes and gets selected.
      expect(canvas().getByRole("button", { name: "Card: Starter plan" })).toHaveClass("animate-drop-flash");
      expect(canvas().getByRole("button", { name: "Card: Starter plan" })).toHaveAttribute("aria-pressed", "true");
    });

    it("refuses a slot that doesn't take the component, with no highlight", async () => {
      const { iframe, palette } = await setup();
      const card = /** @type {HTMLElement} */ (palette().getByRole("button", { name: "Add Card to page" }).closest("li"));
      const heroActions = slotIn(iframe, 0, "actions");

      fireEvent.dragStart(card, { dataTransfer: dataTransfer() });
      expect(fireEvent.dragOver(heroActions, { dataTransfer: dataTransfer() })).toBe(true);
      expect(heroActions).not.toHaveClass("bg-primary-tint");
    });

    it("moves a block by dragging, fading the original, and it's one undo step", async () => {
      const { user, iframe, canvas, status } = await setup();
      const first = canvas().getByRole("button", { name: "Card: Fast to set up" });
      const features = slotIn(iframe, 1, "items");

      fireEvent.dragStart(first, { dataTransfer: dataTransfer() });
      expect(first).toHaveClass("opacity-40");
      // jsdom has no layout (every box is 0×0), so a pointer far right and
      // below counts as "after every block": the end of the slot. jsdom also
      // has no DragEvent, which would drop clientX/clientY, so these are
      // MouseEvents of the drag types, with a dataTransfer attached.
      const at = (/** @type {string} */ type) => {
        const view = /** @type {Window & typeof globalThis} */ (iframe.contentWindow);
        const event = new view.MouseEvent(type, { bubbles: true, cancelable: true, clientX: 9999, clientY: 9999 });
        Object.defineProperty(event, "dataTransfer", { value: dataTransfer() });
        return event;
      };
      fireEvent(features, at("dragover"));
      fireEvent(features, at("drop"));

      expect(status()).toHaveTextContent("Card moved to Features · Items, position 3 of 3.");
      const order = canvas().getAllByRole("button", { name: /^Card:/ }).map((card) => card.getAttribute("aria-label"));
      expect(order).toEqual(["Card: Works on any screen", "Card: Keyboard first", "Card: Fast to set up"]);

      await user.click(screen.getByRole("button", { name: "Undo" }));
      expect(canvas().getAllByRole("button", { name: /^Card:/ })[0]).toHaveAccessibleName("Card: Fast to set up");
    });
  });

  it("saves to this browser and restores on the next visit", async () => {
    const first = await setup();
    await first.user.click(first.palette().getByRole("button", { name: "Add Badge to page" }));
    first.unmount();

    const second = await setup();
    await waitFor(() => expect(second.status()).toHaveTextContent("Restored your page from this browser."));
    expect(second.canvas().getAllByRole("button", { name: /^Badge:/ })).toHaveLength(2);
  });

  it("has no axe violations in the editor chrome", async () => {
    const { container } = await setup();
    // The canvas iframe is scanned separately below: axe can't cross into a
    // jsdom iframe from the parent window.
    const results = await scan(container, { iframes: false });
    expect(results).toEqual([]);
  });

  it.each(/** @type {const} */ (["edit", "try"]))("has no axe violations on the canvas page in %s mode", async (mode) => {
    const { container } = render(
      <EditorProvider>
        <PageCanvas mode={mode} />
      </EditorProvider>,
    );
    expect(await scan(container)).toEqual([]);
  });
});
