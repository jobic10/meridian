export type Role = "ADMIN" | "DOCTOR" | "NURSE" | "RECORDS_OFFICER" | "PHARMACIST";

export const ROLES: Role[] = [
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "RECORDS_OFFICER",
  "PHARMACIST",
];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECORDS_OFFICER: "Records Officer",
  PHARMACIST: "Pharmacist",
};

export const ROLE_BLURB: Record<Role, string> = {
  ADMIN: "Manages staff accounts and reviews facility-wide reporting.",
  DOCTOR: "Reviews patients, records diagnoses and issues prescriptions.",
  NURSE: "Coordinates appointments, vitals and laboratory results.",
  RECORDS_OFFICER: "Registers patients and maintains the central archive.",
  PHARMACIST: "Reviews and dispenses prescriptions issued by doctors.",
};

type NavItem = {
  href: string;
  label: string;
  roles: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", roles: ROLES },
  { href: "/patients", label: "Patients", roles: ROLES },
  {
    href: "/appointments",
    label: "Appointments",
    roles: ["ADMIN", "DOCTOR", "NURSE", "RECORDS_OFFICER"],
  },
  { href: "/pharmacy", label: "Pharmacy queue", roles: ["ADMIN", "PHARMACIST"] },
  { href: "/lab", label: "Laboratory", roles: ["ADMIN", "DOCTOR", "NURSE"] },
  { href: "/admin/reports", label: "Reports", roles: ["ADMIN"] },
  { href: "/admin/staff", label: "Staff accounts", roles: ["ADMIN"] },
];

export function canAccess(role: Role, roles: Role[]) {
  return roles.includes(role);
}
