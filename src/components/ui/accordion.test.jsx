// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { accordionProps } from "@/registry/accordion";
import { AccordionBlock, AccordionTrigger } from "./accordion";

const items = [
  { title: "Is it free?", content: "Yes, free." },
  { title: "Which frameworks?", content: "Next.js, Vite and HTML." },
  { title: "Can I sell it?", content: "Yes." },
];

/** @param {Partial<import("@/registry/accordion").AccordionProps>} [props] */
function renderAccordion(props) {
  const user = userEvent.setup();
  render(<AccordionBlock items={items} {...props} />);
  /** @param {string} name */
  const header = (name) => screen.getByRole("button", { name });
  return { user, header };
}

describe("Accordion: structure", () => {
  it("makes each header a heading that contains a button", () => {
    renderAccordion();
    const heading = screen.getByRole("heading", { level: 3, name: "Is it free?" });
    expect(heading.querySelector("button")).toHaveAccessibleName("Is it free?");
  });

  it("uses the heading level it's given", () => {
    renderAccordion({ headingLevel: 2 });
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
  });

  it("starts with every section closed and no panels showing", () => {
    const { header } = renderAccordion();
    for (const item of items) expect(header(item.title)).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryAllByRole("region")).toHaveLength(0);
  });
});

describe("Accordion: opening and closing", () => {
  it("opens a section's panel when its header is clicked, as a region named by the header", async () => {
    const { user, header } = renderAccordion();
    await user.click(header("Is it free?"));
    expect(header("Is it free?")).toHaveAttribute("aria-expanded", "true");
    const panel = screen.getByRole("region", { name: "Is it free?" });
    expect(panel).toHaveTextContent("Yes, free.");
    expect(header("Is it free?")).toHaveAttribute("aria-controls", panel.id);
  });

  it("closes an open section when its header is clicked again", async () => {
    const { user, header } = renderAccordion();
    await user.click(header("Is it free?"));
    await user.click(header("Is it free?"));
    expect(header("Is it free?")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("in single mode, opening one section closes the others", async () => {
    const { user, header } = renderAccordion();
    await user.click(header("Is it free?"));
    await user.click(header("Can I sell it?"));
    expect(header("Is it free?")).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("region")).toHaveLength(1);
  });

  it("with allowMultiple, keeps several sections open", async () => {
    const { user, header } = renderAccordion({ allowMultiple: true });
    await user.click(header("Is it free?"));
    await user.click(header("Can I sell it?"));
    expect(screen.getAllByRole("region")).toHaveLength(2);
  });
});

describe("Accordion: keyboard", () => {
  it("opens and closes with Enter and Space", async () => {
    const { user, header } = renderAccordion();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(header("Is it free?")).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(header("Is it free?")).toHaveAttribute("aria-expanded", "false");
  });

  it("puts every header in the Tab order", async () => {
    const { user, header } = renderAccordion();
    await user.tab();
    await user.tab();
    expect(header("Which frameworks?")).toHaveFocus();
  });

  it("moves between headers with Down and Up arrows, wrapping, without opening them", async () => {
    const { user, header } = renderAccordion();
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(header("Which frameworks?")).toHaveFocus();
    expect(header("Which frameworks?")).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(header("Can I sell it?")).toHaveFocus();
  });

  it("jumps to the last and first header with End and Home", async () => {
    const { user, header } = renderAccordion();
    await user.tab();
    await user.keyboard("{End}");
    expect(header("Can I sell it?")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(header("Is it free?")).toHaveFocus();
  });

  it("throws a clear error when a part is used outside <Accordion>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<AccordionTrigger>Lost</AccordionTrigger>)).toThrow("inside <Accordion>");
    spy.mockRestore();
  });
});

describe("Accordion and its manifest", () => {
  const levels = [...accordionProps.shape.headingLevel.unwrap().values];

  it.each(levels)("renders h%i headers when the manifest's heading level is %i", (level) => {
    renderAccordion({ headingLevel: level });
    expect(screen.getAllByRole("heading", { level })).toHaveLength(items.length);
  });

  it("renders the manifest's default items, all closed, in single mode", async () => {
    const user = userEvent.setup();
    const defaults = accordionProps.parse({});
    render(<AccordionBlock {...defaults} />);
    const headers = screen.getAllByRole("button");
    expect(headers).toHaveLength(defaults.items.length);
    await user.click(headers[0]);
    await user.click(headers[1]);
    expect(screen.getAllByRole("region")).toHaveLength(1);
  });

  it("rejects an empty list, more than six items, and duplicate titles", () => {
    const item = (/** @type {string} */ title) => ({ title, content: "x" });
    expect(accordionProps.safeParse({ items: [] }).success).toBe(false);
    expect(accordionProps.safeParse({ items: "abcdefg".split("").map(item) }).success).toBe(false);
    expect(accordionProps.safeParse({ items: [item("Same"), item("Same")] }).success).toBe(false);
  });
});
