"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { safeReturnUrl } from "@/lib/safe-redirect";

interface Props {
  /** "Continue with Google" / "Sign up with Google" etc. */
  label?: string;
}

export function GoogleSignInButton({ label = "Continue with Google" }: Props) {
  const params = useSearchParams();
  const callbackUrl = safeReturnUrl(params.get("from"));
  const [busy, setBusy] = useState(false);

  // Only render when explicitly enabled — keeps the button hidden until
  // the operator has actually configured Google OAuth credentials.
  if (process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED !== "true") return null;

  return (
    <>
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <button
        type="button"
        onClick={() => {
          setBusy(true);
          signIn("google", { callbackUrl });
        }}
        disabled={busy}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-btn border border-border bg-white text-sm font-semibold text-text-primary transition hover:border-text-primary hover:bg-bg-page disabled:opacity-60"
      >
        <GoogleLogo />
        {busy ? "Redirecting…" : label}
      </button>
    </>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.62z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.46-.81 5.95-2.18l-2.9-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.95A8.997 8.997 0 0 0 0 9c0 1.45.35 2.83.95 4.05l3.02-2.33z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .95 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
