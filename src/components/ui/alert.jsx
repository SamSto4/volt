import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** @typedef {import("@/registry/alert").AlertProps} AlertProps */

// Each tone has a different icon *shape* and a spoken label, so the meaning
// never depends on color alone (DESIGN.md §2). Color is only on the icon:
// Volt keeps success and danger for status, and never uses a colored edge.
/** @type {Record<AlertProps["tone"], { icon: typeof Info, iconClass: string, label: string }>} */
export const tones = {
  info: { icon: Info, iconClass: "text-muted-foreground", label: "Note" },
  success: { icon: CircleCheck, iconClass: "text-success", label: "Success" },
  danger: { icon: CircleAlert, iconClass: "text-destructive", label: "Error" },
};

/**
 * A Volt alert: icon, then title and description. Static by default; with
 * `announce`, it becomes a live region so screen readers speak it when shown.
 *
 * @param {Partial<Pick<AlertProps, "tone" | "announce">> & import("react").ComponentProps<"div">} props
 */
export function Alert({ tone = "info", announce = false, className, children, ...props }) {
  const { icon: Icon, iconClass, label } = tones[tone];
  // role=alert interrupts whatever the screen reader is saying, so it's only
  // for problems. Everything else waits its turn with role=status.
  const role = announce ? (tone === "danger" ? "alert" : "status") : undefined;

  return (
    <div
      role={role}
      data-slot="alert"
      data-tone={tone}
      className={cn("flex gap-4 rounded-md border border-border bg-card p-4 text-card-foreground", className)}
      {...props}
    >
      <Icon aria-hidden="true" size={20} strokeWidth={1.5} className={cn("mt-0.5 shrink-0", iconClass)} />
      <div className="flex min-w-0 flex-col gap-1">
        {/* sr-only: invisible on screen but read aloud, e.g. "Error: Couldn't save". */}
        <span className="sr-only">{label}: </span>
        {children}
      </div>
    </div>
  );
}

/** @param {import("react").ComponentProps<"p">} props */
export function AlertTitle({ className, ...props }) {
  return <p data-slot="alert-title" className={cn("font-semibold", className)} {...props} />;
}

/** @param {import("react").ComponentProps<"p">} props */
export function AlertDescription({ className, ...props }) {
  return (
    <p data-slot="alert-description" className={cn("type-small text-muted-foreground", className)} {...props} />
  );
}
