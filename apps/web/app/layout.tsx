import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Qorium — AI-proof technical assessment",
    template: "%s · Qorium",
  },
  description:
    "Built post-LLM. Per-candidate question variants. Real-time AI-plagiarism detection. Audit-defensible results.",
  metadataBase: new URL("https://qorium.online"),
  openGraph: {
    title: "Qorium — AI-proof technical assessment",
    description:
      "Built post-LLM. Per-candidate question variants. Real-time AI-plagiarism detection. Audit-defensible results.",
    url: "https://qorium.online",
    siteName: "Qorium",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qorium — AI-proof technical assessment",
    description:
      "Built post-LLM. Per-candidate question variants. Real-time AI-plagiarism detection. Audit-defensible results.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
