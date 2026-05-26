import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrintCard — Design, print and deliver smart cards",
  description:
    "Professional ID, RFID, NFC and smart cards for businesses, schools and organisations. Design in minutes, printed and delivered to your door.",
  metadataBase: new URL("https://printcard.co.in"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
