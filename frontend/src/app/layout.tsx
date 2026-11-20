import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RailKavach Copilot | Indian Railways AI Platform",
  description: "Autonomous Multimodal Safety Investigation & Cross-Modal Regulatory Intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
