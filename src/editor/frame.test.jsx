// @vitest-environment jsdom
import { fireEvent, render, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Frame } from "./frame";

/**
 * The frame's document, once React has rendered into it.
 * @param {HTMLElement} container
 */
async function frameBody(container) {
  const iframe = /** @type {HTMLIFrameElement} */ (container.querySelector("iframe"));
  await waitFor(() => expect(iframe.contentDocument?.body.childElementCount).toBeGreaterThan(0));
  return /** @type {HTMLElement} */ (iframe.contentDocument?.body);
}

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Clicked {count}
    </button>
  );
}

describe("Frame", () => {
  it("renders its children inside the iframe's own document, at the given width", async () => {
    const { container } = render(
      <Frame title="Canvas" width={375}>
        <p>Inside</p>
      </Frame>,
    );
    const body = await frameBody(container);
    expect(within(body).getByText("Inside")).toBeInTheDocument();
    expect(container.querySelector("iframe")).toHaveStyle({ width: "375px" });
    expect(container.querySelector("iframe")).toHaveAccessibleName("Canvas");
  });

  it("keeps React state and event handlers working across the frame boundary", async () => {
    const { container } = render(
      <Frame title="Canvas" width={375}>
        <Counter />
      </Frame>,
    );
    const body = await frameBody(container);
    fireEvent.click(within(body).getByRole("button"));
    fireEvent.click(within(body).getByRole("button"));
    expect(within(body).getByRole("button")).toHaveTextContent("Clicked 2");
  });

  it("writes a standards-mode document and copies the editor's styles in", async () => {
    const style = document.createElement("style");
    style.textContent = ".from-editor { color: red }";
    document.head.appendChild(style);
    const { container } = render(
      <Frame title="Canvas" width={375}>
        <p>Inside</p>
      </Frame>,
    );
    const body = await frameBody(container);
    const doc = /** @type {Document} */ (body.ownerDocument);
    expect(doc.compatMode).toBe("CSS1Compat");
    expect(doc.head.innerHTML).toContain(".from-editor");
    style.remove();
  });
});
