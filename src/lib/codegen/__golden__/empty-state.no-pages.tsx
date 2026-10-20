import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function Example() {
  return (
    <EmptyState title="No saved pages yet" description="Pages you save show up here, so you can pick up where you left off.">
      <Button variant="secondary">Start a new page</Button>
    </EmptyState>
  );
}
