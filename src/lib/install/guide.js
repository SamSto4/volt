import { manifests } from "@/registry";

// "Add it to your project": the steps for one component, per framework,
// derived from its manifest (single source of truth, CLAUDE.md). Pure: data
// in, steps out, so every framework's instructions are tested.

export const REPO_URL = "https://github.com/SamSto4/volt";
const SOURCE_URL = `${REPO_URL}/blob/main`;

export const FRAMEWORKS = /** @type {const} */ (["next", "vite", "html"]);
/** @typedef {typeof FRAMEWORKS[number]} Framework */

export const FRAMEWORK_LABELS = /** @type {Record<Framework, string>} */ ({ next: "Next.js", vite: "Vite", html: "HTML" });

export const PACKAGE_MANAGERS = /** @type {const} */ (["npm", "pnpm", "yarn", "bun"]);
/** @typedef {typeof PACKAGE_MANAGERS[number]} PackageManager */

/**
 * The cn() helper every component imports. A test checks this text is exactly
 * src/lib/utils.js, so the guide can never hand out a stale copy.
 */
export const UTILS_SOURCE = `import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins class names, dropping falsy ones, and resolves Tailwind conflicts so
 * the last one wins: \`cn("px-4", "px-6")\` gives \`"px-6"\`. This is what lets a
 * caller's \`className\` override a component's defaults. Same helper as shadcn's.
 *
 * @param {...import("clsx").ClassValue} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
`;

/** npm packages each registry dependency brings with it. */
const REGISTRY_PACKAGES = /** @type {Record<string, string[]>} */ ({ utils: ["clsx", "tailwind-merge"] });

/**
 * Other Volt components a component is built on (Tooltip uses Button), in
 * the order to copy them. Registry dependencies that name a manifest.
 *
 * @param {import("@/registry/schema").Manifest} manifest
 * @returns {import("@/registry/schema").Manifest[]}
 */
export function componentDependencies(manifest) {
  return manifest.install.registryDependencies.flatMap((name) => manifests.filter((candidate) => candidate.name === name));
}

/**
 * Every npm package needed, including those of the components it's built on.
 *
 * @param {import("@/registry/schema").Manifest} manifest
 * @returns {string[]} sorted, without duplicates
 */
export function packagesFor(manifest) {
  const fromRegistry = manifest.install.registryDependencies.flatMap((name) => REGISTRY_PACKAGES[name] ?? []);
  const fromComponents = componentDependencies(manifest).flatMap((dependency) => packagesFor(dependency));
  return [...new Set([...fromRegistry, ...fromComponents, ...manifest.install.dependencies])].sort();
}

/** @param {PackageManager} manager @param {string[]} packages */
export function installCommand(manager, packages) {
  const verb = manager === "npm" ? "install" : "add";
  return `${manager} ${verb} ${packages.join(" ")}`;
}

/** Where things go in each kind of project. */
const PATHS = /** @type {const} */ ({
  next: { css: "app/globals.css", utils: "lib/utils.js", components: "components/ui", usage: "app/page.jsx" },
  vite: { css: "src/index.css", utils: "src/lib/utils.js", components: "src/components/ui", usage: "src/App.jsx" },
});

/**
 * @typedef {object} Step
 * @property {string} title
 * @property {string} body
 * @property {{ filename: string, text: string }} [code]
 * @property {{ href: string, label: string }} [link]
 */

/**
 * Where this component and its helpers go in a project.
 *
 * @param {import("@/registry/schema").Manifest} manifest
 * @param {"next" | "vite"} framework
 */
export function paths(manifest, framework) {
  const p = PATHS[framework];
  return { ...p, component: `${p.components}/${manifest.name}.jsx` };
}

/**
 * The steps to add one component to a project.
 *
 * @param {import("@/registry/schema").Manifest} manifest
 * @param {Framework} framework
 * @param {PackageManager} manager
 * @param {string} exampleCode
 * @returns {Step[] | null} null when there's no guide for this framework yet
 */
export function installSteps(manifest, framework, manager, exampleCode) {
  if (framework === "html") return null;
  const p = paths(manifest, framework);
  const packages = packagesFor(manifest);

  /** @type {Step[]} */
  const steps = [];
  if (framework === "vite") {
    steps.push({
      title: "Set up Tailwind CSS and the @ alias",
      body: "Add Tailwind CSS v4 with its Vite plugin, and point @/ at src/ so imports like @/lib/utils work.",
      code: {
        filename: "vite.config.js",
        text: `import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
`,
      },
    });
  }
  steps.push(
    {
      title: "Add the Volt theme",
      body: `Volt components use Tailwind CSS v4 and Volt's CSS variables (colors, type, radius). Copy the variables, the @theme block and the type-* utilities from Volt's globals.css into ${p.css}.`,
      link: { href: `${SOURCE_URL}/src/app/globals.css`, label: "Volt's globals.css on GitHub" },
    },
    {
      title: "Install the dependencies",
      body: `${manifest.title} needs ${packages.join(", ")}.`,
      code: { filename: "Terminal", text: installCommand(manager, packages) },
    },
    {
      title: "Add the cn() helper",
      body: `Every Volt component imports cn() to combine class names. Create ${p.utils}${framework === "next" ? " (or src/lib/utils.js if your project uses a src folder)" : ""}.`,
      code: { filename: p.utils, text: UTILS_SOURCE },
    },
    // Components this one is built on come first, so its imports resolve.
    ...componentDependencies(manifest).map((dependency) => ({
      title: `Copy the ${dependency.title} component`,
      body: `${manifest.title} is built on ${dependency.title}. Save its source as ${p.components}/${dependency.name}.jsx.`,
      link: { href: `${SOURCE_URL}/src/components/ui/${dependency.name}.jsx`, label: `${dependency.name}.jsx on GitHub` },
    })),
    {
      title: `Copy the ${manifest.title} component`,
      body: `Save the component's source as ${p.component}. It's plain JavaScript (JSX), so it works in .jsx and .tsx projects.`,
      link: { href: `${SOURCE_URL}/src/components/ui/${manifest.name}.jsx`, label: `${manifest.name}.jsx on GitHub` },
    },
    {
      title: "Use it",
      body: `Import it where you need it, for example in ${p.usage}.`,
      code: { filename: p.usage, text: exampleCode },
    },
  );
  return steps;
}
