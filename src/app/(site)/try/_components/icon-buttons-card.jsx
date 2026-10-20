"use client";

import { Copy, Link2, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { ShowcaseCard } from "./showcase";

const SAVE_MS = 1600;

/**
 * Icon-only buttons (named by their tooltips) and a button that loads.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function IconButtonsCard({ className } = {}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef(/** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined));
  useEffect(() => () => clearTimeout(timer.current), []);

  function save() {
    setSaved(false);
    setSaving(true);
    // Nothing is really saved: this only shows the loading state for a moment.
    timer.current = setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, SAVE_MS);
  }

  return (
    <ShowcaseCard
      className={className}
      id="icon-buttons"
      title="Icon buttons and loading"
      context="Actions · Toolbars"
      note="Tab to an icon to read its name. The save button keeps its width while it works."
    >
      <div className="flex flex-wrap items-center gap-1">
        {[
          { label: "Copy link", Icon: Link2 },
          { label: "Duplicate", Icon: Copy },
          { label: "Page settings", Icon: Settings2 },
        ].map(({ label, Icon }) => (
          // kind="label": the tooltip *is* the button's name (aria-labelledby).
          <Tooltip key={label} content={label} kind="label">
            <Button variant="ghost" className="w-10 px-0">
              <Icon aria-hidden="true" strokeWidth={1.5} />
            </Button>
          </Tooltip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="secondary" loading={saving} onClick={save}>
          Save changes
        </Button>
        {/* Said once when saving finishes; the button itself says "busy" while it works. */}
        <p role="status" className="type-small text-muted-foreground">
          {saved ? "Saved." : ""}
        </p>
      </div>
    </ShowcaseCard>
  );
}
