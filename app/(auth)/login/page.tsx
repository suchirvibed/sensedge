import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Log in — PrintCard" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="w-full max-w-md rounded-card border border-border bg-white p-10">
      <div className="eyebrow mb-3">Welcome back</div>
      <h1 className="h2 text-text-primary">Log in to PrintCard</h1>
      <p className="mt-2 text-sm text-text-muted">
        Enter your details or continue with Google.
      </p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="mt-8 text-center text-sm text-text-muted">
        New to PrintCard?{" "}
        <Link href="/register" className="font-semibold text-text-primary hover:text-orange">
          Create an account
        </Link>
      </p>
    </div>
  );
}
