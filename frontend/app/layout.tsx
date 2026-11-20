import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { Fraunces, JetBrains_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "500", "600"], variable: "--font-deva", display: "swap" });

export const metadata: Metadata = {
  title: "RailKavach Copilot · AiSPRY",
  description:
    "Multimodal AI safety copilot for Indian Railways — unifying Railcomm audio analytics, Locate locomotive cabin video analytics and Wagon Damage Detection.",
  icons: { icon: "/images/brand/aispry-logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#03061a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${GeistSans.variable} ${display.variable} ${mono.variable} ${deva.variable}`}>
      <body>{children}</body>
    </html>
  );
}
