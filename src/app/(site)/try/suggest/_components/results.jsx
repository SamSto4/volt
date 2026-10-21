"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { labelFor, planAsText, recommend } from "@/lib/suggest/recommend.js";
import { SuggestionCard } from "./suggestion-card";

/**
 * The results: where to start, the page top to bottom, the components with
 * the reason for each, and design tips. Everything comes from recommend(),
 * so this file is only layout.
 *
 * @param {{
 *   answers: import("@/lib/suggest/questions.js").Answers,
 *   headingRef: import("react").Ref<HTMLHeadingElement>,
 *   onEdit: () => void,
 *   onReset: () => void,
 * }} props
 *   headingRef: the page moves focus here when the results appear
 */
export function Results({ answers, headingRef, onEdit, onReset }) {
  const result = recommend(answers);
  if (!result.ready || !result.start) return null;

  const start = result.components.filter((item) => item.level === "start");
  const consider = result.components.filter((item) => item.level === "consider");
  const plan = planAsText(answers, result);
  /** What they told us, in the words they read. */
  const chosen = [
    answers.goal && labelFor("goal", answers.goal),
    answers.action && labelFor("action", answers.action),
    ...answers.needs.map((id) => labelFor("needs", id)),
    answers.device && labelFor("device", answers.device),
  ].filter((label) => typeof label === "string");

  return (
    <section aria-labelledby="results-title" className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <h2 id="results-title" ref={headingRef} tabIndex={-1} className="type-heading-1">
          Your starting point
        </h2>
        <ul aria-label="Your answers" className="flex flex-wrap gap-2">
          {chosen.map((label) => (
            <li key={label}>
              <Badge>{label}</Badge>
            </li>
          ))}
        </ul>
        <Button variant="secondary" size="sm" className="w-fit" onClick={onEdit}>
          Change my answers
        </Button>
      </div>

      <section aria-labelledby="start-title" className="flex flex-col gap-2 rounded-md border border-border bg-card p-4 md:p-6">
        <h3 id="start-title" className="type-heading-2">
          Start from the {result.start.title.toLowerCase()}
        </h3>
        <p className="max-w-prose text-muted-foreground">{result.start.how}</p>
      </section>

      {result.outline.length > 0 && (
        <section aria-labelledby="outline-title" className="flex flex-col gap-4">
          <h3 id="outline-title" className="type-heading-2">
            Your page, top to bottom
          </h3>
          <ol className="flex max-w-prose flex-col gap-4">
            {result.outline.map((item, index) => (
              <li key={item.section} className="flex gap-4">
                <span aria-hidden="true" className="w-6 shrink-0 pt-1 type-label text-muted-foreground">
                  {index + 1}
                </span>
                <p>
                  <span className="font-semibold">{item.title}.</span> <span className="text-muted-foreground">{item.why}</span>
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section aria-labelledby="components-title" className="flex flex-col gap-6">
        <h3 id="components-title" className="type-heading-2">
          Components for this page
        </h3>
        <Group title="Start with" intro="The page needs these." items={start} />
        <Group title="Worth considering" intro="Useful if they fit what you're making." items={consider} />
      </section>

      <section aria-labelledby="tips-title" className="flex flex-col gap-4">
        <h3 id="tips-title" className="type-heading-2">
          Design tips for your answers
        </h3>
        <ul className="flex max-w-prose flex-col gap-2">
          {result.tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <Check aria-hidden="true" size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-muted-foreground" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="plan-title" className="flex flex-col gap-4">
        <h3 id="plan-title" className="type-heading-2">
          Take it with you
        </h3>
        <details className="rounded-md border border-border bg-card">
          <summary className="cursor-pointer rounded-md px-4 py-2 type-small font-medium">Show the plan as text</summary>
          <pre id="plan-text" className="overflow-x-auto px-4 pb-4 type-code whitespace-pre-wrap">
            {plan}
          </pre>
        </details>
        <div className="flex flex-wrap items-center gap-4">
          <CopyButton text={plan} label="Copy this plan" targetId="plan-text" />
          <Button variant="ghost" size="sm" onClick={onReset}>
            Start over
          </Button>
          {/* The one primary action on this view. */}
          <Link href="/editor" className={buttonVariants({ className: "sm:ml-auto" })}>
            Open the editor
          </Link>
        </div>
      </section>
    </section>
  );
}

/**
 * A titled group of suggestion cards. Nothing renders when the group is empty.
 *
 * @param {{ title: string, intro: string, items: import("@/lib/suggest/recommend.js").Suggestion[] }} props
 */
function Group({ title, intro, items }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h4 className="type-label text-muted-foreground">{title}</h4>
        <p className="type-small text-muted-foreground">{intro}</p>
      </div>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <SuggestionCard key={item.name} suggestion={item} />
        ))}
      </ul>
    </div>
  );
}
