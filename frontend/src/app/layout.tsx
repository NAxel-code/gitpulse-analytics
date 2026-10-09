import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitPulse Analytics — High-Performance GitHub Developer Intelligence",
  description: "Real-time GitHub analytics, DORA velocity metrics, PR lifecycle funnels, and AI text-to-insight powered by DuckDB.",
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
