import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Create account — PrintCard" };

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md rounded-card bg-white p-10 shadow-card">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> GET STARTED
      </span>
      <h1 className="h2 mt-3 text-text-primary">Create your account</h1>
      <hr className="orange-divider" />

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-orange hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
