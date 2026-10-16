import { z } from "zod";
import { defineManifest } from "./schema.js";

// Every prop has a default, so `buttonProps.parse({})` always gives a
// complete, valid set of props. That's what a freshly dropped block starts with.
export const buttonProps = z.object({
  label: z.string().min(1).max(40).default("Get started").meta({ title: "Label" }),
  variant: z
    .enum(["primary", "secondary", "ghost", "danger"])
    .default("primary")
    .meta({ title: "Style" }),
  // Volt button heights: sm 32px, md 40px, lg 48px (DESIGN.md §10).
  size: z.enum(["sm", "md", "lg"]).default("md").meta({ title: "Size" }),
  disabled: z.boolean().default(false).meta({ title: "Disabled" }),
  // Shows a spinner and ignores clicks while work is in progress, without
  // losing keyboard focus the way `disabled` would.
  loading: z.boolean().default(false).meta({ title: "Loading" }),
});

/** @typedef {z.infer<typeof buttonProps>} ButtonProps */

export default defineManifest({
  name: "button",
  title: "Button",
  category: "actions",
  description: "Starts an action, like submitting a form or opening a dialog.",
  usage: {
    whenToUse: "For the main action in a section. Use one primary button per view.",
    whenNotToUse: "To go to another page. Use a link instead.",
  },
  props: buttonProps,
  variants: [
    { name: "Primary", props: {} },
    { name: "Secondary", props: { variant: "secondary", label: "Learn more" } },
    { name: "Ghost", props: { variant: "ghost", label: "Cancel" } },
    { name: "Danger", props: { variant: "danger", label: "Delete page" } },
    { name: "Loading", props: { loading: true, label: "Saving…" } },
  ],
  fits: ["action"],
  a11y: {
    role: "button",
    keyboard: [{ keys: "Enter or Space", action: "Activates the button" }],
    notes: [
      "The visible label is the accessible name, so don't add an aria-label that says something different.",
      "Disabled buttons can't be focused. If users need to know why an action is unavailable, explain it in nearby text.",
      "While loading, the button stays focusable and is marked aria-disabled, so keyboard users don't lose their place. Change the label too (“Saving…”) so screen readers hear what's happening.",
    ],
  },
  install: {
    // Button needs no npm packages of its own. Its only helper, `cn`, comes
    // from the "utils" registry item (which brings clsx and tailwind-merge).
    dependencies: [],
    registryDependencies: ["utils"],
  },
});
