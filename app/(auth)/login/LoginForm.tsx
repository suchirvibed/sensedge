"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { safeReturnUrl } from "@/lib/safe-redirect";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeReturnUrl(params.get("from"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setBusy(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
        {busy ? "Logging in…" : "Log in"}
      </Button>

      <GoogleSignInButton label="Continue with Google" />
    </form>
  );
}
