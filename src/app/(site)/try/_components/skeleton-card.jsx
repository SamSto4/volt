"use client";

import { RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { MetricContent } from "./metric-card";
import { ShowcaseCard } from "./showcase";

const LOAD_MS = 1800;

/**
 * The metric card while it loads: placeholders in the same places as the
 * real label, number and comparison, so nothing jumps when it arrives.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function SkeletonCard({ className } = {}) {
  const [loading, setLoading] = useState(true);
  const timer = useRef(/** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined));

  const reload = () => {
    clearTimeout(timer.current);
    setLoading(true);
    // Nothing is fetched: this only shows the loading state for a moment.
    timer.current = setTimeout(() => setLoading(false), LOAD_MS);
  };

  // Start "loaded" after a moment on first view, too.
  useEffect(() => {
    timer.current = setTimeout(() => setLoading(false), LOAD_MS);
    return () => clearTimeout(timer.current);
  }, []);

  return (
    <ShowcaseCard
      className={className}
      id="skeleton"
      title="Loading skeleton"
      context="Dashboards · Slow data"
      note="It pulses only when your system allows motion; otherwise it stays still."
    >
      {/* Same height either way, so the card doesn't jump. A live region
          that stays on the page: it says "Loading…" when the skeleton
          appears, then reads the numbers when they arrive. aria-busy asks
          screen readers to wait for the finished content. */}
      <div aria-live="polite" aria-busy={loading} className="min-h-28">
        {loading ? (
          // Each row is a box the size of the line it stands in for (small text
          // is 20px; the number's line is 34px, 42px from 640px), with a shorter
          // bar centered in it. Same gaps as MetricContent, so every block lands
          // exactly where the real one will: nothing jumps when the numbers arrive.
          <SkeletonGroup label="Loading this week's numbers">
            <div data-skeleton-row className="flex h-5 items-center">
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div data-skeleton-row className="flex h-8.5 items-center sm:h-10.5">
              <Skeleton className="h-6 w-1/2 sm:h-7" />
            </div>
            <div data-skeleton-row className="flex h-5 items-center">
              <Skeleton className="h-3 w-1/2" />
            </div>
          </SkeletonGroup>
        ) : (
          <MetricContent />
        )}
      </div>
      {/* Not disabled while loading: a disabled button drops keyboard focus. */}
      <Button variant="secondary" size="sm" className="w-fit" onClick={reload}>
        <RotateCw aria-hidden="true" strokeWidth={1.5} />
        Load again
      </Button>
    </ShowcaseCard>
  );
}
