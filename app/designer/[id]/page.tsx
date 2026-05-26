import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DesignerApp } from "@/components/designer/DesignerApp";

export const dynamic = "force-dynamic";

export default async function DesignerPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?from=/designer/" + params.id);
  }
  return <DesignerApp designId={params.id} userName={session.user.name} />;
}
