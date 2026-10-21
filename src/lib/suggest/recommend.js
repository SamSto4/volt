import { QUESTIONS } from "./questions.js";

// "Find your components": turns a few answers into a starting point for a
// page, with the reason for each suggestion. Pure and rule-based on purpose:
// no AI, no randomness, the same answers always give the same page, and each
// rule can be read (and argued with) in this one file.
//
// The page this feeds is /try/suggest. recommend.test.js checks that every
// name here is a real component, section or template, and that every option
// in questions.js leads somewhere.

/** Suggestions are "start with" (the page needs it) or "consider" (worth a look). */
const START = "start";
const CONSIDER = "consider";

/**
 * Every suggestable component with a one-sentence reason, in catalog order.
 * The order is also how suggestions are sorted, and a test keeps this list
 * equal to the manifests, so a new component can't be forgotten here.
 */
export const COMPONENT_WHY = /** @type {Record<string, string>} */ ({
  button: "Every page needs one clear main action, and a primary button is how you show it.",
  badge: "A short tag for one thing, like “New” or “Published”. Keep the highlighted one to once per section.",
  card: "Cards keep items equal and easy to scan side by side.",
  input: "A labeled text field for one short answer, like an email address.",
  textarea: "Room for a longer answer in people's own words.",
  select: "A dropdown for picking from a list, like a topic.",
  checkbox: "A box people tick to say yes, like agreeing to terms.",
  "radio-group": "Radio buttons show every option at once, so people compare before they choose.",
  switch: "A switch for a setting that applies right away.",
  alert: "Says what happened where people can see it: saved, sent, or what went wrong.",
  "empty-state": "Says what goes here and gives one action, so an empty list isn't a dead end.",
  skeleton: "Gray shapes in the layout of what's coming, so nothing jumps when it loads.",
  avatar: "Shows who wrote or made it, so people know whose voice they're hearing.",
  table: "Rows and columns that people compare across.",
  tabs: "Switch between views of the same content without leaving the page.",
  accordion: "Tucks answers and optional details away, so the page stays short.",
  tooltip: "Names an icon-only button, so nobody has to guess what it does.",
  dialog: "A confirm step with a safe Cancel, for things that can't be undone.",
});

/**
 * The page sections the editor can add, in the order they usually appear on
 * a page. The titles match the section templates' own (checked by a test).
 */
export const SECTION_TITLES = /** @type {Record<string, string>} */ ({
  hero: "Hero",
  article: "Article",
  features: "Features",
  callout: "Callout",
  faq: "FAQ",
  signup: "Sign-up",
});

/**
 * What the editor offers when you start a page. `how` says what to pick.
 * @type {Record<string, { title: string, how: string }>}
 */
export const STARTS = {
  landing: {
    title: "Landing page",
    how: "When the editor asks how to start, choose “Landing page”. It already has a hero, a features grid, an FAQ and a sign-up.",
  },
  blog: {
    title: "Blog post",
    how: "When the editor asks how to start, choose “Blog post”. It has an article with a byline, a highlighted takeaway and a sign-up.",
  },
  contact: {
    title: "Contact page",
    how: "When the editor asks how to start, choose “Contact page”. It has an intro, a form with a topic and message, and an FAQ.",
  },
  pricing: {
    title: "Landing page",
    how: "There's no pricing template yet. Choose “Landing page”, then swap the features cards for one card per plan.",
  },
  blank: {
    title: "Blank page",
    how: "The templates are for pages people read. For an app screen, choose “Blank page”, add a section, and build up from the components below.",
  },
};

/**
 * @typedef {[name: string, level: "start" | "consider", why?: string]} ComponentRule
 * @typedef {[section: string, why: string]} SectionRule
 * @typedef {object} Rule
 * @property {ComponentRule[]} [components]
 * @property {SectionRule[]} [sections]
 * @property {string[]} [tips]
 */

