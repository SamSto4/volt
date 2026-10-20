"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/segmented-control";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InputField } from "@/components/ui/input";
import { ShowcaseCard, Specimen } from "./showcase";

/**
 * The states side by side. Hover and focus aren't frozen copies: point at
 * or Tab to any of these to see them for real.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function StatesCard({ className } = {}) {
  const [align, setAlign] = useState("left");
  return (
    <ShowcaseCard
      className={className}
      id="states"
      title="Every state, side by side"
      context="Reference · All components"
      note="Hover and focus are live here: point at anything, or press Tab."
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end gap-6">
          <Specimen caption="Default">
            <Button variant="secondary">Preview</Button>
          </Specimen>
          <Specimen caption="Disabled">
            <Button variant="secondary" disabled>
              Preview
            </Button>
          </Specimen>
          <Specimen caption="Loading">
            <Button variant="secondary" loading>
              Preview
            </Button>
          </Specimen>
          <Specimen caption="Selected">
            <SegmentedControl
              label="Text alignment"
              hideLabel
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
              ]}
              value={align}
              onChange={setAlign}
            />
          </Specimen>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InputField label="Default field" placeholder="Type here" />
          <InputField label="Field with an error" defaultValue="pricing page" error="Use lowercase letters and dashes only." />
          <InputField label="Disabled field" defaultValue="Can't be changed" disabled />
        </div>
        <div className="flex flex-wrap gap-6">
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked" defaultChecked />
          <Checkbox label="Disabled" disabled />
        </div>
      </div>
    </ShowcaseCard>
  );
}
