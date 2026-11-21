import type { Metadata } from "next";
import { Architecture } from "@/components/Architecture";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Architecture · RailKavach Copilot · AiSPRY",
  description: "How RailKavach Copilot turns a question into evidence: access check, agent skills with Gemini or Gemma, evidence and rule checks, and a hash-chained audit log.",
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
