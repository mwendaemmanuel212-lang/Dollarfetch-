import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DollarFetch Admin",
    short_name: "DF Admin",
    description: "DollarFetch Administration Dashboard",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#080b18",
    theme_color: "#6d28d9",
    icons: [
      {
        src: "/admin-app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
