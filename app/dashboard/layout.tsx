import type { Metadata } from "next";
import RegisterMemberServiceWorker from "./register-member-sw";

export const metadata: Metadata = {
  title: "DollarFetch",
  applicationName: "DollarFetch",
  description: "DollarFetch Member App",
  manifest: "/member-app.webmanifest",
  appleWebApp: {
    capable: true,
    title: "DollarFetch",
    statusBarStyle: "black-translucent",
  },
};

export default function MemberDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <RegisterMemberServiceWorker />
      {children}
    </>
  );
}
