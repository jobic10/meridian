import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar user={user} />
      <div className="min-w-0 flex-1 bg-paper">
        <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
      </div>
    </div>
  );
}
