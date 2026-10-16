import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

export const alertProps = z.object({
  // Generic example copy, not a claim about Volt's own features.
  title: z.string().min(1).max(60).default("Scheduled maintenance").meta({ title: "Title" }),
  description: z
    .string()
    .max(160)
    .default("The site may be slow on Sunday between 2 and 3 a.m.")
    .meta({ title: "Description" }),
  tone: z.enum(["info", "success", "danger"]).default("info").meta({ title: "Tone" }),
  // Off for messages that are on the page from the start (screen readers read
  // them in place). On for messages that appear after an action, like "Saved".
  announce: z.boolean().default(false).meta({ title: "Announce when shown" }),
});

/** @typedef {z.infer<typeof alertProps>} AlertProps */

export default defineManifest({
  name: "alert",
  title: "Alert",
  category: "feedback",
  description: "A short message that tells people something important about the page or what just happened.",
  usage: {
    whenToUse: "To confirm an action, warn about a problem, or point out something people shouldn't miss.",
    whenNotToUse: "For marketing or decoration. If everything is an alert, nothing stands out.",
  },
  props: alertProps,
  variants: [
    { name: "Info", props: {} },
    {
      name: "Success",
      props: { tone: "success", title: "Page published", description: "Anyone with the link can now see it." },
    },
    {
      name: "Danger",
      props: { tone: "danger", title: "Couldn't save", description: "Your changes are still here. Try again." },
    },
  ],
  fits: ["content"],
  a11y: {
    keyboard: [],
    notes: [
      "The tone is spoken as hidden text (“Error:”, “Success:”, “Note:”), so it doesn't rely on the icon or color alone.",
      "A static alert has no role and is read in place. Turn on “Announce when shown” for messages that appear after an action: danger uses role=alert (interrupts), the others use role=status (waits politely).",
      "Screen readers announce a status reliably only when its text changes inside a container that's already on the page. For repeated messages, keep the alert mounted and change its text.",
      "The icon is decorative and hidden from screen readers.",
    ],
  },
  code: {
    from: "@/components/ui/alert",
    render: (/** @type {AlertProps} */ props, /** @type {AlertProps} */ defaults) =>
      h(
        "Alert",
        {
          tone: props.tone === defaults.tone ? undefined : props.tone,
          announce: props.announce,
        },
        h("AlertTitle", {}, props.title),
        props.description && h("AlertDescription", {}, props.description),
      ),
  },
  install: {
    dependencies: ["lucide-react"],
    registryDependencies: ["utils"],
  },
});
