"use client";

import { Toast } from "@/components/ui/toast";
import { useEditor, useEditorStore } from "./editor-context";

/**
 * The editor's undo toast: Volt's Toast, showing the removal that just
 * happened with an Undo button. It isn't announced by the toast itself: the
 * removal is already said in the editor's one live region ("… Undo brings it
 * back."), and Cmd/Ctrl+Z works too.
 *
 * @param {{ onUndo: () => void }} props
 */
export function UndoToast({ onUndo }) {
  const store = useEditorStore();
  const toast = useEditor((state) => state.toast);
  return (
    <Toast
      open={Boolean(toast)}
      id={toast?.id}
      message={toast?.message ?? ""}
      actionLabel="Undo"
      actionKeyshortcuts="Control+Z Meta+Z"
      onAction={onUndo}
      onDismiss={() => store.getState().dismissToast()}
      announce={false}
    />
  );
}
