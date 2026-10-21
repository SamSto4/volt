import { describe, expect, it } from "vitest";
import { TEMPLATES } from "@/editor/store/example-page.js";
import { manifests } from "@/registry";
import { sections } from "@/registry/sections";
import { QUESTIONS, emptyAnswers } from "./questions.js";
import { COMPONENT_WHY, SECTION_TITLES, STARTS, labelFor, planAsText, recommend } from "./recommend.js";

/** @param {Partial<import("./questions.js").Answers>} answers */
const answers = (answers = {}) => ({ ...emptyAnswers(), ...answers });

const optionIds = (/** @type {string} */ questionId) => QUESTIONS.find((question) => question.id === questionId)?.options.map((option) => option.id) ?? [];
const names = (/** @type {import("./recommend.js").Recommendation} */ result) => result.components.map((item) => item.name);

describe("the rules match the rest of Volt", () => {
  it("know exactly the components that exist, in catalog order", () => {
    // Sorting uses this order, so it has to be the manifests' order.
    expect(Object.keys(COMPONENT_WHY)).toEqual(manifests.map((manifest) => manifest.name));
  });

  it("name sections that exist, with the titles the editor shows", () => {
    expect(Object.keys(SECTION_TITLES).sort()).toEqual(sections.map((section) => section.name).sort());
    for (const section of sections) expect(SECTION_TITLES[section.name], section.name).toBe(section.title);
  });

  it("send people to starts the editor really has", () => {
    for (const [id, start] of Object.entries(STARTS)) {
      // "pricing" reuses the landing page, and "blank" is the empty page.
      const template = id === "pricing" ? "landing" : id;
      if (template === "blank") continue;
      expect(Object.keys(TEMPLATES), id).toContain(template);
      expect(TEMPLATES[/** @type {keyof typeof TEMPLATES} */ (template)].title, id).toBe(start.title);
    }
  });
});

