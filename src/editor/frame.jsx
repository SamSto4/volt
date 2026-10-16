"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// The canvas lives in an <iframe> so the page sees the *chosen* width (375,
// 768 or 1280px): its media queries and breakpoints respond to the frame, not
// to the editor window. ADR 0005 explains why it's rendered with a portal
// instead of a separate /preview route.

/**
 * Copies the editor's stylesheets into the frame and keeps them in sync
 * (Next adds and replaces style tags as you navigate and during hot reload).
 *
 * @param {Document} target
 */
function syncStyles(target) {
  const copy = () => {
    target.head.querySelectorAll("[data-volt-copied]").forEach((node) => node.remove());
    document.head.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      const clone = /** @type {HTMLElement} */ (node.cloneNode(true));
      clone.setAttribute("data-volt-copied", "");
      target.head.appendChild(clone);
    });
  };
  copy();
  const observer = new MutationObserver(copy);
  observer.observe(document.head, { childList: true, subtree: true, characterData: true });
  return () => observer.disconnect();
}

/**
 * Mirrors <html>'s classes into the frame: the font variables from next/font
 * and the `dark` class from the theme toggle.
 *
 * @param {Document} target
 */
function syncHtmlClass(target) {
  const copy = () => {
    target.documentElement.className = document.documentElement.className;
    target.documentElement.style.colorScheme = document.documentElement.style.colorScheme;
  };
  copy();
  const observer = new MutationObserver(copy);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
  return () => observer.disconnect();
}

/**
 * Renders its children inside an iframe, as part of the same React tree:
 * state, context and event handlers work as if the frame weren't there.
 *
 * @param {{ title: string, width: number, children: import("react").ReactNode, onDocument?: (doc: Document | null) => void }} props
 *   onDocument: called with the frame's document once it's ready (for keyboard shortcuts)
 */
export function Frame({ title, width, children, onDocument }) {
  const ref = useRef(/** @type {HTMLIFrameElement | null} */ (null));
  const [body, setBody] = useState(/** @type {HTMLElement | null} */ (null));

  useEffect(() => {
    const doc = ref.current?.contentDocument;
    if (!doc) return;
    // Write a real document with a doctype. The iframe's initial about:blank
    // page is in quirks mode, which changes how some layouts behave.
    doc.open();
    doc.write('<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body></body></html>');
    doc.close();
    doc.body.className = "min-h-full bg-background text-foreground";
    const stopStyles = syncStyles(doc);
    const stopClass = syncHtmlClass(doc);
    setBody(doc.body);
    onDocument?.(doc);
    return () => {
      stopStyles();
      stopClass();
      onDocument?.(null);
      setBody(null);
    };
    // onDocument is a callback prop; re-running on every render would rebuild the frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <iframe
      ref={ref}
      title={title}
      style={{ width }}
      className="block h-full max-w-none shrink-0 rounded-md border border-border bg-background"
    >
      {body && createPortal(children, body)}
    </iframe>
  );
}
