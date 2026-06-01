import Link from "next/link";

export const metadata = { title: "Checkout — PrintCard" };

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-page">
      <header className="border-b border-border bg-white">
        <div className="container-px mx-auto flex h-nav max-w-container items-center justify-between">
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
          <span className="text-xs text-text-muted">Secure checkout</span>
        </div>
      </header>
      <main className="container-px mx-auto max-w-container py-10 lg:py-14">{children}</main>
    </div>
  );
}
