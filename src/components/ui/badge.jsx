import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** @typedef {import("@/registry/badge").BadgeProps} BadgeProps */

// Volt badge styles (DESIGN.md §10).
/** @type {Record<BadgeProps["variant"], string>} */
export const variantClasses = {
  neutral: "border border-border text-muted-foreground",
  // Lime is always a fill with dark text, never lime text (DESIGN.md §2).
  highlight: "bg-highlight text-highlight-foreground",
  // Status (DESIGN.md §2: success and danger are for status only). The color
  // is on the text and icon, on the badge's own hairline, never a tinted
  // fill: success and danger only just pass 4.5:1 on plain surfaces.
  success: "border border-border text-success",
  danger: "border border-border text-destructive",
};

/**
 * Status badges carry an icon whose shape says the same as the color, so
 * the state never depends on color alone (WCAG 1.4.1).
 * @type {Partial<Record<BadgeProps["variant"], import("lucide-react").LucideIcon>>}
 */
const statusIcons = { success: CircleCheck, danger: CircleAlert };

/**
 * A short label like "New" or "Beta", or a status like "Published". Plain
 * text in a <span>: no role and no focus stop, because there's nothing to do
 * with it. The label has to say the state in words; the icon and color back
 * it up.
 *
 * @param {Partial<Pick<BadgeProps, "variant">> & import("react").ComponentProps<"span">} props
 */
export function Badge({ variant = "neutral", className, children, ...props }) {
  const Icon = statusIcons[variant];
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(
        // 24px tall pill, 8px side padding, Volt's `label` type style.
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 whitespace-nowrap type-label",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" size={14} strokeWidth={2} className="shrink-0" />}
      {children}
    </span>
  );
}
