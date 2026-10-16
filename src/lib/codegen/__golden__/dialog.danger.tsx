import { Dialog } from "@/components/ui/dialog";

export default function Example() {
  return <Dialog trigger="Delete page" title="Delete this page?" description="The page and everything on it will be removed. This can't be undone." confirmLabel="Delete page" tone="danger" />;
}
