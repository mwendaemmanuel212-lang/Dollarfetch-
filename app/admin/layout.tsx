import type { Metadata } from "next";
import RegisterAdminServiceWorker from "./register-sw";

export const metadata: Metadata = {
  title: "DollarFetch Admin",
  applicationName: "DollarFetch Admin",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "DollarFetch Admin",
    statusBarStyle: "black-translucent",
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <RegisterAdminServiceWorker />
      {children}
    </>
  );
}
