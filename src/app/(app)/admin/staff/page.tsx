import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { AddStaffDialog } from "@/components/staff/add-staff-dialog";
import { ToggleStatusButton } from "@/components/staff/toggle-status-button";
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
import { ROLE_LABELS } from "@/lib/rbac";

export default async function StaffPage() {
  const currentUser = await requireRole(["ADMIN"]);

  const staff = await prisma.user.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Staff accounts"
        description="Create logins for hospital staff and control who can access Meridian."
        actions={<AddStaffDialog />}
      />

      <div className="rounded-lg border border-border bg-surface shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableEmpty colSpan={5}>No staff accounts yet.</TableEmpty>
            ) : (
              staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <span className="font-medium text-ink">{s.name}</span>
                    {s.specialisation && (
                      <span className="ml-1.5 text-[12px] text-ink-faint">
                        · {s.specialisation}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-[12.5px] text-ink-muted">
                    {s.username}
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">{ROLE_LABELS[s.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === "ACTIVE" ? "success" : "danger"}>
                      {s.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ToggleStatusButton
                      userId={s.id}
                      status={s.status}
                      disabled={s.id === currentUser.id}
                    />
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
