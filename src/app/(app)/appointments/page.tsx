import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { apiGet } from "@/lib/api";
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

type AppointmentRow = {
  id: number;
  patientId: number;
  patient: { firstName: string; lastName: string };
  doctor: { name: string };
  date: string;
  time: string;
  reason: string | null;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
};

export default async function AppointmentsPage() {
  const user = await requireRole(["ADMIN", "DOCTOR", "NURSE", "RECORDS_OFFICER"]);

  const [appointments, doctors, patients]: [
    AppointmentRow[],
    Array<{ id: number; name: string; specialisation: string | null }>,
    Array<{ id: number; firstName: string; lastName: string; patientCode: string }>,
  ] = await Promise.all([
    apiGet("/appointments/"),
    apiGet("/users/?role=DOCTOR&status=ACTIVE"),
    apiGet("/patients/"),
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
                  <TableCell className="whitespace-nowrap">
                    <Link
                      href={`/patients/${a.patientId}`}
                      className="font-medium text-ink hover:text-primary"
                    >
                      {patientName(a.patient)}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-muted">
                    {a.doctor.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-muted">
                    {formatDate(a.date)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-[12.5px] text-ink-muted">
                    {formatTime(a.time)}
                  </TableCell>
                  <TableCell
                    className="max-w-40 truncate text-ink-muted"
                    title={a.reason ?? undefined}
                  >
                    {a.reason ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
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
