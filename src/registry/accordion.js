import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

const accordionItem = z.strictObject({
  title: z.string().min(1).max(80).meta({ title: "Question or heading" }),
  content: z.string().min(1).max(600).meta({ title: "Answer or panel text" }),
});

export const accordionProps = z.object({
  items: z
    .array(accordionItem)
    // At most 6: each open panel is a landmark region, and WAI-ARIA advises
    // against piling up landmarks.
    .min(1)
    .max(6)
    // Each title is also its item's id, so two items can't share one.
    .refine((items) => new Set(items.map((item) => item.title)).size === items.length, {
      message: "Each item needs a different title",
    })
    .default([
      // Generic example copy for a shop's FAQ, not claims about Volt itself.
      { title: "How long does delivery take?", content: "Most orders arrive in three to five working days." },
      { title: "Can I return an item?", content: "Yes. Send it back unused within 30 days for a full refund." },
      { title: "Do you ship abroad?", content: "We ship to most countries. Costs are shown at checkout." },
    ])
    .meta({ title: "Items" }),
  // Same rule as Card: one level below the heading of the section it sits in.
  headingLevel: z.literal([2, 3, 4]).default(3).meta({ title: "Heading level" }),
  allowMultiple: z.boolean().default(false).meta({ title: "Allow several open at once" }),
});

/** @typedef {z.infer<typeof accordionProps>} AccordionProps */

export default defineManifest({
  name: "accordion",
  title: "Accordion",
  category: "layout",
  description: "A list of headings that each open to show more, like questions with answers.",
  usage: {
    whenToUse: "For FAQs or optional details people may want, without making the page long for everyone else.",
    whenNotToUse: "For content most people need. Hiding it behind a click makes it easy to miss.",
  },
  props: accordionProps,
  variants: [
    { name: "FAQ", props: {} },
    {
      name: "Several open",
      props: {
        allowMultiple: true,
        items: [
          { title: "What's included", content: "Unlimited projects and email support." },
          { title: "What's not included", content: "Phone support and custom contracts." },
        ],
      },
    },
  ],
  fits: ["content"],
  a11y: {
    keyboard: [
      { keys: "Enter or Space", action: "Opens or closes the focused section" },
      { keys: "Tab", action: "Moves to the next header, or into an open panel's links and buttons" },
      { keys: "Up / Down arrow", action: "Moves between headers, wrapping at the ends" },
      { keys: "Home / End", action: "Moves to the first or last header" },
    ],
    notes: [
      "Follows the WAI-ARIA accordion pattern: each header is a real heading containing a button with aria-expanded and aria-controls.",
      "Open panels are regions named by their header, so screen-reader users can find them by landmark.",
      "Pick the heading level that follows the page outline, as with Card.",
      "The chevron only shows the state; the button's aria-expanded is what screen readers hear.",
    ],
  },
  code: {
    from: "@/components/ui/accordion",
    render: (/** @type {AccordionProps} */ props, /** @type {AccordionProps} */ defaults) =>
      h(
        "Accordion",
        { allowMultiple: props.allowMultiple },
        props.items.map((item) =>
          h(
            "AccordionItem",
            { value: item.title },
            h(
              "AccordionTrigger",
              { level: props.headingLevel === defaults.headingLevel ? undefined : props.headingLevel },
              item.title,
            ),
            h("AccordionContent", {}, item.content),
          ),
        ),
      ),
  },
  install: {
    dependencies: ["lucide-react"],
    registryDependencies: ["utils"],
  },
});
