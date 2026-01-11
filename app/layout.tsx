import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://monitorthesituations.com"),
  title: {
    default: "Monitor the Situations - Real-Time Global Monitoring Dashboard",
    template: "%s | Monitor the Situations",
  },
  description:
    "Live ops-center style dashboard for real-time global monitoring. Track flight radar, stock markets, breaking news, and OSINT intel sources in one place.",
  keywords: [
    "situation room",
    "real-time monitoring",
    "flight radar",
    "OSINT",
    "global events",
    "stock market tracker",
    "breaking news",
    "military aircraft tracking",
    "ADS-B",
    "situation awareness",
    "intel dashboard",
  ],
  authors: [{ name: "Monitor the Situations" }],
  creator: "Monitor the Situations",
  publisher: "Monitor the Situations",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://monitorthesituations.com",
    siteName: "Monitor the Situations",
    title: "Monitor the Situations - Real-Time Global Monitoring Dashboard",
    description:
      "Live ops-center style dashboard for real-time global monitoring. Track flight radar, stock markets, breaking news, and OSINT intel sources.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Monitor the Situations - Real-Time Global Monitoring Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monitor the Situations - Real-Time Global Monitoring Dashboard",
    description:
      "Live ops-center style dashboard for real-time global monitoring. Track flight radar, stock markets, breaking news, and OSINT intel sources.",
    images: ["/opengraph-image"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
  other: {
    "theme-color": "#0a0a0a",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Monitor the Situations",
  description:
    "Live ops-center style dashboard for real-time global monitoring. Track flight radar, stock markets, breaking news, and OSINT intel sources.",
  url: "https://monitorthesituations.com",
  applicationCategory: "NewsApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Real-time flight radar tracking",
    "Live stock market data",
    "Breaking news ticker",
    "OSINT intel source links",
    "Military aircraft tracking",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${jetbrainsMono.variable} antialiased scanlines`}>
        {children}
        {/* Cloudflare Web Analytics */}
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "a5c9e56c914746a985f5a010fb204e10"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
