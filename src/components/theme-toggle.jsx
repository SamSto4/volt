"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Switches between light and dark.
 *
 * The server can't know the user's theme, so instead of reading it in
 * JavaScript (and rendering the wrong label for a moment), both labels are
 * rendered and CSS shows the right one via the `dark:` variant. Elements
 * hidden with `display: none` are also left out of the accessible name, so
 * screen readers hear only the visible label.
 *
 * Under 640px the label is visually hidden (still read by screen readers)
 * so the header fits a phone; the button grows to a 40px touch target.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full type-small text-foreground hover:bg-accent sm:h-8 sm:w-auto sm:px-4"
    >
      <Moon aria-hidden="true" size={20} strokeWidth={1.5} className="dark:hidden" />
      <Sun aria-hidden="true" size={20} strokeWidth={1.5} className="hidden dark:block" />
      <span className="max-sm:sr-only dark:hidden">Use dark theme</span>
      <span className="hidden max-sm:sr-only dark:inline">Use light theme</span>
    </button>
  );
}
