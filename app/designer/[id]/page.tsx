import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DesignerApp } from "@/components/designer/DesignerApp";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function DesignerPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?from=/designer/" + params.id);
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
