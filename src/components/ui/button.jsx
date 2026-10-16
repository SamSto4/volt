import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** @typedef {import("@/registry/button").ButtonProps} ButtonProps */

// Volt button styles (DESIGN.md §10). Plain objects instead of a variants
// library: easy to read, and tests can check that every style the manifest
// allows has classes here.

/** @type {Record<ButtonProps["variant"], string>} */
export const variantClasses = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
  secondary: "border border-input bg-secondary text-secondary-foreground hover:bg-accent active:bg-accent",
  ghost: "bg-transparent text-foreground hover:bg-accent active:bg-accent",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
};

/** @type {Record<ButtonProps["size"], string>} */
export const sizeClasses = {
  sm: "h-8 type-small", // 32px
  md: "h-10 type-small", // 40px
  lg: "h-12 type-body", // 48px
};

/**
 * The classes for a Volt button. Exported so a link can look like a button:
 * `<a className={buttonVariants({ variant: "secondary" })}>`.
 *
 * @param {{ variant?: ButtonProps["variant"], size?: ButtonProps["size"], className?: string }} [options]
 */
export function buttonVariants({ variant = "primary", size = "md", className } = {}) {
  return cn(
    // Shared by every button: pill shape, 16px side padding, 8px icon gap,
    // 20px icons. Color changes are kept even with reduced motion (DESIGN.md §7).
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full px-4 font-medium whitespace-nowrap transition-colors duration-100",
    "[&_svg]:size-5 [&_svg]:shrink-0",
    // A disabled button keeps its shape but fades and stops reacting.
    "disabled:pointer-events-none disabled:opacity-50",
    // A loading button stays fully visible (it's busy, not unavailable).
    "aria-disabled:cursor-wait",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

/**
 * Volt's button. Renders a native <button>, so focus, Enter/Space activation
 * and disabled behavior come from the browser for free.
 *
 * While `loading`, it shows a spinner and ignores clicks, but stays
 * focusable: `disabled` would throw keyboard focus back to the top of the page.
 *
 * @param {Partial<Pick<ButtonProps, "variant" | "size" | "loading">> & import("react").ComponentProps<"button">} props
 */
export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  onClick,
  className,
  children,
  ...props
}) {
  return (
    <button
      {...props}
      // Default to "button": a plain <button> inside a <form> is a submit
      // button, which surprises people. Pass type="submit" when you mean it.
      // While loading it's always "button", so the form can't submit twice.
      type={loading ? "button" : type}
      // Not passing the caller's handler is how clicks are ignored. No new
      // function is created here, so <Button> still works in Server Components.
      onClick={loading ? undefined : onClick}
      aria-disabled={loading || undefined}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      className={buttonVariants({ variant, size, className })}
    >
      {loading && (
        // Spins only when reduced motion is off; otherwise it's a still icon.
        <LoaderCircle aria-hidden="true" strokeWidth={1.5} className="motion-safe:animate-spin" />
      )}
      {children}
    </button>
  );
}
