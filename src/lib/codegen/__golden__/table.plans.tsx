import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Example() {
  return (
    <Table>
      <TableCaption>Compare plans</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Plan</TableHead>
          <TableHead>Projects</TableHead>
          <TableHead>Support</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableHead scope="row">Starter</TableHead>
          <TableCell>1</TableCell>
          <TableCell>Email</TableCell>
        </TableRow>
        <TableRow>
          <TableHead scope="row">Team</TableHead>
          <TableCell>Unlimited</TableCell>
          <TableCell>Email and chat</TableCell>
        </TableRow>
        <TableRow>
          <TableHead scope="row">Business</TableHead>
          <TableCell>Unlimited</TableCell>
          <TableCell>Priority, with a named contact</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
