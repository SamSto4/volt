import accordion from "./accordion.js";
import alert from "./alert.js";
import avatar from "./avatar.js";
import badge from "./badge.js";
import button from "./button.js";
import card from "./card.js";
import checkbox from "./checkbox.js";
import dialog from "./dialog.js";
import emptyState from "./empty-state.js";
import input from "./input.js";
import radioGroup from "./radio-group.js";
import select from "./select.js";
import skeleton from "./skeleton.js";
import switchManifest from "./switch.js";
import table from "./table.js";
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
  radioGroup,
  switchManifest,
  alert,
  emptyState,
  skeleton,
  avatar,
  table,
  tabs,
  accordion,
  tooltip,
  dialog,
];
