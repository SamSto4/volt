import { z } from "zod";
import { h } from "../../lib/codegen/jsx.js";
import { defineSection } from "./schema.js";

// The sections of a landing page. Each slot says which kinds of block it takes
// (matched against each manifest's `fits`) and how many.
//
// Layout classes use Volt tokens only, so generated pages look like the canvas.

const hero = defineSection({
  name: "hero",
  title: "Hero",
  description: "The first thing people see: a headline, a short pitch and the main actions.",
  props: z.object({
    headline: z.string().min(1).max(80).default("Launch pages people actually finish reading").meta({ title: "Headline" }),
    intro: z
      .string()
      .max(200)
      .default("A short sentence that says who this is for and what they get.")
      .meta({ title: "Intro" }),
  }),
  slots: [
    { name: "eyebrow", title: "Above the headline", accepts: ["inline"], max: 2 },
    { name: "actions", title: "Actions", accepts: ["action"], max: 3 },
  ],
  render: (props) =>
    h(
      "section",
      { className: "flex flex-col items-center gap-6 px-4 py-16 text-center md:py-24" },
      h("Slot", { name: "eyebrow", className: "flex flex-wrap items-center justify-center gap-2" }),
      // The page's one h1 and the only use of the display style (DESIGN.md §3).
      h("h1", { className: "max-w-3xl type-display" }, props.headline),
      props.intro && h("p", { className: "max-w-prose text-muted-foreground" }, props.intro),
      h("Slot", { name: "actions", className: "flex flex-wrap items-center justify-center gap-4" }),
    ),
});

const features = defineSection({
  name: "features",
  title: "Features",
  description: "A grid of cards, one per benefit or feature.",
  props: z.object({
    title: z.string().min(1).max(60).default("Why people choose it").meta({ title: "Title" }),
    intro: z.string().max(200).default("").meta({ title: "Intro" }),
  }),
  slots: [{ name: "items", title: "Items", accepts: ["content"], max: 6 }],
  render: (props) =>
    h(
      "section",
      { className: "mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10" },
      h("h2", { className: "type-heading-1" }, props.title),
      props.intro && h("p", { className: "max-w-prose text-muted-foreground" }, props.intro),
      h("Slot", { name: "items", className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" }),
    ),
});

const faq = defineSection({
  name: "faq",
  title: "FAQ",
  description: "Answers to the questions people ask before they sign up.",
  props: z.object({
    title: z.string().min(1).max(60).default("Questions").meta({ title: "Title" }),
  }),
  slots: [{ name: "content", title: "Content", accepts: ["content"], max: 2 }],
  render: (props) =>
    h(
      "section",
      { className: "mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10" },
      h("h2", { className: "type-heading-1" }, props.title),
      h("Slot", { name: "content", className: "flex flex-col gap-6" }),
    ),
});

const signup = defineSection({
  name: "signup",
  title: "Sign-up",
  description: "A short form that turns a visitor into a subscriber.",
  props: z.object({
    title: z.string().min(1).max(60).default("Get the newsletter").meta({ title: "Title" }),
    intro: z.string().max(200).default("One email a month. Unsubscribe any time.").meta({ title: "Intro" }),
  }),
  slots: [
    { name: "fields", title: "Fields", accepts: ["form"], max: 3 },
    { name: "actions", title: "Actions", accepts: ["action"], max: 2 },
  ],
  render: (props) =>
    h(
      "section",
      { className: "mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10" },
      h("h2", { className: "type-heading-1" }, props.title),
      props.intro && h("p", { className: "text-muted-foreground" }, props.intro),
      h("Slot", { name: "fields", className: "flex flex-col gap-4" }),
      h("Slot", { name: "actions", className: "flex flex-wrap gap-4" }),
    ),
});

/** Every section template, in the order the "Add section" menu lists them. */
export const sections = [hero, features, faq, signup];
