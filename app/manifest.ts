import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/?app=dollarfetch-member",
    name: "DollarFetch",
    short_name: "DollarFetch",
    description: "DollarFetch Member App",
    start_url: "/app/login?source=member-app",
    scope: "/",
    display: "standalone",
    background_color: "#100b24",
    theme_color: "#6d28d9",
    icons: [
      {
        src: "/member-app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/member-app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