describe("recommend", () => {
  it("waits for the first answer", () => {
    expect(recommend(answers()).ready).toBe(false);
    expect(recommend(answers({ action: "signup" })).ready).toBe(false);
    expect(recommend(answers({ goal: "not-a-goal" })).ready).toBe(false);
    // Words from JavaScript's own objects aren't answers.
    expect(recommend(answers({ goal: "constructor" })).ready).toBe(false);
  });

  it.each(optionIds("goal"))("gives a %s page a starting template and at least one component to start with", (goal) => {
    const result = recommend(answers({ goal }));
    expect(result.ready).toBe(true);
    expect(result.start?.how).toBeTruthy();
    expect(result.components.filter((item) => item.level === "start").length).toBeGreaterThan(0);
  });

  it("works for every goal and action together", () => {
    for (const goal of optionIds("goal")) {
      for (const action of optionIds("action")) {
        const result = recommend(answers({ goal, action }));
        const known = Object.keys(COMPONENT_WHY);
        expect(names(result).every((name) => known.includes(name)), `${goal} + ${action}`).toBe(true);
        // No component twice.
        expect(new Set(names(result)).size).toBe(names(result).length);
        // Every suggestion says why, and which answer led to it.
        for (const item of result.components) {
          expect(item.why.length, `${goal} + ${action}: ${item.name}`).toBeGreaterThan(10);
          expect(item.because.length, `${goal} + ${action}: ${item.name}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("uses every option of every question: none leads nowhere", () => {
    const base = answers({ goal: "landing" });
    const baseline = JSON.stringify(recommend(base));
    for (const question of QUESTIONS) {
      for (const option of question.options) {
        const withIt =
          question.id === "needs" ? answers({ goal: "landing", needs: [option.id] }) : { ...base, [question.id]: option.id };
        // Choosing the baseline's own goal changes nothing by design.
        if (question.id === "goal" && option.id === "landing") continue;
        expect(JSON.stringify(recommend(withIt)), `${question.id}: ${option.id}`).not.toBe(baseline);
      }
    }
  });

  it("starts with what the person said they need, in words that name their answer", () => {
    const result = recommend(answers({ goal: "landing", needs: ["compare"] }));
    const table = result.components.find((item) => item.name === "table");
    expect(table?.level).toBe("start");
    expect(table?.because).toEqual(["Compare things in rows and columns"]);
  });

  it("lists the answers behind a component that several of them asked for", () => {
    const result = recommend(answers({ goal: "contact", action: "contact", needs: ["form"] }));
    const input = result.components.find((item) => item.name === "input");
    expect(input?.because).toEqual(["Collect details in a form", "Get in touch", "A contact page"]);
  });

  it("puts 'start with' before 'worth considering', each in catalog order", () => {
    // A landing page's badge is only "worth considering", yet comes before the
    // card in catalog order: only the level sort puts the card first.
    const result = recommend(answers({ goal: "landing", needs: ["compare"] }));
    expect(names(result).indexOf("badge")).toBeGreaterThan(names(result).indexOf("card"));
    const levels = result.components.map((item) => item.level);
    expect(levels).toEqual([...levels].sort((a, b) => Number(b === "start") - Number(a === "start")));
    const catalog = Object.keys(COMPONENT_WHY);
    for (const level of ["start", "consider"]) {
      const group = result.components.filter((item) => item.level === level).map((item) => catalog.indexOf(item.name));
      expect(group).toEqual([...group].sort((a, b) => a - b));
    }
  });

  it("doesn't depend on the order boxes were ticked", () => {
    const one = recommend(answers({ goal: "landing", needs: ["faq", "form", "status"] }));
    const other = recommend(answers({ goal: "landing", needs: ["status", "faq", "form"] }));
    expect(other).toEqual(one);
  });

  it("outlines the page in the order a page reads, once per section", () => {
    const result = recommend(answers({ goal: "landing", action: "signup", needs: ["faq", "form"] }));
    expect(result.outline.map((item) => item.section)).toEqual(["hero", "features", "faq", "signup"]);
    const blog = recommend(answers({ goal: "blog", action: "read" }));
    expect(blog.outline.map((item) => item.section)).toEqual(["article", "callout"]);
  });

  it("has no outline for an app screen, which starts blank", () => {
    const result = recommend(answers({ goal: "app" }));
    expect(result.outline).toEqual([]);
    expect(result.start?.id).toBe("blank");
  });

  it("gives at most six tips, with the person's own answers first and no repeats", () => {
    const result = recommend(answers({ goal: "app", action: "manage", needs: optionIds("needs"), device: "phone" }));
    expect(result.tips).toHaveLength(6);
    expect(new Set(result.tips).size).toBe(6);
    // A tip for something they ticked comes before the generic ones.
    expect(result.tips.some((tip) => tip.includes("One primary button per view"))).toBe(false);
    const bare = recommend(answers({ goal: "landing" }));
    expect(bare.tips.at(-1)).toBe("Try the page with only the keyboard before you share it.");
  });
});

describe("labelFor", () => {
  it("reads an option back as the words people clicked", () => {
    expect(labelFor("goal", "app")).toBe("A dashboard or app screen");
    expect(labelFor("goal", "zzz")).toBe("zzz");
  });
});

describe("planAsText", () => {
  it("is empty until there's a plan", () => {
    expect(planAsText(answers(), recommend(answers()))).toBe("");
  });

  it("writes the answers, the start, the outline, every component and the tips", () => {
    const given = answers({ goal: "landing", action: "signup", needs: ["faq"], device: "phone" });
    const result = recommend(given);
    const text = planAsText(given, result);
    expect(text).toContain("Making: A landing page");
    expect(text).toContain("Main action: Sign up or subscribe");
    expect(text).toContain("Also needs: Answer common questions");
    expect(text).toContain("Seen mostly: On phones");
    expect(text).toContain("Start from: Landing page");
    expect(text).toContain("1. Hero:");
    for (const item of result.components) expect(text).toContain(`- ${item.name} (`);
    for (const tip of result.tips) expect(text).toContain(`- ${tip}`);
  });
});
