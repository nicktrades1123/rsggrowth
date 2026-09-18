import type { Metadata, Viewport } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "RSG | Strategy, Finance, Growth & Execution",
    template: "%s | RSG",
  },
  description:
    "Business strategy and advisory for small and growing businesses. Bring clarity to your strategy, finance, growth, and execution with RSG.",
  openGraph: { siteName: "RSG", locale: "en_US", type: "website" },
  twitter: { card: "summary" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#142b38" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
