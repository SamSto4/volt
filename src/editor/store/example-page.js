import { addSection, emptyTree, insertBlock, updateProps } from "./tree.js";

// Page templates people can start from. Each is plain data (sections, their
// props and their blocks), built with the same operations the editor uses, so
// a template can never be a shape the editor couldn't produce itself.
// Adding a template is adding an entry here.

/**
 * @typedef {object} TemplateBlock
 * @property {string} slot
 * @property {string} component
 * @property {Record<string, unknown>} [props]
 */

/**
 * @typedef {object} TemplateSection
 * @property {string} template            a section template name
 * @property {Record<string, unknown>} [props]
 * @property {TemplateBlock[]} [blocks]
 */

/**
 * @typedef {object} PageTemplate
 * @property {string} title
 * @property {string} description
 * @property {TemplateSection[]} sections
 */

/** @typedef {"landing" | "blog" | "contact"} TemplateName */

/** @type {Record<TemplateName, PageTemplate>} */
export const TEMPLATES = {
  landing: {
    title: "Landing page",
    description: "A hero with actions, a features grid, an FAQ and a newsletter sign-up.",
    sections: [
      {
        template: "hero",
        blocks: [
          { slot: "eyebrow", component: "badge", props: { label: "New", variant: "highlight" } },
          { slot: "actions", component: "button", props: { label: "Get started" } },
          { slot: "actions", component: "button", props: { label: "See how it works", variant: "secondary" } },
        ],
      },
      {
        template: "features",
        blocks: [
          { slot: "items", component: "card", props: { title: "Fast to set up", description: "Go from an empty page to a published one in an afternoon." } },
          { slot: "items", component: "card", props: { title: "Works on any screen", description: "Every layout adapts from phones to wide monitors." } },
          { slot: "items", component: "card", props: { title: "Keyboard first", description: "Every action works without a mouse." } },
        ],
      },
      { template: "faq", blocks: [{ slot: "content", component: "accordion" }] },
      {
        template: "signup",
        blocks: [
          { slot: "fields", component: "input", props: { label: "Email", type: "email", placeholder: "you@example.com" } },
          { slot: "actions", component: "button", props: { label: "Subscribe" } },
        ],
      },
    ],
  },
  blog: {
    title: "Blog post",
    description: "An article with a byline, a highlighted takeaway and a sign-up.",
    sections: [
      {
        template: "article",
        blocks: [
          // Not decorative: no name is written next to it, so the avatar itself
          // must tell screen readers who wrote the post.
          { slot: "byline", component: "avatar", props: { name: "Priya Shah", size: "sm" } },
          { slot: "byline", component: "badge", props: { label: "Performance" } },
        ],
      },
      {
        template: "callout",
        blocks: [
          {
            slot: "content",
            component: "alert",
            props: { tone: "success", title: "Measure first", description: "Every change was checked against the same before-and-after numbers." },
          },
        ],
      },
      {
        template: "signup",
        blocks: [
          { slot: "fields", component: "input", props: { label: "Email", type: "email", placeholder: "you@example.com" } },
          { slot: "actions", component: "button", props: { label: "Subscribe" } },
        ],
      },
    ],
  },
  contact: {
    title: "Contact page",
    description: "A short intro, a contact form with a topic and message, and an FAQ.",
    sections: [
      {
        template: "hero",
        props: {
          headline: "Get in touch",
          intro: "Questions about an order, or just want to say hello? We reply within one working day.",
        },
        blocks: [{ slot: "eyebrow", component: "badge", props: { label: "Support" } }],
      },
      {
        template: "signup",
        props: { title: "Send us a message", intro: "Every message is read by a person on our team." },
        blocks: [
          { slot: "fields", component: "input", props: { label: "Email", type: "email", placeholder: "you@example.com", required: true } },
          {
            slot: "fields",
            component: "select",
            props: { label: "Topic", options: [{ label: "An order" }, { label: "Returns" }, { label: "Something else" }] },
          },
          { slot: "fields", component: "textarea", props: { label: "Message", required: true } },
          { slot: "actions", component: "button", props: { label: "Send message" } },
        ],
      },
      { template: "faq", blocks: [{ slot: "content", component: "accordion" }] },
    ],
  },
};

/**
 * Builds a template into a page tree. Sections are added first, then their
 * blocks, the same order the original hand-written builders used, so the
 * generated ids (and golden files) stay the same.
 *
 * @param {TemplateName} name
 * @param {() => string} newId
 * @returns {{ tree: import("./tree.js").Tree, firstSectionId: string }}
 */
export function buildTemplate(name, newId) {
  let tree = emptyTree();

  /** @param {import("./tree.js").Result} result */
  const take = (result) => {
    if ("error" in result) throw new Error(`Template "${name}" is invalid: ${result.error}`);
    tree = result.tree;
    return /** @type {string} */ (result.id);
  };

  /** @type {string[]} */
  const sectionIds = [];
  for (const section of TEMPLATES[name].sections) {
    const sectionId = take(addSection(tree, section.template, newId));
    sectionIds.push(sectionId);
    if (section.props) take(updateProps(tree, sectionId, { ...tree.nodes[sectionId].props, ...section.props }));
  }
  TEMPLATES[name].sections.forEach((section, index) => {
    for (const block of section.blocks ?? []) {
      take(insertBlock(tree, block.component, { sectionId: sectionIds[index], slot: block.slot }, newId, block.props));
    }
  });
  return { tree, firstSectionId: sectionIds[0] };
}

/**
 * The landing page template (the editor's page before anything is chosen).
 * @param {() => string} newId
 * @returns {{ tree: import("./tree.js").Tree, heroId: string }}
 */
export function createExamplePage(newId) {
  const { tree, firstSectionId } = buildTemplate("landing", newId);
  return { tree, heroId: firstSectionId };
}

/**
 * The blog post template.
 * @param {() => string} newId
 * @returns {{ tree: import("./tree.js").Tree, heroId: string }}  heroId: the section to select first
 */
export function createBlogPage(newId) {
  const { tree, firstSectionId } = buildTemplate("blog", newId);
  return { tree, heroId: firstSectionId };
}
