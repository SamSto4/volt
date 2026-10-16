"use client";

import { Component } from "react";

// The canvas shares one React tree with the editor (ADR 0005), so a block
// that throws while rendering would otherwise blank the whole editor. This
// catches it and keeps the panels working. Error boundaries must be class
// components: React has no hook for catching render errors.

/**
 * @typedef {object} Props
 * @property {unknown} resetKey  when this changes (a new page tree), try rendering again
 * @property {(error: Error) => import("react").ReactNode} fallback
 * @property {import("react").ReactNode} children
 */

/** @extends {Component<Props, { error: Error | null }>} */
export class CanvasErrorBoundary extends Component {
  /** @param {Props} props */
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  /** @param {Error} error */
  static getDerivedStateFromError(error) {
    return { error };
  }

  /** @param {Props} previous */
  componentDidUpdate(previous) {
    // An undo or any other change gives the page another chance to render.
    if (this.state.error && previous.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    return this.state.error ? this.props.fallback(this.state.error) : this.props.children;
  }
}
