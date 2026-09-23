import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MAG CORE — THE CORE™",
    short_name: "MAG CORE",
    description: "V19 BLACK EDITION | Built on Core Lock V08",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#FF0033",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
