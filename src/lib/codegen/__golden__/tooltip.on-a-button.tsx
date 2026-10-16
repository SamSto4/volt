import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

export default function Example() {
  return (
    <Tooltip content="Keeps your changes without publishing them.">
      <Button variant="secondary">Save draft</Button>
    </Tooltip>
  );
}
