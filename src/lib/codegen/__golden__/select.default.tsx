import { SelectField } from "@/components/ui/select";

export default function Example() {
  return (
    <SelectField label="Plan">
      <option value="Free">Free</option>
      <option value="Pro">Pro</option>
      <option value="Team">Team</option>
    </SelectField>
  );
}
