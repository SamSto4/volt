// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./table";

function Plans() {
  return (
    <>
      <Table>
        <TableCaption>Compare plans</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead>Projects</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableHead scope="row">Starter</TableHead>
            <TableCell>1</TableCell>
          </TableRow>
          <TableRow>
            <TableHead scope="row">Team</TableHead>
            <TableCell>Unlimited</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <button type="button">Next</button>
    </>
  );
}

describe("Table", () => {
  it("is a real table named by its caption", () => {
    render(<Plans />);
    expect(screen.getByRole("table", { name: "Compare plans" })).toBeInTheDocument();
  });

  it("has column headers and row headers, so each cell is read with both", () => {
    render(<Plans />);
    expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual(["Plan", "Projects"]);
    expect(screen.getAllByRole("rowheader").map((cell) => cell.textContent)).toEqual(["Starter", "Team"]);
    const team = screen.getAllByRole("row")[2];
    expect(within(team).getByRole("cell")).toHaveTextContent("Unlimited");
  });

  it("is not interactive: Tab goes past it", async () => {
    const user = userEvent.setup();
    render(<Plans />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
  });
});
