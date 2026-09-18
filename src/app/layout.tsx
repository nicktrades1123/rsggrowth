import type { Metadata, Viewport } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Analytics } from "@/components/analytics";
import { site, socialImage } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "RSG | Strategy, Finance, Growth & Execution",
    template: "%s | RSG",
  },
  description:
    "Business strategy and advisory for small and growing businesses. Bring clarity to your strategy, finance, growth, and execution with RSG.",
  openGraph: {
    siteName: "RSG",
    locale: "en_US",
    type: "website",
    images: [socialImage],
  },
  twitter: { card: "summary", images: [socialImage] },
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
        <Analytics />
      </body>
    </html>
  );
}
