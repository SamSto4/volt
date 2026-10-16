import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { renderElement } from "@/editor/render-element";
import { generateBlockCode } from "@/lib/codegen";
import { manifests } from "@/registry";

// One page per component, all prerendered at build time.

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
  const defaults = manifest.props.parse({});

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10">
      <section className="flex flex-col gap-2">
        <p className="type-label text-muted-foreground">{manifest.category}</p>
        <h1 className="type-heading-1">{manifest.title}</h1>
        <p className="max-w-prose text-muted-foreground">{manifest.description}</p>
      </section>

      <section aria-labelledby="examples-heading" className="flex flex-col gap-6">
        <h2 id="examples-heading" className="type-heading-2">
          Examples
        </h2>
        {manifest.variants.map((variant) => {
          const props = manifest.props.parse(variant.props);
          // One element tree feeds both tabs: the preview renders it, the
          // code tab prints it. They can't disagree.
          const element = manifest.code.render(props, defaults);
          const code = generateBlockCode({ component: manifest.name, props: variant.props }, manifests);
          const codeId = `code-${manifest.name}-${variant.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          return (
            <section key={variant.name} aria-label={variant.name} className="flex flex-col gap-4">
              <h3 className="type-label text-muted-foreground">{variant.name}</h3>
              <Tabs defaultValue="preview">
                <TabsList aria-label={`${variant.name}: preview or code`}>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="preview"
                  className="flex min-h-40 items-center justify-center rounded-md border border-border bg-card p-4 md:p-6"
                >
                  <div className="w-full max-w-xl">{renderElement(element)}</div>
                </TabsContent>
                <TabsContent value="code" className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="type-label text-muted-foreground">Example.jsx</span>
                    <CopyButton text={code.module} targetId={codeId} />
                  </div>
                  {/* Plain monospace for now; syntax highlighting (Shiki) comes later. */}
                  <pre className="overflow-x-auto type-code">
                    <code id={codeId}>{code.module}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            </section>
          );
        })}
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
