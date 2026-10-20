import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Example() {
  return (
    <Table>
      <TableCaption>Opening hours</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Day</TableHead>
          <TableHead>Opens</TableHead>
          <TableHead>Closes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableHead scope="row">Monday to Friday</TableHead>
          <TableCell>8:00</TableCell>
          <TableCell>18:00</TableCell>
        </TableRow>
        <TableRow>
          <TableHead scope="row">Saturday</TableHead>
          <TableCell>9:00</TableCell>
          <TableCell>16:00</TableCell>
        </TableRow>
        <TableRow>
          <TableHead scope="row">Sunday</TableHead>
          <TableCell>Closed</TableCell>
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  );
}
