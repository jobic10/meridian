import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
import { formatDate, patientName } from "@/lib/format";

export default async function PharmacyPage() {
  await requireRole(["PHARMACIST", "ADMIN"]);

  const [pending, dispensedRecent] = await Promise.all([
    prisma.prescription.findMany({
      where: { dispensed: false },
      include: {
        medicalRecord: { include: { patient: true, doctor: { select: { name: true } } } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.prescription.findMany({
      where: { dispensed: true },
      include: {
        medicalRecord: { include: { patient: true } },
        dispensedBy: { select: { name: true } },
      },
      orderBy: { dispensedAt: "desc" },
      take: 10,
    }),
  ]);

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
                  <TableCell>
                    <Link
                      href={`/patients/${p.medicalRecord.patientId}`}
                      className="font-medium text-ink hover:text-primary"
                    >
                      {patientName(p.medicalRecord.patient)}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium text-ink">{p.drugName}</TableCell>
                  <TableCell className="text-ink-muted">{p.dosage}</TableCell>
                  <TableCell className="text-ink-muted">{p.duration}</TableCell>
                  <TableCell className="text-ink-muted">
                    {p.medicalRecord.doctor.name}
                  </TableCell>
                  <TableCell className="text-ink-muted">
                    {formatDate(p.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DispenseButton prescriptionId={p.id} drugName={p.drugName} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {dispensedRecent.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
            Recently dispensed
          </h2>
          <div className="rounded-lg border border-border bg-surface shadow-sm">
            <ul className="divide-y divide-border">
              {dispensedRecent.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-[13.5px] text-ink">
                      <span className="font-medium">{p.drugName}</span> for{" "}
                      {patientName(p.medicalRecord.patient)}
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
