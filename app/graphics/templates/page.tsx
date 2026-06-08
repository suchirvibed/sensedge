import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { IconLayoutGrid, IconPlus } from "@tabler/icons-react";
import { TEMPLATE_CATEGORIES, type TemplateCategory } from "@/lib/template-categories";
import { SeedTemplatesButton } from "@/components/graphics/SeedTemplatesButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Templates — Graphics" };

interface SP {
  category?: string;
  publish?: string; // "PUBLIC" | "DRAFT" | undefined
}

export default async function GraphicsTemplatesPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const category =
    searchParams.category &&
    (TEMPLATE_CATEGORIES as readonly string[]).includes(searchParams.category)
      ? (searchParams.category as TemplateCategory)
      : undefined;
  const publish =
    searchParams.publish === "PUBLIC" || searchParams.publish === "DRAFT"
      ? searchParams.publish
      : undefined;

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (publish === "PUBLIC") where.isPublic = true;
  if (publish === "DRAFT") where.isPublic = false;

  const templates = await prisma.template.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    take: 200,
    select: {
      id: true,
      name: true,
      category: true,
      previewUrl: true,
      isPublic: true,
      updatedAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow text-text-muted">
            <span className="text-orange">■</span> GRAPHICS / TEMPLATES
          </span>
          <h1 className="h2 mt-3 text-text-primary">Template library</h1>
          <p className="mt-2 text-sm text-text-muted">
            Templates marked as Published are shown to customers in the
            designer&apos;s Templates tab.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SeedTemplatesButton />
          <Link
            href="/graphics/templates/new"
            className="inline-flex h-11 items-center gap-2 rounded-btn bg-orange px-5 text-sm font-semibold text-white transition hover:bg-orange-dark"
          >
            <IconPlus size={16} /> New template
          </Link>
        </div>
      </div>

      {/* Filters */}
      <form
        method="get"
        action="/graphics/templates"
        className="mt-8 flex flex-wrap items-end gap-3"
      >
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-text-muted">
            Category
          </label>
          <select
            name="category"
            defaultValue={category ?? ""}
            className="h-10 rounded-input border border-border bg-white px-3 text-sm text-text-primary focus:border-text-primary focus:outline-none"
          >
            <option value="">All categories</option>
            {TEMPLATE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-text-muted">
            State
          </label>
          <select
            name="publish"
            defaultValue={publish ?? ""}
            className="h-10 rounded-input border border-border bg-white px-3 text-sm text-text-primary focus:border-text-primary focus:outline-none"
          >
            <option value="">Published &amp; drafts</option>
            <option value="PUBLIC">Published only</option>
            <option value="DRAFT">Drafts only</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-10 rounded-btn bg-text-primary px-5 text-sm font-semibold text-white transition hover:bg-orange"
        >
          Filter
        </button>
        {(category || publish) && (
          <Link
            href="/graphics/templates"
            className="h-10 inline-flex items-center text-xs font-semibold text-text-muted hover:text-text-primary"
          >
            Reset
          </Link>
        )}
      </form>

      <div className="mt-8">
        {templates.length === 0 ? (
          <EmptyState
            icon={<IconLayoutGrid size={22} />}
            title="No templates yet"
            body="Create your first template and toggle Publish to make it appear in every customer's designer."
            action={
              <Link
                href="/graphics/templates/new"
                className="inline-flex h-10 items-center gap-2 rounded-btn bg-orange px-5 text-sm font-semibold text-white transition hover:bg-orange-dark"
              >
                <IconPlus size={16} /> New template
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <Link
                key={t.id}
                href={`/graphics/templates/${t.id}`}
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
                      No preview
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <Badge tone={t.isPublic ? "green" : "neutral"}>
                      {t.isPublic ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="truncate font-semibold text-text-primary">
                      {t.name}
                    </span>
                    <Badge tone="neutral">{t.category}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-text-muted">
                    Updated {new Date(t.updatedAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
