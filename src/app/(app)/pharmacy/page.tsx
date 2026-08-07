import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { DispenseButton } from "@/components/dispense-button";
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

type PrescriptionRow = {
  id: number;
  drugName: string;
  dosage: string;
  duration: string;
  createdAt: string;
  patientId: number;
  patientName: string;
  doctorName: string;
  dispensed: boolean;
  dispensedBy: { name: string } | null;
  dispensedAt: string | null;
};

export default async function PharmacyPage() {
  await requireRole(["PHARMACIST", "ADMIN"]);

  const [pending, dispensedRecent]: [PrescriptionRow[], PrescriptionRow[]] = await Promise.all([
    apiGet("/prescriptions/?dispensed=false"),
    apiGet("/prescriptions/?dispensed=true"),
  ]);
  const recentTen = dispensedRecent.slice(0, 10);

  return (
    <div>
      <PageHeader
        eyebrow="Pharmacy"
        title="Dispensing queue"
        description="Prescriptions issued by doctors, awaiting dispensing to the patient."
      />

      <div className="rounded-lg border border-border bg-surface shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Drug</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Prescribed by</TableHead>
              <TableHead>Date</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.length === 0 ? (
              <TableEmpty colSpan={7}>Nothing pending — queue is clear.</TableEmpty>
            ) : (
              pending.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="whitespace-nowrap">
                    <Link
                      href={`/patients/${p.patientId}`}
                      className="font-medium text-ink hover:text-primary"
                    >
                      {p.patientName}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium text-ink">
                    {p.drugName}
                  </TableCell>
                  <TableCell className="max-w-36 truncate text-ink-muted" title={p.dosage}>
                    {p.dosage}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-muted">
                    {p.duration}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-muted">
                    {p.doctorName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-muted">
                    {formatDate(p.createdAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <DispenseButton prescriptionId={p.id} drugName={p.drugName} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {recentTen.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
            Recently dispensed
          </h2>
          <div className="rounded-lg border border-border bg-surface shadow-sm">
            <ul className="divide-y divide-border">
              {recentTen.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-[13.5px] text-ink">
                      <span className="font-medium">{p.drugName}</span> for {p.patientName}
                    </p>
                    <p className="text-[12px] text-ink-faint">
                      Dispensed by {p.dispensedBy?.name} ·{" "}
                      {p.dispensedAt ? formatDate(p.dispensedAt) : ""}
                    </p>
                  </div>
                  <Badge variant="success">Dispensed</Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
