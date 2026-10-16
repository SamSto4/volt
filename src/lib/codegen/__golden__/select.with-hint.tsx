import { SelectField } from "@/components/ui/select";

export default function Example() {
  return (
    <SelectField label="Country" description="Used to show prices in your currency.">
      <option value="Canada">Canada</option>
      <option value="Germany">Germany</option>
      <option value="Japan">Japan</option>
      <option value="United Kingdom">United Kingdom</option>
      <option value="United States">United States</option>
    </SelectField>
  );
}
