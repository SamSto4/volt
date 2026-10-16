"use client";

import { createContext, useContext, useRef, useState } from "react";
import { useStore } from "zustand";
import { createEditorStore } from "./store/store.js";

// One store per mounted editor, shared through context. (A module-level store
// would be shared by every test and every render on the server.)

/** @typedef {ReturnType<typeof createEditorStore>} EditorStore */

const StoreContext = createContext(/** @type {EditorStore | null} */ (null));

// After a block is added or removed, focus should land on the block that's
// now selected, not fall back to the top of the page. Whoever makes the change
// calls request(id); the block calls claim(id) when it renders and focuses
// itself if it was the one asked for. Only the provider touches the ref.

/** @typedef {{ request: (id: string | null) => void, claim: (id: string) => boolean }} FocusRequests */

const FocusContext = createContext(/** @type {FocusRequests | null} */ (null));

/** @param {{ children: import("react").ReactNode, store?: EditorStore }} props */
export function EditorProvider({ children, store }) {
  // useState's initializer runs once, so the store survives re-renders.
  const [value] = useState(() => store ?? createEditorStore());
  const pending = useRef(/** @type {string | null} */ (null));
  const [focus] = useState(
    () =>
      /** @type {FocusRequests} */ ({
        request: (id) => {
          pending.current = id;
        },
        claim: (id) => {
          if (pending.current !== id) return false;
          pending.current = null;
          return true;
        },
      }),
  );
  const [payload, setPayload] = useState(/** @type {DragPayload | null} */ (null));
  const [lastDropped, setLastDropped] = useState(/** @type {string | null} */ (null));
  return (
    <StoreContext value={value}>
      <FocusContext value={focus}>
        <DragContext value={{ payload, setPayload, lastDropped, setLastDropped }}>{children}</DragContext>
      </FocusContext>
    </StoreContext>
  );
}

/**
 * What's being dragged right now. Kept in React state, not only in the
 * browser's dataTransfer: while dragging, browsers hide dataTransfer's
 * contents from dragover handlers, which need it to decide where a drop fits.
 *
 * @typedef {{ kind: "component", name: string } | { kind: "block", id: string }} DragPayload
 */

/**
 * @typedef {object} DragState
 * @property {DragPayload | null} payload
 * @property {(payload: DragPayload | null) => void} setPayload
 * @property {string | null} lastDropped  id of the block that just landed (for the flash)
 * @property {(id: string | null) => void} setLastDropped
 */

const DragContext = createContext(/** @type {DragState | null} */ (null));

/** The current drag, shared by the palette (parent page) and the canvas (iframe). */
export function useDrag() {
  const drag = useContext(DragContext);
  if (!drag) throw new Error("Editor parts must be used inside <EditorProvider>.");
  return drag;
}

/** Ask for, or claim, the next focus target (see above). */
export function useFocusRequests() {
  const focus = useContext(FocusContext);
  if (!focus) throw new Error("Editor parts must be used inside <EditorProvider>.");
  return focus;
}

/** The store itself, for calling actions outside of render. */
export function useEditorStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("Editor parts must be used inside <EditorProvider>.");
  return store;
}

/**
 * Subscribes to part of the editor state. The component re-renders only when
 * the selected part changes.
 *
 * @template T
 * @param {(state: import("./store/store.js").EditorState) => T} selector
 * @returns {T}
 */
export function useEditor(selector) {
  return useStore(useEditorStore(), selector);
}

/** Whether undo and redo are possible right now (reactive). */
export function useHistory() {
  const store = useEditorStore();
  const canUndo = useStore(store.temporal, (state) => state.pastStates.length > 0);
  const canRedo = useStore(store.temporal, (state) => state.futureStates.length > 0);
  return { canUndo, canRedo, undo: () => store.temporal.getState().undo(), redo: () => store.temporal.getState().redo() };
}
