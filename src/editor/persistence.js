import { parseTree } from "./store/tree.js";

// Autosave to this browser only (localStorage). It's a per-viewer
// convenience, not an account: nothing leaves the device. Every read is
// treated as untrusted and validated with parseTree, and every access is
// wrapped in try/catch because storage can be full, blocked or missing
// (private windows, strict privacy settings).

const KEY = "volt:editor:v1";

/** @param {import("./store/tree.js").Tree} tree */
export function saveTree(tree) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, tree }));
    return true;
  } catch {
    return false;
  }
}

/** @returns {import("./store/tree.js").Tree | null} */
export function loadTree() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.version === 1 ? parseTree(data.tree) : null;
  } catch {
    return null;
  }
}
