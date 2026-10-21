"use client";

import { createContext, useContext, useId } from "react";
import { cn } from "@/lib/utils";

// A set of options where exactly one can be chosen. Built on native radio
// buttons that share a `name`, so the browser does the keyboard work: Tab
// goes to the chosen option (or the first), arrow keys move and choose, and
// forms submit the chosen value. The group is a <fieldset> whose <legend> is
// its visible name.

/**
 * @typedef {object} RadioGroupContextValue
 * @property {string} name
 * @property {string} [value]          set when the group is controlled
 * @property {string} [defaultValue]
 * @property {(value: string) => void} [onValueChange]
 * @property {boolean} [required]
 */

const RadioGroupContext = createContext(/** @type {RadioGroupContextValue | null} */ (null));

/** @returns {RadioGroupContextValue} */
function useRadioGroup() {
  const context = useContext(RadioGroupContext);
  if (!context) throw new Error("RadioGroupItem must be used inside <RadioGroup>.");
  return context;
}

/**
 * Uncontrolled with `defaultValue`, or controlled with `value` + `onValueChange`.
 *
 * @param {{
 *   label: string,
 *   description?: string,
 *   name?: string,
 *   defaultValue?: string,
 *   value?: string,
 *   onValueChange?: (value: string) => void,
 *   required?: boolean,
 *   disabled?: boolean,
 *   className?: string,
 *   children: import("react").ReactNode,
 * }} props
 *   name: the form field name; one is generated if you don't need it
 */
export function RadioGroup({ label, description, name, defaultValue, value, onValueChange, required, disabled, className, children }) {
  const generated = useId();
  const descriptionId = description ? `${generated}-description` : undefined;

  return (
    <RadioGroupContext value={{ name: name ?? generated, value, defaultValue, onValueChange, required }}>
      {/* role="radiogroup" makes screen readers say "radio group" rather
          than just "group". `disabled` on a fieldset disables every radio in it. */}
      <fieldset
        role="radiogroup"
        aria-describedby={descriptionId}
        aria-required={required || undefined}
        disabled={disabled}
        data-slot="radio-group"
        className={cn("flex flex-col gap-1 disabled:opacity-50", className)}
      >
        <legend className="mb-1 type-small font-medium text-foreground">
          {label}
          {/* Screen readers hear "required" from the attribute; this copy is for sight. */}
          {required && <span aria-hidden="true" className="text-muted-foreground"> (required)</span>}
        </legend>
        {description && (
          <p id={descriptionId} className="-mt-2 type-small text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </fieldset>
    </RadioGroupContext>
  );
}

/**
 * One option. Its label is its accessible name; the optional description is
 * linked with aria-describedby.
 *
 * @param {{
 *   value: string,
 *   label: string,
 *   description?: string,
 *   className?: string,
 * } & Omit<import("react").ComponentProps<"input">, "type" | "name" | "value">} props
 */
export function RadioGroupItem({ value, label, description, id, className, ...props }) {
  const group = useRadioGroup();
  const generated = useId();
  const inputId = id ?? generated;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const controlled = group.value !== undefined;

  return (
    <div data-slot="radio-group-item" className={cn("flex items-start gap-3", className)}>
      <input
        id={inputId}
        type="radio"
        name={group.name}
        value={value}
        required={group.required}
        aria-describedby={descriptionId}
        // Controlled: the group decides. Uncontrolled: the browser does,
        // starting from defaultValue.
        {...(controlled
          ? { checked: group.value === value, onChange: () => group.onValueChange?.(value) }
          : { defaultChecked: group.defaultValue === value })}
        // Same as Checkbox: the browser's own control, tinted Volt primary,
        // so high-contrast and forced-colors modes keep working.
        className="mt-2 size-6 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
        {...props}
      />
      <div className="flex flex-col">
        {/* A 40px-tall tap target, with the 24px circle centered on its first line. */}
        <label htmlFor={inputId} className="flex min-h-10 cursor-pointer items-center type-small font-medium">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="-mt-2 pb-2 type-small text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
