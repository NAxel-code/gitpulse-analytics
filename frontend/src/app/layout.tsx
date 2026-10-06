import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OmniPulse Analytics — Real-time Marketing & Traffic Intelligence",
  description: "Next-gen marketing analytics platform with stream ingestion, bento grid visualization, and hybrid AI insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
