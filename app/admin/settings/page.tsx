import { auth } from "@/auth";

export const metadata = { title: "Settings — Admin" };

const SETTING_KEYS = [
  {
    key: "NEXTAUTH_SECRET",
    label: "NextAuth secret",
    required: true,
  },
  {
    key: "DATABASE_URL",
    label: "Database URL",
    required: true,
  },
  {
    key: "RAZORPAY_KEY_ID",
    label: "Razorpay live mode",
    required: false,
    envVar: process.env.RAZORPAY_KEY_ID,
  },
  {
    key: "GOOGLE_CLIENT_ID",
    label: "Google sign-in enabled",
    required: false,
    envVar: process.env.GOOGLE_CLIENT_ID,
  },
  {
    key: "RESEND_API_KEY",
    label: "Email sending (Resend)",
    required: false,
    envVar: process.env.RESEND_API_KEY,
  },
  {
    key: "R2_ACCOUNT_ID",
    label: "Cloudflare R2 uploads",
    required: false,
    envVar: process.env.R2_ACCOUNT_ID,
  },
];

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  const u = session!.user;

  return (
    <div className="mx-auto max-w-3xl">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> ADMIN / SETTINGS
      </span>
      <h1 className="h2 mt-3 text-text-primary">Settings</h1>

      <section className="mt-10">
        <h2 className="mb-3 font-display text-lg font-bold text-text-primary">
          Your account
        </h2>
        <dl className="grid gap-x-6 gap-y-3 rounded-card border border-border bg-white p-6 sm:grid-cols-2">
          <KV label="Name" value={u.name ?? "—"} />
          <KV label="Email" value={u.email ?? "—"} />
          <KV label="Role" value={u.role ?? "—"} />
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-display text-lg font-bold text-text-primary">
          Integration status
        </h2>
        <ul className="overflow-hidden rounded-card border border-border bg-white">
          {SETTING_KEYS.map((s) => {
            const configured =
              s.required ||
              (typeof s.envVar === "string" && s.envVar.length > 0);
            return (
              <li
                key={s.key}
                className="flex items-center justify-between border-b border-border px-5 py-3 text-sm last:border-b-0"
              >
                <span className="font-medium text-text-primary">{s.label}</span>
                <span
                  className={
                    configured
                      ? "text-xs font-semibold uppercase tracking-widest text-tint-greenText"
                      : "text-xs font-semibold uppercase tracking-widest text-text-muted"
                  }
                >
                  {configured ? "Configured" : "Not configured"}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-text-muted">
          Set integration keys in <code>.env.local</code> and restart the dev
          server. The deploy environment uses host-level env vars.
        </p>
      </section>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-text-primary">{value}</dd>
    </div>
  );
}
