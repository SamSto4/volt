import { FileText, Inbox, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** @typedef {import("@/registry/empty-state").EmptyStateProps} EmptyStateProps */

/** The icons an empty state can show, by name (so generated code passes a plain string). */
const icons = { file: FileText, inbox: Inbox, search: Search };

/**
 * What a list, table or page shows when there's nothing in it yet: what
 * would be here, and the one thing to do about it. Pass that action (one
 * Button) as children.
 *
 * Volt (DESIGN.md §11 empty slot): a dashed `line-strong` border, `radius-md`,
 * centered text. The title is a real heading whose level follows the page
 * outline, like Card's.
 *
 * @param {{
 *   title: string,
 *   description?: string,
 *   icon?: EmptyStateProps["icon"],
 *   level?: EmptyStateProps["headingLevel"],
 *   className?: string,
 *   children?: import("react").ReactNode,
 * }} props
 */
export function EmptyState({ title, description, icon = "file", level = 3, className, children }) {
  const Icon = icons[icon];
  // A tag name stored in a variable works as a JSX element: <Heading> renders <h2>, <h3> or <h4>.
  const Heading = /** @type {"h2" | "h3" | "h4"} */ (`h${level}`);
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center gap-4 rounded-md border border-dashed border-input p-6 text-center",
        className,
      )}
    >
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-accent text-muted-foreground">
        <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-2">
        <Heading className="type-heading-2">{title}</Heading>
        {description && <p className="max-w-prose type-small text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
