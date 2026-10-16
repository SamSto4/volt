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
  return (
    <StoreContext value={value}>
      <FocusContext value={focus}>{children}</FocusContext>
    </StoreContext>
  );
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
