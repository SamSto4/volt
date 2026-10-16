// "Copy prompt for your AI agent" (CLAUDE.md, AI feature 1): a precise prompt
// a user pastes into Claude Code, Cursor or another coding agent to add a
// Volt component to their project.
//
// Prompt version: 1 (2026-10-16). Change the version when the wording changes,
// so feedback about a prompt can be traced to the text that produced it.
//
// Design choices, one per section of the prompt:
// - It's **grounded**: every fact comes from the manifest and the generated
//   code (file paths, packages, source URL, usage, accessibility notes). The
//   agent isn't asked to guess anything it could get wrong.
// - It names **exact file paths** for the user's framework, so the agent
//   doesn't invent its own structure.
// - It links the **source file** instead of pasting it: the agent fetches the
//   current version, and the prompt stays short enough to read before sending.
// - It lists the **accessibility requirements as rules to keep**, because
//   agents "tidying up" code often drop ARIA attributes or keyboard handlers.
// - It ends with a **definition of done** the agent can check itself against.

import { installCommand, packagesFor, paths, REPO_URL } from "../install/guide.js";

export const AGENT_PROMPT_VERSION = 1;

/**
 * @param {import("@/registry/schema").Manifest} manifest
 * @param {"next" | "vite"} framework
 * @param {import("../install/guide.js").PackageManager} manager
 * @param {string} exampleCode  generated usage code (from generateBlockCode)
 * @returns {string}
 */
export function buildAgentPrompt(manifest, framework, manager, exampleCode) {
  const p = paths(manifest, framework);
  const frameworkName = framework === "next" ? "Next.js (App Router)" : "Vite + React";
  const packages = packagesFor(manifest);

  return `Add the Volt "${manifest.title}" component to this ${frameworkName} project.

## What it is
${manifest.description} ${manifest.usage.whenToUse}

## Steps
1. Install the dependencies: \`${installCommand(manager, packages)}\`
2. Make sure Tailwind CSS v4 is set up, and copy Volt's CSS variables, @theme block and type-* utilities from ${REPO_URL}/blob/main/src/app/globals.css into \`${p.css}\`.
3. If \`${p.utils}\` doesn't exist, create it with a \`cn()\` helper: \`twMerge(clsx(inputs))\`, exported as \`cn\`.
4. Fetch ${REPO_URL}/blob/main/src/components/ui/${manifest.name}.jsx and save it unchanged as \`${p.component}\`. Keep the \`@/\` imports; set up the \`@/\` path alias if the project doesn't have one.
5. Use it in \`${p.usage}\` like this:

\`\`\`jsx
${exampleCode.trimEnd()}
\`\`\`

## Accessibility rules to keep
${manifest.a11y.notes.map((note) => `- ${note}`).join("\n")}
- Don't remove or rename ARIA attributes, roles or keyboard handlers in the component.

## Done when
- The project builds and the page renders the ${manifest.title}.
- ${manifest.a11y.keyboard.length > 0 ? `Keyboard support works: ${manifest.a11y.keyboard.map((row) => `${row.keys} (${row.action.toLowerCase()})`).join("; ")}.` : "It reads correctly with a screen reader in the surrounding text."}
`;
}
