import { Link } from "react-router-dom";
import {
  Badge,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../ui";

interface IntelTableRow {
  id: string;
  primary: string;
  secondary: string;
  status: string;
  visibility: string;
  href: string;
}

interface IntelTableProps {
  rows: IntelTableRow[];
  title: string;
}

export function IntelTable({ rows, title }: IntelTableProps) {
  const statusTone = (value: string) => {
    const status = value.toLowerCase();
    if (status.includes("invalid") || status.includes("failed")) return "danger";
    if (status.includes("false")) return "warning";
    if (status.includes("verified")) return "success";
    return "neutral";
  };

  return (
    <Card className="overflow-hidden border-[#E5E8F2] dark:border-[#2A2A3E]">
      <CardContent className="p-0">
        <div className="border-b border-[#EEF1FA] px-5 py-4 dark:border-[#3A3A4E]">
          <h3 className="text-base font-semibold text-[#100A36] dark:text-white">
            {title}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Record</TableHeaderCell>
                <TableHeaderCell>Details</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Visibility</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-[#100A36] dark:text-white">
                    {row.primary}
                  </TableCell>
                  <TableCell className="dark:text-[#B0B5C3]">
                    {row.secondary}
                  </TableCell>
                  <TableCell>
                    <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge tone="blue">{row.visibility}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={row.href}
                      className="font-medium text-[#4A3CC9] hover:underline dark:text-[#88ADFF]"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
