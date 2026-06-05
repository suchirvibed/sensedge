import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GraphicsSidebar } from "@/components/layout/GraphicsSidebar";
import { UserMenu } from "@/components/auth/UserMenu";

export const metadata = { title: "Graphics — PrintCard" };

export default async function GraphicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?from=/graphics");
  // Middleware also enforces this. Belt-and-braces.
  if (!["GRAPHICS", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-bg-page">
      <GraphicsSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-nav flex-none items-center justify-between border-b border-border bg-bg-page/85 px-6 backdrop-blur-md">
          <div className="text-sm text-text-muted">
            Graphics console ·{" "}
            <span className="font-semibold text-text-primary">
              {session.user.name?.split(" ")[0] || session.user.email}
            </span>
          </div>
          <UserMenu
            user={{
              name: session.user.name ?? session.user.email ?? "Graphics",
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
