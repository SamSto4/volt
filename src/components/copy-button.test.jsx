// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CopyButton } from "./copy-button";

describe("CopyButton", () => {
  it("says what it copies", () => {
    render(<CopyButton text="x" />);
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
  });

  it("copies the text, then says Copied, keeps focus and announces it", async () => {
    // user-event installs a stand-in clipboard we can read back.
    const user = userEvent.setup();
    render(<CopyButton text="<Button>Hi</Button>" />);
    const button = screen.getByRole("button", { name: "Copy code" });

    await user.click(button);
    expect(await navigator.clipboard.readText()).toBe("<Button>Hi</Button>");
    expect(button).toHaveAccessibleName("Copied");
    expect(button).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
  });

  it("shows Copied only after the clipboard accepted the text", async () => {
    const user = userEvent.setup();
    /** @type {() => void} */
    let finish = () => {};
    vi.spyOn(navigator.clipboard, "writeText").mockReturnValue(new Promise((resolve) => (finish = () => resolve())));
    render(<CopyButton text="x" />);

    await user.click(screen.getByRole("button"));
    // The promise hasn't resolved yet, so the label hasn't changed.
    expect(screen.getByRole("button")).toHaveAccessibleName("Copy code");
    finish();
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("when copying fails, says so and selects the code to copy by hand", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    render(
      <>
        <pre>
          <code id="snippet">npm install volt</code>
        </pre>
        <CopyButton text="npm install volt" targetId="snippet" />
      </>,
    );

    await user.click(screen.getByRole("button"));
    expect(await screen.findByRole("button", { name: "Couldn't copy" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy");
    expect(window.getSelection()?.toString()).toBe("npm install volt");
  });
});
