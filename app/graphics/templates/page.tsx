import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { IconLayoutGrid } from "@tabler/icons-react";

export const metadata = { title: "Templates — Graphics" };

export default function GraphicsTemplatesPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> GRAPHICS / TEMPLATES
      </span>
      <h1 className="h2 mt-3 text-text-primary">Templates</h1>
      <p className="mt-2 text-sm text-text-muted">
        Manage the public template library that customers can start from in
        the designer.
      </p>

      <div className="mt-10">
        <EmptyState
          icon={<IconLayoutGrid size={22} />}
          title="Template editor coming next"
          body="Templates currently get auto-loaded from card-type defaults (Company, School, Others) inside the designer. A first-class template library is the next slice."
          action={
            <Link
              href="/graphics"
              className="inline-flex h-10 items-center rounded-btn border border-border bg-white px-5 text-sm font-semibold text-text-primary transition hover:border-text-primary"
            >
              Back to queue
            </Link>
          }
        />
      </div>
    </div>
  );
}
