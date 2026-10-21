import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** @typedef {import("@/registry/button").ButtonProps} ButtonProps */

// Volt button styles (DESIGN.md §10). Plain objects instead of a variants
// library: easy to read, and tests can check that every style the manifest
// allows has classes here.

/** @type {Record<ButtonProps["variant"], string>} */
export const variantClasses = {
  // The only button that glows (DESIGN.md §5b): light on hover, and on press
  // the glow drops and the button settles 1px, as if pushed in. The settle is
  // movement, so it only happens when reduced motion is off. A loading
  // button doesn't glow: it isn't ready to be pressed.
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow active:bg-primary/80 active:shadow-none motion-safe:active:translate-y-px aria-disabled:hover:shadow-none",
  secondary: "border border-input bg-secondary text-secondary-foreground hover:bg-accent active:bg-accent",
  ghost: "bg-transparent text-foreground hover:bg-accent active:bg-accent",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
};

/** Each style's text color, for the loading spinner (the label goes transparent). */
/** @type {Record<ButtonProps["variant"], string>} */
const spinnerClasses = {
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  ghost: "text-foreground",
  danger: "text-destructive-foreground",
};

/** @type {Record<ButtonProps["size"], string>} */
export const sizeClasses = {
  // 32px, but 40px on phones and touch screens (DESIGN.md §13: targets for
  // thumbs). `pointer-coarse` is any device whose main pointer is a finger.
  sm: "h-8 type-small max-sm:h-10 pointer-coarse:h-10",
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
    // 20px icons. Hover and press are "fast" (100ms, DESIGN.md §7). Color and
    // glow changes are kept even with reduced motion; only movement is dropped.
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full px-4 font-medium whitespace-nowrap",
    "transition-[color,background-color,border-color,box-shadow,translate] duration-100 ease-out",
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
 * While `loading`, a spinner takes the label's place and clicks are ignored.
 * The label is still there, only transparent, so the button keeps its width
 * (nothing around it jumps) and its accessible name; aria-busy tells screen
 * readers it's working. It stays focusable: `disabled` would throw keyboard
 * focus back to the top of the page.
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
      aria-busy={loading || undefined}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      // text-transparent hides the label (and icons, which use currentColor)
      // but keeps them in the layout. cn() lets it win over the style's color.
      className={buttonVariants({ variant, size, className: cn(className, loading && "text-transparent hover:text-transparent") })}
    >
      {loading && (
        // Centered over the hidden label. Spins only when reduced motion is
        // off; otherwise it's a still icon.
        <LoaderCircle
          aria-hidden="true"
          strokeWidth={1.5}
          className={cn("absolute inset-0 m-auto motion-safe:animate-spin", spinnerClasses[variant])}
        />
      )}
      {children}
    </button>
  );
}
