// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { alertProps } from "@/registry/alert";
import { Alert, AlertDescription, AlertTitle, tones } from "./alert";

/** @param {Partial<import("react").ComponentProps<typeof Alert>>} props */
function SaveError(props) {
  return (
    <Alert data-testid="alert" tone="danger" {...props}>
      <AlertTitle>Couldn&apos;t save</AlertTitle>
      <AlertDescription>Your changes are still here. Try again.</AlertDescription>
    </Alert>
  );
}

describe("Alert", () => {
  it("speaks its tone before the title, so meaning doesn't rely on the icon", () => {
    render(<SaveError />);
    // textContent joins the two paragraphs without a space; screen readers
    // read them as separate blocks, so only the order matters here.
    const text = screen.getByTestId("alert").textContent ?? "";
    expect(text.startsWith("Error: Couldn't save")).toBe(true);
    expect(text).toContain("Your changes are still here. Try again.");
  });

  it("hides the decorative icon from screen readers", () => {
    render(<SaveError />);
    expect(screen.getByTestId("alert").querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("has no live role when it's static, so it doesn't interrupt on page load", () => {
    render(<SaveError />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("when announced, a danger alert interrupts (role=alert)", () => {
    render(<SaveError announce />);
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't save");
  });

  it.each(["info", "success"])("when announced, a %s alert waits politely (role=status)", (tone) => {
    render(
      <Alert tone={/** @type {"info" | "success"} */ (tone)} announce>
        <AlertTitle>Page published</AlertTitle>
      </Alert>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Page published");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("is not interactive: Tab goes past it", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SaveError />
        <button type="button">Try again</button>
      </>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Try again" })).toHaveFocus();
  });

  it("lets a caller's className override the defaults", () => {
    render(<SaveError className="p-6" />);
    const alert = screen.getByTestId("alert");
    expect(alert).toHaveClass("p-6");
    expect(alert).not.toHaveClass("p-4");
  });
});

describe("Alert and its manifest", () => {
  it("has an icon and spoken label for exactly the tones the manifest allows", () => {
    const manifestTones = alertProps.shape.tone.unwrap().options;
    expect(Object.keys(tones).sort()).toEqual([...manifestTones].sort());
  });

  it("uses the manifest's defaults: info tone, static", () => {
    const defaults = alertProps.parse({});
    render(
      <Alert data-testid="alert">
        <AlertTitle>{defaults.title}</AlertTitle>
      </Alert>,
    );
    const alert = screen.getByTestId("alert");
    expect(alert).toHaveAttribute("data-tone", defaults.tone);
    expect(alert).not.toHaveAttribute("role");
    expect(defaults.announce).toBe(false);
  });
});
