import { cn } from "@/lib/utils";

// Placeholders shaped like content that's still loading, so the page doesn't
// jump when it arrives. Size each Skeleton with classes to match what it
// stands in for (a line of text, a figure, an avatar).
//
// The pulse is a slow opacity change, only when reduced motion is off; with
// it on, the shapes stay still. It's the one looping animation Volt allows.
// No moving shimmer: that's a gradient sweep, which Volt doesn't use.

/**
 * One placeholder shape. Hidden from screen readers: SkeletonGroup says
 * "Loading" once instead of every shape being read.
 *
 * @param {import("react").ComponentProps<"div">} props
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn("h-4 w-full rounded-sm bg-border motion-safe:animate-pulse", className)}
      {...props}
    />
  );
}

/**
 * Wraps the shapes for one loading area and tells screen readers what's
 * loading, once, through a polite status message.
 *
 * @param {{ label: string } & import("react").ComponentProps<"div">} props
 *   label: what's loading, e.g. "Loading metrics"
 */
export function SkeletonGroup({ label, className, children, ...props }) {
  return (
    <div role="status" data-slot="skeleton-group" className={cn("flex flex-col gap-2", className)} {...props}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
