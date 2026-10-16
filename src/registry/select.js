import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

const option = z.strictObject({ label: z.string().min(1).max(40).meta({ title: "Option" }) });

export const selectProps = z.object({
  label: z.string().min(1).max(40).default("Plan").meta({ title: "Label" }),
  description: z.string().max(120).default("").meta({ title: "Hint" }),
  options: z
    .array(option)
    .min(2)
    .max(12)
    .refine((options) => new Set(options.map((o) => o.label)).size === options.length, {
      message: "Each option needs a different label",
    })
    .default([{ label: "Free" }, { label: "Pro" }, { label: "Team" }])
    .meta({ title: "Options" }),
  required: z.boolean().default(false).meta({ title: "Required" }),
  disabled: z.boolean().default(false).meta({ title: "Disabled" }),
});

/** @typedef {z.infer<typeof selectProps>} SelectProps */

export default defineManifest({
  name: "select",
  title: "Select",
  category: "forms",
  description: "A dropdown for choosing one option from a list.",
  usage: {
    whenToUse: "For one choice from about five or more options, like a country or a plan.",
    whenNotToUse: "For two or three options, which are quicker to pick from radio buttons people can see at once.",
  },
  props: selectProps,
  variants: [
    { name: "Default", props: {} },
    {
      name: "With hint",
      props: {
        label: "Country",
        description: "Used to show prices in your currency.",
        options: [{ label: "Canada" }, { label: "Germany" }, { label: "Japan" }, { label: "United Kingdom" }, { label: "United States" }],
      },
    },
  ],
  fits: ["form"],
  a11y: {
    role: "combobox",
    keyboard: [
      { keys: "Space or Enter", action: "Opens the list" },
      { keys: "Up / Down arrow", action: "Moves between options" },
    ],
    notes: [
      "It's the native select, so it works with every input method and opens the phone's own picker on touch screens.",
      "The visible label is linked, and the hint uses aria-describedby.",
      "The arrow is a decorative icon hidden from screen readers.",
    ],
  },
  code: {
    from: "@/components/ui/select",
    // Options are children, the way <select> is written by hand.
    render: (/** @type {SelectProps} */ props) =>
      h(
        "SelectField",
        { label: props.label, description: props.description || undefined, required: props.required, disabled: props.disabled },
        props.options.map((o) => h("option", { value: o.label }, o.label)),
      ),
  },
  install: { dependencies: ["lucide-react"], registryDependencies: ["utils"] },
});
