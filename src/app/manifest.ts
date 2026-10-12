import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Emilies Keeper",
    short_name: "Keeper",
    description: "Oppgaver, ønskelister, mål og alt det andre.",
    lang: "nb",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6f1",
    theme_color: "#fbf6f1",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
