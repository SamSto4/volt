import { ArrowDown } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertsCard } from "./_components/alerts-card";
import { BadgesCard } from "./_components/badges-card";
import { ButtonsCard } from "./_components/buttons-card";
import { ChoicesCard } from "./_components/choices-card";
import { CommandCard } from "./_components/command-card";
import { ComponentCard } from "./_components/component-card";
import { DialogCard } from "./_components/dialog-card";
import { EmptyStateCard } from "./_components/empty-state-card";
import { FormFieldsCard } from "./_components/form-fields-card";
import { IconButtonsCard } from "./_components/icon-buttons-card";
import { MetricCard } from "./_components/metric-card";
import { ShowcaseGroup } from "./_components/showcase";
import { SkeletonCard } from "./_components/skeleton-card";
import { StatesCard } from "./_components/states-card";
import { SwitchersCard } from "./_components/switchers-card";
import { TableCard } from "./_components/table-card";
import { ToastCard } from "./_components/toast-card";

/** @type {import("next").Metadata} */
export const metadata = {
  title: "Try it · Volt",
  description: "Every Volt component, live: click, type and tab through them before you build with them.",
};

/** The shared page column (globals.css). */
const CONTAINER = "page-container";

/**
 * The Try it page: a curated gallery of Volt components, each one live.
 * Everything here is local state; nothing is saved.
 */
export default function TryPage() {
  return (
    <main className="flex flex-col">
      <section aria-labelledby="try-title" className="relative isolate border-b border-border">
        <DotGrid />
        <div className={cn(CONTAINER, "flex flex-col items-start gap-4 py-10")}>
          <p className="type-label text-muted-foreground">Component gallery</p>
          <h1 id="try-title" className="max-w-4xl type-display">
            See how Volt feels before you build with it.
          </h1>
          <p className="max-w-[60ch] text-muted-foreground">
            Every piece here is a real component, not a picture: click it, type in it, tab through it. What you try
            is exactly what you copy into your project.
          </p>
          {/* -ml-4 lines the ghost button's text up with the column above. */}
          <Link href="#showcase" className={buttonVariants({ variant: "ghost", className: "-ml-4" })}>
            Browse components
            <ArrowDown aria-hidden="true" strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      <div id="showcase" className={cn(CONTAINER, "flex scroll-mt-4 flex-col gap-10 py-10")}>
        {/* Column spans are set here, per card, so every row is full at both
            two columns (768px) and three (1280px). Cards stay in reading
            order: no dense packing, which would make Tab jump around. */}
        <p className="max-w-prose type-small text-muted-foreground">
          The names, numbers and pages in these examples are made up, and nothing you do here is saved.
        </p>

        <section
          aria-labelledby="suggest-title"
          className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-border bg-card p-4 md:p-6"
        >
          <div className="flex max-w-prose flex-col gap-2">
            <h2 id="suggest-title" className="type-heading-2">
              Not sure where to start?
            </h2>
            <p className="type-small text-muted-foreground">
              Answer four short questions and get a page outline, the components to use, and design tips.
            </p>
          </div>
          <Link href="/try/suggest" className={buttonVariants({ variant: "secondary" })}>
            Find your components
          </Link>
        </section>

        <ShowcaseGroup id="actions" title="Actions" description="Buttons for doing things, from the one main action to quiet toolbar icons.">
          <ButtonsCard />
          <IconButtonsCard />
          <SwitchersCard className="md:col-span-2 xl:col-span-1" />
        </ShowcaseGroup>

        <ShowcaseGroup id="inputs" title="Inputs" description="Fields and choices with visible labels, hints, and errors that say how to fix them.">
          <FormFieldsCard className="md:col-span-2" />
          <ChoicesCard className="md:col-span-2 xl:col-span-1" />
        </ShowcaseGroup>

        <ShowcaseGroup id="display" title="Display" description="Ways to show information: cards, numbers, statuses and tables.">
          <ComponentCard />
          <MetricCard />
          <BadgesCard className="md:col-span-2 xl:col-span-1" />
          <TableCard className="md:col-span-2 xl:col-span-3" />
        </ShowcaseGroup>

        <ShowcaseGroup id="feedback" title="Feedback" description="How the interface answers: messages, undo, and what shows while there's nothing yet.">
          <AlertsCard className="xl:col-span-2" />
          <ToastCard />
          <EmptyStateCard className="xl:col-span-2" />
          <SkeletonCard />
        </ShowcaseGroup>

        <ShowcaseGroup id="overlays" title="Overlays" description="Things that open over the page, then give focus back when they close.">
          <DialogCard className="md:col-span-2 xl:col-span-1" />
          <CommandCard className="md:col-span-2" />
        </ShowcaseGroup>

        <ShowcaseGroup id="states" title="States" description="The same controls in each state, so you can compare them.">
          <StatesCard className="md:col-span-2 xl:col-span-3" />
        </ShowcaseGroup>
      </div>

      <section aria-labelledby="closing-title" className="border-t border-border">
        <div className={cn(CONTAINER, "flex flex-wrap items-center justify-between gap-4 py-10")}>
          <h2 id="closing-title" className="type-heading-2">
            Ready to put them on a real page?
          </h2>
          {/* The page's one primary action outside the specimens. */}
          <Link href="/editor" className={buttonVariants({ size: "lg" })}>
            Open the editor
          </Link>
        </div>
      </section>
    </main>
  );
}

/**
 * A still grid of small dots behind the hero, in the `line` color. An SVG
 * pattern, not a CSS gradient (Volt uses none), and it never moves.
 */
function DotGrid() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 -z-10 size-full text-border">
      <defs>
        <pattern id="try-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#try-dots)" />
    </svg>
  );
}
