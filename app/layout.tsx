
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mag-core-v08.vercel.app"),
  title: "MAG CORE — THE CORE™",
  description: "V19 BLACK EDITION | MAG CORE OS — Built on Core Lock V08",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.png", apple: "/icon.png" },
  openGraph: {
    title: "MAG CORE — THE CORE™",
    description: "V19 BLACK EDITION | Built on Core Lock V08",
    url: "https://mag-core-v08.vercel.app",
    siteName: "MAG CORE — THE CORE™",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "MAG CORE — THE CORE™" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MAG CORE — THE CORE™",
    description: "V19 BLACK EDITION | Built on Core Lock V08",
    images: ["/opengraph-image"],
  },
  themeColor: "#FF0033",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: "#000000", overflow: "hidden", width: "100vw", height: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
