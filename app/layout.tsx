
import type { Metadata, Viewport } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "DollarFetch | BWK",
  description: "DollarFetch by BWK Solutions",
  applicationName: "DollarFetch",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "DollarFetch",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#073323",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="Bidvertiser2109160" content="2109160" />
        <meta
          name="offerwall-verification"
          content="6b02fe0e02e2d8f6a3dd8bf1"
        />
      </head>
      <body>
        {children}
        <div
          dangerouslySetInnerHTML={{
            __html: "<!-- Bidvertiser2109160 -->",
          }}
        />
      </body>
    </html>
  );
}
