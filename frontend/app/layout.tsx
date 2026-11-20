import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RailKavach Copilot 🚆🛡️ | Indian Railways Operational Intelligence",
  description: "Multimodal AI Safety Assistant connecting Wagon Damage Detection (WDD), Locate Cabin Video Analytics, and Railcomm Denoised Audio for Indian Railways.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-[#f48220] selection:text-white">
        {children}
      </body>
    </html>
  );
}
