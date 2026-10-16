import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

export const checkboxProps = z.object({
  label: z.string().min(1).max(80).default("Send me the monthly newsletter").meta({ title: "Label" }),
  description: z.string().max(120).default("").meta({ title: "Hint" }),
  checked: z.boolean().default(false).meta({ title: "Checked at first" }),
  required: z.boolean().default(false).meta({ title: "Required" }),
  disabled: z.boolean().default(false).meta({ title: "Disabled" }),
});

/** @typedef {z.infer<typeof checkboxProps>} CheckboxProps */

export default defineManifest({
  name: "checkbox",
  title: "Checkbox",
  category: "forms",
  description: "A box people tick to say yes to one thing, like agreeing to terms.",
  usage: {
    whenToUse: "For a single yes/no choice in a form, or several independent options.",
    whenNotToUse: "When only one option of several can be chosen. Use a radio group or a select.",
  },
  props: checkboxProps,
  variants: [
    { name: "Default", props: {} },
    { name: "Required terms", props: { label: "I agree to the terms of service", required: true, description: "You can read them before signing up." } },
  ],
  fits: ["form"],
  a11y: {
    role: "checkbox",
    keyboard: [{ keys: "Space", action: "Ticks or unticks the box" }],
    notes: [
      "It's a native checkbox, so forms submit it and clicking the label ticks it.",
      "Required checkboxes use the native required attribute; the visible “(required)” is hidden from screen readers so it isn't heard twice.",
      "The hint is linked with aria-describedby.",
    ],
  },
  code: {
    from: "@/components/ui/checkbox",
    render: (/** @type {CheckboxProps} */ props) =>
      h("Checkbox", {
        label: props.label,
        description: props.description || undefined,
        defaultChecked: props.checked,
        required: props.required,
        disabled: props.disabled,
      }),
  },
  install: { dependencies: [], registryDependencies: ["utils"] },
});
