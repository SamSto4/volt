import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

export const textareaProps = z.object({
  label: z.string().min(1).max(40).default("Message").meta({ title: "Label" }),
  placeholder: z.string().max(80).default("").meta({ title: "Placeholder" }),
  description: z.string().max(120).default("").meta({ title: "Hint" }),
  error: z.string().max(120).default("").meta({ title: "Error message" }),
  rows: z.literal([3, 4, 6, 8]).default(4).meta({ title: "Rows" }),
  required: z.boolean().default(false).meta({ title: "Required" }),
});

/** @typedef {z.infer<typeof textareaProps>} TextareaProps */

export default defineManifest({
  name: "textarea",
  title: "Textarea",
  category: "forms",
  description: "A multi-line text field for longer answers, with a label, hint and error.",
  usage: {
    whenToUse: "For answers longer than a line, like a message or feedback.",
    whenNotToUse: "For short answers like a name or email. Use an input, so the expected length is clear.",
  },
  props: textareaProps,
  variants: [
    { name: "Default", props: {} },
    { name: "With hint", props: { label: "Feedback", description: "What worked, and what didn't?", rows: 6 } },
    { name: "With error", props: { label: "Message", required: true, error: "Write a message before sending." } },
  ],
  fits: ["form"],
  a11y: {
    role: "textbox",
    keyboard: [{ keys: "Tab", action: "Moves focus into and out of the field" }],
    notes: [
      "The label is visible and linked, so clicking it focuses the field.",
      "Hints and errors are linked with aria-describedby, and an error sets aria-invalid.",
      "Placeholder text isn't a label: it disappears once someone types.",
    ],
  },
  code: {
    from: "@/components/ui/textarea",
    render: (/** @type {TextareaProps} */ props, /** @type {TextareaProps} */ defaults) =>
      h("TextareaField", {
        label: props.label,
        placeholder: props.placeholder || undefined,
        description: props.description || undefined,
        error: props.error || undefined,
        rows: props.rows === defaults.rows ? undefined : props.rows,
        required: props.required,
      }),
  },
  install: { dependencies: [], registryDependencies: ["utils"] },
});
