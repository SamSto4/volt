import Link from "next/link";
import { DotGrid } from "@/components/dot-grid";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { manifests } from "@/registry";
import { LiveCodeDemo } from "./_components/live-code-demo";

// Volt's home page. Every claim here is something the app does today
// (CLAUDE.md: "no README claims the code doesn't back up").

const steps = [
  {
    title: "Start from a real page",
    description: "Open the example landing page, or a blank one, and see it at phone, tablet or desktop width.",
  },
  {
    title: "Drop in components",
    description: "Drag them in, click Add, or use the keyboard. Change any prop in the inspector, and undo anything.",
  },
  {
    title: "Copy the exact code",
    description: "See the JSX for the whole page or for one block, with the selected lines highlighted. Copy it or download it.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* One thing per screen: the idea, one action, and the proof beside it,
          a live component with the exact code that makes it. Left-aligned like
          every page's hero, over the same dot grid as the gallery. */}
      <section className="relative isolate border-b border-border">
        <DotGrid />
        <div className="page-container grid items-center gap-10 py-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:py-16">
          <div className="flex flex-col items-start gap-6">
            <Badge>Early version</Badge>
            <h1 className="type-display">Drop real components into real pages</h1>
            <p className="max-w-[60ch] text-muted-foreground">
              Then learn exactly how to put them in your project. Every block shows the code it produces, and every
              component is built to be accessible from the start.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {/* Links that look like buttons: they go somewhere, so they're links. */}
              <Link href="/editor" className={buttonVariants({ size: "lg" })}>
                Open the editor
              </Link>
              <Link href="/components" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Browse {manifests.length} components
              </Link>
            </div>
          </div>
          <LiveCodeDemo />
        </div>
      </section>

      <section aria-labelledby="how-heading" className="page-container flex flex-col gap-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="how-heading" className="type-heading-1">
            How it works
          </h2>
          <Link href="/try" className="inline-flex min-h-10 items-center rounded-sm text-primary underline underline-offset-4">
            Try every component live
          </Link>
        </div>
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full">
                <CardHeader>
                  <span className="type-label text-muted-foreground">Step {index + 1}</span>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="why-heading" className="page-container flex flex-col gap-6 py-10">
        <h2 id="why-heading" className="type-heading-1">
          Built to be understood
        </h2>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <li>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Accessible by default</CardTitle>
                <CardDescription>
                  Tabs and Accordion follow the WAI-ARIA keyboard patterns. Every page is scanned with axe on every
                  change.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
          <li>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>What you see is the code</CardTitle>
                <CardDescription>
                  The preview and the code come from the same data, so they can&apos;t disagree.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
          <li>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Built in the open</CardTitle>
                <CardDescription>
                  Every decision is written down, and every change went through a pull request that explains it.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
        </ul>
      </section>

      {/* The bookend: the page ends on the same action it opened with, in the same words. */}
      <section aria-labelledby="closing-heading" className="border-t border-border">
        <div className="page-container flex flex-wrap items-center justify-between gap-4 py-10">
          <h2 id="closing-heading" className="type-heading-2">
            Ready to put them on a real page?
          </h2>
          <Link href="/editor" className={buttonVariants({ size: "lg" })}>
            Open the editor
          </Link>
        </div>
      </section>
    </main>
  );
}
