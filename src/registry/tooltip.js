import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

export const tooltipProps = z.object({
  label: z.string().min(1).max(40).default("Save draft").meta({ title: "Button label" }),
  content: z
    .string()
    .min(1)
    .max(120)
    .default("Keeps your changes without publishing them.")
    .meta({ title: "Tooltip text" }),
  variant: z.enum(["secondary", "ghost", "primary"]).default("secondary").meta({ title: "Button style" }),
});

/** @typedef {z.infer<typeof tooltipProps>} TooltipProps */

export default defineManifest({
  name: "tooltip",
  title: "Tooltip",
  category: "feedback",
  description: "A short hint that appears when you point at or focus a control.",
  usage: {
    whenToUse: "To explain what a control does when its label alone might not be clear.",
    whenNotToUse: "For anything people must read to use the page. Tooltips are easy to miss, and touch screens have no hover.",
  },
  props: tooltipProps,
  variants: [
    { name: "On a button", props: {} },
    { name: "On a ghost button", props: { variant: "ghost", label: "Shortcuts", content: "Press ? to see every keyboard shortcut." } },
  ],
  fits: ["action"],
  a11y: {
    role: "tooltip",
    keyboard: [
      { keys: "Tab", action: "Focusing the control shows the tooltip" },
      { keys: "Escape", action: "Hides the tooltip without moving focus" },
    ],
    notes: [
      "The tooltip is linked to its control with aria-describedby, so screen readers read it after the control's name.",
      "It appears on keyboard focus as well as hover, and you can move the pointer onto it without it disappearing (WCAG 1.4.13).",
      "On icon-only buttons, use it as the label (kind=\"label\"): its text becomes the button's accessible name.",
      "Touch screens have no hover, so never put information only in a tooltip.",
    ],
  },
  code: {
    from: "@/components/ui/tooltip",
    // The trigger is a real Volt Button, imported from its own module.
    uses: { Button: "@/components/ui/button" },
    render: (/** @type {TooltipProps} */ props) =>
      h(
        "Tooltip",
        { content: props.content },
        // Button's own default style is primary, so only other styles are written out.
        h("Button", { variant: props.variant === "primary" ? undefined : props.variant }, props.label),
      ),
  },
  install: {
    dependencies: [],
    // Another Volt component this one is built on: copy it too.
    registryDependencies: ["utils", "button"],
  },
});
