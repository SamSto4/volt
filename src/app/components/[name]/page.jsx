import { notFound } from "next/navigation";
import { Playground } from "@/components/playground";
import { manifests } from "@/registry";

// One page per component, all prerendered at build time.

// The 8 component pages are fully static, so navigating to them is instant
// anyway. This only allows an *unknown* name to block long enough to answer
// with a real 404. Reading params inside <Suspense> instead would silence
// Next's "instant navigation" warning, but the response would already have
// started with status 200, turning every bad URL into a soft 404.
export const instant = false;

export function generateStaticParams() {
  return manifests.map((manifest) => ({ name: manifest.name }));
}

/** @param {string} name */
function findManifest(name) {
  return manifests.find((manifest) => manifest.name === name);
}

/** @param {{ params: Promise<{ name: string }> }} props */
export async function generateMetadata({ params }) {
  const manifest = findManifest((await params).name);
  return manifest ? { title: `${manifest.title} · Volt`, description: manifest.description } : {};
}

/** @param {{ params: Promise<{ name: string }> }} props */
export default async function ComponentPage({ params }) {
  // In Next 16, params is a Promise, so it's awaited before use.
  const manifest = findManifest((await params).name);
  if (!manifest) notFound();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10">
      <section className="flex flex-col gap-2">
        <p className="type-label text-muted-foreground">{manifest.category}</p>
        <h1 className="type-heading-1">{manifest.title}</h1>
        <p className="max-w-prose text-muted-foreground">{manifest.description}</p>
      </section>

      <section aria-labelledby="playground-heading" className="flex flex-col gap-4">
        <h2 id="playground-heading" className="type-heading-2">
          Try it
        </h2>
        <p className="max-w-prose text-muted-foreground">
          Change any prop and watch the preview and the code update together. Everything in the preview
          works: click it, tab through it, type in it.
        </p>
        <Playground name={manifest.name} />
      </section>

      <section aria-labelledby="usage-heading" className="flex flex-col gap-4">
        <h2 id="usage-heading" className="type-heading-2">
          Usage
        </h2>
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
            <dt className="font-semibold">When to use</dt>
            <dd className="text-muted-foreground">{manifest.usage.whenToUse}</dd>
          </div>
          <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
            <dt className="font-semibold">When not to use</dt>
            <dd className="text-muted-foreground">{manifest.usage.whenNotToUse}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="a11y-heading" className="flex flex-col gap-4">
        <h2 id="a11y-heading" className="type-heading-2">
          Accessibility
        </h2>
        {manifest.a11y.keyboard.length > 0 && (
          <table className="w-full border-collapse type-small">
            <caption className="sr-only">Keyboard support</caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Key
                </th>
                <th scope="col" className="py-2 font-semibold">
                  What it does
                </th>
              </tr>
            </thead>
            <tbody>
              {manifest.a11y.keyboard.map((row) => (
                <tr key={row.keys} className="border-b border-border">
                  <td className="py-2 pr-4 type-code">{row.keys}</td>
                  <td className="py-2 text-muted-foreground">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <ul className="flex list-disc flex-col gap-2 pl-6 text-muted-foreground">
          {manifest.a11y.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
