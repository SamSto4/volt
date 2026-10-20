import { describe, expect, it } from "vitest";
import { matchScore, searchCommands } from "./commands.js";

const noop = () => {};
/** @type {import("./commands.js").Command[]} */
const commands = [
  { id: "add-button", title: "Add Button to page", group: "Components", run: noop },
  { id: "add-accordion", title: "Add Accordion to page", group: "Components", run: noop },
  { id: "add-dialog", title: "Add Dialog to page", group: "Components", run: noop },
  { id: "undo", title: "Undo", group: "History", shortcut: "⌘Z", run: noop },
  { id: "view-code", title: "Show the code", group: "View", run: noop },
  { id: "width-375", title: "Canvas width 375", group: "View", keywords: ["phone"], run: noop },
];
const titles = (/** @type {import("./commands.js").Command[]} */ list) => list.map((command) => command.title);

describe("matchScore", () => {
  it("ranks a prefix over a word start over a substring over letters in order", () => {
    const text = "Add Button to page";
    expect(matchScore(text, "add")).toBeGreaterThan(matchScore(text, "but"));
    expect(matchScore(text, "but")).toBeGreaterThan(matchScore(text, "utto"));
    expect(matchScore(text, "utto")).toBeGreaterThan(matchScore(text, "abtp"));
    expect(matchScore(text, "zzz")).toBe(0);
  });

  it("ignores case and surrounding spaces", () => {
    expect(matchScore("Undo", "  UNDO ")).toBe(100);
  });
});

describe("searchCommands", () => {
  it("returns everything in order for an empty query", () => {
    expect(titles(searchCommands(commands, ""))).toEqual(titles(commands));
  });

  it("puts recent commands first when there's no query", () => {
    expect(titles(searchCommands(commands, "", ["undo", "add-dialog"])).slice(0, 2)).toEqual(["Undo", "Add Dialog to page"]);
  });

  it("finds commands by synonym, ranked first", () => {
    expect(titles(searchCommands(commands, "modal"))[0]).toBe("Add Dialog to page");
    expect(titles(searchCommands(commands, "faq"))[0]).toBe("Add Accordion to page");
    expect(titles(searchCommands([...commands, { id: "add-skeleton", title: "Add Skeleton to page", group: "Components", run: noop }], "loading"))[0]).toBe(
      "Add Skeleton to page",
    );
    // "cta" also loosely matches "Add Accordion to page" (c…t…a in order),
    // but a synonym hit ranks above letters-in-order.
    const cta = titles(searchCommands(commands, "cta"));
    expect(cta[0]).toBe("Add Button to page");
    expect(cta.indexOf("Add Accordion to page")).toBeGreaterThan(0);
  });

  it("finds commands by their own keywords and their group", () => {
    expect(titles(searchCommands(commands, "phone"))).toContain("Canvas width 375");
    expect(titles(searchCommands(commands, "history"))).toEqual(["Undo"]);
  });

  it("ranks a title match above a synonym match", () => {
    const results = titles(searchCommands(commands, "code"));
    expect(results[0]).toBe("Show the code");
  });

  it("drops commands that don't match at all", () => {
    expect(searchCommands(commands, "qqq")).toEqual([]);
  });
});
