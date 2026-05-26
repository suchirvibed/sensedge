import Link from "next/link";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/templates", label: "Templates" },
      { href: "/pricing", label: "Pricing" },
      { href: "/designer/new", label: "Designer" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/about#story", label: "Our story" },
      { href: "/about#team", label: "Team" },
      { href: "/about#press", label: "Press" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/help", label: "Help centre" },
      { href: "/help#shipping", label: "Shipping" },
      { href: "/help#returns", label: "Returns" },
      { href: "/help#faq", label: "FAQ" },
    ],
  },
  {
    title: "Contact",
    links: [
      { href: "mailto:hello@printcard.co.in", label: "hello@printcard.co.in" },
      { href: "tel:+911234567890", label: "+91 12345 67890" },
      { href: "https://printcard.co.in", label: "printcard.co.in" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-page text-text-primary">
      <div className="container-px mx-auto max-w-container py-20">
        <div className="grid gap-14 md:grid-cols-[1.4fr_3fr]">
          {/* Brand block */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-text-primary text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="6" width="18" height="13" rx="2" />
                  <path d="M3 11h18" />
                  <path d="M7 16h4" />
                </svg>
              </span>
              <span className="font-display text-[17px] font-bold tracking-tight">
                PrintCard
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-text-muted">
              Smart cards, ID cards and RFID — designed in your browser, printed
              and delivered across India.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                  {col.title}
                </h4>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-text-body transition hover:text-orange"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-px mx-auto flex max-w-container flex-col items-start justify-between gap-3 py-6 text-xs text-text-muted md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} PrintCard. All rights reserved.</div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition hover:text-orange">Privacy</Link>
            <Link href="/terms" className="transition hover:text-orange">Terms</Link>
            <span className="flex items-center gap-4">
              <Link href="https://twitter.com" aria-label="Twitter" className="text-text-muted transition hover:text-orange">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21l-6.52 7.45L22 22h-6.84l-5.36-7.01L3.6 22H1l7.04-8.04L1.5 2h6.97l4.85 6.41L18.24 2zm-2.4 18h1.71L7.27 4h-1.8l10.37 16z"/></svg>
              </Link>
              <Link href="https://linkedin.com" aria-label="LinkedIn" className="text-text-muted transition hover:text-orange">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3A2 2 0 0121 5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zM8.34 18V10H5.67v8h2.67zM7 8.84A1.5 1.5 0 105.5 7.34 1.5 1.5 0 007 8.84zM18.34 18v-4.4c0-2.32-1.24-3.4-2.9-3.4-1.34 0-1.94.74-2.27 1.26V10h-2.67c.04.75 0 8 0 8h2.67v-4.46c0-.24.02-.48.09-.65.18-.48.62-.97 1.34-.97.95 0 1.33.72 1.33 1.78V18h2.41z"/></svg>
              </Link>
              <Link href="https://instagram.com" aria-label="Instagram" className="text-text-muted transition hover:text-orange">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.06 1.8.25 2.23.41a3.7 3.7 0 011.34.86 3.7 3.7 0 01.86 1.34c.16.42.35 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.17-.25 1.8-.41 2.23a3.7 3.7 0 01-.86 1.34 3.7 3.7 0 01-1.34.86c-.42.16-1.06.35-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.06-1.8-.25-2.23-.41a3.7 3.7 0 01-1.34-.86 3.7 3.7 0 01-.86-1.34c-.16-.42-.35-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.06-1.17.25-1.8.41-2.23a3.7 3.7 0 01.86-1.34A3.7 3.7 0 014.88 2.7c.42-.16 1.06-.35 2.23-.41C8.42 2.21 8.8 2.2 12 2.2z"/></svg>
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
