import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Belt-and-braces: middleware already guards /dashboard/*, but a server-side
  // check here means a misconfigured matcher can never leak.
  const session = await auth();
  if (!session?.user) redirect("/login?from=/dashboard");

  return (
    <div className="flex min-h-screen bg-bg-page">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
