import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ScheduleAppointmentDialog } from "@/components/schedule-appointment-dialog";
import { AppointmentRowActions } from "@/components/appointment-row-actions";
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
import { formatDate, formatTime, patientName } from "@/lib/format";

export default async function AppointmentsPage() {
  const user = await requireRole(["ADMIN", "DOCTOR", "NURSE", "RECORDS_OFFICER"]);

  const where = user.role === "DOCTOR" ? { doctorId: user.id } : {};

  const [appointments, doctors, patients] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { patient: true, doctor: { select: { name: true } } },
      orderBy: [{ date: "desc" }, { time: "asc" }],
      take: 150,
    }),
    prisma.user.findMany({
      where: { role: "DOCTOR", status: "ACTIVE" },
      select: { id: true, name: true, specialisation: true },
      orderBy: { name: "asc" },
    }),
    prisma.patient.findMany({
      select: { id: true, firstName: true, lastName: true, patientCode: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  const patientOptions = patients.map((p) => ({
    id: p.id,
    label: `${p.firstName} ${p.lastName} (${p.patientCode})`,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Scheduling"
        title={user.role === "DOCTOR" ? "Your appointments" : "Appointments"}
        description="Book, review and manage patient appointments across the facility."
        actions={
          <ScheduleAppointmentDialog doctors={doctors} patients={patientOptions} />
        }
      />

      <div className="rounded-lg border border-border bg-surface shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableEmpty colSpan={7}>No appointments found.</TableEmpty>
            ) : (
              appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Link
                      href={`/patients/${a.patientId}`}
                      className="font-medium text-ink hover:text-primary"
                    >
                      {patientName(a.patient)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-ink-muted">{a.doctor.name}</TableCell>
                  <TableCell className="text-ink-muted">{formatDate(a.date)}</TableCell>
                  <TableCell className="font-mono text-[12.5px] text-ink-muted">
                    {formatTime(a.time)}
                  </TableCell>
                  <TableCell className="text-ink-muted">{a.reason ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        a.status === "COMPLETED"
                          ? "success"
                          : a.status === "CANCELLED"
                            ? "danger"
                            : "primary"
                      }
                    >
                      {a.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AppointmentRowActions appointmentId={a.id} status={a.status} />
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
