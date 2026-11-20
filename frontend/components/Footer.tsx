import { ArrowUpRight } from "lucide-react";

const LINKS = [
  { href: "https://nwrwdd.aispry.ai", label: "Wagon Damage Detection" },
  { href: "https://nwrlcva.aispry.ai", label: "Locate" },
  { href: "https://nwradt.aispry.ai", label: "Railcomm" },
];

export function Footer() {
  return (
    <footer className="on-dark bg-ink-950 text-white">
      <div className="h-[3px] bg-brand-spectrum" aria-hidden />
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <a href="https://aispry.ai" target="_blank" rel="noopener noreferrer" aria-label="AiSPRY — opens aispry.ai in a new tab">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/brand/aispry-logo.png" alt="AiSPRY" className="h-8 w-auto" width={60} height={32} />
          </a>
          <span className="h-8 w-px bg-white/10" aria-hidden />
          <div>
            <p className="text-sm font-semibold">RailKavach Copilot</p>
            <p className="text-[13px] text-ink-300">AiSPRY Technologies · Hyderabad</p>
          </div>
        </div>
        <nav aria-label="RailKavach products">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1 text-sm font-medium text-ink-200 transition hover:text-white">
                  {l.label}
                  <ArrowUpRight className="h-3.5 w-3.5 text-amber transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
