// Turns a small element tree (plain data) into JSX source text.
//
// Pure JavaScript: no React, no DOM (ADR 0003). Every escaping and formatting
// rule lives here, so manifests never build code strings themselves.

/**
 * A value an attribute can have. `true` prints as a bare attribute
 * (`disabled`); `false`, `null` and `undefined` leave the attribute out.
 * @typedef {string | number | boolean | null | undefined} AttrValue
 */

/**
 * @typedef {object} Element
 * @property {string} type  a component (`Button`) or an HTML tag (`p`)
 * @property {Record<string, AttrValue>} props
 * @property {Child[]} children
 */

/**
 * Children can be elements or text. `false`, `null` and `undefined` are
 * skipped, so `description && h(...)` works the way it does in JSX.
 * @typedef {Element | string | false | null | undefined} Child
 */

const INDENT = "  ";
// Component names (`Button`, `Card.Title`) and HTML tags (`p`, `h3`).
const TYPE_NAME = /^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)*$/;
// Attribute names, including `aria-label` and `data-slot`.
const ATTR_NAME = /^[A-Za-z_][A-Za-z0-9_-]*$/;

/**
 * Builds an element. Named after the `h()` function many JSX tools use.
 *
 * @param {string} type
 * @param {Record<string, AttrValue>} [props]
 * @param {...(Child | Child[])} children  arrays are flattened, so `items.map(...)` can be passed directly
 * @returns {Element}
 */
export function h(type, props = {}, ...children) {
  if (!TYPE_NAME.test(type)) throw new Error(`Invalid element type: ${JSON.stringify(type)}`);
  return { type, props, children: children.flat() };
}

/**
 * Text between tags. Plain words print as-is; anything JSX would read as
 * code (`{ } < >`), an HTML entity (`&`), surrounding spaces (which JSX would
 * trim) or quotes is printed as a string expression instead: {"Couldn't save"}.
 * Quotes are included so the code passes react/no-unescaped-entities in the
 * user's own lint setup.
 *
 * @param {string} text
 * @returns {string}
 */
export function printText(text) {
  const plain = /^[^{}<>&"'\n]*$/.test(text) && text === text.trim() && text !== "";
  return plain ? text : `{${JSON.stringify(text)}}`;
}

/**
 * One attribute, with a leading space, or "" when it should be left out.
 *
 * @param {string} name
 * @param {AttrValue} value
 * @returns {string}
 */
export function printAttribute(name, value) {
  if (!ATTR_NAME.test(name)) throw new Error(`Invalid attribute name: ${JSON.stringify(name)}`);
  if (value === undefined || value === null || value === false) return "";
  if (value === true) return ` ${name}`;
  if (typeof value === "number") return ` ${name}={${value}}`;
  // In a JSX attribute string, `&amp;` would be decoded and there's no way to
  // escape `"`, so values with either (or a line break) become expressions.
  return /^[^"&\n]*$/.test(value) ? ` ${name}="${value}"` : ` ${name}={${JSON.stringify(value)}}`;
}

/**
 * Prints an element (or text) as JSX, indented by `depth` levels.
 * An element with only text children fits on one line; otherwise each child
 * goes on its own line, one level deeper.
 *
 * @param {Element | string} node
 * @param {number} [depth]
 * @returns {string}
 */
export function printJsx(node, depth = 0) {
  const pad = INDENT.repeat(depth);
  if (typeof node === "string") return pad + printText(node);

  const attributes = Object.entries(node.props)
    .map(([name, value]) => printAttribute(name, value))
    .join("");
  // Drop false/null/undefined children (from `condition && h(...)`).
  const children = /** @type {(Element | string)[]} */ (
    node.children.filter((child) => child !== false && child !== null && child !== undefined)
  );

  if (children.length === 0) return `${pad}<${node.type}${attributes} />`;

  const onlyText = children.every((child) => typeof child === "string");
  if (onlyText) {
    return `${pad}<${node.type}${attributes}>${children.map((child) => printText(/** @type {string} */ (child))).join("")}</${node.type}>`;
  }

  const inner = children.map((child) => printJsx(child, depth + 1)).join("\n");
  return `${pad}<${node.type}${attributes}>\n${inner}\n${pad}</${node.type}>`;
}

/**
 * Every element type used in a tree, in the order first seen.
 *
 * @param {Element} node
 * @returns {string[]}
 */
export function collectTypes(node) {
  /** @type {Set<string>} */
  const seen = new Set();
  /** @param {Child} child */
  const visit = (child) => {
    if (!child || typeof child === "string") return;
    seen.add(child.type);
    child.children.forEach(visit);
  };
  visit(node);
  return [...seen];
}
