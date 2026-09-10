import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FormFit — upload preparation studio",
    short_name: "FormFit",
    description: "Prepare images and PDFs for online upload requirements.",
    start_url: "/?source=installed-app",
    display: "standalone",
    background_color: "#f3f5f6",
    theme_color: "#c44421",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
