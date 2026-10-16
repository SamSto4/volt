"use client";

import { GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { manifests } from "@/registry";
import { sections as sectionTemplates } from "@/registry/sections";
import { describeBlock, setDragPreview } from "./canvas";
import { useDrag, useEditor, useEditorStore } from "./editor-context";
import { getManifest, getSection, getSectionTemplate } from "./store/tree.js";

/**
 * The left-hand panel: components and sections to add, and the page's layers.
 * "Add to page" is the click alternative to dragging (DESIGN.md §11): it puts
 * the block after the selected one, or into the selected section, or into
 * the first slot on the page that takes it.
 */
export function ComponentsPanel() {
  const store = useEditorStore();
  const drag = useDrag();

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="palette-heading" className="flex flex-col gap-3">
        <h2 id="palette-heading" className="type-label text-muted-foreground">
          Components
        </h2>
        <ul className="flex flex-col gap-2">
          {manifests.map((manifest) => (
            <li
              key={manifest.name}
              // Drag a card onto the page, or use its "Add to page" button.
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "copy";
                event.dataTransfer.setData("text/plain", manifest.title);
                setDragPreview(event, manifest.title);
                drag.setPayload({ kind: "component", name: manifest.name });
              }}
              onDragEnd={() => drag.setPayload(null)}
              className="flex cursor-grab items-center justify-between gap-2 rounded-md border border-border bg-card p-3 active:cursor-grabbing"
            >
              <GripVertical aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="type-small font-medium">{manifest.title}</span>
                <span className="truncate type-small text-muted-foreground">{manifest.category}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                aria-label={`Add ${manifest.title} to page`}
                onClick={() => store.getState().insertBlock(manifest.name)}
              >
                <Plus aria-hidden="true" strokeWidth={1.5} />
                Add to page
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sections-heading" className="flex flex-col gap-3">
        <h2 id="sections-heading" className="type-label text-muted-foreground">
          Sections
        </h2>
        <ul className="flex flex-col gap-2">
          {sectionTemplates.map((template) => (
            <li key={template.name} className="flex items-center justify-between gap-2 rounded-md border border-border bg-card p-3">
              <span className="type-small font-medium">{template.title}</span>
              <Button
                variant="secondary"
                size="sm"
                aria-label={`Add ${template.title} section`}
                onClick={() => store.getState().addSection(template.name)}
              >
                <Plus aria-hidden="true" strokeWidth={1.5} />
                Add section
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <LayersList />
    </div>
  );
}

/** An outline of the page: every section and block, in order, selectable. */
function LayersList() {
  const tree = useEditor((state) => state.tree);
  const selectedId = useEditor((state) => state.selectedId);
  const select = useEditor((state) => state.select);

  return (
    <nav aria-labelledby="layers-heading" className="flex flex-col gap-3">
      <h2 id="layers-heading" className="type-label text-muted-foreground">
        Layers
      </h2>
      {tree.sections.length === 0 ? (
        <p className="type-small text-muted-foreground">The page is empty.</p>
      ) : (
        <ol className="flex flex-col gap-1">
          {tree.sections.map((sectionId) => {
            const section = getSection(tree, sectionId);
            if (!section) return null;
            const blockIds = Object.values(section.slots).flat();
            return (
              <li key={sectionId} className="flex flex-col gap-1">
                <LayerButton id={sectionId} selected={selectedId === sectionId} onSelect={select}>
                  {getSectionTemplate(section.template).title}
                </LayerButton>
                {blockIds.length > 0 && (
                  <ol className="flex flex-col gap-1 pl-4">
                    {blockIds.map((blockId) => {
                      const block = tree.nodes[blockId];
                      if (!block || block.kind !== "block") return null;
                      const summary = describeBlock(block.props);
                      return (
                        <li key={blockId}>
                          <LayerButton id={blockId} selected={selectedId === blockId} onSelect={select}>
                            {getManifest(block.component).title}
                            {summary && <span className="text-muted-foreground"> · {summary}</span>}
                          </LayerButton>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
}

/**
 * @param {{ id: string, selected: boolean, onSelect: (id: string) => void, children: import("react").ReactNode }} props
 */
function LayerButton({ id, selected, onSelect, children }) {
  return (
    <button
      type="button"
      aria-current={selected ? "true" : undefined}
      onClick={() => onSelect(id)}
      className="flex min-h-8 w-full cursor-pointer items-center truncate rounded-sm px-2 text-left type-small hover:bg-accent aria-[current=true]:bg-primary-tint aria-[current=true]:font-medium"
    >
      {children}
    </button>
  );
}
