// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { avatarProps } from "@/registry/avatar";
import { Avatar, getInitials, sizes } from "./avatar";

describe("getInitials", () => {
  it.each([
    ["Alex Morgan", "AM"],
    ["alex", "A"],
    ["Mary Jane Watson", "MW"],
    ["  Priya   Shah  ", "PS"],
    ["Élodie Durand", "ÉD"],
    ["", ""],
    ["   ", ""],
  ])("%j -> %j", (name, initials) => {
    expect(getInitials(name)).toBe(initials);
  });

  it("doesn't split a character that takes two UTF-16 units", () => {
    // "𝒜" is one character but two code units; slicing with [0] would break it.
    expect(getInitials("𝒜lex Morgan")).toBe("𝒜M");
  });
});

describe("Avatar", () => {
  it("shows initials, named with the person's full name", () => {
    render(<Avatar name="Alex Morgan" />);
    const avatar = screen.getByRole("img", { name: "Alex Morgan" });
    expect(avatar).toHaveTextContent("AM");
  });

  it("shows the photo with the person's name as alt text", () => {
    render(<Avatar name="Alex Morgan" src="https://example.com/alex.jpg" />);
    const photo = screen.getByRole("img", { name: "Alex Morgan" });
    expect(photo.tagName).toBe("IMG");
    expect(photo).toHaveAttribute("src", "https://example.com/alex.jpg");
  });

  it("falls back to initials when the photo fails to load", () => {
    render(<Avatar name="Alex Morgan" src="https://example.com/missing.jpg" />);
    const photo = screen.getByRole("img", { name: "Alex Morgan" });
    fireEvent.error(photo);
    expect(screen.queryByRole("img", { name: "Alex Morgan" })?.tagName).toBe("SPAN");
    expect(screen.getByText("AM")).toBeInTheDocument();
  });

  it("tries a new photo address after the previous one failed", () => {
    const { rerender } = render(<Avatar name="Alex Morgan" src="https://example.com/missing.jpg" />);
    fireEvent.error(screen.getByRole("img"));
    rerender(<Avatar name="Alex Morgan" src="https://example.com/alex.jpg" />);
    expect(screen.getByRole("img", { name: "Alex Morgan" }).tagName).toBe("IMG");
  });

  it("when decorative, is hidden from screen readers, photo or not", () => {
    const { rerender } = render(<Avatar name="Alex Morgan" decorative />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    rerender(<Avatar name="Alex Morgan" src="https://example.com/alex.jpg" decorative />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

describe("Avatar and its manifest", () => {
  it("has a size for exactly the sizes the manifest allows", () => {
    const manifestSizes = avatarProps.shape.size.unwrap().options;
    expect(Object.keys(sizes).sort()).toEqual([...manifestSizes].sort());
  });

  it.each(["https://example.com/a.jpg", "/images/a.png", ""])("accepts the image address %j", (src) => {
    expect(avatarProps.safeParse({ src }).success).toBe(true);
  });

  it.each(["javascript:alert(1)", "http://example.com/a.jpg", "data:image/png;base64,AAAA", "a.jpg"])(
    "rejects the unsafe or ambiguous image address %j",
    (src) => {
      expect(avatarProps.safeParse({ src }).success).toBe(false);
    },
  );
});
