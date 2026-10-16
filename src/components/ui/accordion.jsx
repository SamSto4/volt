"use client";

import { ChevronDown } from "lucide-react";
import { createContext, useContext, useId, useState } from "react";
import { cn } from "@/lib/utils";

/** @typedef {import("@/registry/accordion").AccordionProps} AccordionProps */

// The WAI-ARIA accordion pattern (https://www.w3.org/WAI/ARIA/apg/patterns/accordion/):
// each header is a heading that contains a button. The button says whether
// its panel is open (aria-expanded) and which panel it controls.

/**
 * @typedef {object} AccordionContextValue
 * @property {string[]} open  values of the open items
 * @property {(value: string) => void} toggle
 */

/**
 * @typedef {object} ItemContextValue
 * @property {string} value
 * @property {boolean} isOpen
 * @property {string} triggerId
 * @property {string} panelId
 */

const AccordionContext = createContext(/** @type {AccordionContextValue | null} */ (null));
const ItemContext = createContext(/** @type {ItemContextValue | null} */ (null));

/**
 * @template T
 * @param {import("react").Context<T | null>} context
 * @param {string} part
 * @returns {T}
 */
function useRequired(context, part) {
  const value = useContext(context);
  if (!value) throw new Error(`${part} must be used inside <Accordion>.`);
  return value;
}

/**
 * Holds which items are open. In single mode, opening one closes the others;
 * clicking an open item closes it either way.
 *
 * @param {{ allowMultiple?: boolean, defaultOpen?: string[] } & import("react").ComponentProps<"div">} props
 */
export function Accordion({ allowMultiple = false, defaultOpen = [], className, onKeyDown, ...props }) {
  const [open, setOpen] = useState(defaultOpen);

  /** @param {string} value */
  function toggle(value) {
    // Functional update: compute the new list from the current one, never
    // by changing the old array in place.
    setOpen((current) => {
      if (current.includes(value)) return current.filter((v) => v !== value);
      return allowMultiple ? [...current, value] : [value];
    });
  }

  /** @param {import("react").KeyboardEvent<HTMLDivElement>} event */
  function handleKeyDown(event) {
    onKeyDown?.(event);
    // Only this accordion's own headers, not ones nested in a panel.
    const triggers = /** @type {HTMLButtonElement[]} */ ([
      ...event.currentTarget.querySelectorAll(':scope > [data-slot="accordion-item"] [data-slot="accordion-trigger"]'),
    ]);
    const current = triggers.indexOf(/** @type {HTMLButtonElement} */ (document.activeElement));
    if (current === -1) return;

    /** @type {Record<string, number>} */
    const targets = {
      ArrowDown: (current + 1) % triggers.length,
      ArrowUp: (current - 1 + triggers.length) % triggers.length,
      Home: 0,
      End: triggers.length - 1,
    };
    const next = targets[event.key];
    if (next === undefined) return;
    event.preventDefault(); // keep arrows and Home/End from scrolling the page
    triggers[next].focus(); // focus only: unlike tabs, moving doesn't open anything
  }

  return (
    <AccordionContext value={{ open, toggle }}>
      <div
        data-slot="accordion"
        onKeyDown={handleKeyDown}
        className={cn("flex flex-col", className)}
        {...props}
      />
    </AccordionContext>
  );
}

/**
 * @param {{ value: string } & import("react").ComponentProps<"div">} props
 */
export function AccordionItem({ value, className, ...props }) {
  const { open } = useRequired(AccordionContext, "AccordionItem");
  const baseId = useId();
  const isOpen = open.includes(value);

  return (
    <ItemContext
      value={{ value, isOpen, triggerId: `${baseId}-trigger`, panelId: `${baseId}-panel` }}
    >
      <div
        data-slot="accordion-item"
        data-state={isOpen ? "open" : "closed"}
        className={cn("border-b border-border", className)}
        {...props}
      />
    </ItemContext>
  );
}

/**
 * The header: a real heading (h2–h4) wrapping a button.
 *
 * @param {{ level?: AccordionProps["headingLevel"] } & import("react").ComponentProps<"button">} props
 */
export function AccordionTrigger({ level = 3, className, children, onClick, ...props }) {
  const { toggle } = useRequired(AccordionContext, "AccordionTrigger");
  const item = useRequired(ItemContext, "AccordionTrigger");
  const Heading = /** @type {"h2" | "h3" | "h4"} */ (`h${level}`);

  return (
    <Heading className="flex">
      <button
        type="button"
        id={item.triggerId}
        aria-expanded={item.isOpen}
        aria-controls={item.panelId}
        data-slot="accordion-trigger"
        onClick={(event) => {
          onClick?.(event);
          toggle(item.value);
        }}
        className={cn(
          "flex flex-1 cursor-pointer items-center justify-between gap-4 py-4 text-left type-body font-medium text-foreground",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          aria-hidden="true"
          size={20}
          strokeWidth={1.5}
          className={cn(
            "shrink-0 text-muted-foreground",
            item.isOpen && "rotate-180",
            // The turn is animated only when reduced motion is off (DESIGN.md §7).
            "motion-safe:transition-transform motion-safe:duration-200",
          )}
        />
      </button>
    </Heading>
  );
}

/** @param {import("react").ComponentProps<"div">} props */
export function AccordionContent({ className, ...props }) {
  const item = useRequired(ItemContext, "AccordionContent");

  return (
    <div
      role="region"
      id={item.panelId}
      aria-labelledby={item.triggerId}
      hidden={!item.isOpen}
      data-slot="accordion-content"
      className={cn("pb-4 text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * An accordion built from a list of items: what the editor renders for an
 * Accordion block. Each item's title doubles as its value.
 *
 * @param {Partial<AccordionProps> & { className?: string }} props
 */
export function AccordionBlock({ items = [], headingLevel = 3, allowMultiple = false, className }) {
  return (
    <Accordion allowMultiple={allowMultiple} className={className}>
      {items.map((item) => (
        <AccordionItem key={item.title} value={item.title}>
          <AccordionTrigger level={headingLevel}>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
