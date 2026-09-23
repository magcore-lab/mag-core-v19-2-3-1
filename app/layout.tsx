import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAG CORE — THE CORE™",
  description: "V19 BLACK EDITION | Built on Core Lock V08",
  themeColor: "#FF0033",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: "#000000", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
