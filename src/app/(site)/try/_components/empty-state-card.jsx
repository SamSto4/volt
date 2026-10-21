import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ShowcaseCard } from "./showcase";

/**
 * What a list shows before it has anything in it.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function EmptyStateCard({ className } = {}) {
  return (
    <ShowcaseCard className={className} id="empty-state" title="Empty state" context="Dashboards · First run">
      <EmptyState
        title="No saved pages yet"
        description="Pages you save show up here, so you can pick up where you left off."
        level={4}
        className="bg-card"
      >
        {/* A link styled as a button: it goes somewhere rather than doing something. */}
        <Link href="/editor" className={buttonVariants({ variant: "secondary" })}>
          Start a new page
        </Link>
      </EmptyState>
    </ShowcaseCard>
  );
}
