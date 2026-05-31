import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QOrium Phase 1",
  description: "Assessment builder and candidate assessment flow"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
