"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      // Auto sign-in
      const signRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signRes?.error) {
        // Account created but auto-sign-in failed; send to login.
        router.push("/login");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <Input
        name="name"
        type="text"
        label="Full name"
        autoComplete="name"
        required
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
      />
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
      />
      <Input
        name="phone"
        type="tel"
        label="Phone (optional)"
        autoComplete="tel"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
      />
      <Input
        name="password"
        type="password"
        label="Password (min 8 characters)"
        autoComplete="new-password"
        required
        minLength={8}
        value={form.password}
        onChange={(e) => update("password", e.target.value)}
      />
      {error && (
        <p className="rounded-input bg-tint-red px-3 py-2 text-sm text-tint-redText">{error}</p>
      )}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={busy}
        showArrow
        className="w-full justify-center"
      >
        {busy ? "Creating…" : "Create account"}
      </Button>

      <GoogleSignInButton label="Sign up with Google" />
    </form>
  );
}
