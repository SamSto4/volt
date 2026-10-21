import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { installCommand, packagesFor } from "@/lib/install/guide.js";
import { manifests } from "@/registry";
import { ShowcaseCard } from "./showcase";

const accordion = /** @type {import("@/registry/schema").Manifest} */ (manifests.find((manifest) => manifest.name === "accordion"));
// The real command from the install guide, not a made-up one.
const COMMAND = installCommand("pnpm", packagesFor(accordion));

/**
 * A card that describes a component: what it is, tags, and how to install it.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function ComponentCard({ className } = {}) {
  return (
    <ShowcaseCard className={className} id="component-card" title="Component card" context="Catalog · Libraries">
      {/* Straight onto the card's inset: it used to sit in its own bordered
          box, which made three borders around one thing (card, inset, box). */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h4 className="type-heading-2">{accordion.title}</h4>
          <p className="type-small text-muted-foreground">{accordion.usage.whenToUse}</p>
        </div>
        <ul aria-label="Tags" className="flex flex-wrap gap-2">
          {["Layout", "Keyboard", "No ARIA to add"].map((tag) => (
            <li key={tag}>
              <Badge>{tag}</Badge>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border bg-card py-1 pr-1 pl-3">
          <code id="component-card-command" className="min-w-0 type-code break-words text-foreground">
            {COMMAND}
          </code>
          <CopyButton text={COMMAND} label="Copy install command" targetId="component-card-command" />
        </div>
        <Link href={`/components/${accordion.name}`} className="inline-flex min-h-10 w-fit items-center rounded-sm type-small text-primary underline underline-offset-4">
          Read the {accordion.title} guide
        </Link>
      </div>
    </ShowcaseCard>
  );
}
