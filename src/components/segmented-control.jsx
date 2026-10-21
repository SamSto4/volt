"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Volt's segmented control (DESIGN.md §10): a pill track with one choice
 * selected. Built from native radio buttons, so arrow keys move between
 * options, Tab enters and leaves the group, and screen readers announce
 * "View, Code, radio button, 2 of 3" with no extra code.
 *
 * @template {string | number} T
 * @param {{
 *   label: string,
 *   options: { value: T, label: string }[],
 *   value: T,
 *   onChange: (value: T) => void,
 *   hideLabel?: boolean,
 *   className?: string,
 * }} props
 *   hideLabel: keep the group name for screen readers but don't show it
 */
export function SegmentedControl({ label, options, value, onChange, hideLabel = false, className }) {
  const name = useId();
  return (
    <fieldset className={cn("flex flex-col gap-1", className)}>
      <legend className={hideLabel ? "sr-only" : "mb-1 type-small font-medium"}>{label}</legend>
      <div className="inline-flex w-fit max-w-full flex-wrap gap-1 rounded-full border border-border bg-background p-1">
        {options.map((option) => (
          <label
            key={String(option.value)}
            className={cn(
              "inline-flex h-8 min-w-8 max-sm:h-10 pointer-coarse:h-10 cursor-pointer items-center justify-center rounded-full border border-transparent px-3 type-small whitespace-nowrap text-muted-foreground hover:text-foreground",
              // Same selected look as Tabs: a raised fill *and* a 3:1 border.
              "has-[:checked]:border-input has-[:checked]:bg-card has-[:checked]:text-foreground",
              // The radio itself is hidden, so its focus ring is drawn on the label.
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
            )}
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
