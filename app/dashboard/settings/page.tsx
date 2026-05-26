import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { IconUser } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Account — PrintCard" };

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> ACCOUNT
      </span>
      <h1 className="h2 mt-3 text-text-primary">Account settings</h1>

      <div className="mt-8 rounded-card bg-white p-8 shadow-card">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-tint text-orange">
            <IconUser size={26} />
          </span>
          <div>
            <div className="font-display text-xl font-bold text-text-primary">{user.name}</div>
            <div className="text-sm text-text-muted">{user.email}</div>
          </div>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={user.name} />
          <Field label="Email" value={user.email} />
          <Field label="Phone" value={user.phone || "—"} />
          <Field
            label="Member since"
            value={new Date(user.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
          <div>
            <dt className="text-xs uppercase tracking-widest text-text-muted">Account type</dt>
            <dd className="mt-1.5">
              <Badge tone={user.role === "ADMIN" ? "orange" : "neutral"}>{user.role}</Badge>
            </dd>
          </div>
        </dl>

        <p className="mt-8 text-xs text-text-muted">
          Editing your account details will be available soon. To request a change in the
          meantime, email{" "}
          <a href="mailto:support@printcard.co.in" className="text-orange hover:underline">
            support@printcard.co.in
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-text-muted">{label}</dt>
      <dd className="mt-1.5 text-sm font-medium text-text-primary">{value}</dd>
    </div>
  );
}
