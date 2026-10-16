import badge from "./badge.js";
import button from "./button.js";

/**
 * Every component manifest, in catalog order. Adding a component means adding
 * its manifest file and listing it here; a test fails if one is forgotten.
 *
 * @type {import("./schema.js").Manifest[]}
 */
export const manifests = [button, badge];
