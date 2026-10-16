// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./code-block";

const code = 'import { Button } from "@/components/ui/button";\n\nexport default function Example() {\n  return <Button>Hi</Button>;\n}\n';

describe("CodeBlock", () => {
  it("shows the plain code at once, then the same text in colored tokens", async () => {
    const { container } = render(<CodeBlock code={code} label="Example code" />);
    // One block per line; an empty line holds a single space to keep its height.
    const expected = code.replace(/\n$/, "").split("\n").map((line) => line || " ");
    const lines = () => [...container.querySelectorAll("code > span")].map((line) => line.textContent);

    // Before highlighting: plain text, already complete.
    expect(lines()).toEqual(expected);
    await waitFor(() => expect(container.querySelector("[style*='--token-light']")).not.toBeNull());
    // After: the same text, now split into colored tokens.
    expect(lines()).toEqual(expected);
  });

  it("marks the requested lines with the tint and gutter marker", () => {
    const { container } = render(<CodeBlock code={code} label="Example code" highlight={{ start: 4, end: 4 }} />);
    const marked = [...container.querySelectorAll("span.bg-primary-tint")];
    expect(marked.map((line) => line.textContent)).toEqual(["  return <Button>Hi</Button>;"]);
    expect(marked[0]).toHaveClass("border-primary");
  });

  it("is reachable by keyboard and named for screen readers", () => {
    render(<CodeBlock code={code} label="Example code" />);
    expect(screen.getByLabelText("Example code")).toHaveAttribute("tabindex", "0");
  });
});
