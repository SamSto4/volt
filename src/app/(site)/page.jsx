import Link from "next/link";
import { AccordionBlock } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/input";
import { TabsBlock } from "@/components/ui/tabs";
import { manifests } from "@/registry";
import { accordionProps } from "@/registry/accordion";
import { tabsProps } from "@/registry/tabs";

// Volt's home page. Every claim here is something the app does today
// (CLAUDE.md: "no README claims the code doesn't back up").

const steps = [
  {
    title: "Start from a real page",
    description: "Open the example landing page, or a blank one, and see it at phone, tablet or desktop width.",
  },
  {
    title: "Drop in components",
    description: "Drag them in, click “Add to page”, or use the keyboard. Change any prop in the inspector, and undo anything.",
  },
  {
    title: "Copy the exact code",
    description: "See the JSX for the whole page or for one block, with the selected lines highlighted. Copy it or download it.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Left-aligned like every page's hero: the headline and the text under it share one edge. */}
      <section className="page-container flex flex-col items-start gap-6 py-16 md:py-24">
        <Badge>Early version</Badge>
        <h1 className="max-w-4xl type-display">Drop real components into real pages</h1>
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
      </section>

      <section aria-labelledby="how-heading" className="page-container flex flex-col gap-6 py-10">
        <h2 id="how-heading" className="type-heading-1">
          How it works
        </h2>
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

      <section aria-labelledby="try-heading" className="page-container flex flex-col gap-6 py-10">
        <div className="flex flex-col gap-2">
          <h2 id="try-heading" className="type-heading-1">
            Try a few
          </h2>
          <p className="max-w-prose text-muted-foreground">
            These are the real components, not pictures. Switch the tabs, open a question, tab through them with the
            keyboard.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6 rounded-md border border-border bg-card p-4 md:p-6">
            <TabsBlock {...tabsProps.parse({})} />
            <InputField label="Email" type="email" placeholder="you@example.com" description="We'll never share it." />
          </div>
          <div className="flex flex-col gap-6 rounded-md border border-border bg-card p-4 md:p-6">
            <Alert tone="success">
              <AlertTitle>Page published</AlertTitle>
              <AlertDescription>Anyone with the link can now see it.</AlertDescription>
            </Alert>
            <AccordionBlock {...accordionProps.parse({})} />
          </div>
        </div>
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
    </main>
  );
}
