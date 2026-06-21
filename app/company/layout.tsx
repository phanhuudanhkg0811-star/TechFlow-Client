import { DashboardShell } from "@/features/dashboard/dashboard-shell";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
