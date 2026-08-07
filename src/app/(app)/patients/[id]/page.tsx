import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Users as UsersIcon,
  Droplet,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AddRecordDialog } from "@/components/patients/add-record-dialog";
import { AddLabDialog } from "@/components/patients/add-lab-dialog";
import { ScheduleAppointmentDialog } from "@/components/schedule-appointment-dialog";
import {
  calculateAge,
  formatDate,
  formatDateLong,
  formatTime,
  patientName,
} from "@/lib/format";

export default async function PatientDetailPage({
  params,
  searchParams,
}: PageProps<"/patients/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const { registered } = await searchParams;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      registeredBy: { select: { name: true } },
      medicalRecords: {
        orderBy: { visitDate: "desc" },
        include: {
          doctor: { select: { name: true, specialisation: true } },
          prescriptions: true,
          labResults: true,
        },
      },
      appointments: {
        orderBy: { date: "desc" },
        include: { doctor: { select: { name: true } } },
      },
      labResults: {
        orderBy: { createdAt: "desc" },
        include: { enteredBy: { select: { name: true } } },
      },
    },
  });

  if (!patient) notFound();

  const canAddRecord = user.role === "DOCTOR" || user.role === "ADMIN";
  const canOrderLab = ["ADMIN", "DOCTOR", "NURSE"].includes(user.role);
  const canSchedule = ["ADMIN", "DOCTOR", "NURSE", "RECORDS_OFFICER"].includes(
    user.role
  );

  const doctors = canSchedule
    ? await prisma.user.findMany({
        where: { role: "DOCTOR", status: "ACTIVE" },
        select: { id: true, name: true, specialisation: true },
        orderBy: { name: "asc" },
      })
    : [];

  const allPrescriptions = patient.medicalRecords.flatMap((r) =>
    r.prescriptions.map((p) => ({ ...p, visitDate: r.visitDate, diagnosis: r.diagnosis }))
  );

  return (
    <div>
      <Link
        href="/patients"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> All patients
      </Link>

      {registered && (
        <div className="mb-6 flex items-center gap-2.5 rounded-md border border-success/20 bg-success-soft px-4 py-3 text-[13px] text-success">
          <CheckCircle2 className="size-4 shrink-0" />
          Patient registered successfully — ID {patient.patientCode}.
        </div>
      )}

      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-[26px] font-medium leading-tight text-ink">
              {patientName(patient)}
            </h1>
            <Badge variant="neutral" className="font-mono">
              {patient.patientCode}
            </Badge>
          </div>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">
            {calculateAge(patient.dateOfBirth)} years old · {patient.gender} ·
            Registered {formatDate(patient.createdAt)}
            {patient.registeredBy ? ` by ${patient.registeredBy.name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canOrderLab && <AddLabDialog patientId={patient.id} />}
          {canSchedule && (
            <ScheduleAppointmentDialog doctors={doctors} patientId={patient.id} />
          )}
          {canAddRecord && <AddRecordDialog patientId={patient.id} />}
        </div>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoTile icon={Droplet} label="Blood group" value={patient.bloodGroup ?? "Unknown"} />
        <InfoTile icon={Phone} label="Phone" value={patient.phone ?? "—"} />
        <InfoTile icon={MapPin} label="Address" value={patient.address ?? "—"} />
        <InfoTile
          icon={UsersIcon}
          label="Next of kin"
          value={patient.nextOfKin ?? "—"}
        />
      </div>

      {patient.allergies && (
        <div className="mb-7 flex items-start gap-2.5 rounded-md border border-accent/25 bg-accent-soft px-4 py-3 text-[13.5px] text-accent">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <span className="font-medium">Known allergies: </span>
            {patient.allergies}
          </div>
        </div>
      )}

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">
            Medical records ({patient.medicalRecords.length})
          </TabsTrigger>
          <TabsTrigger value="appointments">
            Appointments ({patient.appointments.length})
          </TabsTrigger>
          <TabsTrigger value="prescriptions">
            Prescriptions ({allPrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="labs">Lab results ({patient.labResults.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="mt-5">
          {patient.medicalRecords.length === 0 ? (
            <EmptyState message="No visits recorded yet." />
          ) : (
            <div className="flex flex-col gap-4">
              {patient.medicalRecords.map((r) => (
                <Card key={r.id}>
                  <CardHeader>
                    <div>
                      <CardTitle>{r.diagnosis}</CardTitle>
                      <p className="mt-1 text-[12.5px] text-ink-faint">
                        {formatDateLong(r.visitDate)} · {r.doctor.name}
                        {r.doctor.specialisation ? ` (${r.doctor.specialisation})` : ""}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                        Symptoms
                      </p>
                      <p className="mt-1 text-[13.5px] text-ink">{r.symptoms}</p>
                    </div>
                    {r.treatmentNotes && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                          Treatment notes
                        </p>
                        <p className="mt-1 text-[13.5px] text-ink">{r.treatmentNotes}</p>
                      </div>
                    )}
                    {r.prescriptions.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                          Prescriptions
                        </p>
                        <ul className="flex flex-col gap-1.5">
                          {r.prescriptions.map((p) => (
                            <li
                              key={p.id}
                              className="flex items-center justify-between rounded-md bg-surface-sunken px-3 py-2 text-[13px]"
                            >
                              <span>
                                <span className="font-medium text-ink">{p.drugName}</span>{" "}
                                <span className="text-ink-muted">
                                  · {p.dosage} · {p.duration}
                                </span>
                              </span>
                              <Badge variant={p.dispensed ? "success" : "warning"}>
                                {p.dispensed ? "Dispensed" : "Pending"}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="appointments" className="mt-5">
          {patient.appointments.length === 0 ? (
            <EmptyState message="No appointments scheduled." />
          ) : (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {patient.appointments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-[13.5px] font-medium text-ink">
                          {a.doctor.name} · {formatDate(a.date)} at {formatTime(a.time)}
                        </p>
                        <p className="text-[12.5px] text-ink-faint">
                          {a.reason ?? "Consultation"}
                        </p>
                      </div>
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
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-5">
          {allPrescriptions.length === 0 ? (
            <EmptyState message="No prescriptions on record." />
          ) : (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {allPrescriptions.map((p) => (
                    <li key={p.id} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-[13.5px] font-medium text-ink">{p.drugName}</p>
                        <p className="text-[12.5px] text-ink-faint">
                          {p.dosage} · {p.duration} · for {p.diagnosis}
                        </p>
                      </div>
                      <Badge variant={p.dispensed ? "success" : "warning"}>
                        {p.dispensed ? "Dispensed" : "Pending"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="labs" className="mt-5">
          {patient.labResults.length === 0 ? (
            <EmptyState message="No laboratory tests on record." />
          ) : (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {patient.labResults.map((l) => (
                    <li key={l.id} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-[13.5px] font-medium text-ink">{l.testName}</p>
                        <p className="text-[12.5px] text-ink-faint">
                          {l.result ?? "Awaiting result"} · entered by {l.enteredBy.name}
                        </p>
                      </div>
                      <Badge variant={l.status === "COMPLETED" ? "success" : "warning"}>
                        {l.status.toLowerCase()}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-ink-faint">
        <Icon className="size-3.5" />
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 truncate text-[13.5px] text-ink" title={value}>
        {value}
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border-strong px-5 py-10 text-center">
      <p className="text-[13.5px] text-ink-faint">{message}</p>
    </div>
  );
}
