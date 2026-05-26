import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { auth } from "@/auth";
import { UserMenu } from "@/components/auth/UserMenu";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 h-nav border-b border-border bg-bg-page/85 backdrop-blur-md">
      <div className="container-px mx-auto flex h-full max-w-container items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-text-primary text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <path d="M3 11h18" />
              <path d="M7 16h4" />
            </svg>
          </span>
          <span className="font-display text-[17px] font-bold tracking-tight text-text-primary">
            PrintCard
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-text-body transition hover:text-text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!user && (
            <LinkButton href="/login" variant="ghost" className="hidden sm:inline-flex">
              Log in
            </LinkButton>
          )}

          <LinkButton href="/designer/new" variant="primary" showArrow>
            Start designing
          </LinkButton>

          {user && (
            <UserMenu
              user={{
                name: user.name ?? user.email ?? "Account",
                email: user.email ?? "",
                role: user.role,
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}
