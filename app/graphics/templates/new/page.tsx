import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TemplateEditor } from "@/components/templates/TemplateEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "New template — Graphics" };

export default async function NewTemplatePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?from=/graphics/templates/new");
  if (!["GRAPHICS", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <TemplateEditor
      templateId="new"
      initialName="Untitled template"
      initialCategory="Business"
      initialIsPublic={false}
      initialCanvas={null}
      userName={session.user.name ?? ""}
    />
  );
}
