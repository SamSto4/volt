"use client";

import { createContext, useContext, useId, useState } from "react";
import { cn } from "@/lib/utils";

/** @typedef {import("@/registry/tabs").TabsProps} TabsProps */

// The WAI-ARIA tabs pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/),
// built without a headless library so every part can be explained:
//   - roles tablist / tab / tabpanel, linked by ids
//   - roving tabindex: only the selected tab is in the Tab order
//   - arrows, Home and End move focus, and selection follows focus

/**
 * @typedef {object} TabsContextValue
 * @property {string} value  the selected tab's value
 * @property {(value: string) => void} select
 * @property {(value: string) => string} tabId
 * @property {(value: string) => string} panelId
 */

const TabsContext = createContext(/** @type {TabsContextValue | null} */ (null));

/** @returns {TabsContextValue} */
function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tabs parts must be used inside <Tabs>.");
  return context;
}

/**
 * Holds which tab is selected. Uncontrolled with `defaultValue`, or
 * controlled with `value` + `onValueChange`.
 *
 * @param {{
 *   defaultValue?: string,
 *   value?: string,
 *   onValueChange?: (value: string) => void,
 * } & Omit<import("react").ComponentProps<"div">, "defaultValue" | "onChange">} props
 */
export function Tabs({ defaultValue = "", value, onValueChange, className, ...props }) {
  const [ownValue, setOwnValue] = useState(defaultValue);
  // If the parent passes `value`, it's in charge; otherwise we keep our own.
  const selected = value ?? ownValue;
  const baseId = useId();
  // Values become part of an id, and ids can't contain spaces.
  /** @param {string} tabValue */
  const safe = (tabValue) => tabValue.replace(/\s+/g, "-");

  /** @type {TabsContextValue} */
  const context = {
    value: selected,
    select: (next) => {
      if (value === undefined) setOwnValue(next);
      onValueChange?.(next);
    },
    tabId: (tabValue) => `${baseId}-tab-${safe(tabValue)}`,
    panelId: (tabValue) => `${baseId}-panel-${safe(tabValue)}`,
  };

  return (
    <TabsContext value={context}>
      <div data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props} />
    </TabsContext>
  );
}

/**
 * The row of tabs. Give it an `aria-label` that says what the tabs choose
 * between. Handles the arrow, Home and End keys for the tabs inside it.
 *
 * @param {import("react").ComponentProps<"div">} props
 */
export function TabsList({ className, onKeyDown, ...props }) {
  /** @param {import("react").KeyboardEvent<HTMLDivElement>} event */
  function handleKeyDown(event) {
    onKeyDown?.(event);
    const tabs = /** @type {HTMLButtonElement[]} */ ([
      ...event.currentTarget.querySelectorAll('[role="tab"]'),
    ]);
    const current = tabs.indexOf(/** @type {HTMLButtonElement} */ (document.activeElement));
    if (current === -1) return;

    // Which tab each key moves to. The `% length` wraps past either end.
    /** @type {Record<string, number>} */
    const targets = {
      ArrowRight: (current + 1) % tabs.length,
      ArrowLeft: (current - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = targets[event.key];
    if (next === undefined) return;

    event.preventDefault(); // stop Home/End from scrolling the page
    tabs[next].focus();
    tabs[next].click(); // selection follows focus
  }

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      data-slot="tabs-list"
      onKeyDown={handleKeyDown}
      className={cn(
        // Volt segmented control: a pill track on `surface`.
        "inline-flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-background p-1",
        className,
      )}
      {...props}
    />
  );
}

/**
 * One tab.
 *
 * @param {{ value: string } & import("react").ComponentProps<"button">} props
 */
export function TabsTrigger({ value, className, onClick, ...props }) {
  const tabs = useTabs();
  const isSelected = tabs.value === value;

  return (
    <button
      type="button"
      role="tab"
      id={tabs.tabId(value)}
      aria-selected={isSelected}
      aria-controls={tabs.panelId(value)}
      // Roving tabindex: Tab lands on the selected tab only; arrows do the rest.
      tabIndex={isSelected ? 0 : -1}
      data-slot="tabs-trigger"
      data-state={isSelected ? "active" : "inactive"}
      onClick={(event) => {
        onClick?.(event);
        tabs.select(value);
      }}
      className={cn(
        "inline-flex h-8 shrink-0 max-sm:h-10 pointer-coarse:h-10 cursor-pointer items-center rounded-full border border-transparent px-4 type-small font-medium whitespace-nowrap text-muted-foreground transition-colors duration-100 hover:text-foreground",
        // The selected tab gets a raised fill *and* a line-strong border: the
        // fill alone is too close to the track to show state at 3:1.
        "data-[state=active]:border-input data-[state=active]:bg-card data-[state=active]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The panel for one tab. Hidden unless its tab is selected.
 *
 * @param {{ value: string } & import("react").ComponentProps<"div">} props
 */
export function TabsContent({ value, className, ...props }) {
  const tabs = useTabs();
  const isSelected = tabs.value === value;

  return (
    <div
      role="tabpanel"
      id={tabs.panelId(value)}
      aria-labelledby={tabs.tabId(value)}
      // Focusable so Tab can move from the tab into the panel even when the
      // panel has no links or buttons of its own.
      tabIndex={0}
      hidden={!isSelected}
      data-slot="tabs-content"
      // Fades in when it's shown (@starting-style runs as `hidden` lifts),
      // rising 4px only when motion is allowed (DESIGN.md §7, motion-base).
      className={cn(
        "rounded-md transition-[opacity,translate] duration-200 ease-out starting:opacity-0 motion-safe:starting:translate-y-1",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Tabs built from a list of items: what the editor renders for a Tabs block.
 * Each item's label doubles as its value.
 *
 * @param {Partial<TabsProps> & { className?: string }} props
 */
export function TabsBlock({ label = "", items = [], className }) {
  return (
    <Tabs defaultValue={items[0]?.label} className={className}>
      <TabsList aria-label={label}>
        {items.map((item) => (
          <TabsTrigger key={item.label} value={item.label}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.label} value={item.label}>
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
