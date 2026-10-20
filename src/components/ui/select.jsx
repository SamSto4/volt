"use client";

import { ChevronDown } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * A labeled dropdown built on the native <select>. Native means it works with
 * every input method (keyboard, touch, screen readers, voice control) and
 * opens the platform's own picker on phones. Pass <option>s as children.
 *
 * @param {{
 *   label: string,
 *   description?: string,
 *   required?: boolean,
 *   className?: string,
 * } & import("react").ComponentProps<"select">} props
 */
export function SelectField({ label, description, required, id, className, children, ...props }) {
  const generated = useId();
  const selectId = id ?? generated;
  const descriptionId = description ? `${selectId}-description` : undefined;

  return (
    <div data-slot="select-field" className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={selectId} className="type-small font-medium text-foreground">
        {label}
        {required && <span aria-hidden="true" className="text-muted-foreground"> (required)</span>}
      </label>
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-describedby={descriptionId}
          // appearance-none hides the browser's arrow so Volt's chevron can be drawn instead.
          className={cn(
            "h-10 w-full min-w-0 cursor-pointer appearance-none rounded-sm border border-input bg-card pr-10 pl-4 type-body text-foreground",
            // Focus: primary border plus a soft halo next to the outline (DESIGN.md §10).
            // The same classes as Input; each field file stands alone when copied.
            "transition-[border-color,box-shadow] duration-100 ease-out",
            "focus-visible:shadow-focus focus-visible:not-aria-invalid:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          size={20}
          strokeWidth={1.5}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
        />
      </div>
      {description && (
        <p id={descriptionId} className="type-small text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
