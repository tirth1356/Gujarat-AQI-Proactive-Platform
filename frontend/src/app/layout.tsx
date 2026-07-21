import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gujarat Air Quality Intelligence Platform | Multi-Agency Urban Suite",
  description: "Enterprise AI-Powered Urban Air Quality Intelligence Platform for Gujarat fusing CAAQMS, TomTom Telemetry, NASA FIRMS & Planet Satellite Layers across 32 urban centers.",
  icons: {
    icon: "/icon",
    shortcut: "/favicon.ico",
    apple: "/icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.className} bg-zinc-950 text-stone-200 antialiased`}>
        {children}
      </body>
    </html>
  );
}
