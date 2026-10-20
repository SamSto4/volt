// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Command } from "./command";

const ITEMS = [
  { id: "button", title: "Button", group: "Actions" },
  { id: "badge", title: "Badge", group: "Display" },
  { id: "dialog", title: "Dialog", group: "Overlays", shortcut: "⌘D" },
];

/** A Command with a plain "title contains the query" search. */
function Search({ onSelect = () => {} }) {
  const [query, setQuery] = useState("");
  const results = ITEMS.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
  return (
    <Command
      label="Search components"
      query={query}
      onQueryChange={setQuery}
      results={results}
      onSelect={onSelect}
      hint="⌘K"
      empty={<p>Nothing matches “{query}”.</p>}
    />
  );
}

/** The option the combobox currently points at. */
function activeOption() {
  const id = screen.getByRole("combobox").getAttribute("aria-activedescendant");
  return id ? document.getElementById(id) : null;
}

describe("Command", () => {
  it("is a combobox named by its label, controlling a list of options", () => {
    render(<Search />);
    const box = screen.getByRole("combobox", { name: "Search components" });
    expect(box).toHaveAttribute("aria-controls", screen.getByRole("listbox").id);
    expect(screen.getAllByRole("option")).toHaveLength(3);
    // The ⌘K hint is visible, and the shortcut is exposed the ARIA way.
    expect(box).toHaveAttribute("aria-keyshortcuts", "Meta+K Control+K");
  });

  it("moves the active option with arrows, Home and End, wrapping at the ends, while focus stays in the box", async () => {
    const user = userEvent.setup();
    render(<Search />);
    await user.click(screen.getByRole("combobox"));

    expect(activeOption()).toHaveTextContent("Button");
    await user.keyboard("{ArrowDown}");
    expect(activeOption()).toHaveTextContent("Badge");
    expect(screen.getByRole("option", { name: /Badge/ })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(activeOption()).toHaveTextContent("Button"); // wrapped past the end
    await user.keyboard("{ArrowUp}");
    expect(activeOption()).toHaveTextContent("Dialog"); // wrapped past the start
    await user.keyboard("{Home}");
    expect(activeOption()).toHaveTextContent("Button");
    await user.keyboard("{End}");
    expect(activeOption()).toHaveTextContent("Dialog");

    expect(screen.getByRole("combobox")).toHaveFocus();
  });

  it("chooses the active option with Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Search onSelect={onSelect} />);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith(ITEMS[1]);
  });

  it("filters as you type, starts again from the first result, and says how many there are", async () => {
    const user = userEvent.setup();
    render(<Search />);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ArrowDown}{ArrowDown}");
    await user.type(screen.getByRole("combobox"), "b");

    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["ButtonActions", "BadgeDisplay"]);
    expect(activeOption()).toHaveTextContent("Button");
    expect(screen.getByRole("status")).toHaveTextContent("2 results");
  });

  it("says when nothing matches, and Enter does nothing", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Search onSelect={onSelect} />);
    await user.type(screen.getByRole("combobox"), "zzz{Enter}");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("Nothing matches “zzz”.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("0 results");
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-activedescendant");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("never scrolls the page, on first render or while arrowing", async () => {
    // It used to call scrollIntoView, which scrolls every scrollable ancestor,
    // so a page with a Command on it opened scrolled down to the panel.
    const scrollIntoView = vi.spyOn(Element.prototype, "scrollIntoView");
    const user = userEvent.setup();
    render(<Search />);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ArrowDown}{End}");
    expect(scrollIntoView).not.toHaveBeenCalled();
    scrollIntoView.mockRestore();
  });

  it("chooses an option by clicking it", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Search onSelect={onSelect} />);
    await user.click(screen.getByRole("option", { name: /Dialog/ }));
    expect(onSelect).toHaveBeenCalledWith(ITEMS[2]);
  });
});
