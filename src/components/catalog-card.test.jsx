// @vitest-environment jsdom
import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CatalogCard } from "./catalog-card";

/** @param {string} name */
function renderCard(name) {
  const user = userEvent.setup();
  const { container } = render(
    <ul>
      <CatalogCard name={name} />
    </ul>,
  );
  // The card is the outer <li> (its abilities list has <li>s of its own).
  return { user, card: within(/** @type {HTMLElement} */ (container.querySelector("ul > li"))) };
}

describe("CatalogCard", () => {
  it("has a live, interactive preview: the accordion opens right on the card", async () => {
    const { user, card } = renderCard("accordion");
    const question = card.getByRole("button", { name: "Can I return an item?" });
    await user.click(question);
    expect(question).toHaveAttribute("aria-expanded", "true");
  });

  it("switches the preview between presets from the chips", async () => {
    const { user, card } = renderCard("alert");
    await user.click(card.getByRole("button", { name: "Danger" }));
    expect(card.getByRole("button", { name: "Danger" })).toHaveAttribute("aria-pressed", "true");
    expect(card.getByText("Couldn't save")).toBeInTheDocument();
  });

  it("states what it can do, readable without hovering", () => {
    const { card } = renderCard("tabs");
    // Only visually faded until hover or focus: still in the accessibility tree.
    expect(card.getByText(/Keyboard:/)).toBeInTheDocument();
    expect(card.getByText(/settings to change: group label, tabs/)).toBeInTheDocument();
  });

  it("links its title to the component's page and shows its accessibility badge", () => {
    const { card } = renderCard("tooltip");
    expect(card.getByRole("link", { name: "Tooltip" })).toHaveAttribute("href", "/components/tooltip");
    expect(card.getByText("role: tooltip")).toBeInTheDocument();
  });
});
