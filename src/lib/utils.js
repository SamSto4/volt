import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins class names, dropping falsy ones, and resolves Tailwind conflicts so
 * the last one wins: `cn("px-4", "px-6")` gives `"px-6"`. This is what lets a
 * caller's `className` override a component's defaults. Same helper as shadcn's.
 *
 * @param {...import("clsx").ClassValue} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
