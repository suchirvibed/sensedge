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
    <div className="w-full max-w-md rounded-card border border-border bg-white p-10">
      <div className="eyebrow mb-3">Get started</div>
      <h1 className="h2 text-text-primary">Create your account</h1>
      <p className="mt-2 text-sm text-text-muted">
        Design and order professional cards in minutes.
      </p>

      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>

      <p className="mt-8 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-text-primary hover:text-orange">
          Log in
        </Link>
      </p>
    </div>
  );
}
