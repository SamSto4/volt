import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ShowcaseCard } from "./showcase";

/**
 * The three ways to choose: tick one thing, turn a setting on, pick one of a few.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function ChoicesCard({ className } = {}) {
  return (
    <ShowcaseCard className={className} id="choices" title="Checkbox, switch and radio group" context="Forms · Preferences">
      <Checkbox label="Show layout grid" description="Lines every 8px while you arrange blocks." />
      <Switch label="Snap blocks into place" defaultChecked />
      <RadioGroup label="Default preview width" defaultValue="768">
        <RadioGroupItem value="375" label="Phone, 375px" />
        <RadioGroupItem value="768" label="Tablet, 768px" />
        <RadioGroupItem value="1280" label="Desktop, 1280px" />
      </RadioGroup>
    </ShowcaseCard>
  );
}
