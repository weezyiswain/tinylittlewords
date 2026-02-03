import type { Metadata, Viewport } from "next";
import "./globals.css";
import { canonicalUrl, seoConfig } from "@/lib/seo";
import { MobileLayoutDebug } from "@/components/MobileLayoutDebug";
import { ViewportHeight } from "@/components/ViewportHeight";

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  applicationName: seoConfig.siteName,
  title: {
    default: seoConfig.defaultTitle,
    template: `%s | ${seoConfig.siteName}`,
  },
  description: seoConfig.defaultDescription,
  keywords: [...seoConfig.keywords],
  authors: [{ name: "Tiny Little Words Team" }],
  creator: "Tiny Little Words",
  publisher: "Tiny Little Words",
  alternates: {
    canonical: canonicalUrl(),
  },
  openGraph: {
    url: seoConfig.siteUrl,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    siteName: seoConfig.siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${seoConfig.siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Tiny Little Words – kid-friendly word puzzle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    creator: "@tinylittlewords",
    images: [`${seoConfig.siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  category: "Education",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: seoConfig.siteName,
  },
};

export const viewport: Viewport = {
  themeColor: "#faf5ff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="relative h-full font-sans antialiased">
        <ViewportHeight />
        {children}
        <MobileLayoutDebug />
      </body>
    </html>
  );
}
