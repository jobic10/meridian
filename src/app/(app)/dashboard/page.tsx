import Link from "next/link";
import {
  Users,
  CalendarClock,
  Pill,
  FlaskConical,
  UserPlus,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { greeting, formatDateLong, formatTime, patientName } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/rbac";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const appointmentWhere =
    user.role === "DOCTOR"
      ? { doctorId: user.id, date: { gte: todayStart, lte: todayEnd } }
      : { date: { gte: todayStart, lte: todayEnd } };

  const [todaysAppointments, patientCount, pendingPrescriptions, pendingLabs] =
    await Promise.all([
      prisma.appointment.findMany({
        where: appointmentWhere,
        include: { patient: true, doctor: true },
        orderBy: { time: "asc" },
        take: 8,
      }),
      prisma.patient.count(),
      prisma.prescription.count({ where: { dispensed: false } }),
      prisma.labResult.count({ where: { status: "PENDING" } }),
    ]);

  const [activeStaff, recentPatients] = await Promise.all([
    user.role === "ADMIN" ? prisma.user.count({ where: { status: "ACTIVE" } }) : null,
    user.role === "RECORDS_OFFICER" || user.role === "ADMIN"
      ? prisma.patient.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : null,
  ]);

  return (
    <div>
      {denied && (
        <div className="mb-6 flex items-center gap-2.5 rounded-md border border-warning/25 bg-warning-soft px-4 py-3 text-[13px] text-warning">
          <ShieldAlert className="size-4 shrink-0" />
          You don&apos;t have access to that section — redirected to your
          dashboard.
        </div>
      )}

      <PageHeader
        eyebrow={ROLE_LABELS[user.role]}
        title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description={formatDateLong(now)}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {user.role === "ADMIN" && (
          <>
            <StatCard label="Registered patients" value={patientCount} icon={Users} tone="primary" />
            <StatCard label="Active staff" value={activeStaff ?? 0} icon={ShieldAlert} tone="accent" />
            <StatCard label="Appointments today" value={todaysAppointments.length} icon={CalendarClock} tone="success" />
            <StatCard label="Prescriptions pending" value={pendingPrescriptions} icon={Pill} tone="warning" />
          </>
        )}
        {user.role === "DOCTOR" && (
          <>
            <StatCard label="Your appointments today" value={todaysAppointments.length} icon={CalendarClock} tone="primary" />
            <StatCard label="Registered patients" value={patientCount} icon={Users} tone="accent" />
            <StatCard label="Lab results pending" value={pendingLabs} icon={FlaskConical} tone="warning" />
          </>
        )}
        {user.role === "NURSE" && (
          <>
            <StatCard label="Appointments today" value={todaysAppointments.length} icon={CalendarClock} tone="primary" />
            <StatCard label="Lab results pending" value={pendingLabs} icon={FlaskConical} tone="warning" />
            <StatCard label="Registered patients" value={patientCount} icon={Users} tone="accent" />
          </>
        )}
        {user.role === "RECORDS_OFFICER" && (
          <>
            <StatCard label="Registered patients" value={patientCount} icon={Users} tone="primary" />
            <StatCard label="Appointments today" value={todaysAppointments.length} icon={CalendarClock} tone="accent" />
          </>
        )}
        {user.role === "PHARMACIST" && (
          <>
            <StatCard label="Prescriptions pending" value={pendingPrescriptions} icon={Pill} tone="warning" />
            <StatCard label="Registered patients" value={patientCount} icon={Users} tone="primary" />
          </>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {user.role === "DOCTOR" ? "Your appointments today" : "Today's appointments"}
            </CardTitle>
            <Button variant="link" asChild>
              <Link href="/appointments">
                View all <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {todaysAppointments.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13.5px] text-ink-faint">
                Nothing scheduled for today.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {todaysAppointments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/patients/${a.patientId}`}
                        className="truncate text-[13.5px] font-medium text-ink hover:text-primary"
                      >
                        {patientName(a.patient)}
                      </Link>
                      <p className="truncate text-[12.5px] text-ink-faint">
                        {a.reason ?? "Consultation"} · Dr.{" "}
                        {a.doctor.name.replace(/^Dr\.\s*/, "")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-[12.5px] text-ink-muted">
                        {formatTime(a.time)}
                      </span>
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
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {(user.role === "RECORDS_OFFICER" || user.role === "ADMIN") && (
              <Button variant="secondary" className="justify-start" asChild>
                <Link href="/patients/new">
                  <UserPlus className="size-4" /> Register a new patient
                </Link>
              </Button>
            )}
            <Button variant="secondary" className="justify-start" asChild>
              <Link href="/patients">
                <Users className="size-4" /> Search patient records
              </Link>
            </Button>
            {(user.role === "DOCTOR" ||
              user.role === "NURSE" ||
              user.role === "RECORDS_OFFICER" ||
              user.role === "ADMIN") && (
              <Button variant="secondary" className="justify-start" asChild>
                <Link href="/appointments">
                  <CalendarClock className="size-4" /> Schedule an appointment
                </Link>
              </Button>
            )}
            {(user.role === "PHARMACIST" || user.role === "ADMIN") && (
              <Button variant="secondary" className="justify-start" asChild>
                <Link href="/pharmacy">
                  <Pill className="size-4" /> Review pharmacy queue
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {recentPatients && recentPatients.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recently registered</CardTitle>
            <Button variant="link" asChild>
              <Link href="/patients">
                View all <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {recentPatients.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3">
                  <Link
                    href={`/patients/${p.id}`}
                    className="text-[13.5px] font-medium text-ink hover:text-primary"
                  >
                    {patientName(p)}
                  </Link>
                  <span className="font-mono text-[12px] text-ink-faint">
                    {p.patientCode}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
