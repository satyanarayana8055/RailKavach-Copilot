"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";

const INTERESTS = ["Wagon Damage Detection", "Locate", "Railcomm", "RailKavach Copilot"] as const;

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done"; ref: string } | { kind: "error"; msg: string };

const field = "mt-1.5 h-11 w-full rounded-btn border border-white/15 bg-white/[0.04] px-3 text-sm text-white placeholder:text-ink-400 focus:border-amber focus:outline-none";

/** Public demo request. Collects only what is needed and asks for explicit consent (DPDP Act 2023 §6). */
export function RequestDemo() {
  const [state, setState] = useState<State>({ kind: "idle" });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          organisation: f.get("organisation"),
          email: f.get("email"),
          interests: f.getAll("interests"),
          consent: f.get("consent") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setState({ kind: "done", ref: data.reference });
    } catch (err) {
      setState({ kind: "error", msg: err instanceof Error ? err.message : "Something went wrong" });
    }
  };

  return (
    <section id="demo" aria-labelledby="demo-h" className="on-dark relative isolate overflow-hidden bg-navy text-white">
      <div className="bg-grid-dark mask-fade-b absolute inset-0 -z-10" aria-hidden />
      <div className="absolute -right-40 -top-40 -z-10 h-[480px] w-[480px] rounded-full bg-orange/20 blur-[120px]" aria-hidden />
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <div>
          <p className="eyebrow">Request a demo</p>
          <h2 id="demo-h" className="h-display mt-4 text-[36px] sm:text-[52px]">
            See it on <em>your division.</em>
          </h2>
        </div>

        <div className="panel-dark p-6 sm:p-8">
          {state.kind === "done" ? (
            <div role="status" className="flex flex-col items-start gap-3 py-6">
              <CheckCircle2 className="h-10 w-10 text-ok" aria-hidden />
              <p className="text-xl font-semibold">Request received</p>
              <p className="font-mono text-[12px] text-ink-300">Reference {state.ref}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-ink-200">
                Name
                <input name="name" required maxLength={120} autoComplete="name" className={field} />
              </label>
              <label className="text-sm font-medium text-ink-200">
                Organisation / division
                <input name="organisation" required maxLength={160} autoComplete="organization" className={field} />
              </label>
              <label className="text-sm font-medium text-ink-200 sm:col-span-2">
                Work email
                <input name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
              </label>

              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-medium text-ink-200">Interested in</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {INTERESTS.map((i) => (
                    <label key={i} className="cursor-pointer">
                      <input type="checkbox" name="interests" value={i} className="peer sr-only" />
                      <span className="inline-flex rounded-full border border-white/15 px-3 py-1.5 text-[13px] font-medium text-ink-200 transition peer-checked:border-amber peer-checked:bg-amber peer-checked:text-ink-950 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-amber">
                        {i}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="flex items-start gap-3 text-[13px] leading-relaxed text-ink-300 sm:col-span-2">
                <input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-amber" />
                I consent to AiSPRY using these details only to arrange this demo. They are not shared and are deleted on request.
              </label>

              <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                <button type="submit" disabled={state.kind === "sending"} className="btn-amber h-12 px-6">
                  {state.kind === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
                  Request demo
                </button>
                {state.kind === "error" && (
                  <p role="alert" className="text-sm text-[#ff8a8d]">
                    {state.msg}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
