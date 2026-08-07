import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { CompleteLabDialog } from "@/components/complete-lab-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";

type LabRow = {
  id: number;
  patientId: number;
  patientName: string;
  testName: string;
  result: string | null;
  status: "PENDING" | "COMPLETED";
  enteredBy: { name: string };
  createdAt: string;
  completedAt: string | null;
};

export default async function LabPage() {
  await requireRole(["ADMIN", "DOCTOR", "NURSE"]);

  const [pending, completed]: [LabRow[], LabRow[]] = await Promise.all([
    apiGet("/lab-results/?status=PENDING"),
    apiGet("/lab-results/?status=COMPLETED"),
  ]);
  const recentCompleted = completed.slice(0, 15);

  return (
    <div>
      <PageHeader
        eyebrow="Laboratory"
        title="Test results"
        description="Pending laboratory orders and recently completed results across the facility."
      />

      <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
        Pending ({pending.length})
      </h2>
      <div className="mb-8 rounded-lg border border-border bg-surface shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Test</TableHead>
              <TableHead>Ordered by</TableHead>
              <TableHead>Date</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.length === 0 ? (
              <TableEmpty colSpan={5}>No pending laboratory orders.</TableEmpty>
            ) : (
              pending.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap">
                    <Link
                      href={`/patients/${l.patientId}`}
                      className="font-medium text-ink hover:text-primary"
                    >
                      {l.patientName}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink">{l.testName}</TableCell>
                  <TableCell className="whitespace-nowrap text-ink-muted">
                    {l.enteredBy.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-muted">
                    {formatDate(l.createdAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <CompleteLabDialog labResultId={String(l.id)} testName={l.testName} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
        Recently completed
      </h2>
      <div className="rounded-lg border border-border bg-surface shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Test</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentCompleted.length === 0 ? (
              <TableEmpty colSpan={4}>No completed results yet.</TableEmpty>
            ) : (
              recentCompleted.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap">
                    <Link
                      href={`/patients/${l.patientId}`}
                      className="font-medium text-ink hover:text-primary"
                    >
                      {l.patientName}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink">{l.testName}</TableCell>
                  <TableCell className="max-w-xs truncate text-ink-muted" title={l.result ?? ""}>
                    {l.result}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-muted">
                    {l.completedAt ? formatDate(l.completedAt) : "—"}
                    <Badge variant="success" className="ml-2">
                      Done
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
