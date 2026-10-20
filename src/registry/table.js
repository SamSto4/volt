import { z } from "zod";
import { h } from "../lib/codegen/jsx.js";
import { defineManifest } from "./schema.js";

// The editor's table is three columns: enough for most comparisons on a page.
const tableRow = z.strictObject({
  first: z.string().min(1).max(40).meta({ title: "Row heading" }),
  second: z.string().max(60).default("").meta({ title: "Second column" }),
  third: z.string().max(60).default("").meta({ title: "Third column" }),
});

export const tableProps = z.object({
  caption: z.string().min(1).max(80).default("Compare plans").meta({ title: "Caption" }),
  firstHeading: z.string().min(1).max(30).default("Plan").meta({ title: "First column heading" }),
  secondHeading: z.string().min(1).max(30).default("Projects").meta({ title: "Second column heading" }),
  thirdHeading: z.string().min(1).max(30).default("Support").meta({ title: "Third column heading" }),
  rows: z
    .array(tableRow)
    .min(1)
    .max(8)
    .default([
      { first: "Starter", second: "1", third: "Email" },
      { first: "Team", second: "Unlimited", third: "Email and chat" },
      { first: "Business", second: "Unlimited", third: "Priority, with a named contact" },
    ])
    .meta({ title: "Rows" }),
});

/** @typedef {z.infer<typeof tableProps>} TableProps */

export default defineManifest({
  name: "table",
  title: "Table",
  category: "display",
  description: "Rows and columns of facts that people compare across, with a caption that says what they are.",
  usage: {
    whenToUse: "For data people compare across rows, like plans, opening hours or specifications.",
    whenNotToUse: "For layout, or for a single list of items. Use a list or cards instead.",
  },
  props: tableProps,
  variants: [
    { name: "Plans", props: {} },
    {
      name: "Opening hours",
      props: {
        caption: "Opening hours",
        firstHeading: "Day",
        secondHeading: "Opens",
        thirdHeading: "Closes",
        rows: [
          { first: "Monday to Friday", second: "8:00", third: "18:00" },
          { first: "Saturday", second: "9:00", third: "16:00" },
          { first: "Sunday", second: "Closed", third: "" },
        ],
      },
    },
  ],
  fits: ["content"],
  a11y: {
    role: "table",
    keyboard: [],
    notes: [
      "A real <table>, so screen readers announce its size and let people move cell by cell with their table commands.",
      "The caption is the table's name. Column headers use scope=\"col\" and each row's first cell is a row header (scope=\"row\"), so every cell is read with its row and column.",
      "When it's wider than the screen it scrolls sideways, and only then its box becomes a focusable region named by the caption, so keyboard users can scroll it with the arrow keys. Otherwise Tab skips it.",
      "Hover only tints the row; it never carries information.",
    ],
  },
  code: {
    from: "@/components/ui/table",
    render: (/** @type {TableProps} */ props) =>
      h(
        "Table",
        {},
        h("TableCaption", {}, props.caption),
        h(
          "TableHeader",
          {},
          h(
            "TableRow",
            {},
            h("TableHead", {}, props.firstHeading),
            h("TableHead", {}, props.secondHeading),
            h("TableHead", {}, props.thirdHeading),
          ),
        ),
        h(
          "TableBody",
          {},
          props.rows.map((row) =>
            h(
              "TableRow",
              {},
              h("TableHead", { scope: "row" }, row.first),
              h("TableCell", {}, row.second),
              h("TableCell", {}, row.third),
            ),
          ),
        ),
      ),
  },
  install: { dependencies: [], registryDependencies: ["utils"] },
});
