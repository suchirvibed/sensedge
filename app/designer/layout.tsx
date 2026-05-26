import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Designer — PrintCard",
};

export default function DesignerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-white">
      {/* The marketing nav is intentionally excluded — designer is its own surface */}
      {children}
    </div>
  );
}
