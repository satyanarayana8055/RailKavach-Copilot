import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Demo requests. Validates and acknowledges with a reference.
 * TODO: route to the sales inbox / CRM — until then requests are only logged server-side.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const name = str(body.name, 120);
  const organisation = str(body.organisation, 160);
  const email = str(body.email, 200);
  const interests = Array.isArray(body.interests) ? body.interests.filter((i): i is string => typeof i === "string").slice(0, 4) : [];

  if (!name || !organisation || !EMAIL.test(email)) return NextResponse.json({ error: "Please fill name, organisation and a valid email" }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: "Consent is required to contact you" }, { status: 400 });

  const reference = `RK-${randomUUID().slice(0, 8).toUpperCase()}`;
  console.info("[demo-request]", JSON.stringify({ reference, at: new Date().toISOString(), name, organisation, email, interests }));
  return NextResponse.json({ reference });
}
