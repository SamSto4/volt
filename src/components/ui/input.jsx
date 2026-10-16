"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** @typedef {import("@/registry/input").InputProps} InputProps */

/**
 * The bare text input, styled for Volt (DESIGN.md §10): 40px tall, 6px corners,
 * raised fill and a `line-strong` border. That border is 3:1 against the page,
 * which WCAG 1.4.11 requires for the edge of a control.
 * Prefer InputField, which adds the label, hint and error for you.
 *
 * @param {import("react").ComponentProps<"input">} props
 */
export function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-sm border border-input bg-card px-4 type-body text-foreground",
        "placeholder:text-muted-foreground",
        "aria-invalid:border-destructive",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A labeled text field: label, input, optional hint and optional error, all
 * linked so assistive technology reads them together.
 *
 * @param {Partial<Omit<InputProps, "type">> & { type?: InputProps["type"] } & Omit<import("react").ComponentProps<"input">, "type">} props
 */
export function InputField({ label, description, error, required, id, className, ...props }) {
  // useId gives each field its own ids, so two fields on one page never clash.
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  // aria-describedby takes a space-separated list of ids. filter(Boolean) drops the undefined ones.
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div data-slot="input-field" className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={inputId} className="type-small font-medium text-foreground">
        {label}
        {/* Sighted users see "(required)". Screen readers already hear "required"
            from the attribute below, so this copy is hidden from them. */}
        {required && <span aria-hidden="true" className="text-muted-foreground"> (required)</span>}
      </label>
      <Input
        id={inputId}
        required={required}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
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
