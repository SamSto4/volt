// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import SuggestPage from "./page";

// axe in jsdom (structure only; contrast and the real keyboard walk are in
// tests/e2e), plus the flow itself: answer, move on, read the suggestions.

/** @param {Document | HTMLElement} container */
async function violations(container) {
  const results = await axe.run(container, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
    rules: { "color-contrast": { enabled: false } },
  });
  return results.violations.map((v) => `${v.id}: ${v.help}`);
}

/** Answers the four questions for a landing page that signs people up. */
async function answerAll(/** @type {ReturnType<typeof userEvent.setup>} */ user) {
  await user.click(screen.getByRole("radio", { name: "A landing page" }));
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.click(screen.getByRole("radio", { name: "Sign up or subscribe" }));
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.click(screen.getByRole("checkbox", { name: "Answer common questions" }));
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.click(screen.getByRole("radio", { name: "On phones" }));
  await user.click(screen.getByRole("button", { name: "See my suggestions" }));
}

describe("Find your components page", () => {
  it("has one h1 and starts at question 1 of 4, with Next waiting for an answer", () => {
    render(<SuggestPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "Question 1 of 4" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "What are you making?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toHaveAccessibleDescription("Pick one to continue.");
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
  });

  it("has no axe violations on the questions or on the results", async () => {
    const user = userEvent.setup();
    const { container } = render(<SuggestPage />);
    expect(await violations(container)).toEqual([]);
    await answerAll(user);
    expect(screen.getByRole("heading", { level: 2, name: "Your starting point" })).toBeInTheDocument();
    expect(await violations(container)).toEqual([]);
  });

  it("moves through the questions with Next and Back, keeping answers, and focuses the new question", async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);
    await user.click(screen.getByRole("radio", { name: "A blog post or article" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("heading", { level: 2, name: "Question 2 of 4" })).toBeInTheDocument();
    // Focus follows the person into the new question, so a screen reader reads it.
    expect(screen.getByRole("radio", { name: "Sign up or subscribe" })).toHaveFocus();
    // The other questions are optional.
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next" })).toHaveAccessibleDescription("You can skip this one.");

    await user.click(screen.getByRole("button", { name: "Back" }));
    // Back to question 1 with the answer kept, and focus on it.
    expect(screen.getByRole("radio", { name: "A blog post or article" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "A blog post or article" })).toHaveFocus();
  });

  it("ticks several needs in one question", async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);
    await user.click(screen.getByRole("radio", { name: "A landing page" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    const needs = screen.getByRole("group", { name: "What else should the page do?" });
    await user.click(within(needs).getByRole("checkbox", { name: "Answer common questions" }));
    await user.click(within(needs).getByRole("checkbox", { name: "Show success, errors or notices" }));
    expect(within(needs).getAllByRole("checkbox", { checked: true })).toHaveLength(2);
    await user.click(within(needs).getByRole("checkbox", { name: "Answer common questions" }));
    expect(within(needs).getAllByRole("checkbox", { checked: true })).toHaveLength(1);
  });

  it("shows the suggestions: a start, an outline, real components with reasons, and tips", async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);
    await answerAll(user);

    // Focus lands on the new heading.
    expect(screen.getByRole("heading", { level: 2, name: "Your starting point" })).toHaveFocus();
    expect(screen.getByRole("heading", { level: 3, name: "Start from the landing page" })).toBeInTheDocument();
    const outline = screen.getByRole("heading", { level: 3, name: "Your page, top to bottom" }).closest("section");
    expect(within(/** @type {HTMLElement} */ (outline)).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      expect.stringContaining("Hero."),
      expect.stringContaining("Features."),
      expect.stringContaining("FAQ."),
      expect.stringContaining("Sign-up."),
    ]);
    // The accordion is here because they asked for answers to common questions, and says so.
    const accordion = screen.getByRole("heading", { level: 4, name: "Accordion" }).closest("li");
    expect(accordion).toHaveTextContent("Because you chose “Answer common questions”");
    // And it's the real, working component.
    expect(within(/** @type {HTMLElement} */ (accordion)).getByRole("button", { name: "How long does delivery take?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Code and install guide for Accordion" })).toHaveAttribute("href", "/components/accordion");
    expect(screen.getByRole("heading", { level: 3, name: "Design tips for your answers" })).toBeInTheDocument();
    // One primary action on the view.
    expect(screen.getByRole("link", { name: "Open the editor" })).toHaveAttribute("href", "/editor");
  });

  it("lets people change their answers, or start over", async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);
    await answerAll(user);

    await user.click(screen.getByRole("button", { name: "Change my answers" }));
    expect(screen.getByRole("radio", { name: "A landing page" })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: "A contact page" }));
    for (const name of ["Next", "Next", "Next", "See my suggestions"]) await user.click(screen.getByRole("button", { name }));
    expect(screen.getByRole("heading", { level: 3, name: "Start from the contact page" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start over" }));
    expect(screen.getByRole("radio", { name: "A contact page" })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("offers the plan as text, to copy or read", async () => {
    const user = userEvent.setup();
    render(<SuggestPage />);
    await answerAll(user);
    expect(screen.getByRole("button", { name: "Copy this plan" })).toBeInTheDocument();
    await user.click(screen.getByText("Show the plan as text"));
    expect(document.getElementById("plan-text")).toHaveTextContent("Making: A landing page");
  });
});
