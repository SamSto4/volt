"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * A labeled checkbox. It's a native <input type="checkbox">, so Space
 * toggles it, forms submit it, and clicking the label works. The box uses
 * Volt's primary color for the check (accent-color), which keeps the
 * browser's own high-contrast and forced-colors handling.
 *
 * @param {{
 *   label: string,
 *   description?: string,
 *   required?: boolean,
 *   className?: string,
 * } & Omit<import("react").ComponentProps<"input">, "type">} props
 */
export function Checkbox({ label, description, required, className, id, ...props }) {
  const generated = useId();
  const inputId = id ?? generated;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <div data-slot="checkbox-field" className={cn("flex items-start gap-3", className)}>
      <input
        id={inputId}
        type="checkbox"
        required={required}
        aria-describedby={descriptionId}
        className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="cursor-pointer type-small font-medium">
          {label}
          {/* Screen readers hear "required" from the attribute; this copy is for sight. */}
          {required && <span aria-hidden="true" className="text-muted-foreground"> (required)</span>}
        </label>
        {description && (
          <p id={descriptionId} className="type-small text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
