import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

const radioOption = z.strictObject({
  label: z.string().min(1).max(60).meta({ title: "Option" }),
  description: z.string().max(120).default("").meta({ title: "Option hint" }),
});

export const radioGroupProps = z.object({
  label: z.string().min(1).max(80).default("How often should we email you?").meta({ title: "Question" }),
  description: z.string().max(120).default("").meta({ title: "Hint" }),
  options: z
    .array(radioOption)
    // Two at least (one option isn't a choice); past six, a select is easier to scan.
    .min(2)
    .max(6)
    // Each label is also its option's value, so two options can't share one.
    .refine((options) => new Set(options.map((option) => option.label)).size === options.length, {
      message: "Each option needs a different label",
    })
    .default([
      { label: "Every week", description: "A short round-up of what's new." },
      { label: "Once a month", description: "Only the biggest changes." },
      { label: "Never", description: "" },
    ])
    .meta({ title: "Options" }),
  firstChosen: z.boolean().default(true).meta({ title: "First option chosen at first" }),
  required: z.boolean().default(false).meta({ title: "Required" }),
  disabled: z.boolean().default(false).meta({ title: "Disabled" }),
});

/** @typedef {z.infer<typeof radioGroupProps>} RadioGroupProps */

export default defineManifest({
  name: "radio-group",
  title: "Radio group",
  category: "forms",
  description: "A short list of options where exactly one can be chosen.",
  usage: {
    whenToUse: "When people pick one of two to six options and should see them all at once, like a plan or a delivery speed.",
    whenNotToUse: "For more than six options (use a select), or when several can be chosen at once (use checkboxes).",
  },
  props: radioGroupProps,
  variants: [
    { name: "Default", props: {} },
    {
      name: "Plan",
      props: {
        label: "Choose a plan",
        required: true,
        firstChosen: false,
        options: [
          { label: "Starter", description: "One project, everything you need to publish." },
          { label: "Team", description: "Unlimited projects and shared components." },
        ],
      },
    },
  ],
  fits: ["form"],
  a11y: {
    role: "radiogroup",
    keyboard: [
      { keys: "Tab", action: "Moves to the chosen option, or the first one if none is chosen" },
      { keys: "Up / Down or Left / Right arrow", action: "Moves to the next option and chooses it" },
      { keys: "Space", action: "Chooses the focused option" },
    ],
    notes: [
      "Native radio buttons sharing one name, so the browser handles the arrow keys and forms submit the chosen value.",
      "The group is a fieldset named by its legend (the question), so screen readers say it before the first option.",
      "Each option's label is its name; its hint is linked with aria-describedby.",
    ],
  },
  code: {
    from: "@/components/ui/radio-group",
    render: (/** @type {RadioGroupProps} */ props) =>
      h(
        "RadioGroup",
        {
          label: props.label,
          description: props.description || undefined,
          defaultValue: props.firstChosen ? props.options[0].label : undefined,
          required: props.required,
          disabled: props.disabled,
        },
        props.options.map((option) =>
          h("RadioGroupItem", { value: option.label, label: option.label, description: option.description || undefined }),
        ),
      ),
  },
  install: { dependencies: [], registryDependencies: ["utils"] },
});
