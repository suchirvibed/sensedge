import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Create account — PrintCard" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="w-full max-w-md rounded-card bg-white p-10 shadow-card">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> GET STARTED
      </span>
      <h1 className="h2 mt-3 text-text-primary">Create your account</h1>
      <hr className="orange-divider" />

      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-orange hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
