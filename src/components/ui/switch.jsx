"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * An on/off switch with a visible label (WAI-ARIA switch pattern). It's a
 * native <button>, so Tab, Space and Enter work without extra code, with
 * role="switch" and aria-checked so screen readers say "on" or "off".
 *
 * Uncontrolled with `defaultChecked`, or controlled with `checked` +
 * `onCheckedChange`.
 *
 * @param {{
 *   label: string,
 *   description?: string,
 *   defaultChecked?: boolean,
 *   checked?: boolean,
 *   onCheckedChange?: (checked: boolean) => void,
 *   disabled?: boolean,
 *   className?: string,
 * }} props
 */
export function Switch({ label, description, defaultChecked = false, checked, onCheckedChange, disabled = false, className }) {
  const id = useId();
  const [own, setOwn] = useState(defaultChecked);
  const on = checked ?? own;

  return (
    <div data-slot="switch-field" className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex flex-col gap-1">
        <span id={`${id}-label`} className="type-small font-medium">
          {label}
        </span>
        {description && (
          <span id={`${id}-description`} className="type-small text-muted-foreground">
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled}
        data-state={on ? "on" : "off"}
        onClick={() => {
          if (checked === undefined) setOwn(!on);
          onCheckedChange?.(!on);
        }}
        className={cn(
          // 24×44px pill. Off uses line-strong (3:1 against the surface, WCAG
          // 1.4.11); on uses primary.
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-100",
          // The pill stays 24px, but the tap area grows to 40px: an invisible
          // 8px strip above and below (a pseudo-element counts as the button).
          "before:absolute before:inset-x-0 before:-inset-y-2 before:content-['']",
          on ? "bg-primary" : "bg-input",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-5 rounded-full bg-card",
            // The thumb slides only when reduced motion is off; otherwise it jumps.
            "motion-safe:transition-transform motion-safe:duration-100",
            on ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}
