import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PasswordGate } from "@/components/password-gate";

const TOC = [
  ["overview", "Overview"],
  ["architecture", "Architecture"],
  ["stack", "Technology stack"],
  ["database", "Database design"],
  ["roles", "Roles & permissions"],
  ["modules", "Modules"],
  ["auth", "Authentication & sessions"],
] as const;

export const metadata = {
  title: "Guide & Documentation — Meridian",
};

export default function GuidePage() {
  return (
    <PasswordGate>
      <div className="flex flex-1 flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary font-display text-[16px] text-white">
                M
              </div>
              <span className="font-display text-[17px] tracking-tight text-ink">
                Meridian
              </span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink"
            >
              <ArrowLeft className="size-3.5" /> Back home
            </Link>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-ink-faint">
            Reference
          </p>
          <h1 className="font-display text-[36px] font-medium leading-tight text-ink">
            Guide &amp; documentation
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
            How Meridian is put together: the system architecture, the
            technology it&apos;s built on, the database schema, and how
            access control is enforced across the five staff roles.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[200px_1fr]">
            <nav className="hidden lg:block">
              <div className="sticky top-8 flex flex-col gap-1 border-l border-border pl-4">
                {TOC.map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="py-1 text-[13px] text-ink-muted hover:text-primary"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </nav>

            <div className="flex flex-col gap-16">
              <Section id="overview" title="Overview">
                <p>
                  Meridian is a staff-facing electronic health record
                  platform for a hospital setting. It replaces the
                  paper-based case-file workflow — registration cards, a
                  physical file per patient, and a case note passed by hand
                  between departments — with a single record that every
                  authorised department can read and update from wherever
                  they are.
                </p>
                <p>
                  The system covers six functional areas: patient
                  registration, medical records, appointment scheduling,
                  prescriptions and dispensing, laboratory results, and
                  facility-wide reporting. Each area maps to one or more of
                  five staff roles, and every action a user can take is
                  scoped to what their role is permitted to do.
                </p>
              </Section>

              <Section id="architecture" title="Architecture">
                <p>
                  The system is split into two independently deployable
                  services rather than one monolith:
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <strong className="text-ink">A frontend application</strong>{" "}
                    that renders every screen and handles user interaction.
                    It holds no data of its own — every read and write is
                    forwarded to the API.
                  </li>
                  <li>
                    <strong className="text-ink">A backend API</strong> that
                    owns the database, the authentication logic, and every
                    authorization decision. It is a private service: it is
                    never called directly from a browser, only from the
                    frontend&apos;s own server.
                  </li>
                </ul>
                <p>
                  Keeping the API private rather than exposing it to the
                  browser removes an entire class of concerns — no CORS
                  policy to defend, no bearer token sitting in client-side
                  JavaScript, no direct surface for a browser-based client
                  to probe. The frontend server is the only party that ever
                  holds a credential, and it attaches that credential to
                  each request on the user&apos;s behalf.
                </p>
                <div className="mt-2 rounded-lg border border-border bg-surface p-5">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                    Request flow
                  </p>
                  <div className="flex flex-col gap-2 text-[13.5px] text-ink-muted sm:flex-row sm:items-center sm:gap-3">
                    <Node label="Browser" />
                    <Arrow />
                    <Node label="Frontend server" sub="renders pages, holds the session" />
                    <Arrow />
                    <Node label="API" sub="owns data + auth decisions" />
                    <Arrow />
                    <Node label="Database" />
                  </div>
                </div>
              </Section>

              <Section id="stack" title="Technology stack">
                <StackGroup
                  title="Frontend"
                  items={[
                    ["Next.js", "Application framework — server-rendered pages, server-side data mutations"],
                    ["React", "Component model and client-side interactivity"],
                    ["TypeScript", "Static typing across the codebase"],
                    ["Tailwind CSS", "Utility-first styling, custom design tokens"],
                    ["Radix UI", "Unstyled, accessible primitives — dialogs, dropdowns, tabs, toasts"],
                    ["Zod", "Runtime validation of form input before it reaches the API"],
                  ]}
                />
                <StackGroup
                  title="Backend"
                  items={[
                    ["Django", "Application framework and ORM"],
                    ["Django REST Framework", "API layer — serializers, viewsets, permissions"],
                    ["Simple JWT", "Issues and validates the access tokens used for authentication"],
                    ["Gunicorn", "Production WSGI server"],
                    ["WhiteNoise", "Serves static assets without a separate file host"],
                  ]}
                />
                <StackGroup
                  title="Data"
                  items={[
                    ["PostgreSQL", "Primary datastore in production"],
                    ["SQLite", "Used for local development only"],
                  ]}
                />
              </Section>

              <Section id="database" title="Database design">
                <p>
                  The schema is built around a patient's chart as the
                  central record, with every clinical event —
                  a visit, a prescription, a lab order, an appointment —
                  linked back to it. Six entities cover the whole system:
                </p>

                <SchemaTable
                  name="User"
                  description="A staff account. Every screen in the system is accessed by one of these — patients themselves do not log in."
                  fields={[
                    ["id", "identifier", "Primary key"],
                    ["username", "text", "Unique login handle"],
                    ["password", "text", "Hashed, never stored or transmitted in plain form"],
                    ["name", "text", "Full display name"],
                    ["role", "enum", "ADMIN · DOCTOR · NURSE · RECORDS_OFFICER · PHARMACIST"],
                    ["specialisation", "text", "Doctors only, e.g. “Paediatrics”"],
                    ["is_active", "boolean", "Deactivated accounts lose access immediately"],
                  ]}
                />
                <SchemaTable
                  name="Patient"
                  description="One row per patient, created once at registration."
                  fields={[
                    ["id", "identifier", "Primary key"],
                    ["patient_code", "text", "Human-readable ID, e.g. PT-2026-0001"],
                    ["first_name / last_name", "text", ""],
                    ["gender", "text", ""],
                    ["date_of_birth", "date", ""],
                    ["address, phone", "text", ""],
                    ["next_of_kin, next_of_kin_phone", "text", ""],
                    ["blood_group", "text", "Optional"],
                    ["allergies", "text", "Free text, surfaced prominently on the chart"],
                    ["registered_by", "→ User", "Who registered the patient"],
                  ]}
                />
                <SchemaTable
                  name="Appointment"
                  description="A scheduled slot between a patient and a doctor."
                  fields={[
                    ["patient", "→ Patient", ""],
                    ["doctor", "→ User", "Must be an active user with role DOCTOR"],
                    ["date, time", "date / text", ""],
                    ["reason", "text", "Optional"],
                    ["status", "enum", "PENDING · COMPLETED · CANCELLED"],
                  ]}
                />
                <SchemaTable
                  name="MedicalRecord"
                  description="One row per consultation — the core clinical entry."
                  fields={[
                    ["patient", "→ Patient", ""],
                    ["doctor", "→ User", "The examining doctor"],
                    ["visit_date", "datetime", ""],
                    ["symptoms, diagnosis", "text", ""],
                    ["treatment_notes", "text", "Optional"],
                  ]}
                />
                <SchemaTable
                  name="Prescription"
                  description="A drug ordered against a medical record. Dispensing is tracked separately from prescribing."
                  fields={[
                    ["medical_record", "→ MedicalRecord", ""],
                    ["drug_name, dosage, duration", "text", ""],
                    ["dispensed", "boolean", "Set once a pharmacist fulfils it"],
                    ["dispensed_by", "→ User", "Recorded at the point of dispensing"],
                    ["dispensed_at", "datetime", ""],
                  ]}
                />
                <SchemaTable
                  name="LabResult"
                  description="A test ordered for a patient, optionally tied to the visit that requested it."
                  fields={[
                    ["patient", "→ Patient", ""],
                    ["medical_record", "→ MedicalRecord", "Optional — a test can be ordered outside a visit"],
                    ["test_name, result, notes", "text", ""],
                    ["status", "enum", "PENDING · COMPLETED"],
                    ["entered_by", "→ User", ""],
                  ]}
                />

                <p className="mt-4">
                  In short: a <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[12.5px]">Patient</code> has
                  many appointments, medical records and lab results; a{" "}
                  <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[12.5px]">MedicalRecord</code> has
                  many prescriptions and may have lab results attached to
                  it; and every clinical action is attributed to the{" "}
                  <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[12.5px]">User</code> who
                  performed it.
                </p>
              </Section>

              <Section id="roles" title="Roles & permissions">
                <p>
                  Five roles exist, and permission is checked on the API for
                  every request — the interface only ever hides actions a
                  role can&apos;t take; it is not what enforces that
                  restriction.
                </p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-sunken text-[11px] uppercase tracking-wide text-ink-faint">
                        <th className="px-4 py-2.5">Action</th>
                        <th className="px-3 py-2.5 text-center">Admin</th>
                        <th className="px-3 py-2.5 text-center">Doctor</th>
                        <th className="px-3 py-2.5 text-center">Nurse</th>
                        <th className="px-3 py-2.5 text-center">Records officer</th>
                        <th className="px-3 py-2.5 text-center">Pharmacist</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Register a patient", [1, 0, 0, 1, 0]],
                        ["Add a medical record", [1, 1, 0, 0, 0]],
                        ["Schedule an appointment", [1, 1, 1, 1, 0]],
                        ["Order / enter a lab result", [1, 1, 1, 0, 0]],
                        ["Dispense a prescription", [1, 0, 0, 0, 1]],
                        ["Manage staff accounts", [1, 0, 0, 0, 0]],
                        ["View facility reports", [1, 0, 0, 0, 0]],
                      ].map(([label, marks]) => (
                        <tr key={label as string} className="border-b border-border last:border-0">
                          <td className="px-4 py-2.5 text-ink">{label as string}</td>
                          {(marks as number[]).map((m, i) => (
                            <td key={i} className="px-3 py-2.5 text-center">
                              {m ? (
                                <span className="inline-block size-1.5 rounded-full bg-primary" />
                              ) : (
                                <span className="text-ink-faint">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section id="modules" title="Modules">
                <dl className="flex flex-col gap-5">
                  {[
                    ["Patient registration", "Captures bio-data and issues a permanent patient ID on first contact with the facility."],
                    ["Medical records", "A chronological log of every visit — symptoms, diagnosis, and treatment notes — tied to the examining doctor."],
                    ["Appointment scheduling", "Books a patient against a specific doctor's calendar and tracks status through to completion."],
                    ["Prescriptions & pharmacy", "Drugs ordered during a visit land in a dispensing queue that pharmacy staff work through."],
                    ["Laboratory results", "Tests can be ordered against a visit or independently, and results are entered once available."],
                    ["Reporting", "Facility-wide statistics — registration trends, appointment load, common diagnoses — for administrators."],
                  ].map(([title, body]) => (
                    <div key={title}>
                      <dt className="font-display text-[16px] font-medium text-ink">{title}</dt>
                      <dd className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">{body}</dd>
                    </div>
                  ))}
                </dl>
              </Section>

              <Section id="auth" title="Authentication & sessions">
                <p>
                  Signing in exchanges a username and password for a signed
                  access token from the API. The frontend stores that token
                  in an <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[12.5px]">httpOnly</code> cookie
                  — never in client-side storage a script could read — and
                  attaches it to every subsequent request it makes to the
                  API on the user&apos;s behalf.
                </p>
                <p>
                  A session lasts eight hours, matching a working shift, and
                  is re-validated against the database on every request —
                  not just decoded and trusted — so a deactivated account
                  loses access immediately rather than at the end of its
                  token&apos;s lifetime.
                </p>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </PasswordGate>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="font-display text-[24px] font-medium text-ink">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-[14px] leading-relaxed text-ink-muted">
        {children}
      </div>
    </section>
  );
}

function StackGroup({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div className="mb-2">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        {title}
      </p>
      <ul className="flex flex-col gap-2">
        {items.map(([name, desc]) => (
          <li key={name} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <span className="w-44 shrink-0 font-mono text-[12.5px] font-medium text-ink">
              {name}
            </span>
            <span className="text-[13px] text-ink-muted">{desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SchemaTable({
  name,
  description,
  fields,
}: {
  name: string;
  description: string;
  fields: [string, string, string][];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="border-b border-border bg-surface-sunken px-4 py-2.5">
        <p className="font-mono text-[13px] font-medium text-ink">{name}</p>
        <p className="mt-0.5 text-[12.5px] text-ink-faint">{description}</p>
      </div>
      <table className="w-full text-left text-[13px]">
        <tbody>
          {fields.map(([field, type, note], i) => (
            <tr key={field} className={i === 0 ? "" : "border-t border-border"}>
              <td className="w-1/3 px-4 py-2 font-mono text-[12.5px] text-ink">{field}</td>
              <td className="w-1/6 px-3 py-2 text-ink-faint">{type}</td>
              <td className="px-3 py-2 text-ink-muted">{note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Node({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="rounded-md border border-border-strong bg-paper px-3 py-2 text-center sm:flex-1">
      <p className="text-[12.5px] font-medium text-ink">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-ink-faint">{sub}</p>}
    </div>
  );
}

function Arrow() {
  return (
    <span className="hidden text-ink-faint sm:block" aria-hidden>
      →
    </span>
  );
}
