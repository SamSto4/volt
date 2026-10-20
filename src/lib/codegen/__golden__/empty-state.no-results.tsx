import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function Example() {
  return (
    <EmptyState title="No components match “carousel”" description="Try a shorter word, or browse every component." icon="search">
      <Button variant="secondary">Clear search</Button>
    </EmptyState>
  );
}
