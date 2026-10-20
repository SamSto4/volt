import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEMO_COMPONENTS, STATUS } from "./demo-data";
import { ShowcaseCard } from "./showcase";

/**
 * A compact data table: what's in a project, its status, and when it changed.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function TableCard({ className } = {}) {
  return (
    <ShowcaseCard className={className} id="table" title="Data table" context="Dashboards · Projects" note="Rows light up under the pointer; the table reads cell by cell with screen-reader table commands.">
      <Table>
        <TableCaption>Components in an example project</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Component</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEMO_COMPONENTS.map((component) => (
            <TableRow key={component.id}>
              <TableHead scope="row">
                {component.name}
                <span className="block font-normal text-muted-foreground">{component.kind}</span>
              </TableHead>
              <TableCell>
                <Badge variant={STATUS[component.status].variant}>{STATUS[component.status].label}</Badge>
              </TableCell>
              <TableCell>{component.updated}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ShowcaseCard>
  );
}
