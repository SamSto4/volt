// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { tabsProps } from "@/registry/tabs";
import { Tabs, TabsBlock, TabsContent, TabsList, TabsTrigger } from "./tabs";

const items = [
  { label: "Next.js", content: "Next.js steps" },
  { label: "Vite", content: "Vite steps" },
  { label: "HTML", content: "HTML steps" },
];

function renderTabs() {
  const user = userEvent.setup();
  render(<TabsBlock label="Framework" items={items} />);
  /** @param {string} name */
  const tab = (name) => screen.getByRole("tab", { name });
  return { user, tab };
}

describe("Tabs: structure", () => {
  it("is a named tab list with one tab per item", () => {
    renderTabs();
    expect(screen.getByRole("tablist", { name: "Framework" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual(["Next.js", "Vite", "HTML"]);
  });

  it("selects the first tab and shows only its panel", () => {
    const { tab } = renderTabs();
    expect(tab("Next.js")).toHaveAttribute("aria-selected", "true");
    expect(tab("Vite")).toHaveAttribute("aria-selected", "false");
    // Hidden panels aren't in the accessibility tree, so exactly one is found.
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Next.js steps");
  });

  it("links each tab and panel to each other", () => {
    const { tab } = renderTabs();
    const panel = screen.getByRole("tabpanel");
    expect(tab("Next.js")).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAccessibleName("Next.js");
  });
});

describe("Tabs: mouse", () => {
  it("shows a tab's panel when it's clicked", async () => {
    const { user, tab } = renderTabs();
    await user.click(tab("Vite"));
    expect(tab("Vite")).toHaveAttribute("aria-selected", "true");
    expect(tab("Next.js")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tabpanel", { name: "Vite" })).toHaveTextContent("Vite steps");
  });
});

describe("Tabs: keyboard", () => {
  it("puts only the selected tab in the Tab order, then the panel", async () => {
    const { user, tab } = renderTabs();
    await user.tab();
    expect(tab("Next.js")).toHaveFocus();
    // The next Tab skips the other tabs and goes into the panel.
    await user.tab();
    expect(screen.getByRole("tabpanel")).toHaveFocus();
  });

  it("moves to and selects the next tab with Right arrow, wrapping at the end", async () => {
    const { user, tab } = renderTabs();
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(tab("Vite")).toHaveFocus();
    expect(tab("Vite")).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(tab("Next.js")).toHaveFocus();
  });

  it("moves backwards with Left arrow, wrapping at the start", async () => {
    const { user, tab } = renderTabs();
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(tab("HTML")).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("HTML steps");
  });

  it("jumps to the last and first tab with End and Home", async () => {
    const { user, tab } = renderTabs();
    await user.tab();
    await user.keyboard("{End}");
    expect(tab("HTML")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(tab("Next.js")).toHaveFocus();
    expect(tab("Next.js")).toHaveAttribute("aria-selected", "true");
  });

  it("keeps roving tabindex in step with the selection", async () => {
    const { user, tab } = renderTabs();
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(tab("Vite")).toHaveAttribute("tabindex", "0");
    expect(tab("Next.js")).toHaveAttribute("tabindex", "-1");
    expect(tab("HTML")).toHaveAttribute("tabindex", "-1");
  });
});

describe("Tabs: controlled", () => {
  it("reports changes and follows the value it's given", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs value="a" onValueChange={onValueChange}>
        <TabsList aria-label="Letters">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    // The parent didn't change `value`, so A stays selected.
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "true");
  });

  it("throws a clear error when a part is used outside <Tabs>", () => {
    // React logs the error too; silence it so the test output stays readable.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TabsTrigger value="a">A</TabsTrigger>)).toThrow("inside <Tabs>");
    spy.mockRestore();
  });
});

describe("Tabs and its manifest", () => {
  it("renders the manifest's default items as tabs", () => {
    const defaults = tabsProps.parse({});
    render(<TabsBlock {...defaults} />);
    expect(screen.getAllByRole("tab")).toHaveLength(defaults.items.length);
    expect(screen.getByRole("tablist", { name: defaults.label })).toBeInTheDocument();
  });

  it("rejects fewer than two tabs and duplicate labels", () => {
    const one = [{ label: "Only", content: "x" }];
    const twins = [
      { label: "Same", content: "x" },
      { label: "Same", content: "y" },
    ];
    expect(tabsProps.safeParse({ items: one }).success).toBe(false);
    expect(tabsProps.safeParse({ items: twins }).success).toBe(false);
  });
});
