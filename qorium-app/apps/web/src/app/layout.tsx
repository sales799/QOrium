import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://qorium.online"),
  title: {
    default: "QOrium - Skills assessments you can defend in an audit.",
    template: "%s"
  },
  description:
    "QOrium is an India-built assessment content platform with ReadyBank, JD-Forge, Stack-Vault, anti-leak positioning, and evidence-gated trust surfaces.",
  applicationName: "QOrium",
  authors: [{ name: "Talpro India Pvt Ltd" }],
  keywords: [
    "skills assessment",
    "assessment library",
    "JD-Forge",
    "ReadyBank",
    "Stack-Vault",
    "anti-leak assessment",
    "DPDP hiring"
  ],
  openGraph: {
    type: "website",
    siteName: "QOrium",
    locale: "en_IN"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
