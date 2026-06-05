import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { UserMenu } from "@/components/auth/UserMenu";

export const metadata = { title: "Admin — PrintCard" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Belt-and-braces: middleware already enforces ADMIN on /admin/*, but a
  // server-side check here means a misconfigured matcher can't leak.
  const session = await auth();
  if (!session?.user?.id) redirect("/login?from=/admin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-bg-page">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-nav flex-none items-center justify-between border-b border-border bg-bg-page/85 px-6 backdrop-blur-md">
          <div className="text-sm text-text-muted">
            Admin console ·{" "}
            <span className="font-semibold text-text-primary">
              {session.user.name?.split(" ")[0] || session.user.email}
            </span>
          </div>
          <UserMenu
            user={{
              name: session.user.name ?? session.user.email ?? "Admin",
              email: session.user.email ?? "",
              role: session.user.role,
            }}
          />
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
