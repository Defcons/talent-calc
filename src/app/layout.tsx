import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talent Calculator",
  description: "Wrath-era talent calculator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        {/* Header matching logs.defc0n.no */}
        <header
          className="flex items-center justify-between px-6 py-3"
          style={{
            background: "var(--header-bg)",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <a href="/" className="text-lg font-semibold" style={{ color: "var(--accent)" }}>
            Talent Calculator
          </a>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
