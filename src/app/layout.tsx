import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { RegistrerServiceWorker } from "@/components/registrer-service-worker";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Emilies Keeper",
  description: "Oppgaver, ønskelister, mål og alt det andre.",
  appleWebApp: { capable: true, title: "Keeper", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1820" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nb" className={`${geist.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <RegistrerServiceWorker />
      </body>
    </html>
  );
}
