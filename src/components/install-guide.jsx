"use client";

import { CircleCheck, ExternalLink } from "lucide-react";
import { useId } from "react";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { SegmentedControl } from "@/components/segmented-control";
import { buildAgentPrompt } from "@/lib/ai/agent-prompt.js";
import { generateBlockCode } from "@/lib/codegen";
import { doneWhen, FRAMEWORK_LABELS, FRAMEWORKS, installSteps, PACKAGE_MANAGERS } from "@/lib/install/guide.js";
import { manifests } from "@/registry";
import { useStoredChoice } from "./use-stored-choice";

/**
 * "Add it to your project": numbered steps for the chosen framework and
 * package manager (both remembered in this browser), and a prompt for a
 * coding agent built from the same facts.
 *
 * @param {{ name: string }} props  the manifest's name (manifests can't cross to the client)
 */
export function InstallGuide({ name }) {
  const manifest = manifests.find((candidate) => candidate.name === name);
  const [framework, setFramework] = useStoredChoice("volt:framework", FRAMEWORKS, "next");
  const [manager, setManager] = useStoredChoice("volt:package-manager", PACKAGE_MANAGERS, "npm");
  const baseId = useId();
  if (!manifest) return null;

  const example = generateBlockCode({ component: manifest.name, props: {} }, manifests).module;
  const steps = installSteps(manifest, framework, manager, example);
  const prompt = framework === "html" ? null : buildAgentPrompt(manifest, framework, manager, example);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-6">
        <SegmentedControl
          label="Framework"
          options={FRAMEWORKS.map((value) => ({ value, label: FRAMEWORK_LABELS[value] }))}
          value={framework}
          onChange={setFramework}
        />
        {steps && (
          <SegmentedControl
            label="Package manager"
            options={PACKAGE_MANAGERS.map((value) => ({ value, label: value }))}
            value={manager}
            onChange={setManager}
          />
        )}
      </div>

      {!steps ? (
        <p className="max-w-prose text-muted-foreground">
          There&apos;s no plain-HTML version yet: Volt components are React components for now. HTML export is on the
          roadmap. Until then, use the Next.js or Vite guide.
        </p>
      ) : (
        <>
          <ol className="flex flex-col gap-6">
            {steps.map((step, index) => {
              const codeId = `${baseId}-step-${index}`;
              return (
                <li key={step.title} className="flex flex-col gap-2">
                  <h3 className="type-heading-2">
                    <span className="text-muted-foreground">{index + 1}.</span> {step.title}
                  </h3>
                  <p className="max-w-prose text-muted-foreground">{step.body}</p>
                  {step.link && (
                    <a
                      href={step.link.href}
                      className="inline-flex items-center gap-1 self-start rounded-sm text-primary underline underline-offset-4"
                    >
                      {step.link.label}
                      <ExternalLink aria-hidden="true" size={16} strokeWidth={1.5} />
                    </a>
                  )}
                  {step.code && (
                    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="type-label text-muted-foreground">{step.code.filename}</span>
                        <CopyButton
                          text={step.code.text}
                          label={step.code.filename === "Terminal" ? "Copy command" : "Copy code"}
                          targetId={codeId}
                        />
                      </div>
                      <CodeBlock
                        code={step.code.text}
                        lang={step.code.filename === "Terminal" ? "shellscript" : "jsx"}
                        id={codeId}
                        label={step.code.filename}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          <section aria-labelledby={`${baseId}-done`} className="flex flex-col gap-2">
            <h3 id={`${baseId}-done`} className="type-heading-2">
              You&apos;re done when…
            </h3>
            <ul className="flex flex-col gap-2">
              {doneWhen(manifest).map((check) => (
                <li key={check} className="flex items-start gap-2 text-muted-foreground">
                  <CircleCheck aria-hidden="true" size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-success" />
                  {check}
                </li>
              ))}
            </ul>
          </section>

          {prompt && (
            <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
              <h3 className="type-heading-2">Using an AI coding agent?</h3>
              <p className="max-w-prose text-muted-foreground">
                Copy a prompt with these exact steps, paths and accessibility rules, and paste it into Claude Code,
                Cursor or another agent working in your project.
              </p>
              <div>
                <CopyButton text={prompt} label="Copy prompt for your AI agent" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
