"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";

const ROLES: { value: Role; label: string }[] = [
  { value: "CUSTOMER", label: "Customer" },
  { value: "GRAPHICS", label: "Graphics" },
  { value: "PRINTER", label: "Printer" },
  { value: "ADMIN", label: "Admin" },
];

interface Props {
  userId: string;
  current: Role;
  /** When true, the dropdown is disabled (self-row protection). */
  isSelf?: boolean;
}

export function UserRoleSelect({ userId, current, isSelf }: Props) {
  const router = useRouter();
  const [value, setValue] = useState<Role>(current);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(next: Role) {
    setError(null);
    setBusy(true);
    setValue(next);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setValue(current); // rollback
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={value}
        disabled={isSelf || busy}
        onChange={(e) => change(e.target.value as Role)}
        title={isSelf ? "You can't change your own role" : undefined}
        className="h-8 rounded-input border border-border bg-white px-2 text-xs font-medium text-text-primary focus:border-text-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-bg-page disabled:text-text-muted"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[10px] text-tint-redText">{error}</span>}
    </div>
  );
}
