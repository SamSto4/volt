import { Badge } from "@/components/ui/badge";
import { DEMO_METRIC } from "./demo-data";
import { ShowcaseCard } from "./showcase";

/**
 * One number with its context. The change is the group's single lime
 * element: Volt allows one per region, as a fill with dark text.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function MetricCard({ className } = {}) {
  return (
    <ShowcaseCard className={className} id="metric" title="Metric card" context="Dashboards · Reports">
      <MetricContent />
    </ShowcaseCard>
  );
}

/** The metric itself, shared with the skeleton demo so the two are the same shape. */
export function MetricContent() {
  return (
    <div data-metric className="flex flex-col gap-2">
      <p className="type-small text-muted-foreground">{DEMO_METRIC.label}</p>
      {/* Read in order: label, number, change, comparison. */}
      <p className="flex flex-wrap items-center gap-2">
        <span className="type-heading-1">{DEMO_METRIC.value}</span>
        <Badge variant="highlight">{DEMO_METRIC.change}</Badge>
      </p>
      <p className="type-small text-muted-foreground">{DEMO_METRIC.context}</p>
    </div>
  );
}
