"use client";

import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Volt table: a real <table>, so screen readers can announce "row 2 of 4,
// Status column" and let people move by cell. Split into parts like
// shadcn's Table. Rows are divided by `line` hairlines; the header uses
// Volt's `label` style; a row lights up in the hover surface under the
// pointer. No zebra stripes, no shadows.
//
// On a narrow screen a table can be wider than its space, so it sits in a
// box that scrolls sideways. Only while it actually overflows, that box is
// a focusable region named by the caption, so keyboard users can scroll it
// with the arrow keys (WCAG 2.1.1). When it fits, it's no extra Tab stop.

/** The caption's id, so the scrolling box can be named by it. */
const CaptionIdContext = createContext("");

/** @param {import("react").ComponentProps<"table">} props */
export function Table({ className, ...props }) {
  const captionId = useId();
  const box = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [overflows, setOverflows] = useState(false);

  // Check whether the table is wider than its box, now and whenever either resizes.
  useEffect(() => {
    const element = box.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const check = () => setOverflows(element.scrollWidth > element.clientWidth);
    const observer = new ResizeObserver(check);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    check();
    return () => observer.disconnect();
  }, []);

  return (
    <CaptionIdContext value={captionId}>
      <div
        ref={box}
        data-slot="table-container"
        {...(overflows ? { role: "region", "aria-labelledby": captionId, tabIndex: 0 } : {})}
        className="w-full overflow-x-auto rounded-sm"
      >
        <table data-slot="table" className={cn("w-full border-collapse text-left type-small", className)} {...props} />
      </div>
    </CaptionIdContext>
  );
}

/**
 * The table's visible title, read as its name. Every table should have one.
 * @param {import("react").ComponentProps<"caption">} props
 */
export function TableCaption({ className, ...props }) {
  const id = useContext(CaptionIdContext);
  return (
    <caption
      id={id || undefined}
      data-slot="table-caption"
      className={cn("caption-top pb-2 text-left type-small font-medium text-foreground", className)}
      {...props}
    />
  );
}

/** @param {import("react").ComponentProps<"thead">} props */
export function TableHeader({ className, ...props }) {
  return <thead data-slot="table-header" className={cn("border-b border-border", className)} {...props} />;
}

/** @param {import("react").ComponentProps<"tbody">} props */
export function TableBody({ className, ...props }) {
  return <tbody data-slot="table-body" className={cn("[&>tr:last-child]:border-b-0", className)} {...props} />;
}

/** @param {import("react").ComponentProps<"tr">} props */
export function TableRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      // Only body rows react; the header row doesn't (see TableHeader's selector).
      className={cn("border-b border-border transition-colors duration-100 [tbody>&]:hover:bg-accent", className)}
      {...props}
    />
  );
}

/**
 * A header cell. In the header it labels a column (scope="col", the
 * default); as a row's first cell, pass scope="row" so it labels the row.
 *
 * @param {import("react").ComponentProps<"th">} props
 */
export function TableHead({ scope = "col", className, ...props }) {
  return (
    <th
      data-slot="table-head"
      scope={scope}
      className={cn(
        "px-4 py-2 align-top",
        // Column headers use the eyebrow style; row headers read like body text.
        scope === "col" ? "type-label text-muted-foreground" : "font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** @param {import("react").ComponentProps<"td">} props */
export function TableCell({ className, ...props }) {
  return <td data-slot="table-cell" className={cn("px-4 py-2 align-top text-muted-foreground", className)} {...props} />;
}
