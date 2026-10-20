import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Example() {
  return (
    <RadioGroup label="How often should we email you?" defaultValue="Every week">
      <RadioGroupItem value="Every week" label="Every week" description="A short round-up of what's new." />
      <RadioGroupItem value="Once a month" label="Once a month" description="Only the biggest changes." />
      <RadioGroupItem value="Never" label="Never" />
    </RadioGroup>
  );
}
