import { z } from "zod";
import { defineManifest } from "./schema.js";

export const cardProps = z.object({
  title: z.string().min(1).max(60).default("Starter plan").meta({ title: "Title" }),
  description: z
    .string()
    .max(160)
    .default("Everything you need to publish your first page.")
    .meta({ title: "Description" }),
  // The title's heading level depends on where the card sits: h3 under a
  // section's h2 is the common case, so that's the default. Skipping levels
  // (h2 straight to h4) confuses screen-reader users who navigate by heading.
  headingLevel: z.literal([2, 3, 4]).default(3).meta({ title: "Heading level" }),
});

/** @typedef {z.infer<typeof cardProps>} CardProps */

export default defineManifest({
  name: "card",
  title: "Card",
  category: "layout",
  description: "A raised panel that groups a title and short description about one thing.",
  usage: {
    whenToUse: "To present a few comparable items side by side, like plans or features.",
    whenNotToUse: "To separate every part of a page. Use spacing and headings for that, or the page turns into boxes.",
  },
  props: cardProps,
  variants: [
    { name: "Plan", props: {} },
    {
      name: "Feature",
      props: { title: "Keyboard first", description: "Every action works without a mouse." },
    },
  ],
  fits: ["content"],
  a11y: {
    keyboard: [],
    notes: [
      "The title is a real heading, so screen-reader users can jump between cards by heading.",
      "Pick the heading level that follows the page outline: one level below the section heading the card sits under.",
      "The card itself isn't interactive. If the whole card should be a link, put the link on the title and keep other text outside it.",
    ],
  },
  install: {
    dependencies: [],
    registryDependencies: ["utils"],
  },
});
