import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

export const dialogProps = z.object({
  trigger: z.string().min(1).max(40).default("Discard changes").meta({ title: "Button label" }),
  title: z.string().min(1).max(80).default("Discard your changes?").meta({ title: "Title" }),
  description: z
    .string()
    .min(1)
    .max(240)
    .default("Your edits since the last save will be lost.")
    .meta({ title: "Description" }),
  confirmLabel: z.string().min(1).max(30).default("Discard").meta({ title: "Confirm label" }),
  cancelLabel: z.string().min(1).max(30).default("Cancel").meta({ title: "Cancel label" }),
  tone: z.enum(["default", "danger"]).default("default").meta({ title: "Tone" }),
});

/** @typedef {z.infer<typeof dialogProps>} DialogProps */

export default defineManifest({
  name: "dialog",
  title: "Dialog",
  category: "feedback",
  description: "A button that opens a modal to confirm an important action.",
  usage: {
    whenToUse: "To confirm something that's hard to undo, like deleting or discarding work.",
    whenNotToUse: "For actions that can simply be undone. Offer Undo afterwards instead of asking first.",
  },
  props: dialogProps,
  variants: [
    { name: "Confirm", props: {} },
    {
      name: "Danger",
      props: {
        tone: "danger",
        trigger: "Delete page",
        title: "Delete this page?",
        description: "The page and everything on it will be removed. This can't be undone.",
        confirmLabel: "Delete page",
      },
    },
  ],
  fits: ["action"],
  a11y: {
    role: "dialog",
    keyboard: [
      { keys: "Enter or Space", action: "Opens the dialog from its button" },
      { keys: "Tab", action: "Moves between the dialog's buttons; focus can't leave the dialog" },
      { keys: "Escape", action: "Closes the dialog and returns focus to its button" },
    ],
    notes: [
      "Built on the native <dialog> with showModal(), so the browser traps focus inside and makes the rest of the page inert.",
      "The dialog is named by its title and described by its text (aria-labelledby, aria-describedby).",
      "Cancel is first, so it gets focus when the dialog opens: the safe choice for actions that can't be undone.",
      "Closing in any way (Cancel, Confirm, Escape, clicking the backdrop) returns focus to the button that opened it.",
    ],
  },
  code: {
    from: "@/components/ui/dialog",
    render: (/** @type {DialogProps} */ props, /** @type {DialogProps} */ defaults) =>
      h("Dialog", {
        trigger: props.trigger,
        title: props.title,
        description: props.description,
        confirmLabel: props.confirmLabel,
        cancelLabel: props.cancelLabel === defaults.cancelLabel ? undefined : props.cancelLabel,
        tone: props.tone === defaults.tone ? undefined : props.tone,
      }),
  },
  install: {
    dependencies: [],
    // The dialog's buttons are Volt Buttons.
    registryDependencies: ["utils", "button"],
  },
});
