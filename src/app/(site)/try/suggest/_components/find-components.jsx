"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { QUESTIONS, emptyAnswers } from "@/lib/suggest/questions.js";
import { QuestionStep } from "./question-step";
import { Results } from "./results";

/** The step number that shows the results: one past the last question. */
const RESULTS = QUESTIONS.length;

/**
 * "Find your components": one question at a time, then the suggestions.
 * Everything is local state; nothing is saved or sent anywhere.
 *
 * Focus follows the person. When the step changes, focus moves to the new
 * question's first control (the chosen one, if they're coming back) or to
 * the results heading, so keyboard and screen-reader users land where the
 * new content is instead of on a button that's no longer there.
 */
export function FindComponents() {
  const [answers, setAnswers] = useState(emptyAnswers);
  const [step, setStep] = useState(0);
  const question = useRef(/** @type {HTMLDivElement | null} */ (null));
  const resultsHeading = useRef(/** @type {HTMLHeadingElement | null} */ (null));
  // Focus only moves after the person changes step, never when the page first loads.
  const moved = useRef(false);

  useEffect(() => {
    if (!moved.current) return;
    if (step === RESULTS) {
      resultsHeading.current?.focus();
      return;
    }
    // The chosen answer if there is one, otherwise the first.
    const target = question.current?.querySelector("input:checked") ?? question.current?.querySelector("input");
    if (target instanceof HTMLElement) target.focus();
  }, [step]);

  /** @param {number} next */
  function go(next) {
    moved.current = true;
    setStep(next);
  }

  if (step === RESULTS) {
    return (
      <Results
        answers={answers}
        headingRef={resultsHeading}
        onEdit={() => go(0)}
        onReset={() => {
          setAnswers(emptyAnswers());
          go(0);
        }}
      />
    );
  }

  const current = QUESTIONS[step];
  // Only the first question is required: without it there's nothing to suggest.
  const canContinue = step > 0 || Boolean(answers.goal);
  const isLast = step === QUESTIONS.length - 1;
  const hint = canContinue ? (step > 0 ? "You can skip this one." : "") : "Pick one to continue.";

  return (
    <section aria-labelledby="questions-title" className="flex max-w-2xl flex-col gap-6 rounded-md border border-border bg-card p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h2 id="questions-title" className="type-label text-muted-foreground">
          Question {step + 1} of {QUESTIONS.length}
        </h2>
        {/* Decorative: the heading above says the same in words. */}
        <ol aria-hidden="true" className="flex gap-1">
          {QUESTIONS.map((item, index) => (
            <li key={item.id} className={index <= step ? "h-1 flex-1 rounded-full bg-primary" : "h-1 flex-1 rounded-full bg-border"} />
          ))}
        </ol>
      </div>

      <div ref={question}>
        <QuestionStep question={current} answers={answers} onChange={setAnswers} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {step > 0 && (
          <Button variant="ghost" onClick={() => go(step - 1)}>
            Back
          </Button>
        )}
        {/* The one primary action on this view. */}
        <Button className="ml-auto" disabled={!canContinue} aria-describedby={hint ? "step-hint" : undefined} onClick={() => go(step + 1)}>
          {isLast ? "See my suggestions" : "Next"}
        </Button>
      </div>
      {hint && (
        <p id="step-hint" className="type-small text-muted-foreground">
          {hint}
        </p>
      )}
    </section>
  );
}
