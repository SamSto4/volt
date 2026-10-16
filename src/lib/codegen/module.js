// Shared helpers for printing a whole file: grouped imports and a component
// that returns some JSX. Pure (ADR 0003).

/**
 * One import line per module, names sorted, modules sorted.
 *
 * @param {Map<string, Set<string>>} namesByModule  module path -> names imported from it
 * @returns {string}
 */
export function printImports(namesByModule) {
  return [...namesByModule.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([from, names]) => `import { ${[...names].sort().join(", ")} } from "${from}";`)
    .join("\n");
}

/**
 * Wraps JSX in a default-exported component. Multi-line JSX gets parentheses,
 * the way people write it, so `return` isn't followed by a line break (which
 * would make JavaScript return undefined).
 *
 * @param {string} imports
 * @param {string} jsx
 * @param {string} name  the component's name, e.g. "Example" or "Page"
 */
export function printModule(imports, jsx, name) {
  const body = jsx.includes("\n")
    ? `  return (\n${jsx
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n")}\n  );`
    : `  return ${jsx};`;
  const header = imports ? `${imports}\n\n` : "";
  return `${header}export default function ${name}() {\n${body}\n}\n`;
}
