import Link from "next/link";
import {
  UserPlus,
  FileText,
  CalendarClock,
  Pill,
  FlaskConical,
  BarChart3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MODULES = [
  {
    icon: UserPlus,
    title: "Patient registration",
    description:
      "Every patient gets one permanent record and ID the moment they walk in — no more duplicate case files.",
  },
  {
    icon: FileText,
    title: "Medical records",
    description:
      "Doctors capture symptoms, diagnosis and treatment notes against a full, chronological visit history.",
  },
  {
    icon: CalendarClock,
    title: "Appointment scheduling",
    description:
      "Records officers and nurses book patients against a doctor's real calendar, no double-booking.",
  },
  {
    icon: Pill,
    title: "Prescriptions & pharmacy",
    description:
      "Prescriptions flow straight from the consulting room to a dispensing queue the pharmacist can trust.",
  },
  {
    icon: FlaskConical,
    title: "Laboratory results",
    description:
      "Order a test, and its result lands back on the patient's chart automatically once entered.",
  },
  {
    icon: BarChart3,
    title: "Reporting",
    description:
      "Administrators see registrations, appointment load and disease trends without opening a single file.",
  },
];

const ROLES = [
  "Administrator",
  "Doctor",
  "Nurse",
  "Records officer",
  "Pharmacist",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary font-display text-[16px] text-white">
              M
            </div>
            <span className="font-display text-[17px] tracking-tight text-ink">
              Meridian
            </span>
          </div>
          <Button variant="secondary" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.35]" />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-paper px-3 py-1 text-[12px] font-medium text-ink-muted">
            Integrated patient health record platform
          </span>
          <h1 className="mt-6 font-display text-[42px] font-medium leading-[1.15] tracking-tight text-ink sm:text-[52px]">
            The case-file cabinet, replaced.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-ink-muted">
            Meridian is a single, searchable patient chart that every
            department can trust — from the front desk, to the consulting
            room, to the pharmacy counter.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/login">
                Sign in to your workspace <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-10 max-w-xl">
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-ink-faint">
            One platform
          </p>
          <h2 className="font-display text-[28px] font-medium leading-tight text-ink">
            Every department, one record
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <div
              key={m.title}
              className="rounded-lg border border-border bg-surface p-5 shadow-sm"
            >
              <div className="flex size-9 items-center justify-center rounded-md bg-primary-soft text-primary">
                <m.icon className="size-[18px]" />
              </div>
              <h3 className="mt-4 font-display text-[16px] font-medium text-ink">
                {m.title}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-ink-faint">
                Role-based access
              </p>
              <h2 className="font-display text-[28px] font-medium leading-tight text-ink">
                Everyone sees exactly what their role needs
              </h2>
              <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-ink-muted">
                Meridian ships with five staff roles out of the box, each
                with its own dashboard and permissions — so a records officer
                can never edit a diagnosis, and a pharmacist only sees what
                is safe to dispense.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-paper px-3 py-1.5 text-[12.5px] font-medium text-ink-muted"
                  >
                    <ShieldCheck className="size-3.5 text-primary" />
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-paper p-6">
              <ol className="relative flex flex-col gap-6 pl-6">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border-strong" />
                {[
                  ["Registration", "A patient is registered once and receives a permanent ID."],
                  ["Consultation", "A doctor records symptoms, diagnosis and treatment notes."],
                  ["Prescription", "Drugs are prescribed and queued for the pharmacy to dispense."],
                  ["Reporting", "Administrators review trends across the whole facility."],
                ].map(([title, body], i) => (
                  <li key={title} className="relative">
                    <span className="absolute -left-6 top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-white">
                      {i + 1}
                    </span>
                    <p className="text-[13.5px] font-medium text-ink">{title}</p>
                    <p className="mt-0.5 text-[13px] text-ink-muted">{body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-10 text-center">
          <p className="text-[13px] text-ink-muted">
            Built as a working prototype for the{" "}
            <span className="text-ink">
              &ldquo;Integrated Electronic Patient Health Record Management
              Platform&rdquo;
            </span>{" "}
            final year project.
          </p>
          <p className="text-[12px] text-ink-faint">
            Not for use with real patient data.
          </p>
        </div>
      </footer>
    </div>
  );
}
