import { cn } from "@/lib/utils";

// Volt table: a real <table>, so screen readers can announce "row 2 of 4,
// Status column" and let people move by cell. Split into parts like
// shadcn's Table. Rows are divided by `line` hairlines; the header uses
// Volt's `label` style; a row lights up in the hover surface under the
// pointer. No zebra stripes, no shadows.
//
// It doesn't scroll sideways on its own: a scrolling box would need to be
// focusable for keyboard users. Keep tables to a few short columns, or show
// a list on small screens.

/** @param {import("react").ComponentProps<"table">} props */
export function Table({ className, ...props }) {
  return <table data-slot="table" className={cn("w-full border-collapse text-left type-small", className)} {...props} />;
}

/**
 * The table's visible title, read as its name. Every table should have one.
 * @param {import("react").ComponentProps<"caption">} props
 */
export function TableCaption({ className, ...props }) {
  return (
    <caption
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
