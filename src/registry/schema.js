import { z } from "zod";

// A manifest describes one component: what it's for, its props, where it can
// go and how to install it. The catalog, palette, inspector, codegen and
// registry all read it, so nothing about a component is written down twice.
//
// Manifests are plain data plus a Zod schema. They never import React, so
// codegen, server routes, build scripts and tests can load them safely.

/**
 * Kinds of slot a component can be dropped into. A component lists the kinds
 * it fits; a page slot lists the kinds it accepts. Matching by kind (instead
 * of by component name) means a new component works in every matching slot
 * without editing any page template.
 */
export const SLOT_KINDS = /** @type {const} */ (["action", "inline", "content", "form"]);

/** Palette groups. */
export const CATEGORIES = /** @type {const} */ (["actions", "forms", "display", "feedback", "layout"]);

// z.custom accepts any value the function approves. The JSDoc cast tells the
// type checker what that value is, so `manifest.props` is typed as a ZodObject.
const propsSchema = /** @type {z.ZodType<z.ZodObject>} */ (
  z.custom((value) => value instanceof z.ZodObject, {
    message: "props must be a z.object(...) schema",
  })
);

// A manifest's render function: (props, defaults) => element tree (ADR 0003).
const renderSchema = /** @type {z.ZodType<(props: any, defaults: any) => import("../lib/codegen/jsx.js").Element>} */ (
  z.custom((value) => typeof value === "function", { message: "code.render must be a function" })
);

// strictObject rejects unknown keys, so a typo like `fit:` instead of `fits:`
// fails loudly instead of being silently ignored.
export const manifestSchema = z.strictObject({
  name: z
    .string()
    .regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, "name must be kebab-case, like `button` or `radio-group`"),
  title: z.string().min(1),
  category: z.enum(CATEGORIES),
  description: z.string().min(1),
  usage: z.strictObject({
    whenToUse: z.string().min(1),
    whenNotToUse: z.string().min(1),
  }),
  props: propsSchema,
  // Named presets shown as live previews in the catalog. Their props are only
  // checked against the component's own schema in the tests, because this
  // schema can't know each component's props.
  variants: z
    .array(
      z.strictObject({
        name: z.string().min(1),
        props: z.record(z.string(), z.unknown()),
      }),
    )
    .min(1),
  fits: z.array(z.enum(SLOT_KINDS)).min(1),
  a11y: z.strictObject({
    role: z.string().min(1).optional(),
    keyboard: z.array(z.strictObject({ keys: z.string().min(1), action: z.string().min(1) })),
    notes: z.array(z.string().min(1)),
  }),
  // How to write this component as code (ADR 0003). `from` is the module its
  // parts are imported from; `render` turns props into an element tree that
  // src/lib/codegen prints. It must be pure: same props in, same tree out.
  code: z.strictObject({
    from: z.string().regex(/^@\/components\/ui\/[a-z0-9-]+$/, "code.from must be @/components/ui/<name>"),
    // Components the render uses from *other* modules, e.g. Tooltip's Button:
    // { Button: "@/components/ui/button" }. Everything else comes from `from`.
    uses: z
      .record(z.string().regex(/^[A-Z][A-Za-z0-9]*$/), z.string().regex(/^@\/components\/ui\/[a-z0-9-]+$/))
      .optional(),
    render: renderSchema,
  }),
  install: z.strictObject({
    dependencies: z.array(z.string().min(1)), // npm packages
    registryDependencies: z.array(z.string().min(1)), // other registry items, e.g. "utils"
  }),
});

/** @typedef {z.infer<typeof manifestSchema>} Manifest */

/**
 * Checks a manifest's shape and returns it. Runs when the manifest module is
 * first imported, so a broken manifest fails immediately with a readable
 * message, not later as a confusing bug in the inspector or codegen.
 *
 * @param {Manifest} manifest
 * @returns {Manifest}
 */
export function defineManifest(manifest) {
  const result = manifestSchema.safeParse(manifest);
  if (!result.success) {
    const name = typeof manifest?.name === "string" ? manifest.name : "(unnamed)";
    throw new Error(`Invalid manifest "${name}":\n${z.prettifyError(result.error)}`);
  }
  // Return the original object, not result.data, so `props` stays the exact
  // schema instance the component file exported.
  return manifest;
}
