import { Dialog } from "@/components/ui/dialog";

export default function Example() {
  return <Dialog trigger="Discard changes" title="Discard your changes?" description="Your edits since the last save will be lost." confirmLabel="Discard" />;
}
