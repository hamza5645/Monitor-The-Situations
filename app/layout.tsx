import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MONITOR THE SITUATIONS",
  description: "Real-time global situation monitoring dashboard. Track world events, flight radar, markets, and breaking news.",
  keywords: ["situation room", "monitoring", "global events", "flight radar", "stocks", "news"],
  openGraph: {
    title: "MONITOR THE SITUATIONS",
    description: "Real-time global situation monitoring dashboard",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
