"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId } from "react";
import { SegmentedControl } from "@/components/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fieldsFor } from "./fields.js";

// Editor-chrome styles (DESIGN.md §3/§4): `small` text, `label` headers, and
// the dense 4px/12px steps allowed in the editor.
const controlClass =
  "w-full min-w-0 rounded-sm border border-input bg-card px-3 type-small text-foreground aria-invalid:border-destructive";

/** Friendly option labels: "sm" -> "Small", "primary" -> "Primary", 3 -> "3". */
const OPTION_LABELS = /** @type {Record<string, string>} */ ({ sm: "Small", md: "Medium", lg: "Large" });
/** @param {string | number} value */
function optionLabel(value) {
  if (typeof value === "number") return String(value);
  return OPTION_LABELS[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Props form generated from a manifest's schema. It edits a *draft*: the
 * parent validates it (see fields.js `validate`) and passes back `errors`.
 *
 * @param {{
 *   manifest: { props: import("zod").ZodObject },
 *   draft: Record<string, any>,
 *   errors: Record<string, string>,
 *   onChange: (name: string, value: unknown) => void,
 * }} props
 */
export function Inspector({ manifest, draft, errors, onChange }) {
  return (
    <div data-slot="inspector" className="flex flex-col gap-4">
      {fieldsFor(manifest).map((field) => {
        const value = draft[field.name];
        if (field.kind === "text") {
          return (
            <TextControl
              key={field.name}
              field={field}
              value={value ?? ""}
              error={errors[field.name]}
              onChange={(next) => onChange(field.name, next)}
            />
          );
        }
        if (field.kind === "choice") {
          return (
            <ChoiceControl
              key={field.name}
              field={field}
              value={value}
              error={errors[field.name]}
              onChange={(next) => onChange(field.name, next)}
            />
          );
        }
        if (field.kind === "toggle") {
          return (
            <ToggleControl key={field.name} field={field} checked={Boolean(value)} onChange={(next) => onChange(field.name, next)} />
          );
        }
        return (
          <ListControl
            key={field.name}
            field={field}
            items={Array.isArray(value) ? value : []}
            errors={errors}
            onChange={(next) => onChange(field.name, next)}
          />
        );
      })}
    </div>
  );
}

/**
 * A labeled text input, or a text area for long text, with its error linked.
 *
 * @param {{ field: import("./fields.js").TextField, value: string, error?: string, onChange: (value: string) => void, label?: string }} props
 */
function TextControl({ field, value, error, onChange, label = field.label }) {
  const id = useId();
  const errorId = `${id}-error`;
  // Long text (descriptions, panel text) gets room to wrap.
  const multiline = (field.maxLength ?? 0) > 120;
  const shared = {
    id,
    value,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    onChange: (/** @type {{ target: { value: string } }} */ event) => onChange(event.target.value),
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="type-small font-medium">
        {label}
      </label>
      {multiline ? (
        <textarea {...shared} rows={3} className={cn(controlClass, "py-2")} />
      ) : (
        <input {...shared} type="text" className={cn(controlClass, "h-8")} />
      )}
      {error && (
        <p id={errorId} className="type-small text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * A segmented control (up to four options) or a select (more than four).
 * Segments are native radio buttons, so arrow keys, Tab and screen-reader
 * announcements ("Style, Primary, radio button, 1 of 4") come from the browser.
 *
 * @param {{ field: import("./fields.js").ChoiceField, value: string | number, error?: string, onChange: (value: string | number) => void }} props
 */
function ChoiceControl({ field, value, error, onChange }) {
  const id = useId();

  if (field.options.length > 4) {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="type-small font-medium">
          {field.label}
        </label>
        <select
          id={id}
          // Options can be numbers; the select only knows strings, so the
          // index is the value and it's mapped back on change.
          value={String(field.options.indexOf(value))}
          onChange={(event) => onChange(field.options[Number(event.target.value)])}
          className={cn(controlClass, "h-8")}
        >
          {field.options.map((option, index) => (
            <option key={String(option)} value={String(index)}>
              {optionLabel(option)}
            </option>
          ))}
        </select>
        {error && <p className="type-small text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <SegmentedControl
      label={field.label}
      options={field.options.map((option) => ({ value: option, label: optionLabel(option) }))}
      value={value}
      onChange={onChange}
    />
  );
}

/**
 * @param {{ field: import("./fields.js").ToggleField, checked: boolean, onChange: (value: boolean) => void }} props
 */
function ToggleControl({ field, checked, onChange }) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 shrink-0 cursor-pointer accent-primary"
      />
      <label htmlFor={id} className="cursor-pointer type-small font-medium">
        {field.label}
      </label>
    </div>
  );
}

/**
 * Edits a list of items (like Tabs or Accordion items): each item's text
 * fields, plus Add and Remove within the manifest's limits.
 *
 * @param {{ field: import("./fields.js").ListField, items: Record<string, string>[], errors: Record<string, string>, onChange: (items: Record<string, string>[]) => void }} props
 */
function ListControl({ field, items, errors, onChange }) {
  const [first] = field.itemFields;

  function addItem() {
    // A label that isn't used yet ("Item 3"), so unique-label rules still pass.
    let number = items.length + 1;
    while (items.some((item) => item[first.name] === `Item ${number}`)) number += 1;
    /** @type {Record<string, string>} */
    const item = {};
    for (const itemField of field.itemFields) {
      item[itemField.name] = itemField === first ? `Item ${number}` : "Write something here.";
    }
    onChange([...items, item]);
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 type-label text-muted-foreground">{field.label}</legend>
      {items.map((item, index) => (
        <fieldset key={index} className="flex flex-col gap-2 rounded-md border border-border p-3">
          <legend className="px-1 type-small font-medium">Item {index + 1}</legend>
          {field.itemFields.map((itemField) => (
            <TextControl
              key={itemField.name}
              field={itemField}
              value={item[itemField.name] ?? ""}
              error={errors[`${field.name}.${index}.${itemField.name}`]}
              // Replace one item without changing the others (immutable update).
              onChange={(next) =>
                onChange(items.map((current, i) => (i === index ? { ...current, [itemField.name]: next } : current)))
              }
            />
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            disabled={items.length <= field.minItems}
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            <Trash2 aria-hidden="true" strokeWidth={1.5} />
            Remove item {index + 1}
          </Button>
        </fieldset>
      ))}
      {errors[field.name] && <p className="type-small text-destructive">{errors[field.name]}</p>}
      <Button variant="secondary" size="sm" className="self-start" disabled={items.length >= field.maxItems} onClick={addItem}>
        <Plus aria-hidden="true" strokeWidth={1.5} />
        Add item
      </Button>
    </fieldset>
  );
}
