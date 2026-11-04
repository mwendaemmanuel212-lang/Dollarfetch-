import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "DollarFetch | BWK",
  description: "BWK DollarFetch Member Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
