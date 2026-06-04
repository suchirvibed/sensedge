import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { IconLayoutGrid, IconPlus } from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";

export const metadata = { title: "My designs — PrintCard" };

export default async function DesignsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const designs = await prisma.design.findMany({
    where: {
      userId,
      // Hide the auto-created "[BLANK INKJET]" stub from the grid —
      // it's an internal artefact, not something the user designed.
      NOT: { name: "[BLANK INKJET]" },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      previewUrl: true,
      updatedAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow text-text-muted">
            <span className="text-orange">■</span> DESIGNS
          </span>
          <h1 className="h2 mt-3 text-text-primary">My designs</h1>
        </div>
        <LinkButton href="/designer/new" variant="primary" showArrow>
          <IconPlus size={16} /> New design
        </LinkButton>
      </div>

      <div className="mt-8">
        {designs.length === 0 ? (
          <EmptyState
            icon={<IconLayoutGrid size={22} />}
            title="No saved designs yet"
            body="Designs you save will appear here so you can edit, duplicate or order them again."
            action={
              <LinkButton href="/designer/new" variant="primary" showArrow>
                Start designing
              </LinkButton>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((d) => (
              <Link
                key={d.id}
                href={`/designer/${d.id}`}
                className="group block overflow-hidden rounded-card bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
              >
                <div className="relative aspect-[1.6/1] w-full bg-bg-page">
                  {d.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.previewUrl}
                      alt={d.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-widest text-text-muted">
                      No preview
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-text-primary">
                      {d.name}
                    </div>
                    <div className="text-xs text-text-muted">
                      Updated {new Date(d.updatedAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
