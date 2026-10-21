import { CatalogCard } from "@/components/catalog-card";
import { manifests } from "@/registry";

/** @type {import("next").Metadata} */
export const metadata = {
  title: "Components · Volt",
  description: "Accessible, shadcn-style components with live previews and the exact code.",
};

/** The catalog: every component as a card with a live preview (DESIGN.md §12). */
export default function ComponentsPage() {
  return (
    <main className="page-container flex flex-col gap-10 py-10">
      <section className="flex flex-col gap-2">
        <h1 className="type-heading-1">Components</h1>
        <p className="max-w-prose text-muted-foreground">
          Accessible building blocks you can try right here. Point at a card to see its presets and what it can do.
        </p>
      </section>

      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {manifests.map((manifest) => (
          <CatalogCard key={manifest.name} name={manifest.name} />
        ))}
      </ul>
    </main>
  );
}
