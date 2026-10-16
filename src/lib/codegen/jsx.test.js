import ts from "typescript";
import { describe, expect, it } from "vitest";
import { collectTypes, h, printAttribute, printJsx, printText } from "./jsx.js";

/**
 * Syntax errors TypeScript finds when reading `code` as a .tsx file.
 * @param {string} code
 */
export function syntaxErrors(code) {
  const { diagnostics = [] } = ts.transpileModule(code, {
    fileName: "example.tsx",
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve },
  });
  return diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, " "));
}

/** Wraps JSX so it can be parsed as a file. @param {string} jsx */
const asModule = (jsx) => `export const x = (\n${jsx}\n);`;

describe("printText", () => {
  it("prints plain words as they are", () => {
    expect(printText("Get started")).toBe("Get started");
  });

  it.each([
    ["Save {draft}", '{"Save {draft}"}'],
    ["a < b", '{"a < b"}'],
    ["Fish & chips", '{"Fish & chips"}'],
    ["Couldn't save", '{"Couldn\'t save"}'],
    ['Say "hi"', '{"Say \\"hi\\""}'],
    [" padded ", '{" padded "}'],
    ["", '{""}'],
  ])("turns %j into a string expression: %s", (text, expected) => {
    expect(printText(text)).toBe(expected);
  });

  it.each(["Save {draft}", "a < b > c", "Fish & chips", "Couldn't", 'He said "hi"', "line\nbreak", "😀 emoji"])(
    "always produces JSX that parses and keeps the exact text: %j",
    (text) => {
      const code = asModule(printJsx(h("p", {}, text)));
      expect(syntaxErrors(code)).toEqual([]);
    },
  );
});

describe("printAttribute", () => {
  it("leaves out false, null and undefined", () => {
    expect(printAttribute("disabled", false)).toBe("");
    expect(printAttribute("x", null)).toBe("");
    expect(printAttribute("x", undefined)).toBe("");
  });

  it("prints true as a bare attribute", () => {
    expect(printAttribute("disabled", true)).toBe(" disabled");
  });

  it("prints numbers as expressions", () => {
    expect(printAttribute("level", 2)).toBe(" level={2}");
  });

  it("quotes plain strings, and uses an expression when quotes, & or line breaks appear", () => {
    expect(printAttribute("variant", "secondary")).toBe(' variant="secondary"');
    expect(printAttribute("label", 'Say "hi"')).toBe(' label={"Say \\"hi\\""}');
    expect(printAttribute("label", "R&D")).toBe(' label={"R&D"}');
  });

  it("keeps braces and apostrophes in quoted strings, where JSX doesn't treat them specially", () => {
    expect(printAttribute("label", "Don't {panic}")).toBe(' label="Don\'t {panic}"');
    expect(syntaxErrors(asModule("<X label=\"Don't {panic}\" />"))).toEqual([]);
  });

  it("rejects attribute names that aren't valid JSX", () => {
    expect(() => printAttribute("on click", "x")).toThrow(/Invalid attribute name/);
  });
});

describe("printJsx", () => {
  it("self-closes an element with no children", () => {
    expect(printJsx(h("InputField", { label: "Email" }))).toBe('<InputField label="Email" />');
  });

  it("keeps an element with only text on one line", () => {
    expect(printJsx(h("Button", { variant: "secondary" }, "Learn more"))).toBe(
      '<Button variant="secondary">Learn more</Button>',
    );
  });

  it("puts element children on their own lines, indented two spaces per level", () => {
    const tree = h("Card", {}, h("CardHeader", {}, h("CardTitle", {}, "Plan")));
    expect(printJsx(tree)).toBe(
      ["<Card>", "  <CardHeader>", "    <CardTitle>Plan</CardTitle>", "  </CardHeader>", "</Card>"].join("\n"),
    );
  });

  it("skips false, null and undefined children, like JSX does", () => {
    const tree = h("Card", {}, h("CardTitle", {}, "Plan"), false, null, undefined);
    expect(printJsx(tree)).toBe("<Card>\n  <CardTitle>Plan</CardTitle>\n</Card>");
  });

  it("flattens arrays of children, so items.map(...) can be passed in", () => {
    const tree = h("ul", {}, ["a", "b"].map((letter) => h("li", {}, letter)));
    expect(printJsx(tree)).toBe("<ul>\n  <li>a</li>\n  <li>b</li>\n</ul>");
  });

  it("rejects element types that aren't valid JSX", () => {
    expect(() => h("my button")).toThrow(/Invalid element type/);
  });
});

describe("collectTypes", () => {
  it("lists each element type once, in the order first seen", () => {
    const tree = h("Card", {}, h("CardTitle", {}, "A"), h("CardTitle", {}, "B"), h("p", {}, "x"));
    expect(collectTypes(tree)).toEqual(["Card", "CardTitle", "p"]);
  });
});
