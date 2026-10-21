import { Button } from "@/components/ui/button";
import { ShowcaseCard, Specimen } from "./showcase";

/**
 * Every button style with a real label, each captioned with its name.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function ButtonsCard({ className } = {}) {
  return (
    <ShowcaseCard
      className={className}
      id="buttons"
      title="Buttons"
      context="Actions · Everywhere"
      note="One primary per view. Point at it to see the glow; press it and it settles."
    >
      <div className="flex flex-wrap items-end gap-x-4 gap-y-6">
        <Specimen caption="Primary">
          <Button>Publish</Button>
        </Specimen>
        <Specimen caption="Secondary">
          <Button variant="secondary">Preview</Button>
        </Specimen>
        <Specimen caption="Ghost">
          <Button variant="ghost">Cancel</Button>
        </Specimen>
        <Specimen caption="Danger">
          <Button variant="danger">Delete</Button>
        </Specimen>
        <Specimen caption="Disabled">
          <Button variant="secondary" disabled>
            Export
          </Button>
        </Specimen>
      </div>
    </ShowcaseCard>
  );
}
