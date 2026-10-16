import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

export default function Example() {
  return (
    <Tooltip content="Press ? to see every keyboard shortcut.">
      <Button variant="ghost">Shortcuts</Button>
    </Tooltip>
  );
}
