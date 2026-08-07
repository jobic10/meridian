import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart } from "@/components/charts/bar-chart";
import { StatusBars } from "@/components/charts/status-bars";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CalendarClock, Pill, ShieldCheck } from "lucide-react";

function weekLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(date);
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = (day + 6) % 7; // Monday as start
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function ReportsPage() {
  await requireRole(["ADMIN"]);

  const [
    patientCount,
    appointmentCount,
    activeStaff,
    dispensedCount,
    patients,
    appointments,
    records,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.prescription.count({ where: { dispensed: true } }),
    prisma.patient.findMany({ select: { createdAt: true } }),
    prisma.appointment.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.medicalRecord.findMany({ select: { diagnosis: true } }),
  ]);

  // Weekly registrations, last 8 weeks
  const now = new Date();
  const weeks: { start: Date; label: string; value: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = startOfWeek(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7));
    weeks.push({ start, label: weekLabel(start), value: 0 });
  }
  for (const p of patients) {
    const bucketStart = startOfWeek(p.createdAt);
    const match = weeks.find((w) => w.start.getTime() === bucketStart.getTime());
    if (match) match.value += 1;
  }

  // Appointment status breakdown
  const statusOrder: Array<{ key: string; label: string; colorVar: string }> = [
    { key: "PENDING", label: "Pending", colorVar: "var(--color-warning)" },
    { key: "COMPLETED", label: "Completed", colorVar: "var(--color-success)" },
    { key: "CANCELLED", label: "Cancelled", colorVar: "var(--color-danger)" },
  ];
  const statusRows = statusOrder.map((s) => ({
    label: s.label,
    colorVar: s.colorVar,
    value: appointments.find((a) => a.status === s.key)?._count.status ?? 0,
  }));

  // Top diagnoses
  const diagnosisCounts = new Map<string, number>();
  for (const r of records) {
    diagnosisCounts.set(r.diagnosis, (diagnosisCounts.get(r.diagnosis) ?? 0) + 1);
  }
  const topDiagnoses = [...diagnosisCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({
      label: label.length > 18 ? `${label.slice(0, 17)}…` : label,
      value,
    }));

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Reports"
        description="Facility-wide statistics for planning and decision making."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Registered patients" value={patientCount} icon={Users} tone="primary" />
        <StatCard label="Total appointments" value={appointmentCount} icon={CalendarClock} tone="accent" />
        <StatCard label="Active staff" value={activeStaff} icon={ShieldCheck} tone="success" />
        <StatCard label="Prescriptions dispensed" value={dispensedCount} icon={Pill} tone="warning" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Patient registrations</CardTitle>
              <CardDescription>Weekly, last 8 weeks</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <BarChart data={weeks.map((w) => ({ label: w.label, value: w.value }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Appointment status</CardTitle>
              <CardDescription>All appointments on record</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <StatusBars rows={statusRows} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Most common diagnoses</CardTitle>
              <CardDescription>Across all recorded visits</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {topDiagnoses.length === 0 ? (
              <p className="py-6 text-center text-[13.5px] text-ink-faint">
                No medical records yet.
              </p>
            ) : (
              <BarChart
                data={topDiagnoses}
                color="var(--color-accent)"
                height={210}
                angledLabels
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
