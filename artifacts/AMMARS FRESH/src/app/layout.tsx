import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { brand } from "@/lib/brand";
import { getAppUrl } from "@/lib/app-url";

const pageTitle = `${brand.legalName} — Fresh Produce Marketplace`;

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: pageTitle,
  description: brand.metaDescription,
  keywords:
    "agriculture, marketplace, South Sudan, farmers, retailers, produce, logistics, Juba, AMMARS FRESH",
  robots: "index, follow",
  authors: [{ name: brand.legalName }],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: pageTitle,
    description: `Connecting farmers, retailers, and logistics across ${brand.country}. Live truck tracking, fair prices, fresh produce delivered.`,
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_AR"],
    siteName: brand.legalName,
    images: ["/opengraph.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: `Connecting farmers, retailers, and logistics across ${brand.country}.`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#15803d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
