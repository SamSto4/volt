import { cn } from "@/lib/utils";

/** @typedef {import("@/registry/card").CardProps} CardProps */

// Volt card (DESIGN.md §10): raised surface, 1px hairline, 12px corners,
// 16px padding on mobile and 24px from 768px. No shadow at rest, no colored
// edge. Split into small parts like shadcn's Card, so people can compose them.

/**
 * How an interactive card (a link, something selectable, a live preview)
 * answers the pointer (DESIGN.md §7): it lifts 2px, gains `shadow-lift`, and
 * its border moves toward `primary`, over 200ms. Focus inside the card does
 * the same, so keyboard users get the signal too. With reduced motion the
 * shadow and border still change; only the lift is dropped.
 */
export const interactiveCardClasses = cn(
  "transition-[translate,box-shadow,border-color] duration-200 ease-out",
  "hover:border-primary/40 hover:shadow-lift motion-safe:hover:-translate-y-0.5",
  "focus-within:border-primary/40 focus-within:shadow-lift motion-safe:focus-within:-translate-y-0.5",
);

/**
 * @param {{ interactive?: boolean } & import("react").ComponentProps<"div">} props
 *   interactive: the card responds to hover and focus (see interactiveCardClasses)
 */
export function Card({ interactive = false, className, ...props }) {
  return (
    <div
      data-slot="card"
      data-interactive={interactive || undefined}
      className={cn(
        "flex flex-col gap-4 rounded-md border border-border bg-card p-4 text-card-foreground md:p-6",
        interactive && interactiveCardClasses,
        className,
      )}
      {...props}
    />
  );
}

/** @param {import("react").ComponentProps<"div">} props */
export function CardHeader({ className, ...props }) {
  return <div data-slot="card-header" className={cn("flex flex-col gap-2", className)} {...props} />;
}

/**
 * The card's title, as a real heading. `level` picks h2, h3 or h4 so the
 * page's heading outline stays in order wherever the card is placed.
 *
 * @param {{ level?: CardProps["headingLevel"] } & import("react").ComponentProps<"h3">} props
 */
export function CardTitle({ level = 3, className, ...props }) {
  // A tag name stored in a variable works as a JSX element: <Heading> renders <h2>, <h3> or <h4>.
  const Heading = /** @type {"h2" | "h3" | "h4"} */ (`h${level}`);
  return <Heading data-slot="card-title" className={cn("type-heading-2", className)} {...props} />;
}

/** @param {import("react").ComponentProps<"p">} props */
export function CardDescription({ className, ...props }) {
  return (
    <p data-slot="card-description" className={cn("type-small text-muted-foreground", className)} {...props} />
  );
}

/** @param {import("react").ComponentProps<"div">} props */
export function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn(className)} {...props} />;
}

/** @param {import("react").ComponentProps<"div">} props */
export function CardFooter({ className, ...props }) {
  return <div data-slot="card-footer" className={cn("flex items-center gap-2", className)} {...props} />;
}
