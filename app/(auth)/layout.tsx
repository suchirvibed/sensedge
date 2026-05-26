import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-page">
      <div className="container-px mx-auto flex h-nav max-w-container items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-card bg-orange text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <path d="M3 11h18" />
              <path d="M7 16h4" />
            </svg>
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-text-primary">
            PrintCard
          </span>
        </Link>
      </div>
      <main className="flex items-center justify-center px-5 pb-20 pt-6">
        {children}
      </main>
    </div>
  );
}
