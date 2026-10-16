// Generates the code for one block: the imports it needs, its JSX, and a
// complete example file that can be pasted into a project as-is.
//
// Pure JavaScript: takes data, returns strings (ADR 0003).

import { z } from "zod";
import { collectTypes, printJsx } from "./jsx.js";
import { printImports, printModule } from "./module.js";

/**
 * A block as stored in a page tree: which component, and its props.
 * @typedef {object} Block
 * @property {string} component  a manifest name, e.g. "button"
 * @property {Record<string, unknown>} props
 */

/**
 * @typedef {object} BlockCode
 * @property {string} imports  e.g. `import { Button } from "@/components/ui/button";`
 * @property {string} jsx      the block's JSX, unindented
 * @property {string} module   imports + an `Example` component that returns the JSX
 */

/**
 * @param {Block} block
 * @param {import("@/registry/schema").Manifest[]} manifests
 * @returns {BlockCode}
 */
export function generateBlockCode(block, manifests) {
  const manifest = manifests.find((candidate) => candidate.name === block.component);
  if (!manifest) throw new Error(`Unknown component "${block.component}"`);

  // Saved trees and share links are untrusted, so props are checked here,
  // and parse() fills in every prop that wasn't set.
  const result = manifest.props.safeParse(block.props);
  if (!result.success) {
    throw new Error(`Invalid props for "${block.component}":\n${z.prettifyError(result.error)}`);
  }
  const defaults = manifest.props.parse({});
  const element = manifest.code.render(result.data, defaults);

  // Import only the components the JSX actually uses. Lowercase types are
  // HTML tags (p, span) and need no import.
  const names = collectTypes(element).filter((type) => /^[A-Z]/.test(type));
  const imports = printImports(new Map(names.length > 0 ? [[manifest.code.from, new Set(names)]] : []));

  const jsx = printJsx(element);
  return { imports, jsx, module: printModule(imports, jsx, "Example") };
}
