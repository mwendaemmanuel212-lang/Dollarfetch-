import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DollarFetch Admin",
  applicationName: "DollarFetch Admin",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
