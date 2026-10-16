import { cn } from "@/lib/utils";

/** @typedef {import("@/registry/badge").BadgeProps} BadgeProps */

// Volt badge styles (DESIGN.md §10).
/** @type {Record<BadgeProps["variant"], string>} */
export const variantClasses = {
  neutral: "border border-border text-muted-foreground",
  // Lime is always a fill with dark text, never lime text (DESIGN.md §2).
  highlight: "bg-highlight text-highlight-foreground",
};

/**
 * A short label like "New" or "Beta". Plain text in a <span>: no role and no
 * focus stop, because there's nothing to do with it.
 *
 * @param {Partial<Pick<BadgeProps, "variant">> & import("react").ComponentProps<"span">} props
 */
export function Badge({ variant = "neutral", className, ...props }) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(
        // 24px tall pill, 8px side padding, Volt's `label` type style.
        "inline-flex h-6 shrink-0 items-center rounded-full px-2 whitespace-nowrap type-label",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
