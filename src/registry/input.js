import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

export const inputProps = z.object({
  label: z.string().min(1).max(40).default("Email").meta({ title: "Label" }),
  type: z.enum(["email", "text", "search", "url", "tel"]).default("email").meta({ title: "Type" }),
  placeholder: z.string().max(60).default("").meta({ title: "Placeholder" }),
  // Hint text under the field, linked with aria-describedby so screen readers read it too.
  description: z.string().max(120).default("").meta({ title: "Hint" }),
  // A non-empty error marks the field invalid and is read along with the label.
  error: z.string().max(120).default("").meta({ title: "Error message" }),
  required: z.boolean().default(false).meta({ title: "Required" }),
  disabled: z.boolean().default(false).meta({ title: "Disabled" }),
});

/** @typedef {z.infer<typeof inputProps>} InputProps */

export default defineManifest({
  name: "input",
  title: "Input",
  category: "forms",
  description: "A one-line text field with a visible label, an optional hint and an error message.",
  usage: {
    whenToUse: "For short answers like an email address, a name or a search term.",
    whenNotToUse: "For long answers. Use a multi-line text area so people can see what they wrote.",
  },
  props: inputProps,
  variants: [
    { name: "Default", props: {} },
    {
      name: "With hint",
      props: { label: "Display name", type: "text", description: "Shown on your public pages." },
    },
    { name: "Required", props: { label: "Email", required: true } },
    {
      name: "With error",
      props: { label: "Website", type: "url", error: "Enter a full address, like https://example.com." },
    },
  ],
  fits: ["form"],
  a11y: {
    role: "textbox",
    keyboard: [{ keys: "Tab", action: "Moves focus into and out of the field" }],
    notes: [
      "The label is always visible and linked to the field, so clicking it focuses the field and screen readers announce it.",
      "Placeholder text isn't a label. It disappears as soon as someone types, and it's often too faint to read.",
      "Hints and errors are linked with aria-describedby, and an error also sets aria-invalid, so screen readers say the field is invalid and why.",
      "Required fields use the native required attribute. The visible “(required)” text is hidden from screen readers so it isn't announced twice.",
    ],
  },
  code: {
    from: "@/components/ui/input",
    render: (/** @type {InputProps} */ props, /** @type {InputProps} */ defaults) =>
      h("InputField", {
        label: props.label,
        type: props.type === defaults.type ? undefined : props.type,
        // Empty strings mean "not set", so they're left out.
        placeholder: props.placeholder || undefined,
        description: props.description || undefined,
        error: props.error || undefined,
        required: props.required,
        disabled: props.disabled,
      }),
  },
  install: {
    dependencies: [],
    registryDependencies: ["utils"],
  },
});
