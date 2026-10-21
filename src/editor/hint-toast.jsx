"use client";

import { Toast } from "@/components/ui/toast";
import { useEditor, useEditorStore } from "./editor-context";

/**
 * The note that appears when a drag didn't land ("Button wasn't added. Drop
 * it on a highlighted slot: …"). Volt's Toast with no action. It isn't
 * announced by the toast itself: the store announces it through the editor's
 * one live region.
 */
export function HintToast() {
  const store = useEditorStore();
  const hint = useEditor((state) => state.hint);
  return (
    <Toast
      open={Boolean(hint)}
      id={hint?.id}
      message={hint?.message ?? ""}
      onDismiss={() => store.getState().dismissHint()}
      announce={false}
    />
  );
}
