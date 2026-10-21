"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/**
 * One question, as the right kind of control: a radio group when you pick
 * one answer, a group of checkboxes when you can tick any number. Both are
 * Volt's own components, so they're named by the question, work with the
 * arrow keys and Space, and read their hints.
 *
 * @param {{
 *   question: import("@/lib/suggest/questions.js").Question,
 *   answers: import("@/lib/suggest/questions.js").Answers,
 *   onChange: (answers: import("@/lib/suggest/questions.js").Answers) => void,
 * }} props
 */
export function QuestionStep({ question, answers, onChange }) {
  if (question.kind === "single") {
    // The question's id says which single answer it fills: goal, action or device.
    const id = /** @type {"goal" | "action" | "device"} */ (question.id);
    return (
      <RadioGroup
        label={question.title}
        description={question.hint}
        // "" means nothing chosen yet; the group stays controlled either way.
        value={answers[id] ?? ""}
        onValueChange={(value) => onChange({ ...answers, [id]: value })}
      >
        {question.options.map((option) => (
          <RadioGroupItem key={option.id} value={option.id} label={option.label} description={option.hint} />
        ))}
      </RadioGroup>
    );
  }

  /** @param {string} optionId @param {boolean} ticked */
  const toggle = (optionId, ticked) =>
    onChange({
      ...answers,
      // Filter out the old entry, then add it back only when ticked.
      needs: [...answers.needs.filter((id) => id !== optionId), ...(ticked ? [optionId] : [])],
    });

  const hintId = question.hint ? `${question.id}-hint` : undefined;
  return (
    <fieldset aria-describedby={hintId} className="flex flex-col gap-3">
      <legend className="mb-1 type-small font-medium text-foreground">{question.title}</legend>
      {question.hint && (
        <p id={hintId} className="-mt-2 type-small text-muted-foreground">
          {question.hint}
        </p>
      )}
      {question.options.map((option) => (
        <Checkbox
          key={option.id}
          label={option.label}
          description={option.hint}
          checked={answers.needs.includes(option.id)}
          onChange={(event) => toggle(option.id, event.target.checked)}
        />
      ))}
    </fieldset>
  );
}