/** Rules for each answer to "What are you making?". @type {Record<string, Rule & { start: string }>} */
const GOALS = {
  landing: {
    start: "landing",
    components: [
      ["button", START],
      ["card", START, "Cards turn your benefits into a grid people can scan."],
      ["badge", CONSIDER, "One highlighted badge, like “New”, points at the single thing you most want noticed."],
    ],
    sections: [
      ["hero", "Open with what it is and the one main action."],
      ["features", "Three short benefits, one card each."],
    ],
    tips: ["Repeat the main action once near the end, so people who read on don't have to scroll back up."],
  },
  blog: {
    start: "blog",
    components: [
      ["avatar", START],
      ["badge", CONSIDER, "Tag the topic next to the byline, so people know what they're about to read."],
    ],
    sections: [
      ["article", "The title, a short intro and the body, with a byline."],
      ["callout", "Pull out one takeaway for the people who skim."],
    ],
    tips: ["Give the post one h1 (its title) and an h2 for each part, so screen-reader users can jump around."],
  },
  contact: {
    start: "contact",
    components: [
      ["input", START, "Email is the one field you can't do without."],
      ["textarea", START],
      ["button", START, "One button that says what it does, like “Send message”."],
      ["select", CONSIDER, "A topic list helps you send each message to the right person."],
      ["alert", CONSIDER, "Confirm that the message went through, or say what to do if it didn't."],
    ],
    sections: [
      ["hero", "Say who you are and how fast you reply."],
      ["signup", "The form itself: email, topic and message."],
    ],
    tips: ["Ask only for what you need in order to reply."],
  },
  shop: {
    start: "pricing",
    components: [
      ["card", START, "One card per plan or product keeps them equal and easy to compare."],
      ["button", START, "One primary button, on the plan you most want people to pick."],
      ["badge", CONSIDER, "Mark the plan you recommend with the page's one highlighted badge."],
    ],
    sections: [
      ["hero", "Say what you sell and who it's for, in a line."],
      ["features", "Your plans or products, one card each."],
    ],
    tips: ["Keep plans parallel: the same facts, in the same order, on every card."],
  },
  app: {
    start: "blank",
    components: [
      ["table", START, "Rows of things with a status are the heart of most app screens."],
      ["badge", START, "Status badges say “Published” or “Failed” in words and an icon, not color alone."],
      ["button", START, "One primary button for the main thing people do on this screen."],
      ["tooltip", CONSIDER],
    ],
    tips: ["Put the most-used action where people already look, and keep to one primary button per screen."],
  },
};

/** Rules for each answer to "What should visitors do?". @type {Record<string, Rule>} */
const ACTIONS = {
  signup: {
    components: [
      ["input", START, "Ask for as little as you can: an email address is often enough."],
      ["button", START, "Label it with what happens next, like “Subscribe”."],
      ["checkbox", CONSIDER, "Add a consent box if you'll send marketing email."],
    ],
    sections: [["signup", "A short form, placed where people have just finished reading."]],
    tips: ["Say how often you'll email and how to unsubscribe, next to the button."],
  },
  contact: {
    components: [
      ["input", START],
      ["textarea", START],
      ["button", START, "One button that says what it does, like “Send message”."],
      ["select", CONSIDER],
      ["alert", CONSIDER],
    ],
    sections: [["signup", "The form itself: email, topic and message."]],
    tips: ["Say how quickly you reply. It sets the right expectation before people write."],
  },
  read: {
    components: [
      ["accordion", CONSIDER, "Tuck optional details away so the page stays easy to read from top to bottom."],
      ["avatar", CONSIDER],
    ],
    sections: [["article", "The title, a short intro and the body, with a byline."]],
    tips: ["Use one h1, and an h2 for each section, so people can skim."],
  },
  choose: {
    components: [
      ["radio-group", START],
      ["card", START, "One card per option keeps them equal and easy to compare."],
      ["button", START, "One primary button, on the option you most want people to pick."],
    ],
    sections: [["features", "The options, one card each."]],
    tips: ["Highlight the option you recommend once, and keep the others plain."],
  },
  manage: {
    components: [
      ["table", START],
      ["badge", START, "Status badges say “Published” or “Failed” in words and an icon, not color alone."],
      ["dialog", CONSIDER, "Ask before deleting or publishing, with a safe Cancel."],
      ["empty-state", CONSIDER],
      ["tooltip", CONSIDER],
    ],
    tips: ["Let people undo a mistake instead of asking “Are you sure?” every time."],
  },
};

