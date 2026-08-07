import { requireRole } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart } from "@/components/charts/bar-chart";
import { StatusBars } from "@/components/charts/status-bars";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CalendarClock, Pill, ShieldCheck } from "lucide-react";

type ReportsSummary = {
  patientCount: number;
  appointmentCount: number;
  activeStaff: number;
  dispensedCount: number;
  weeklyRegistrations: { label: string; value: number }[];
  appointmentStatus: { label: string; value: number; tone: "warning" | "success" | "danger" }[];
  topDiagnoses: { label: string; value: number }[];
};

const TONE_COLOR_VAR: Record<string, string> = {
  warning: "var(--color-warning)",
  success: "var(--color-success)",
  danger: "var(--color-danger)",
};

export default async function ReportsPage() {
  await requireRole(["ADMIN"]);

  const summary: ReportsSummary = await apiGet("/reports/summary/");
  const {
    patientCount,
    appointmentCount,
    activeStaff,
    dispensedCount,
    weeklyRegistrations,
    appointmentStatus,
    topDiagnoses,
  } = summary;

  const statusRows = appointmentStatus.map((s) => ({
    label: s.label,
    value: s.value,
    colorVar: TONE_COLOR_VAR[s.tone],
  }));

  const diagnosisRows = topDiagnoses.map((d) => ({
    label: d.label.length > 18 ? `${d.label.slice(0, 17)}…` : d.label,
    value: d.value,
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
            <BarChart data={weeklyRegistrations} />
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
            {diagnosisRows.length === 0 ? (
              <p className="py-6 text-center text-[13.5px] text-ink-faint">
                No medical records yet.
              </p>
            ) : (
              <BarChart
                data={diagnosisRows}
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
