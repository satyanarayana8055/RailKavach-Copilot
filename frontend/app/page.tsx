import { Convergence } from "@/components/Convergence";
import { CopilotTeaser } from "@/components/CopilotTeaser";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { ProductSuite } from "@/components/ProductSuite";
import { RequestDemo } from "@/components/RequestDemo";

/** Public landing: the RailKavach suite, what the copilot does, and a demo request. No workspace here. */
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Convergence />
        <ProductSuite />
        <CopilotTeaser />
        <RequestDemo />
      </main>
      <Footer />
    </>
  );
}
