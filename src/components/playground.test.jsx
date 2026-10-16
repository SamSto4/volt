// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Playground } from "./playground";

/** The Code panel is hidden until its tab is chosen; read its text directly. */
function codeText() {
  return document.querySelector("[data-slot=playground] code")?.textContent ?? "";
}

describe("Playground", () => {
  it("previews the component with its defaults and shows matching code", () => {
    render(<Playground name="button" />);
    const preview = screen.getByRole("tabpanel", { name: "Preview" });
    expect(within(preview).getByRole("button", { name: "Get started" })).toBeInTheDocument();
    expect(codeText()).toContain("<Button>Get started</Button>");
  });

  it("updates the preview and the code together when a prop changes", async () => {
    const user = userEvent.setup();
    render(<Playground name="button" />);
    const props = screen.getByRole("complementary", { name: "Button props" });

    await user.click(within(props).getByRole("radio", { name: "Secondary" }));
    const label = within(props).getByRole("textbox", { name: "Label" });
    await user.clear(label);
    await user.type(label, "Learn more");

    const preview = screen.getByRole("tabpanel", { name: "Preview" });
    expect(within(preview).getByRole("button", { name: "Learn more" })).toHaveAttribute("data-variant", "secondary");
    expect(codeText()).toContain('<Button variant="secondary">Learn more</Button>');
  });

  it("keeps the last valid version and marks the field when input is invalid", async () => {
    const user = userEvent.setup();
    render(<Playground name="button" />);
    const label = screen.getByRole("textbox", { name: "Label" });

    await user.clear(label);
    expect(label).toBeInvalid();
    expect(label).toHaveAccessibleDescription("This can't be empty.");
    // The preview still shows the last valid label.
    const preview = screen.getByRole("tabpanel", { name: "Preview" });
    expect(within(preview).getByRole("button", { name: "Get started" })).toBeInTheDocument();
    expect(screen.getByText(/Showing the last valid version/)).toBeInTheDocument();
  });

  it("loads a preset and resets to it", async () => {
    const user = userEvent.setup();
    render(<Playground name="alert" />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Start from" }), "Danger");
    expect(screen.getByRole("radio", { name: "Danger" })).toBeChecked();
    expect(codeText()).toContain('<Alert tone="danger">');

    await user.click(screen.getByRole("radio", { name: "Success" }));
    await user.click(screen.getByRole("button", { name: "Reset to preset" }));
    expect(screen.getByRole("radio", { name: "Danger" })).toBeChecked();
  });

  it("edits list items: add, rename and remove tabs within the limits", async () => {
    const user = userEvent.setup();
    render(<Playground name="tabs" />);
    const props = screen.getByRole("complementary", { name: "Tabs props" });

    await user.click(within(props).getByRole("button", { name: "Add item" }));
    const preview = screen.getByRole("tabpanel", { name: "Preview" });
    expect(within(preview).getAllByRole("tab")).toHaveLength(4);
    expect(within(preview).getByRole("tab", { name: "Item 4" })).toBeInTheDocument();

    const firstLabel = within(props).getAllByRole("textbox", { name: "Tab label" })[0];
    await user.clear(firstLabel);
    await user.type(firstLabel, "Remix");
    expect(within(screen.getByRole("tabpanel", { name: "Preview" })).getByRole("tab", { name: "Remix" })).toBeInTheDocument();

    // Remove down to the minimum of two; the remove buttons then turn off.
    await user.click(within(props).getByRole("button", { name: "Remove item 4" }));
    await user.click(within(props).getByRole("button", { name: "Remove item 3" }));
    expect(within(props).getByRole("button", { name: "Remove item 1" })).toBeDisabled();
  });

  it("keeps number choices as numbers (heading level)", async () => {
    const user = userEvent.setup();
    render(<Playground name="card" />);
    await user.click(screen.getByRole("radio", { name: "2" }));
    const preview = screen.getByRole("tabpanel", { name: "Preview" });
    expect(within(preview).getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(codeText()).toContain("<CardTitle level={2}>");
  });

  it("the components inside the preview stay interactive", async () => {
    const user = userEvent.setup();
    render(<Playground name="accordion" />);
    const preview = screen.getByRole("tabpanel", { name: "Preview" });
    const header = within(preview).getByRole("button", { name: "Can I return an item?" });
    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "true");
  });
});
