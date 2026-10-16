import { z } from "zod";
import { SLOT_KINDS } from "../schema.js";

// A section template is one realistic part of a page (a hero, a features
// grid) with named slots that blocks are dropped into (ADR 0004). Like a
// component manifest, it has Zod props (so the same inspector edits it) and a
// render() that returns an element tree (ADR 0003). Where blocks go, the tree
// holds a Slot marker: h("Slot", { name: "actions", className: "…" }).
// Codegen swaps each marker for the slot's blocks; the editor canvas swaps it
// for an interactive drop zone.

const renderSchema = /** @type {z.ZodType<(props: any) => import("../../lib/codegen/jsx.js").Element>} */ (
  z.custom((value) => typeof value === "function", { message: "render must be a function" })
);

export const sectionSchema = z.strictObject({
  name: z.string().regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, "name must be kebab-case"),
  title: z.string().min(1),
  description: z.string().min(1),
  props: /** @type {z.ZodType<z.ZodObject>} */ (
    z.custom((value) => value instanceof z.ZodObject, { message: "props must be a z.object(...) schema" })
  ),
  slots: z
    .array(
      z.strictObject({
        name: z.string().regex(/^[a-z][a-zA-Z0-9]*$/, "slot names are camelCase"),
        title: z.string().min(1),
        accepts: z.array(z.enum(SLOT_KINDS)).min(1),
        max: z.number().int().min(1),
      }),
    )
    .min(1),
  render: renderSchema,
});

/** @typedef {z.infer<typeof sectionSchema>} SectionTemplate */
/** @typedef {SectionTemplate["slots"][number]} SlotDefinition */

/**
 * Checks a section template's shape and returns it unchanged.
 *
 * @param {SectionTemplate} section
 * @returns {SectionTemplate}
 */
export function defineSection(section) {
  const result = sectionSchema.safeParse(section);
  if (!result.success) {
    throw new Error(`Invalid section "${section?.name ?? "(unnamed)"}":\n${z.prettifyError(result.error)}`);
  }
  return section;
}
