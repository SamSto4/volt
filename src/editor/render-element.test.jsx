// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { generateBlockCode, h } from "@/lib/codegen";
import { collectTypes } from "@/lib/codegen/jsx.js";
import { manifests } from "@/registry";
import { renderElement, scope } from "./render-element";

describe("renderElement", () => {
  it("renders a component from the tree as the real component", () => {
    render(renderElement(h("Button", { variant: "secondary" }, "Learn more")));
    const button = screen.getByRole("button", { name: "Learn more" });
    expect(button).toHaveAttribute("data-variant", "secondary");
  });

  it("renders lowercase types as HTML tags", () => {
    render(renderElement(h("p", {}, "Hello")));
    expect(screen.getByText("Hello").tagName).toBe("P");
  });

  it("skips false, null and undefined children, like JSX", () => {
    render(renderElement(h("p", {}, "a", false, null, undefined, "b")));
    expect(screen.getByText("ab")).toBeInTheDocument();
  });

  it("throws for a component that isn't in the preview scope", () => {
    expect(() => renderElement(h("Carousel"))).toThrow('No component named "Carousel"');
  });
});

describe("preview scope", () => {
  const cases = manifests.flatMap((manifest) => manifest.variants.map((variant) => ({ manifest, variant })));

  it.each(cases)("covers every component $manifest.name / $variant.name uses", ({ manifest, variant }) => {
    const props = manifest.props.parse(variant.props);
    const types = collectTypes(manifest.code.render(props, manifest.props.parse({})));
    for (const type of types.filter((t) => /^[A-Z]/.test(t))) expect(scope).toHaveProperty(type);
  });

  it.each(cases)("previews $manifest.name / $variant.name with the components its code imports", ({ manifest, variant }) => {
    const { imports } = generateBlockCode({ component: manifest.name, props: variant.props }, manifests);
    const names = imports.match(/\{ (.*) \}/)?.[1].split(", ") ?? [];
    // Same names in the code and in the preview: one tree, two outputs.
    for (const name of names) expect(scope).toHaveProperty(name);
  });
});
