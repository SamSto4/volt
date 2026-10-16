// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CanvasErrorBoundary } from "./canvas-error-boundary";

/** @param {{ broken: boolean }} props */
function MaybeBroken({ broken }) {
  if (broken) throw new Error("bad block");
  return <p>Page is fine</p>;
}

describe("CanvasErrorBoundary", () => {
  it("shows the fallback instead of crashing when a child throws", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <CanvasErrorBoundary resetKey={1} fallback={(error) => <p role="alert">Couldn&apos;t show it: {error.message}</p>}>
        <MaybeBroken broken />
      </CanvasErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't show it: bad block");
    quiet.mockRestore();
  });

  it("tries again when the page changes (resetKey), e.g. after an undo", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    const fallback = () => <p role="alert">Broken</p>;
    const { rerender } = render(
      <CanvasErrorBoundary resetKey={1} fallback={fallback}>
        <MaybeBroken broken />
      </CanvasErrorBoundary>,
    );
    rerender(
      <CanvasErrorBoundary resetKey={2} fallback={fallback}>
        <MaybeBroken broken={false} />
      </CanvasErrorBoundary>,
    );
    expect(screen.getByText("Page is fine")).toBeInTheDocument();
    quiet.mockRestore();
  });
});
