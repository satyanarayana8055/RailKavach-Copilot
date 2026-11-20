import type { Metadata } from "next";
import { Workspace } from "./Workspace";

export const metadata: Metadata = {
  title: "Copilot · RailKavach · AiSPRY",
  description: "Role-scoped RailKavach Copilot for Indian Railways officials: ask in Hindi or English, get evidence-cited answers with DPDP masking.",
};

export default function CopilotPage() {
  return <Workspace />;
}
