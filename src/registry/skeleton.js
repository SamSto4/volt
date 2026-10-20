import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

export const skeletonProps = z.object({
  label: z.string().min(1).max(60).default("Loading article").meta({ title: "What's loading (for screen readers)" }),
  shape: z.enum(["text", "metric"]).default("text").meta({ title: "Shape" }),
});

/** @typedef {z.infer<typeof skeletonProps>} SkeletonProps */

/**
 * The placeholder shapes for each layout, as Tailwind sizes.
 * @type {Record<SkeletonProps["shape"], string[]>}
 */
const SHAPES = {
  // A heading and three lines of text, each shorter than the last.
  text: ["h-6 w-1/2", "h-4 w-full", "h-4 w-5/6", "h-4 w-2/3"],
  // A metric card: label, big figure, a line of context.
  metric: ["h-4 w-1/3", "h-10 w-1/2", "h-4 w-2/3"],
};

export default defineManifest({
  name: "skeleton",
  title: "Skeleton",
  category: "feedback",
  description: "Gray shapes in the layout of content that's still loading, so nothing jumps when it arrives.",
  usage: {
    whenToUse: "While content loads for more than a moment, in the shape of what's coming.",
    whenNotToUse: "For things that load almost instantly (it just flickers), or when you can't predict the shape.",
  },
  props: skeletonProps,
  variants: [
    { name: "Text", props: {} },
    { name: "Metric", props: { shape: "metric", label: "Loading this week's numbers" } },
  ],
  fits: ["content"],
  a11y: {
    role: "status",
    keyboard: [],
    notes: [
      "The shapes are hidden from screen readers. The group is a polite status that says what's loading, once.",
      "The pulse only runs when reduced motion is off; with it on, the shapes stay still.",
      "Replace the whole group with the content when it loads, so screen readers stop hearing “Loading”.",
    ],
  },
  code: {
    from: "@/components/ui/skeleton",
    render: (/** @type {SkeletonProps} */ props) =>
      h(
        "SkeletonGroup",
        { label: props.label },
        SHAPES[props.shape].map((size) => h("Skeleton", { className: size })),
      ),
  },
  install: { dependencies: [], registryDependencies: ["utils"] },
});
