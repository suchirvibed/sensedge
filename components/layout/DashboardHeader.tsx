import { auth } from "@/auth";
import { UserMenu } from "@/components/auth/UserMenu";

export async function DashboardHeader() {
  const session = await auth();
  if (!session?.user) return null;
  const u = session.user;

  return (
    <header className="flex h-nav flex-none items-center justify-between border-b border-border bg-bg-page/85 px-6 backdrop-blur-md">
      <div className="text-sm text-text-muted">
        Welcome back,{" "}
        <span className="font-semibold text-text-primary">
          {u.name?.split(" ")[0] || u.email}
        </span>
      </div>
      <UserMenu
        user={{
          name: u.name ?? u.email ?? "Account",
          email: u.email ?? "",
          role: u.role,
        }}
      />
    </header>
  );
}
