import { interactiveCardClasses } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * One group of specimens on the Try it page (Actions, Inputs, ...): a real
 * section with an h2, so screen-reader users can jump between groups.
 *
 * @param {{ id: string, title: string, description: string, children: import("react").ReactNode }} props
 */
export function ShowcaseGroup({ id, title, description, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-4 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id={`${id}-title`} className="type-heading-2">
          {title}
        </h2>
        <p className="max-w-prose type-small text-muted-foreground">{description}</p>
      </div>
      {/* One column on phones, two from 768px, three from 1280px. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

/**
 * A specimen card: context label, name, and the live example on a quiet
 * inset. It lifts on hover and when focus is inside it (DESIGN.md §7), so
 * keyboard users get the same signal as pointer users.
 *
 * The name is an h3 in body type, a step below the group's h2: eighteen
 * display-font headings in a grid would shout.
 *
 * @param {{
 *   id: string,
 *   title: string,
 *   context: string,
 *   note?: import("react").ReactNode,
 *   className?: string,
 *   children: import("react").ReactNode,
 * }} props
 *   context: where you'd use it, e.g. "Forms · Settings"
 *   className: how many columns it spans; the page sets it, so every row fills
 *   note: one line under the example, e.g. how to try it
 */
export function ShowcaseCard({ id, title, context, note, className, children }) {
  return (
    <article
      aria-labelledby={`${id}-title`}
      className={cn(
        // @container: what's inside a card responds to the card's own width, not the screen's.
        "@container flex min-w-0 flex-col gap-4 rounded-md border border-border bg-card p-4 md:p-6",
        interactiveCardClasses,
        className,
      )}
    >
      <header className="flex flex-col gap-1">
        <p className="type-label text-muted-foreground">{context}</p>
        <h3 id={`${id}-title`} className="type-body font-semibold">
          {title}
        </h3>
      </header>
      {/* The inset grows to the row's height and centers its example, so
          short specimens sit in the middle like on a stage. */}
      <div data-specimen className="flex flex-1 flex-col justify-center gap-4 rounded-md border border-border bg-background p-4">{children}</div>
      {note && <p className="type-small text-muted-foreground">{note}</p>}
    </article>
  );
}

/**
 * A specimen with a caption under it, for showing states side by side.
 *
 * @param {{ caption: string, children: import("react").ReactNode, className?: string }} props
 */
export function Specimen({ caption, children, className }) {
  return (
    <figure className={cn("flex flex-col items-start gap-2", className)}>
      {children}
      <figcaption className="type-label text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
