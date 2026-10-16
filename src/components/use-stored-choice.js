"use client";

import { useCallback, useSyncExternalStore } from "react";

// A choice remembered in this browser (framework, package manager), shared by
// every component that reads the same key, in this tab and others.
// localStorage is a per-viewer convenience: reads and writes are wrapped in
// try/catch because storage can be blocked, and the default is used then.

const EVENT = "volt:stored-choice";

/** @param {() => void} onChange */
function subscribe(onChange) {
  window.addEventListener("storage", onChange); // other tabs
  window.addEventListener(EVENT, onChange); // this tab
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/**
 * @template {string} T
 * @param {string} key
 * @param {readonly T[]} options
 * @param {T} fallback  also what the server renders, so hydration matches
 * @returns {[T, (value: T) => void]}
 */
export function useStoredChoice(key, options, fallback) {
  const read = () => {
    try {
      const stored = localStorage.getItem(key);
      return options.includes(/** @type {T} */ (stored)) ? /** @type {T} */ (stored) : fallback;
    } catch {
      return fallback;
    }
  };
  const value = useSyncExternalStore(subscribe, read, () => fallback);
  const set = useCallback(
    /** @param {T} next */
    (next) => {
      try {
        localStorage.setItem(key, next);
      } catch {
        // Storage is unavailable; the choice just won't be remembered.
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );
  return [value, set];
}
