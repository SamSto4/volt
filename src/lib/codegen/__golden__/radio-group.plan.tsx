import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Example() {
  return (
    <RadioGroup label="Choose a plan" required>
      <RadioGroupItem value="Starter" label="Starter" description="One project, everything you need to publish." />
      <RadioGroupItem value="Team" label="Team" description="Unlimited projects and shared components." />
    </RadioGroup>
  );
}
