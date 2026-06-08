import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DesignerApp } from "@/components/designer/DesignerApp";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
  searchParams: { template?: string };
}

export default async function DesignerPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user) {
    const from = `/designer/${params.id}${
      searchParams.template ? `?template=${searchParams.template}` : ""
    }`;
    redirect(`/login?from=${encodeURIComponent(from)}`);
  }

  // ── Template deep-link (only meaningful on a fresh canvas) ──
  // The public /templates page links here as /designer/new?template={id}.
  // We resolve the template, pull its canvasJson + name, and treat them
  // as the initial state.
  if (params.id === "new" && searchParams.template) {
    const template = await prisma.template.findUnique({
      where: { id: searchParams.template },
      select: { id: true, name: true, canvasJson: true, isPublic: true },
    });
    if (template && template.isPublic) {
      return (
        <DesignerApp
          designId="new"
          userName={session.user.name}
          initialName={template.name}
          initialCanvas={template.canvasJson as object}
        />
      );
    }
    // Bad / private template id — fall through to blank canvas silently.
  }

  // "new" = fresh canvas, not persisted yet. First save creates the row.
  if (params.id === "new") {
    return (
      <DesignerApp
        designId="new"
        userName={session.user.name}
        initialName="Untitled design"
        initialCanvas={null}
      />
    );
  }

  // Real design ID — load it from DB. Other users' designs return 404.
  const design = await prisma.design.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      userId: true,
      name: true,
      canvasJson: true,
    },
  });
  if (!design || design.userId !== session.user.id) {
    notFound();
  }

  return (
    <DesignerApp
      designId={design.id}
      userName={session.user.name}
      initialName={design.name}
      initialCanvas={design.canvasJson as object}
    />
  );
}
