import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1">
      {/* Branding panel */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-primary px-12 py-10 text-white lg:flex">
        <div className="bg-grain pointer-events-none absolute inset-0 opacity-40" />
        <svg
          className="pointer-events-none absolute -bottom-24 -right-24 opacity-[0.18]"
          width="520"
          height="520"
          viewBox="0 0 520 520"
          fill="none"
        >
          <circle cx="260" cy="260" r="259" stroke="white" strokeWidth="1" />
          <circle cx="260" cy="260" r="200" stroke="white" strokeWidth="1" />
          <circle cx="260" cy="260" r="140" stroke="white" strokeWidth="1" />
          <circle cx="260" cy="260" r="80" stroke="white" strokeWidth="1" />
        </svg>

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md border border-white/25 font-display text-[17px]">
              M
            </div>
            <span className="font-display text-[19px] tracking-tight">
              Meridian
            </span>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="font-display text-[34px] font-medium leading-[1.15] tracking-tight">
            One record for every visit, every department, every patient.
          </p>
          <p className="mt-5 text-[15px] leading-relaxed text-white/75">
            Meridian replaces the case-file cabinet with a single, searchable
            chart that records officers, doctors, nurses and pharmacists can
            all trust — from registration to prescription.
          </p>
        </div>

        <div className="relative flex items-center gap-8 text-[13px] text-white/60">
          <span>Registration</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Diagnosis</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Prescription</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Reporting</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-paper px-6 py-16">
        <div className="mb-10 flex flex-col items-center gap-2 lg:hidden">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary font-display text-[18px] text-white">
            M
          </div>
          <span className="font-display text-[19px] tracking-tight text-ink">
            Meridian
          </span>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="font-display text-[22px] font-medium text-ink">
            Sign in to your workspace
          </h1>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">
            Enter the credentials issued by your facility administrator.
          </p>
        </div>

        <div className="mt-7">
          <LoginForm />
        </div>

        <p className="mt-12 text-[12px] text-ink-faint">
          Built as a prototype for the{" "}
          <Link href="/" className="underline underline-offset-2 hover:text-ink-muted">
            integrated patient health record
          </Link>{" "}
          project.
        </p>
      </div>
    </div>
  );
}
