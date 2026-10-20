"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * A multi-line text field with a visible label, an optional hint and an
 * error, linked the same way as InputField (htmlFor, aria-describedby,
 * aria-invalid). Volt input styling: radius-sm, raised fill, line-strong border.
 *
 * @param {{
 *   label: string,
 *   description?: string,
 *   error?: string,
 *   required?: boolean,
 *   className?: string,
 * } & import("react").ComponentProps<"textarea">} props
 */
export function TextareaField({ label, description, error, required, id, className, rows = 4, ...props }) {
  const generated = useId();
  const fieldId = id ?? generated;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div data-slot="textarea-field" className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={fieldId} className="type-small font-medium text-foreground">
        {label}
        {required && <span aria-hidden="true" className="text-muted-foreground"> (required)</span>}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        required={required}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(
          "w-full min-w-0 rounded-sm border border-input bg-card px-4 py-2 type-body text-foreground",
          "placeholder:text-muted-foreground aria-invalid:border-destructive",
          // Focus: primary border plus a soft halo next to the outline (DESIGN.md §10).
          // The same classes as Input; each field file stands alone when copied.
          "transition-[border-color,box-shadow] duration-100 ease-out",
          "focus-visible:shadow-focus focus-visible:not-aria-invalid:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        {...props}
      />
      {description && (
        <p id={descriptionId} className="type-small text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="type-small text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
