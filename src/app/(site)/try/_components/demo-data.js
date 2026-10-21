// Example content for the Try it page's specimens. It's sample data for
// showing components, not anything stored: the page says so, and nothing
// here is saved. Keeping it in one file keeps the card components about
// layout and behavior, and makes the copy easy to review in one place.

/**
 * @typedef {object} DemoComponent
 * @property {string} id
 * @property {string} name
 * @property {string} kind      e.g. "Section", "Form"
 * @property {"published" | "draft" | "failed"} status
 * @property {string} updated   relative, already written out ("2 hours ago")
 */

/** @type {DemoComponent[]} */
export const DEMO_COMPONENTS = [
  { id: "pricing", name: "Pricing section", kind: "Section", status: "published", updated: "2 hours ago" },
  { id: "signup", name: "Newsletter signup", kind: "Form", status: "draft", updated: "Yesterday" },
  { id: "faq", name: "FAQ accordion", kind: "Section", status: "published", updated: "3 days ago" },
  { id: "hero", name: "Launch hero", kind: "Section", status: "failed", updated: "Last week" },
];

/** How each status reads, and which badge style shows it. */
export const STATUS = /** @type {const} */ ({
  published: { label: "Published", variant: "success" },
  draft: { label: "Draft", variant: "neutral" },
  failed: { label: "Failed", variant: "danger" },
});

/**
 * What the command panel searches: components and pages in an example
 * project, plus a few actions.
 * @type {import("@/components/ui/command").CommandItem[]}
 */
export const DEMO_COMMANDS = [
  ...DEMO_COMPONENTS.map((component) => ({ id: `open-${component.id}`, title: `Open ${component.name}`, group: component.kind })),
  // No shortcuts shown: none of these would work on this page.
  { id: "new-page", title: "Start a new page", group: "Pages" },
  { id: "theme", title: "Switch theme", group: "View" },
  { id: "width-375", title: "Preview at phone width", group: "View" },
  { id: "export", title: "Export the page as JSX", group: "Code" },
];

/** The metric card's numbers. */
export const DEMO_METRIC = {
  label: "Components installed this week",
  value: "1,284",
  change: "+18%",
  context: "compared with last week",
};

/** The sections the toast demo removes and brings back. */
export const DEMO_SECTIONS = ["Hero", "Pricing", "FAQ"];

/** Framework choices, as on the component pages. */
export const FRAMEWORKS = /** @type {const} */ ([
  { value: "next", label: "Next.js", hint: "Save it as components/ui/accordion.jsx and import it in app/page.jsx." },
  { value: "vite", label: "Vite", hint: "Save it as src/components/ui/accordion.jsx and import it in src/App.jsx." },
  { value: "html", label: "HTML", hint: "The plain HTML guide isn't written yet. The Next.js and Vite guides are ready." },
]);