/** Rules for each tick in "What else should the page do?". @type {Record<string, Rule>} */
const NEEDS = {
  form: {
    components: [
      ["input", START],
      ["textarea", CONSIDER],
      ["select", CONSIDER],
      ["checkbox", CONSIDER],
      ["button", START, "A form needs a button that says what it does, like “Send message”."],
    ],
    sections: [["signup", "Holds the form's fields and its button."]],
    tips: ["Give every field a visible label, and say how to fix an error instead of only saying something is wrong."],
  },
  faq: {
    components: [["accordion", START]],
    sections: [["faq", "Answer the top questions before people have to ask them."]],
    tips: ["Lead with the questions people really ask. Three to six is plenty."],
  },
  compare: {
    components: [["table", START]],
    tips: ["Keep a table to a few short columns. On a phone, three is about the limit."],
  },
  choices: {
    components: [
      ["radio-group", START, "Radio buttons show two to six options at once, so people compare before they choose."],
      ["select", CONSIDER, "A dropdown takes over when there are more than six options."],
      ["checkbox", CONSIDER, "Checkboxes let people pick several, instead of only one."],
      ["switch", CONSIDER],
    ],
    tips: ["Use radio buttons for two to six options and a select for more."],
  },
  views: {
    components: [["tabs", START]],
    tips: ["Name each view with one or two plain words, like Preview and Code."],
  },
  status: {
    components: [
      ["alert", START],
      ["badge", CONSIDER, "A status badge says “Published” or “Failed” in words and an icon, not color alone."],
    ],
    tips: ["Say the state in words as well as color: “Published”, not just a green dot."],
  },
  confirm: {
    components: [["dialog", START]],
    tips: ["Make Cancel the safe default, and name the confirm button after what it does, like “Delete page”, not “OK”."],
  },
  people: {
    components: [["avatar", START]],
    tips: ["Write a person's name in text next to their picture, so nobody depends on the image."],
  },
  slow: {
    components: [["skeleton", START]],
    tips: ["Make each placeholder the same shape as the content, so nothing jumps when it arrives."],
  },
  empty: {
    components: [["empty-state", START]],
    tips: ["Say what would be here and give one action to fill it."],
  },
};

/** Rules for each answer to "Where will most people see it?". Tips only. @type {Record<string, Rule>} */
const DEVICES = {
  phone: {
    tips: [
      "Keep controls at least 40px tall for thumbs. Tooltips can't be hovered on a phone, so put the important words in the label itself.",
    ],
  },
  computer: {
    tips: ["On a wide screen, keep the content in a column about 1100px wide at most, so lines stay easy to read."],
  },
  both: {
    tips: ["Start with the phone layout, then see what the wider screen needs."],
  },
};

/** Tips that fill any space left over. Each is a Volt rule (DESIGN.md §1, §2 and §13). */
const GENERAL_TIPS = [
  "One primary button per view. Make everything else secondary or ghost.",
  "Use the lime highlight once per section, as a fill with dark text.",
  "Try the page with only the keyboard before you share it.",
];

const MAX_TIPS = 6;

/**
 * `table[key]`, but only for the table's own keys: an answer like
 * "constructor" must not find Object's built-in methods.
 *
 * @template T
 * @param {Record<string, T>} table
 * @param {string | undefined} key
 * @returns {T | undefined}
 */
function own(table, key) {
  return key !== undefined && Object.hasOwn(table, key) ? table[key] : undefined;
}

/**
 * @typedef {object} Suggestion
 * @property {string} name        a component manifest name, like "radio-group"
 * @property {"start" | "consider"} level
 * @property {string} why         one sentence on what it's for
 * @property {string[]} because   the answers that led to it, as people read them
 */

/**
 * @typedef {object} Recommendation
 * @property {boolean} ready      false until the first question (what you're making) is answered
 * @property {{ id: string, title: string, how: string } | null} start
 * @property {{ section: string, title: string, why: string }[]} outline  sections, in page order
 * @property {Suggestion[]} components  "start with" first, each group in catalog order
 * @property {string[]} tips
 */

/**
 * The label a person read for one option of one question.
 *
 * @param {string} questionId
 * @param {string} optionId
 */
export function labelFor(questionId, optionId) {
  const option = QUESTIONS.find((question) => question.id === questionId)?.options.find((candidate) => candidate.id === optionId);
  return option?.label ?? optionId;
}

/**
 * A starting point for a page, from the answers so far. Works with partial
 * answers: it needs the first one (what you're making) and gets more
 * specific with each answer after that.
 *
 * @param {import("./questions.js").Answers} answers
 * @returns {Recommendation}
 */
