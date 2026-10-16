import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

const tabItem = z.strictObject({
  label: z.string().min(1).max(30).meta({ title: "Tab label" }),
  content: z.string().min(1).max(400).meta({ title: "Panel text" }),
});

export const tabsProps = z.object({
  // Names the group for screen readers ("Framework, tab list"), since the
  // tabs alone don't say what they choose between.
  label: z.string().min(1).max(40).default("Framework").meta({ title: "Group label" }),
  // An array prop: the inspector will need a list editor for this one
  // (ADR 0002), since JSON Schema fields only cover simple values.
  items: z
    .array(tabItem)
    .min(2)
    .max(6)
    // Each label is also its tab's id, so two tabs can't share one.
    .refine((items) => new Set(items.map((item) => item.label)).size === items.length, {
      message: "Each tab needs a different label",
    })
    .default([
      { label: "Next.js", content: "Add the component to app/ and import it into your page." },
      { label: "Vite", content: "Add the component to src/components and import it into App.jsx." },
      { label: "HTML", content: "Copy the generated markup and the CSS variables into your page." },
    ])
    .meta({ title: "Tabs" }),
});

/** @typedef {z.infer<typeof tabsProps>} TabsProps */

export default defineManifest({
  name: "tabs",
  title: "Tabs",
  category: "layout",
  description: "Switches between a few related panels in the same spot, one at a time.",
  usage: {
    whenToUse: "For two to six views of the same thing, like setup steps for different frameworks.",
    whenNotToUse: "When people need to compare panels side by side, or when the content is long enough to need its own page.",
  },
  props: tabsProps,
  variants: [
    { name: "Frameworks", props: {} },
    {
      name: "Two tabs",
      props: {
        label: "Billing period",
        items: [
          { label: "Monthly", content: "Pay each month. Cancel any time." },
          { label: "Yearly", content: "Pay once a year and get two months free." },
        ],
      },
    },
  ],
  fits: ["content"],
  a11y: {
    role: "tablist",
    keyboard: [
      { keys: "Tab", action: "Moves focus to the selected tab, then into its panel" },
      { keys: "Left / Right arrow", action: "Moves to and shows the previous or next tab, wrapping at the ends" },
      { keys: "Home / End", action: "Moves to and shows the first or last tab" },
    ],
    notes: [
      "Follows the WAI-ARIA tabs pattern: tablist, tab and tabpanel roles, with aria-selected and aria-controls linking each tab to its panel.",
      "Only the selected tab is in the Tab order (roving tabindex), so keyboard users don't have to step through every tab.",
      "The selected tab has a visible border as well as a lighter fill, so its state shows at 3:1 contrast, not by a subtle shade alone.",
      "The group label names the tab list, so screen readers say what the tabs choose between.",
    ],
  },
  code: {
    from: "@/components/ui/tabs",
    // Generated code uses the composable parts (what people write by hand),
    // not TabsBlock, so it's easy to edit after pasting.
    render: (/** @type {TabsProps} */ props) =>
      h(
        "Tabs",
        { defaultValue: props.items[0].label },
        h(
          "TabsList",
          { "aria-label": props.label },
          props.items.map((item) => h("TabsTrigger", { value: item.label }, item.label)),
        ),
        props.items.map((item) => h("TabsContent", { value: item.label }, item.content)),
      ),
  },
  install: {
    dependencies: [],
    registryDependencies: ["utils"],
  },
});
