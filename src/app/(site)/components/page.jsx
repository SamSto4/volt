import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { renderElement } from "@/editor/render-element";
import { manifests } from "@/registry";

/** @type {import("next").Metadata} */
export const metadata = {
  title: "Components · Volt",
  description: "Accessible, shadcn-style components with live previews and the exact code.",
};

/** The catalog: every component as a card with a live preview (DESIGN.md §12). */
export default function ComponentsPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10">
      <section className="flex flex-col gap-2">
        <h1 className="type-heading-1">Components</h1>
        <p className="max-w-prose text-muted-foreground">
          Accessible building blocks with a live preview and the exact code for each one.
        </p>
      </section>

      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {manifests.map((manifest) => {
          const defaults = manifest.props.parse({});
          return (
            <li key={manifest.name} className="flex flex-col gap-4 rounded-md border border-border bg-card p-4 md:p-6">
              {/* A live preview, not a screenshot. Inert: it's a picture of
                  the component here, so its controls shouldn't take focus. */}
              <div inert className="flex min-h-32 items-center justify-center rounded-md border border-border bg-background p-4">
                {renderElement(manifest.code.render(defaults, defaults))}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="type-heading-2">
                    {/* The link is on the title only, so the card's other text
                        isn't read as part of the link (Card a11y notes). */}
                    <Link href={`/components/${manifest.name}`} className="rounded-sm hover:underline">
                      {manifest.title}
                    </Link>
                  </h2>
                  {/* The accessibility badge (DESIGN.md §12): the ARIA role it
                      implements, or that plain HTML is enough. */}
                  <Badge>{manifest.a11y.role ? `role: ${manifest.a11y.role}` : "No ARIA needed"}</Badge>
                </div>
                <p className="type-small text-muted-foreground">{manifest.usage.whenToUse}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
