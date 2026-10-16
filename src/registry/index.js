import accordion from "./accordion.js";
import alert from "./alert.js";
import avatar from "./avatar.js";
import badge from "./badge.js";
import button from "./button.js";
import card from "./card.js";
import checkbox from "./checkbox.js";
import input from "./input.js";
import select from "./select.js";
import switchManifest from "./switch.js";
import tabs from "./tabs.js";
import textarea from "./textarea.js";
import tooltip from "./tooltip.js";

/**
 * Every component manifest, in catalog order. Adding a component means adding
 * its manifest file and listing it here; a test fails if one is forgotten.
 *
 * @type {import("./schema.js").Manifest[]}
 */
export const manifests = [
  button,
  badge,
  card,
  input,
  textarea,
  select,
  checkbox,
  switchManifest,
  alert,
  avatar,
  tabs,
  accordion,
  tooltip,
];
