"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/segmented-control";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FRAMEWORKS } from "./demo-data";
import { ShowcaseCard } from "./showcase";

/**
 * Tabs (switch what you see) and a segmented control (pick a setting).
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function SwitchersCard({ className } = {}) {
  const [framework, setFramework] = useState(/** @type {(typeof FRAMEWORKS)[number]["value"]} */ ("next"));
  const chosen = FRAMEWORKS.find((option) => option.value === framework) ?? FRAMEWORKS[0];

  return (
    <ShowcaseCard
      className={className}
      id="switchers"
      title="Tabs and segmented control"
      context="Navigation · Settings"
      note="Arrow keys move between tabs and between choices."
    >
      <Tabs defaultValue="preview">
        <TabsList aria-label="View">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="split">Split</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="pt-2 type-small text-muted-foreground">
          The page as visitors see it.
        </TabsContent>
        <TabsContent value="code" className="pt-2 type-small text-muted-foreground">
          The exact JSX for the page, ready to copy.
        </TabsContent>
        <TabsContent value="split" className="pt-2 type-small text-muted-foreground">
          Both side by side, with the selected block&apos;s lines highlighted.
        </TabsContent>
      </Tabs>
      <SegmentedControl
        label="Framework"
        options={FRAMEWORKS.map(({ value, label }) => ({ value, label }))}
        value={framework}
        onChange={setFramework}
      />
      <p aria-live="polite" className="type-small text-muted-foreground">
        {chosen.hint}
      </p>
    </ShowcaseCard>
  );
}
