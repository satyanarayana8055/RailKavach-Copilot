import type { Metadata } from "next";
import { Architecture } from "@/components/Architecture";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Architecture · RailKavach Copilot · AiSPRY",
  description: "Five-stage RailKavach Copilot architecture: Capture, Infer, Attribute, Surface, Evidence — Gemini in the cloud or Gemma at the edge.",
};

export default function ArchitecturePage() {
  return (
    <>
      <Navbar current="architecture" />
      <main>
        <Architecture standalone />
      </main>
      <Footer />
    </>
  );
}
