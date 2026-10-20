import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

export const badgeProps = z.object({
  label: z.string().min(1).max(24).default("Beta").meta({ title: "Label" }),
  // Neutral is the default: Volt allows one lime element per region, so the
  // highlight style should be a deliberate choice, not what you get by accident.
  // success and danger are status badges ("Published", "Failed") with an icon.
  variant: z.enum(["neutral", "highlight", "success", "danger"]).default("neutral").meta({ title: "Style" }),
});

/** @typedef {z.infer<typeof badgeProps>} BadgeProps */

export default defineManifest({
  name: "badge",
  title: "Badge",
  category: "display",
  description: "A short label that marks something as new, in beta, or in a category.",
  usage: {
    whenToUse: "To tag an item with a short status or category, like “New” next to a feature or “Published” in a list.",
    whenNotToUse: "For actions. A badge isn't clickable; use a button or link instead.",
  },
  props: badgeProps,
  variants: [
    { name: "Neutral", props: {} },
    { name: "Highlight", props: { variant: "highlight", label: "New" } },
    { name: "Success", props: { variant: "success", label: "Published" } },
    { name: "Danger", props: { variant: "danger", label: "Failed" } },
  ],
  fits: ["inline"],
  a11y: {
    keyboard: [],
    notes: [
      "A badge is plain text, so it isn't focusable and has no role. Screen readers read it in place with the text around it.",
      "Write the label in normal case. The uppercase look is CSS only, so screen readers get the original word instead of spelling out capitals.",
      "Don't rely on color alone. The label text has to carry the meaning on its own; status badges add an icon whose shape matches (a check, an alert), hidden from screen readers because the word already says it.",
    ],
  },
  code: {
    from: "@/components/ui/badge",
    render: (/** @type {BadgeProps} */ props, /** @type {BadgeProps} */ defaults) =>
      h("Badge", { variant: props.variant === defaults.variant ? undefined : props.variant }, props.label),
  },
  install: {
    dependencies: [],
    registryDependencies: ["utils"],
  },
});
