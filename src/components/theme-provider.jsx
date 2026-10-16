"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Wraps the app in next-themes with Volt's settings (DESIGN.md §6):
 * the `class` strategy (adds `dark` to <html>) and the OS setting as default.
 *
 * @param {{ children: import("react").ReactNode }} props
 */
export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // Without this, every element's color transition would run at once on
      // switch, which looks like a flicker.
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
