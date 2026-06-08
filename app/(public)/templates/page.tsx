import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { IconLayoutBoard } from "@tabler/icons-react";
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
  isTemplateCategory,
} from "@/lib/template-categories";
import { cn } from "@/lib/cn";

export const metadata = {
  title: "Templates — PrintCard",
  description:
    "Professional card templates ready to customise. Pick one and we'll print and ship across India.",
};

interface SP {
  category?: string;
}

export const dynamic = "force-dynamic";

export default async function PublicTemplatesPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const filterCat: TemplateCategory | null =
    searchParams.category && isTemplateCategory(searchParams.category)
      ? searchParams.category
      : null;

  const templates = await prisma.template.findMany({
    where: {
      isPublic: true,
      ...(filterCat ? { category: filterCat } : {}),
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 60,
    select: {
      id: true,
      name: true,
      category: true,
      previewUrl: true,
    },
  });

  return (
    <section className="bg-bg-page">
      <div className="container-px mx-auto max-w-container py-16 lg:py-24">
        <div className="max-w-2xl">
          <span className="eyebrow text-text-muted">
            <span className="text-orange">■</span> TEMPLATES
          </span>
          <h1 className="h1 mt-3 text-text-primary">
            Start from a template, ship in days.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-body">
            Pre-designed layouts for every kind of card. Pick one, customise
            the details in our browser studio, and we&rsquo;ll print and
            deliver across India in 3–5 days.
          </p>
        </div>

        {/* Category filter chips */}
        <div className="mt-10 flex flex-wrap gap-2">
          <CategoryChip label="All" active={filterCat === null} href="/templates" />
          {TEMPLATE_CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              label={c}
              active={filterCat === c}
              href={`/templates?category=${encodeURIComponent(c)}`}
            />
          ))}
        </div>

        <div className="mt-10">
          {templates.length === 0 ? (
            <EmptyState
              icon={<IconLayoutBoard size={22} />}
              title="No templates in this category yet"
              body="Try another category, or start from a blank card in the designer."
              action={
                <LinkButton href="/designer/new" variant="primary" showArrow>
                  Design from scratch
                </LinkButton>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <Link
                  key={t.id}
                  href={`/designer/new?template=${t.id}`}
                  className="group block overflow-hidden rounded-card border border-border bg-white transition hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-hover"
                >
                  <div className="relative aspect-[1.6/1] bg-bg-page">
                    {t.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.previewUrl}
                        alt={t.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-widest text-text-muted">
                        Preview unavailable
                      </div>
                    )}
                    <div className="absolute right-3 top-3">
                      <Badge tone="neutral">{t.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-text-primary">
                        {t.name}
                      </div>
                      <div className="mt-0.5 text-xs text-text-muted">
                        Click to customise
                      </div>
                    </div>
                    <span className="ml-3 inline-flex h-9 items-center justify-center rounded-btn bg-orange px-3 text-xs font-semibold text-white transition group-hover:bg-orange-dark">
                      Use →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-3 rounded-card border border-border bg-white p-6">
          <div className="flex-1 min-w-[240px]">
            <div className="font-display text-lg font-bold text-text-primary">
              Can&rsquo;t find what you&rsquo;re after?
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Start from a blank canvas in the designer — text, photo, QR and
              barcode fields are one click away.
            </p>
          </div>
          <LinkButton href="/designer/new" variant="primary" showArrow>
            Design from scratch
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

function CategoryChip({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition",
        active
          ? "border-orange bg-orange text-white"
          : "border-border bg-white text-text-body hover:border-text-primary"
      )}
    >
      {label}
    </Link>
  );
}
