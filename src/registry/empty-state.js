import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

export const emptyStateProps = z.object({
  title: z.string().min(1).max(60).default("No saved pages yet").meta({ title: "Title" }),
  description: z
    .string()
    .max(160)
    .default("Pages you save show up here, so you can pick up where you left off.")
    .meta({ title: "Description" }),
  actionLabel: z.string().min(1).max(30).default("Start a new page").meta({ title: "Action label" }),
  // Secondary by default: a page has one primary button (DESIGN.md §1), and an
  // empty list is rarely the most important thing on it.
  actionStyle: z.enum(["secondary", "primary"]).default("secondary").meta({ title: "Action style" }),
  icon: z.enum(["file", "inbox", "search"]).default("file").meta({ title: "Icon" }),
  headingLevel: z.literal([2, 3, 4]).default(3).meta({ title: "Heading level" }),
});

/** @typedef {z.infer<typeof emptyStateProps>} EmptyStateProps */

export default defineManifest({
  name: "empty-state",
  title: "Empty state",
  category: "feedback",
  description: "What a list or page shows before it has anything in it, with the one action that fills it.",
  usage: {
    whenToUse: "When a list, table or search has no items, to say what would be here and how to add the first one.",
    whenNotToUse: "For errors. If something failed, say what happened and what to do, in an alert.",
  },
  props: emptyStateProps,
  variants: [
    { name: "No pages", props: {} },
    {
      name: "No results",
      props: {
        title: "No components match “carousel”",
        description: "Try a shorter word, or browse every component.",
        actionLabel: "Clear search",
        icon: "search",
      },
    },
  ],
  fits: ["content"],
  a11y: {
    keyboard: [],
    notes: [
      "The title is a real heading, so screen-reader users find the empty state when they move by headings. Pick the level that follows the page outline.",
      "The icon is decorative and hidden from screen readers; the title says what's missing.",
      "One action only, labeled with what it does (“Start a new page”), not “Click here”.",
    ],
  },
  code: {
    from: "@/components/ui/empty-state",
    uses: { Button: "@/components/ui/button" },
    render: (/** @type {EmptyStateProps} */ props, /** @type {EmptyStateProps} */ defaults) =>
      h(
        "EmptyState",
        {
          title: props.title,
          description: props.description || undefined,
          icon: props.icon === defaults.icon ? undefined : props.icon,
          level: props.headingLevel === defaults.headingLevel ? undefined : props.headingLevel,
        },
        h("Button", { variant: props.actionStyle === "primary" ? undefined : props.actionStyle }, props.actionLabel),
      ),
  },
  install: { dependencies: ["lucide-react"], registryDependencies: ["utils", "button"] },
});
