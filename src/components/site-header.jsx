import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

/** The top bar on every page: product name, main navigation and theme toggle. */
export function SiteHeader() {
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border px-4">
      <div className="flex items-center gap-6">
        {/* No logo yet: the name in Playfair Display 700 (DESIGN.md §8). */}
        <Link href="/" className="rounded-sm font-display text-xl font-bold">
          Volt
        </Link>
        <nav aria-label="Main" className="flex items-center gap-4">
          <Link href="/components" className="rounded-sm type-small whitespace-nowrap text-muted-foreground hover:text-foreground">
            Components
          </Link>
          <Link href="/try" className="rounded-sm type-small whitespace-nowrap text-muted-foreground hover:text-foreground">
            Try it
          </Link>
          <Link href="/editor" className="rounded-sm type-small whitespace-nowrap text-muted-foreground hover:text-foreground">
            Editor
          </Link>
        </nav>
      </div>
      <ThemeToggle />
    </header>
  );
}
