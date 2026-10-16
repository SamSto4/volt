import { z } from "zod";

// Turns a manifest's Zod props schema into a list of inspector fields, via
// JSON Schema (ADR 0002: a public, stable format instead of Zod internals).
// Pure: no React, so it's tested on its own.

/**
 * @typedef {object} TextField
 * @property {"text"} kind
 * @property {string} name
 * @property {string} label
 * @property {number} [maxLength]
 */

/**
 * @typedef {object} ChoiceField
 * @property {"choice"} kind
 * @property {string} name
 * @property {string} label
 * @property {(string | number)[]} options
 */

/**
 * @typedef {object} ToggleField
 * @property {"toggle"} kind
 * @property {string} name
 * @property {string} label
 */

/**
 * A list of objects whose properties are all text, like Tabs items.
 * @typedef {object} ListField
 * @property {"list"} kind
 * @property {string} name
 * @property {string} label
 * @property {number} minItems
 * @property {number} maxItems
 * @property {TextField[]} itemFields
 */

/** @typedef {TextField | ChoiceField | ToggleField | ListField} Field */

/**
 * @param {string} name
 * @param {any} property  one JSON Schema property
 * @returns {Field}
 */
function toField(name, property) {
  const label = property.title ?? name;
  if (Array.isArray(property.enum)) return { kind: "choice", name, label, options: property.enum };
  if (property.type === "boolean") return { kind: "toggle", name, label };
  if (property.type === "string") return { kind: "text", name, label, maxLength: property.maxLength };
  if (property.type === "array" && property.items?.type === "object") {
    const itemFields = Object.entries(property.items.properties ?? {}).map(([itemName, itemProperty]) => {
      const field = toField(itemName, itemProperty);
      if (field.kind !== "text") throw new Error(`List "${name}" can only contain text fields (got "${itemName}")`);
      return field;
    });
    return {
      kind: "list",
      name,
      label,
      minItems: property.minItems ?? 0,
      maxItems: property.maxItems ?? Infinity,
      itemFields,
    };
  }
  throw new Error(`The inspector has no field for prop "${name}" (${JSON.stringify(property.type)})`);
}

/**
 * The inspector fields for a manifest, in the order its props are declared.
 *
 * @param {import("@/registry/schema").Manifest} manifest
 * @returns {Field[]}
 */
export function fieldsFor(manifest) {
  // io: "input" describes what may be *passed in*, so props with defaults
  // aren't listed as required.
  const schema = /** @type {any} */ (z.toJSONSchema(manifest.props, { io: "input" }));
  return Object.entries(schema.properties ?? {}).map(([name, property]) => toField(name, property));
}

/**
 * A short, friendly message for one Zod issue, in Volt's voice: say what to
 * do, not what went wrong internally ("Too small: expected string…").
 *
 * @param {z.core.$ZodIssue} issue
 * @returns {string}
 */
export function friendlyMessage(issue) {
  const detail = /** @type {{ origin?: string, minimum?: number, maximum?: number }} */ (issue);
  if (issue.code === "too_small" && detail.origin === "string") {
    return detail.minimum === 1 ? "This can't be empty." : `Use at least ${detail.minimum} characters.`;
  }
  if (issue.code === "too_big" && detail.origin === "string") return `Keep it to ${detail.maximum} characters or fewer.`;
  if (issue.code === "too_small" && detail.origin === "array") return `Keep at least ${detail.minimum}.`;
  if (issue.code === "too_big" && detail.origin === "array") return `Use ${detail.maximum} at most.`;
  // Custom messages written in the manifests (regex rules, refinements) are already friendly.
  return issue.message;
}

/**
 * Validates draft props. Returns the parsed props when valid, and a message
 * for each invalid field keyed by its path ("label", "items.0.label").
 *
 * @param {import("@/registry/schema").Manifest} manifest
 * @param {Record<string, unknown>} draft
 * @returns {{ props: Record<string, unknown> | null, errors: Record<string, string> }}
 */
export function validate(manifest, draft) {
  const result = manifest.props.safeParse(draft);
  if (result.success) return { props: result.data, errors: {} };
  /** @type {Record<string, string>} */
  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    // Keep the first message per field: it's usually the most useful one.
    errors[key] ??= friendlyMessage(issue);
  }
  return { props: null, errors };
}
