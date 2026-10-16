// The command palette's search (DESIGN.md §10: fuzzy search with synonyms,
// recent items first). Pure: commands and a query in, ranked commands out.

/**
 * @typedef {object} Command
 * @property {string} id         stable, used for "recent"
 * @property {string} title      what's shown and searched, e.g. "Add Button to page"
 * @property {string} group      shown beside the title, e.g. "Components"
 * @property {string[]} [keywords]  extra words that should find it (synonyms)
 * @property {string} [shortcut] shown right-aligned, e.g. "⌘Z"
 * @property {() => void} run
 */

/**
 * Words people use for things Volt names differently. Each key's words are
 * added to any command whose title contains the key.
 */
export const SYNONYMS = /** @type {Record<string, string[]>} */ ({
  button: ["cta", "action", "link"],
  badge: ["tag", "label", "chip", "pill"],
  card: ["tile", "panel", "box"],
  input: ["field", "text", "email", "form"],
  textarea: ["message", "multiline", "comment", "field"],
  select: ["dropdown", "picker", "menu", "options"],
  checkbox: ["tick", "agree", "terms", "toggle"],
  switch: ["toggle", "on off", "setting"],
  alert: ["notice", "banner", "message", "warning", "error"],
  avatar: ["photo", "profile", "picture", "user"],
  tabs: ["tab", "segments", "switcher"],
  accordion: ["faq", "collapse", "expand", "disclosure"],
  tooltip: ["hint", "help", "popover"],
  dialog: ["modal", "confirm", "popup"],
  hero: ["header", "banner", "intro"],
  undo: ["back", "revert"],
  redo: ["again", "forward"],
  delete: ["remove", "trash"],
  code: ["export", "jsx", "source"],
  width: ["size", "viewport", "screen", "mobile", "phone", "tablet", "desktop"],
});

/** @param {string} text */
const normalize = (text) => text.toLowerCase().trim();

/**
 * How well `query` matches `text`: higher is better, 0 is no match.
 * Word-start matches beat substring matches, which beat "letters in order"
 * (so "atp" still finds "Add to page").
 *
 * @param {string} text
 * @param {string} query
 */
export function matchScore(text, query) {
  const haystack = normalize(text);
  const needle = normalize(query);
  if (!needle) return 1;
  if (haystack.startsWith(needle)) return 100;
  if (haystack.split(/\s+/).some((word) => word.startsWith(needle))) return 80;
  if (haystack.includes(needle)) return 60;
  // Subsequence: every query letter appears, in order.
  let position = 0;
  for (const letter of needle.replace(/\s+/g, "")) {
    position = haystack.indexOf(letter, position);
    if (position === -1) return 0;
    position += 1;
  }
  return 20;
}

/**
 * The commands that match a query, best first. With no query, recent
 * commands come first, then the rest in their original order.
 *
 * @param {Command[]} commands
 * @param {string} query
 * @param {string[]} [recent]  command ids, most recent first
 * @returns {Command[]}
 */
export function searchCommands(commands, query, recent = []) {
  const recency = (/** @type {Command} */ command) => {
    const index = recent.indexOf(command.id);
    return index === -1 ? 0 : 10 - Math.min(index, 9);
  };

  const scored = commands.map((command, order) => {
    const words = [command.title, command.group, ...(command.keywords ?? []), ...synonymsFor(command.title)];
    const score = Math.max(...words.map((word, index) => matchScore(word, query) - (index === 0 ? 0 : 5)));
    return { command, order, score: score > 0 ? score + recency(command) : 0 };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((entry) => entry.command);
}

/** @param {string} title */
function synonymsFor(title) {
  const lower = normalize(title);
  return Object.entries(SYNONYMS).flatMap(([key, words]) => (lower.includes(key) ? words : []));
}
