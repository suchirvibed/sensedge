import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TemplateEditor } from "@/components/templates/TemplateEditor";
import { isTemplateCategory } from "@/lib/template-categories";

interface Props {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?from=/graphics/templates/${params.id}`);
  }
  if (!["GRAPHICS", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  // "new" handled by sibling route; defensive bounce-back here.
  if (params.id === "new") {
    redirect("/graphics/templates/new");
  }

  const template = await prisma.template.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      category: true,
      canvasJson: true,
      isPublic: true,
    },
  });
  if (!template) notFound();

  const category = isTemplateCategory(template.category)
    ? template.category
    : "Other";

  return (
    <TemplateEditor
      templateId={template.id}
      initialName={template.name}
      initialCategory={category}
      initialIsPublic={template.isPublic}
      initialCanvas={template.canvasJson as object}
      userName={session.user.name ?? ""}
    />
  );
}
