import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { IconCurrencyRupee } from "@tabler/icons-react";

export const metadata = { title: "Pricing — Admin" };

export default function AdminPricingPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> ADMIN / PRICING
      </span>
      <h1 className="h2 mt-3 text-text-primary">Pricing</h1>
      <p className="mt-2 text-sm text-text-muted">
        Per-card pricing, finish &amp; chip add-ons, bulk discount tiers and
        shipping rates. Edits made here apply to new orders only.
      </p>

      <div className="mt-10">
        <EmptyState
          icon={<IconCurrencyRupee size={22} />}
          title="Pricing UI coming next"
          body="Pricing rules currently live in lib/pricing.ts. A form-driven editor is the next slice — flag if you'd like it prioritised."
          action={
            <Link
              href="/admin"
              className="inline-flex h-10 items-center rounded-btn border border-border bg-white px-5 text-sm font-semibold text-text-primary transition hover:border-text-primary"
            >
              Back to Overview
            </Link>
          }
        />
      </div>
    </div>
  );
}