export function recommend(answers) {
  const goal = own(GOALS, answers.goal);
  if (!answers.goal || !goal) return { ready: false, start: null, outline: [], components: [], tips: [] };

  // The answers that count, most specific first. What a person ticked or
  // chose outranks the broad "what are you making", so when two rules
  // disagree about the wording, the more specific one is the one shown.
  // Ticks are visited in the questions' order, not tick order, so the result
  // never depends on which box was ticked first.
  const tickedInOrder = (QUESTIONS.find((question) => question.id === "needs")?.options ?? []).filter((option) => answers.needs.includes(option.id));
  /** @type {{ questionId: string, optionId: string, rule: Rule }[]} */
  const sources = [
    ...tickedInOrder.map((option) => ({ questionId: "needs", optionId: option.id, rule: NEEDS[option.id] })),
    { questionId: "action", optionId: answers.action ?? "", rule: own(ACTIONS, answers.action) },
    { questionId: "goal", optionId: answers.goal, rule: goal },
    { questionId: "device", optionId: answers.device ?? "", rule: own(DEVICES, answers.device) },
  ].flatMap((source) => (source.rule ? [{ ...source, rule: source.rule }] : []));

  /** @type {Map<string, { level: "start" | "consider", why?: string, because: string[] }>} */
  const found = new Map();
  /** @type {Map<string, string>} */
  const sectionWhy = new Map();
  /** @type {string[]} */
  const tips = [];

  for (const { questionId, optionId, rule } of sources) {
    const label = labelFor(questionId, optionId);
    for (const [name, level, why] of rule.components ?? []) {
      const entry = found.get(name) ?? { level, because: [] };
      if (level === START) entry.level = START;
      // The first rule to give its own wording wins (most specific, per above).
      entry.why ??= why;
      if (!entry.because.includes(label)) entry.because.push(label);
      found.set(name, entry);
    }
    for (const [section, why] of rule.sections ?? []) if (!sectionWhy.has(section)) sectionWhy.set(section, why);
    for (const tip of rule.tips ?? []) if (!tips.includes(tip)) tips.push(tip);
  }

  const order = Object.keys(COMPONENT_WHY);
  const components = [...found.entries()]
    .map(([name, entry]) => ({ name, level: entry.level, why: entry.why ?? COMPONENT_WHY[name], because: entry.because }))
    .sort((a, b) => Number(b.level === START) - Number(a.level === START) || order.indexOf(a.name) - order.indexOf(b.name));

  const sectionOrder = Object.keys(SECTION_TITLES);
  const outline = [...sectionWhy.entries()]
    .map(([section, why]) => ({ section, title: SECTION_TITLES[section], why }))
    .sort((a, b) => sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section));

  for (const tip of GENERAL_TIPS) if (!tips.includes(tip)) tips.push(tip);

  return {
    ready: true,
    start: { id: goal.start, ...STARTS[goal.start] },
    outline,
    components,
    tips: tips.slice(0, MAX_TIPS),
  };
}

/**
 * The plan as plain text, to paste into notes or an AI coding agent's prompt.
 *
 * @param {import("./questions.js").Answers} answers
 * @param {Recommendation} result
 */
export function planAsText(answers, result) {
  if (!result.ready || !result.start) return "";
  const lines = ["My page plan, from Volt's “Find your components”", ""];
  if (answers.goal) lines.push(`Making: ${labelFor("goal", answers.goal)}`);
  if (answers.action) lines.push(`Main action: ${labelFor("action", answers.action)}`);
  if (answers.needs.length > 0) lines.push(`Also needs: ${answers.needs.map((id) => labelFor("needs", id)).join("; ")}`);
  if (answers.device) lines.push(`Seen mostly: ${labelFor("device", answers.device)}`);
  lines.push("", `Start from: ${result.start.title}`, result.start.how);
  if (result.outline.length > 0) {
    lines.push("", "Page outline:", ...result.outline.map((item, index) => `${index + 1}. ${item.title}: ${item.why}`));
  }
  lines.push("", "Components:");
  for (const item of result.components) {
    lines.push(`- ${item.name} (${item.level === START ? "start with" : "worth considering"}): ${item.why}`);
  }
  lines.push("", "Design tips:", ...result.tips.map((tip) => `- ${tip}`));
  return lines.join("\n");
}
