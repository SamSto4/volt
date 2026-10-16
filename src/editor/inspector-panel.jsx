"use client";

import { ArrowDown, ArrowUp, Copy, ExternalLink, SquareDashed, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEditor, useEditorStore } from "./editor-context";
import { validate } from "./inspector/fields.js";
import { Inspector } from "./inspector/inspector";
import { findParent, getManifest, getSectionTemplate, slotLabel } from "./store/tree.js";

/**
 * The right-hand panel: what's selected, the actions for it (the click and
 * keyboard alternative to dragging, WCAG 2.5.7), and its props.
 */
export function InspectorPanel() {
  const selectedId = useEditor((state) => state.selectedId);
  const node = useEditor((state) => (state.selectedId ? state.tree.nodes[state.selectedId] : undefined));

  if (!selectedId || !node) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="type-label text-muted-foreground">Properties</h2>
        <p className="type-small text-muted-foreground">
          Select a block or section on the page to change it. Use the Components panel to add one.
        </p>
      </div>
    );
  }
  return node.kind === "block" ? <BlockPanel id={selectedId} /> : <SectionPanel id={selectedId} />;
}

/** @param {{ id: string }} props */
function BlockPanel({ id }) {
  const store = useEditorStore();
  const tree = useEditor((state) => state.tree);
  const block = tree.nodes[id];
  const parent = findParent(tree, id);
  if (!block || block.kind !== "block" || !parent) return null;
  const manifest = getManifest(block.component);
  const slotIds = /** @type {import("./store/tree.js").SectionNode} */ (tree.nodes[parent.sectionId]).slots[parent.slot];
  const { moveBy, duplicate, remove, select } = store.getState();

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="type-label text-muted-foreground">Selected block</h2>
        <p className="type-heading-2">{manifest.title}</p>
        <p className="type-small text-muted-foreground">
          {slotLabel(tree, parent.sectionId, parent.slot)}, position {parent.index + 1} of {slotIds.length}
        </p>
      </header>

      {/* Focus stays on these buttons after each action, so several moves in
          a row are just repeated presses. */}
      <div role="toolbar" aria-label={`${manifest.title} actions`} className="flex flex-wrap gap-1">
        <Button variant="ghost" size="sm" disabled={parent.index === 0} onClick={() => moveBy(id, -1)}>
          <ArrowUp aria-hidden="true" strokeWidth={1.5} />
          Move up
        </Button>
        <Button variant="ghost" size="sm" disabled={parent.index === slotIds.length - 1} onClick={() => moveBy(id, 1)}>
          <ArrowDown aria-hidden="true" strokeWidth={1.5} />
          Move down
        </Button>
        <Button variant="ghost" size="sm" onClick={() => duplicate(id)}>
          <Copy aria-hidden="true" strokeWidth={1.5} />
          Duplicate
        </Button>
        <Button variant="ghost" size="sm" onClick={() => select(parent.sectionId)}>
          <SquareDashed aria-hidden="true" strokeWidth={1.5} />
          Select section
        </Button>
        <Button variant="ghost" size="sm" onClick={() => remove(id)}>
          <Trash2 aria-hidden="true" strokeWidth={1.5} />
          Delete
        </Button>
      </div>

      <PropsForm key={id} nodeId={id} schemaOwner={manifest} props={block.props} />

      <section aria-labelledby={`${id}-a11y`} className="flex flex-col gap-2 border-t border-border pt-4">
        <h3 id={`${id}-a11y`} className="type-label text-muted-foreground">
          Accessibility
        </h3>
        <ul className="flex list-disc flex-col gap-1 pl-4 type-small text-muted-foreground">
          {manifest.a11y.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <Link
          href={`/components/${manifest.name}`}
          target="_blank"
          className="inline-flex items-center gap-1 self-start rounded-sm type-small text-primary underline underline-offset-4"
        >
          {manifest.title} in the catalog
          <ExternalLink aria-hidden="true" size={16} strokeWidth={1.5} />
          <span className="sr-only">(opens in a new tab)</span>
        </Link>
      </section>
    </div>
  );
}

/** @param {{ id: string }} props */
function SectionPanel({ id }) {
  const store = useEditorStore();
  const sections = useEditor((state) => state.tree.sections);
  const section = useEditor((state) => state.tree.nodes[id]);
  if (!section || section.kind !== "section") return null;
  const template = getSectionTemplate(section.template);
  const index = sections.indexOf(id);
  const { moveBy, remove } = store.getState();

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="type-label text-muted-foreground">Selected section</h2>
        <p className="type-heading-2">{template.title}</p>
        <p className="type-small text-muted-foreground">
          {template.description} Position {index + 1} of {sections.length}.
        </p>
      </header>
      <div role="toolbar" aria-label={`${template.title} section actions`} className="flex flex-wrap gap-1">
        <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => moveBy(id, -1)}>
          <ArrowUp aria-hidden="true" strokeWidth={1.5} />
          Move up
        </Button>
        <Button variant="ghost" size="sm" disabled={index === sections.length - 1} onClick={() => moveBy(id, 1)}>
          <ArrowDown aria-hidden="true" strokeWidth={1.5} />
          Move down
        </Button>
        <Button variant="ghost" size="sm" onClick={() => remove(id)}>
          <Trash2 aria-hidden="true" strokeWidth={1.5} />
          Delete section
        </Button>
      </div>
      <PropsForm key={id} nodeId={id} schemaOwner={template} props={section.props} />
    </div>
  );
}

/**
 * The inspector for one node. It keeps a draft (which may be invalid while
 * someone types) and saves each valid version to the store. Saves to the same
 * field within a second become one undo step.
 *
 * @param {{ nodeId: string, schemaOwner: { props: import("zod").ZodObject }, props: Record<string, unknown> }} props
 */
function PropsForm({ nodeId, schemaOwner, props }) {
  const store = useEditorStore();
  const [draft, setDraft] = useState(props);
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}));
  const [synced, setSynced] = useState(props);

  // When the props change from outside (undo, redo, a preset), reset the
  // draft to match. Comparing during render, as React's docs recommend for
  // "adjusting state when a prop changes", avoids a flash of stale values.
  if (props !== synced && JSON.stringify(props) !== JSON.stringify(synced)) {
    setSynced(props);
    setDraft(props);
    setErrors({});
  }

  return (
    <Inspector
      manifest={schemaOwner}
      draft={draft}
      errors={errors}
      onChange={(name, value) => {
        const next = { ...draft, [name]: value };
        setDraft(next);
        const result = validate(schemaOwner, next);
        setErrors(result.errors);
        if (result.props) {
          // Mark our own save as already in sync, so it doesn't reset the draft.
          setSynced(result.props);
          store.getState().updateProps(nodeId, result.props, `${nodeId}:${name}`);
        }
      }}
    />
  );
}
