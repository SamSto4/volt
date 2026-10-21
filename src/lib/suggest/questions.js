// The questions on the "Find your components" page (/try/suggest), as plain
// data. Plain data means the page just maps over it, and a test can check
// that every option here leads somewhere (see recommend.test.js).

/**
 * @typedef {object} Option
 * @property {string} id      stable key; recommend.js's rules are keyed by it
 * @property {string} label   what people read
 * @property {string} [hint]  one line of explanation under the label
 */

/**
 * @typedef {object} Question
 * @property {"goal" | "action" | "needs" | "device"} id   which answer it fills
 * @property {"single" | "multi"} kind  pick one, or tick any number
 * @property {string} title
 * @property {string} [hint]
 * @property {Option[]} options
 */

/**
 * What a person has answered so far. Every part is optional except `needs`,
 * which is a list (empty when nothing is ticked).
 *
 * @typedef {object} Answers
 * @property {string} [goal]
 * @property {string} [action]
 * @property {string[]} needs
 * @property {string} [device]
 */

/** @type {Question[]} */
export const QUESTIONS = [
  {
    id: "goal",
    kind: "single",
    title: "What are you making?",
    options: [
      { id: "landing", label: "A landing page", hint: "For a product, event or service." },
      { id: "blog", label: "A blog post or article", hint: "Something people read." },
      { id: "contact", label: "A contact page", hint: "So people can reach you." },
      { id: "shop", label: "A pricing or shop page", hint: "Plans or products to choose from." },
      { id: "app", label: "A dashboard or app screen", hint: "Lists and status, for people who come back." },
    ],
  },
  {
    id: "action",
    kind: "single",
    title: "What should visitors do?",
    hint: "The one main thing. Everything else on the page supports it.",
    options: [
      { id: "signup", label: "Sign up or subscribe" },
      { id: "contact", label: "Get in touch" },
      { id: "read", label: "Read and learn" },
      { id: "choose", label: "Choose a plan or an option" },
      { id: "manage", label: "Find, review or manage things" },
    ],
  },
  {
    id: "needs",
    kind: "multi",
    title: "What else should the page do?",
    hint: "Tick anything that applies.",
    options: [
      { id: "form", label: "Collect details in a form" },
      { id: "faq", label: "Answer common questions" },
      { id: "compare", label: "Compare things in rows and columns" },
      { id: "choices", label: "Let people pick from options" },
      { id: "views", label: "Switch between views of the same content" },
      { id: "status", label: "Show success, errors or notices" },
      { id: "confirm", label: "Ask before something risky happens" },
      { id: "people", label: "Show who made or wrote it" },
      { id: "slow", label: "Show content that takes a moment to load" },
      { id: "empty", label: "Handle a list that starts empty" },
    ],
  },
  {
    id: "device",
    kind: "single",
    title: "Where will most people see it?",
    options: [
      { id: "phone", label: "On phones" },
      { id: "computer", label: "On computers" },
      { id: "both", label: "About equally on both" },
    ],
  },
];

/** @returns {Answers} nothing answered yet */
export function emptyAnswers() {
  return { needs: [] };
}
