// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { InstallGuide } from "./install-guide";

afterEach(() => localStorage.clear());

describe("InstallGuide", () => {
  it("shows numbered Next.js steps with npm by default", () => {
    render(<InstallGuide name="button" />);
    expect(screen.getByRole("radio", { name: "Next.js" })).toBeChecked();
    expect(screen.getByText("npm install clsx tailwind-merge")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Copy the Button component/ })).toBeInTheDocument();
  });

  it("switches framework and package manager, and remembers both", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<InstallGuide name="alert" />);
    await user.click(screen.getByRole("radio", { name: "Vite" }));
    await user.click(screen.getByRole("radio", { name: "pnpm" }));
    expect(screen.getByLabelText("vite.config.js")).toBeInTheDocument();
    expect(screen.getByText("pnpm add clsx lucide-react tailwind-merge")).toBeInTheDocument();
    unmount();

    render(<InstallGuide name="card" />);
    expect(screen.getByRole("radio", { name: "Vite" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "pnpm" })).toBeChecked();
  });

  it("says plainly that there's no HTML version yet", async () => {
    const user = userEvent.setup();
    render(<InstallGuide name="button" />);
    await user.click(screen.getByRole("radio", { name: "HTML" }));
    expect(screen.getByText(/no plain-HTML version yet/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copy prompt for your AI agent" })).not.toBeInTheDocument();
  });

  it("copies an agent prompt built for the chosen setup", async () => {
    const user = userEvent.setup();
    render(<InstallGuide name="tabs" />);
    await user.click(screen.getByRole("button", { name: "Copy prompt for your AI agent" }));
    const prompt = await navigator.clipboard.readText();
    expect(prompt).toContain('Add the Volt "Tabs" component to this Next.js (App Router) project.');
    expect(prompt).toContain("`components/ui/tabs.jsx`");
  });
});
