"use client";

import { FilePlus, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { TEMPLATES } from "./store/example-page.js";
import { getSectionTemplate } from "./store/tree.js";

/** @typedef {import("./store/example-page.js").TemplateName | "blank"} StartChoice */

/**
 * "Start a new page": a blank page or one of the templates. Each template
 * shows the outline of its sections, so you can see its shape before choosing.
 * A native <dialog>, so focus stays inside and Escape closes it.
 *
 * @param {{ open: boolean, onChoose: (choice: StartChoice) => void, onClose: () => void }} props
 */
export function StartChooser({ open, onChoose, onClose }) {
  const dialog = useRef(/** @type {HTMLDialogElement | null} */ (null));

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    else if (!open && element.open) element.close();
  }, [open]);

  /** @param {StartChoice} choice */
  const choose = (choice) => {
    dialog.current?.close();
    onChoose(choice);
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="start-chooser-title"
      aria-describedby="start-chooser-description"
      onClose={onClose}
      className="m-auto w-full max-w-3xl rounded-md border border-border bg-card p-0 text-card-foreground backdrop:bg-foreground/50"
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 id="start-chooser-title" className="type-heading-1">
              Start a new page
            </h2>
            <p id="start-chooser-description" className="text-muted-foreground">
              Begin with a blank page or a template. You can change everything afterwards.
            </p>
          </div>
          <Tooltip content="Close" kind="label">
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>
          </Tooltip>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <li>
            <ChoiceButton title="Blank page" description="Start from nothing and add sections yourself." onClick={() => choose("blank")}>
              <div className="flex h-24 items-center justify-center rounded-sm border border-dashed border-input">
                <FilePlus aria-hidden="true" size={20} strokeWidth={1.5} className="text-muted-foreground" />
              </div>
            </ChoiceButton>
          </li>
          {Object.entries(TEMPLATES).map(([name, template]) => (
            <li key={name}>
              <ChoiceButton
                title={template.title}
                description={template.description}
                onClick={() => choose(/** @type {import("./store/example-page.js").TemplateName} */ (name))}
              >
                {/* The template's outline: one bar per section. */}
                <ol aria-hidden="true" className="flex h-24 flex-col gap-1">
                  {template.sections.map((section, index) => (
                    <li
                      key={index}
                      className="flex flex-1 items-center rounded-sm bg-background px-2 type-label text-muted-foreground"
                    >
                      {getSectionTemplate(section.template).title}
                    </li>
                  ))}
                </ol>
              </ChoiceButton>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}

/**
 * One option: a single big button, named by its title and described by its text.
 *
 * @param {{ title: string, description: string, onClick: () => void, children: import("react").ReactNode }} props
 */
function ChoiceButton({ title, description, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full w-full cursor-pointer flex-col gap-3 rounded-md border border-border bg-card p-4 text-left hover:border-primary"
    >
      {children}
      <span className="flex flex-col gap-1">
        <span className="font-semibold">{title}</span>
        <span className="type-small text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}
