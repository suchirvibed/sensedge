"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { IconArrowLeft, IconDeviceFloppy, IconShoppingCart, IconLogout } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";

interface Props {
  designName: string;
  onNameChange: (name: string) => void;
  saveStatus: "idle" | "saving" | "saved";
  onSaveLocal: () => void;
  onPlaceOrder: () => void;
  userName: string;
}

export function DesignerToolbar({
  designName,
  onNameChange,
  saveStatus,
  onSaveLocal,
  onPlaceOrder,
  userName,
}: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-white/10 bg-bg-darker px-5">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
        >
          <IconArrowLeft size={16} />
          Back
        </Link>
        <span className="h-5 w-px bg-white/10" />
        <input
          value={designName}
          onChange={(e) => onNameChange(e.target.value)}
          className="bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/40 focus:ring-0"
          placeholder="Untitled design"
        />
        <span className="text-xs text-white/40">
          {saveStatus === "saving" && "Saving…"}
          {saveStatus === "saved" && "All changes saved"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onSaveLocal} variant="ghost" size="md" className="!text-white hover:!bg-white/10">
          <IconDeviceFloppy size={16} /> Save draft
        </Button>
        <Button onClick={onPlaceOrder} variant="primary" size="md" showArrow>
          <IconShoppingCart size={16} /> Continue to order
        </Button>
        <span className="hidden text-xs text-white/40 md:inline">{userName}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          aria-label="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <IconLogout size={16} />
        </button>
      </div>
    </header>
  );
}
