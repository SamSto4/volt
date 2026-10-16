import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

export const switchProps = z.object({
  label: z.string().min(1).max(60).default("Email me about new features").meta({ title: "Label" }),
  description: z.string().max(120).default("").meta({ title: "Hint" }),
  checked: z.boolean().default(false).meta({ title: "On at first" }),
  disabled: z.boolean().default(false).meta({ title: "Disabled" }),
});

/** @typedef {z.infer<typeof switchProps>} SwitchProps */

export default defineManifest({
  name: "switch",
  title: "Switch",
  category: "forms",
  description: "An on/off control for a setting that takes effect straight away.",
  usage: {
    whenToUse: "For settings that apply immediately, like turning notifications on or off.",
    whenNotToUse: "In a form that's only saved when submitted. Use a checkbox there: a switch suggests the change already happened.",
  },
  props: switchProps,
  variants: [
    { name: "Off", props: {} },
    { name: "On, with hint", props: { label: "Dark mode", checked: true, description: "Easier on the eyes at night." } },
  ],
  fits: ["form"],
  a11y: {
    role: "switch",
    keyboard: [{ keys: "Space or Enter", action: "Turns the switch on or off" }],
    notes: [
      "It's a button with role=\"switch\" and aria-checked, so screen readers announce it as a switch that's on or off.",
      "The visible label names it (aria-labelledby), and the hint is linked with aria-describedby.",
      "The off track uses the line-strong color, so the control's edge has 3:1 contrast. On uses primary.",
      "The thumb slides only when reduced motion is off.",
    ],
  },
  code: {
    from: "@/components/ui/switch",
    render: (/** @type {SwitchProps} */ props) =>
      h("Switch", {
        label: props.label,
        description: props.description || undefined,
        defaultChecked: props.checked,
        disabled: props.disabled,
      }),
  },
  install: { dependencies: [], registryDependencies: ["utils"] },
});
