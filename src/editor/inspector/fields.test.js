import { describe, expect, it } from "vitest";
import { z } from "zod";
import { manifests } from "@/registry";
import { fieldsFor, friendlyMessage, validate } from "./fields.js";

const byName = (/** @type {string} */ name) => {
  const manifest = manifests.find((candidate) => candidate.name === name);
  if (!manifest) throw new Error(name);
  return manifest;
};

describe("fieldsFor", () => {
  it.each(manifests.map((manifest) => manifest.name))("has an inspector field for every prop of %s", (name) => {
    const manifest = byName(name);
    const fields = fieldsFor(manifest);
    expect(fields.map((field) => field.name)).toEqual(Object.keys(manifest.props.shape));
  });

  it("maps Button's props to the right kinds of field, labeled from the manifest", () => {
    expect(fieldsFor(byName("button"))).toEqual([
      { kind: "text", name: "label", label: "Label", maxLength: 40 },
      { kind: "choice", name: "variant", label: "Style", options: ["primary", "secondary", "ghost", "danger"] },
      { kind: "choice", name: "size", label: "Size", options: ["sm", "md", "lg"] },
      { kind: "toggle", name: "disabled", label: "Disabled" },
      { kind: "toggle", name: "loading", label: "Loading" },
    ]);
  });

  it("keeps number choices as numbers (Card's heading level)", () => {
    const level = fieldsFor(byName("card")).find((field) => field.name === "headingLevel");
    expect(level).toEqual({ kind: "choice", name: "headingLevel", label: "Heading level", options: [2, 3, 4] });
  });

  it("describes Tabs items as a list with limits and text fields", () => {
    const items = fieldsFor(byName("tabs")).find((field) => field.name === "items");
    expect(items).toMatchObject({ kind: "list", label: "Tabs", minItems: 2, maxItems: 6 });
    expect(items?.kind === "list" && items.itemFields.map((field) => field.label)).toEqual(["Tab label", "Panel text"]);
  });

  it("refuses a prop type it can't edit, instead of silently skipping it", () => {
    const manifest = { ...byName("button"), props: z.object({ when: z.date().default(new Date()).meta({ title: "When" }) }) };
    expect(() => fieldsFor(manifest)).toThrow();
  });
});

describe("validate", () => {
  it("returns parsed props, with defaults filled in, when the draft is valid", () => {
    const { props, errors } = validate(byName("button"), { label: "Go" });
    expect(errors).toEqual({});
    expect(props).toMatchObject({ label: "Go", variant: "primary" });
  });

  it("returns a friendly message per invalid field, keyed by its path", () => {
    const { props, errors } = validate(byName("tabs"), {
      items: [
        { label: "", content: "x" },
        { label: "B", content: "y" },
      ],
    });
    expect(props).toBeNull();
    expect(errors).toEqual({ "items.0.label": "This can't be empty." });
  });

  it("uses the manifest's own message for custom rules", () => {
    const { errors } = validate(byName("avatar"), { src: "javascript:alert(1)" });
    expect(errors.src).toBe("Use an https:// address or a path starting with /");
  });
});

describe("friendlyMessage", () => {
  it("rewrites Zod's length messages in plain words", () => {
    const issue = z.object({ name: z.string().max(3) }).safeParse({ name: "long" }).error?.issues[0];
    expect(issue && friendlyMessage(issue)).toBe("Keep it to 3 characters or fewer.");
  });
});
