import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Log in — PrintCard" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-card bg-white p-10 shadow-card">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> WELCOME BACK
      </span>
      <h1 className="h2 mt-3 text-text-primary">Log in</h1>
      <hr className="orange-divider" />

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-text-muted">
        New to PrintCard?{" "}
        <Link href="/register" className="font-semibold text-orange hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
