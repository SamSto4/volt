"use client";

import { useState } from "react";
import { InputField } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { TextareaField } from "@/components/ui/textarea";
import { ShowcaseCard } from "./showcase";

// Loose on purpose: something@something.something. The browser's own
// type="email" check is stricter about the rest.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A small settings form: every field has a visible label, a hint, or an error.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function FormFieldsCard({ className } = {}) {
  const [email, setEmail] = useState("sam@");
  // The error shows once you leave the field, not while you're still typing.
  const [touched, setTouched] = useState(true);
  const error = touched && !EMAIL.test(email) ? "Enter an email address like name@example.com." : undefined;

  return (
    <ShowcaseCard
      className={className}
      id="form-fields"
      title="Form fields"
      context="Forms · Settings"
      note="The email starts with an error so you can see one. Fix it, then leave the field."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField label="Page name" defaultValue="Pricing" description="Shown in the browser tab and in search results." />
        <InputField
          label="Contact email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setTouched(false);
          }}
          onBlur={() => setTouched(true)}
          error={error}
          required
        />
        <SelectField label="Template" defaultValue="landing" description="You can switch later; your content stays.">
          <option value="landing">Landing page</option>
          <option value="blog">Blog post</option>
          <option value="contact">Contact page</option>
        </SelectField>
        <TextareaField label="Notes for your team" rows={3} placeholder="What should reviewers look at first?" />
      </div>
    </ShowcaseCard>
  );
}
