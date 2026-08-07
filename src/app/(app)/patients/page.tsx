import Link from "next/link";
import { UserPlus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { PatientSearch } from "@/components/patient-search";
import { Button } from "@/components/ui/button";
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
import { calculateAge, formatDate, patientName } from "@/lib/format";

export default async function PatientsPage({
  searchParams,
}: PageProps<"/patients">) {
  const user = await requireUser();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const canRegister = user.role === "RECORDS_OFFICER" || user.role === "ADMIN";

  const patients = await prisma.patient.findMany({
    where: query
      ? {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { patientCode: { contains: query } },
            { phone: { contains: query } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Central archive"
        title="Patients"
        description="Search the hospital's complete patient record by name, patient ID, or phone number."
        actions={
          canRegister ? (
            <Button asChild>
              <Link href="/patients/new">
                <UserPlus className="size-4" /> Register patient
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4">
        <PatientSearch placeholder="Search by name, ID or phone…" />
      </div>

      <div className="rounded-lg border border-border bg-surface shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Age / Gender</TableHead>
              <TableHead>Blood group</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableEmpty colSpan={6}>
                {query
                  ? `No patients match "${query}".`
                  : "No patients registered yet."}
              </TableEmpty>
            ) : (
              patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/patients/${p.id}`}
                      className="font-medium text-ink hover:text-primary"
                    >
                      {patientName(p)}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-[12.5px] text-ink-muted">
                    {p.patientCode}
                  </TableCell>
                  <TableCell className="text-ink-muted">
                    {calculateAge(p.dateOfBirth)} yrs · {p.gender}
                  </TableCell>
                  <TableCell>
                    {p.bloodGroup ? (
                      <Badge variant="neutral">{p.bloodGroup}</Badge>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-ink-muted">
                    {p.phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-ink-muted">
                    {formatDate(p.createdAt)}
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
