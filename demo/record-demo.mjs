// RailKavach Copilot — recorded product walkthrough.
//
//   npm run record          → against BASE_URL (default http://localhost:8000, the FastAPI-served build)
//   npm run record:live     → against the Cloud Run deployment
//
// Output (demo/output/): railkavach-copilot-demo.webm, shots/NN-*.png, chapters.md
// The cursor dot and captions are injected overlays: Playwright videos do not show the real pointer.

import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const OUT = new URL("./output/", import.meta.url).pathname;
const W = 1440, H = 900;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "shots"), { recursive: true });
mkdirSync(join(OUT, "raw"), { recursive: true });

/* ---------------- overlays (installed on every page load) ---------------- */
const OVERLAY = () => {
  const css = `
    #demo-cursor{position:fixed;z-index:2147483647;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;
      background:rgba(244,130,32,.35);border:2px solid #f48220;pointer-events:none;transition:transform .12s ease}
    #demo-cursor.down{transform:scale(.7);background:rgba(244,130,32,.6)}
    .demo-ripple{position:fixed;z-index:2147483646;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
      border:2px solid #f48220;pointer-events:none;animation:demo-rip .55s ease-out forwards}
    @keyframes demo-rip{from{opacity:.9;transform:scale(.3)}to{opacity:0;transform:scale(1.6)}}
    #demo-cap{position:fixed;z-index:2147483645;left:24px;bottom:24px;max-width:560px;padding:14px 18px;border-radius:12px;
      background:rgba(10,13,18,.92);color:#fff;font:600 17px/1.35 Geist,system-ui,sans-serif;box-shadow:0 12px 32px -12px rgba(0,0,0,.5);
      opacity:0;transform:translateY(8px);transition:opacity .35s ease,transform .35s ease;pointer-events:none}
    #demo-cap.on{opacity:1;transform:none}
    #demo-cap small{display:block;margin-top:4px;font:500 12.5px/1.4 "JetBrains Mono",ui-monospace,monospace;color:#b6bfcd;letter-spacing:.02em}
    #demo-cap b{color:#f48220;font:600 11px "JetBrains Mono",ui-monospace,monospace;letter-spacing:.14em;display:block;margin-bottom:5px}`;
  const boot = () => {
    if (document.getElementById("demo-cursor")) return;
    const s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);
    const c = document.createElement("div"); c.id = "demo-cursor"; document.body.appendChild(c);
    const cap = document.createElement("div"); cap.id = "demo-cap"; document.body.appendChild(cap);
    addEventListener("mousemove", (e) => { c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; }, true);
    addEventListener("mousedown", (e) => {
      c.classList.add("down");
      const r = document.createElement("div"); r.className = "demo-ripple"; r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px";
      document.body.appendChild(r); setTimeout(() => r.remove(), 600);
    }, true);
    addEventListener("mouseup", () => c.classList.remove("down"), true);
  };
  window.__cap = (step, title, sub) => {
    boot();
    const el = document.getElementById("demo-cap");
    if (!title) return el.classList.remove("on");
    el.innerHTML = `${step ? `<b>${step}</b>` : ""}${title}${sub ? `<small>${sub}</small>` : ""}`;
    el.classList.add("on");
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
};

/* ---------------- run ---------------- */
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome", headless: process.env.HEADED ? false : true });
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  recordVideo: { dir: join(OUT, "raw"), size: { width: W, height: H } },
  locale: "en-IN",
});
await ctx.addInitScript(OVERLAY);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

const t0 = Date.now();
const chapters = [];
let shotN = 0;
const pause = (ms) => page.waitForTimeout(ms);
const mmss = (ms) => `${String(Math.floor(ms / 60000)).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
let mouse = { x: W / 2, y: H / 2 };

async function caption(step, title, sub = "") {
  if (step && !chapters.some((c) => c.includes(step))) chapters.push(`${mmss(Date.now() - t0)}  ${step} — ${title}`);
  await page.evaluate(([a, b, c]) => window.__cap?.(a, b, c), [step, title, sub]);
}
async function shot(name) {
  shotN++;
  await page.screenshot({ path: join(OUT, "shots", `${String(shotN).padStart(2, "0")}-${name}.png`) });
}
async function moveTo(loc) {
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  if (!b) throw new Error("not visible: " + loc);
  const x = b.x + b.width / 2, y = b.y + b.height / 2;
  const d = Math.hypot(x - mouse.x, y - mouse.y);
  await page.mouse.move(x, y, { steps: Math.max(12, Math.round(d / 18)) });
  mouse = { x, y };
}
async function click(loc, wait = 700) {
  await moveTo(loc);
  await pause(250);
  await page.mouse.down(); await pause(70); await page.mouse.up();
  await pause(wait);
}
async function scrollTo(loc, block = "center") {
  await loc.evaluate((el, block) => el.scrollIntoView({ behavior: "smooth", block }), block);
  await pause(1300);
}
const chat = () => page.locator('aside[aria-label="Copilot chat"]');
async function waitAnswer() {
  await pause(600);
  await page.waitForFunction(() => !document.querySelector('aside[aria-label="Copilot chat"]')?.textContent?.includes("Correlating radio"), null, { timeout: 120_000 });
  await pause(900);
}
async function ask(text) {
  const box = page.locator("#copilot-input");
  await click(box, 200);
  await box.pressSequentially(text, { delay: 28 });
  await pause(400);
  await page.keyboard.press("Enter");
  await waitAnswer();
}
async function scrollThread(px) {
  const sc = chat().locator("div.overflow-y-auto").first();
  await sc.evaluate((el, px) => el.scrollBy({ top: px, behavior: "smooth" }), px);
  await pause(1100);
}
async function lastAnswerToTop() {
  await chat().locator("li[data-msg=assistant]").last().evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "start" }));
  await pause(1200);
}
async function switchRole(title) {
  await click(page.locator('button[aria-haspopup="listbox"]'), 600);
  await click(page.getByRole("option", { name: new RegExp(title) }), 1800);
}

try {
  /* 1 — landing */
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await caption("01 · LANDING", "One suite for radio, cabin video and wagons", "Public page · products, demos, request a demo");
  await pause(2600);
  await shot("landing");
  await scrollTo(page.locator("#suite"), "start");
  await pause(1500);
  await caption("01 · LANDING", "Authorised staff open the Copilot", "Role-based access lives on its own page");
  const open = page.locator('a[href="/copilot/"]', { hasText: "Open Copilot" });
  await scrollTo(open);
  await click(open, 2200);

  /* 2 — roles */
  await caption("02 · SIGN IN BY ROLE", "Each role sees only its own sources", "Masking and audit are enforced on the server");
  await pause(2800);
  await shot("roles");
  await click(page.getByRole("button", { name: /Sr\. Divisional Safety Officer/ }), 2500);

  /* 3 — dashboard */
  await caption("03 · DASHBOARD", "The night shift at a glance", "Sr. DSO · Railcomm, Locate and WDD in one view");
  await pause(2500);
  await shot("dashboard");
  const bars = page.locator('ul[aria-label^="Cabin violations"] li');
  await caption("03 · DASHBOARD", "Violations peak between 04:00 and 05:00", "Hover any bar for the count");
  for (const i of [5, 8, 9]) { await moveTo(bars.nth(i)); await pause(700); }
  await shot("chart-hover");
  await caption("03 · DASHBOARD", "What needs a reviewer, most severe first");
  await moveTo(page.locator('section[aria-label="Needs review"] li').first());
  await pause(1600);
  await scrollTo(page.locator('section[aria-label="Flagged radio exchanges"]'));
  await caption("03 · DASHBOARD", "Radio exchanges with real safety callouts", "Transcripts in Hindi and English · fail-open bypasses flagged");
  await pause(2200);
  await scrollTo(page.locator('section[aria-label^="Incident 12414"]'));
  await caption("03 · DASHBOARD", "Radio, cabin and brake data on one timeline");
  await pause(2400);
  await scrollTo(page.locator('section[aria-label^="Rake BOXN-542"]'));
  await caption("03 · DASHBOARD", "Entry vs exit gantry scan for every wagon");
  await pause(2400);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await pause(1200);

  /* 4 — ask: starter */
  await caption("04 · ASK THE COPILOT", "Start from a suggested question", "Or type anything, in English or हिन्दी");
  await pause(1500);
  await click(chat().getByRole("button", { name: /Investigate the 12414/ }), 300);
  await caption("04 · ASK THE COPILOT", "One question correlates radio, cabin and telemetry", "3–5 days of investigation · under a minute");
  await waitAnswer();
  await lastAnswerToTop();
  await shot("answer");
  await scrollThread(380);
  await pause(1200);
  await scrollThread(2000);
  await caption("05 · EVIDENCE", "Every claim is cited to its source", "Timestamp · source · human-review status");
  await click(chat().getByRole("button", { name: /Evidence ·/ }).last(), 1500);
  await scrollThread(2000);
  await shot("evidence");
  await caption("05 · EVIDENCE", "Masked identities · audit entry for every answer", "DPDP Act 2023 · hash-chained access log");
  await moveTo(chat().locator("p.font-mono").last());
  await pause(2400);

  /* 6 — follow-up */
  const chips = chat().locator("li[data-msg=assistant]").last().locator("button.rounded-full");
  if (await chips.count()) {
    await caption("06 · FOLLOW UP", "Continue the conversation with one click");
    await click(chips.first(), 300);
    await waitAnswer();
    await lastAnswerToTop();
    await pause(2200);
    await shot("follow-up");
  }

  /* 7 — ask from the dashboard */
  await caption("07 · ASK FROM THE DASHBOARD", "Any row can become a question");
  const rowAsk = page.locator('section[aria-label="Needs review"] li').first().getByRole("button", { name: "Ask" });
  await scrollTo(rowAsk);
  await click(rowAsk, 300);
  await waitAnswer();
  await lastAnswerToTop();
  await pause(2200);
  await shot("row-ask");

  /* 8 — Hindi */
  await caption("08 · HINDI", "Ask in Hindi, get the answer in Hindi", "Voice input and read-aloud work too");
  await click(page.getByRole("button", { name: "Switch to Hindi" }), 900);
  await ask("क्या 12403 का सिग्नल लाल था?");
  await lastAnswerToTop();
  await pause(2600);
  await shot("hindi");
  await click(page.getByRole("button", { name: "Switch to English" }), 600);

  /* 9 — panel controls */
  await caption("09 · YOUR WORKSPACE", "Widen the chat for long reports");
  await click(chat().getByRole("button", { name: "Widen panel" }), 1600);
  await shot("wide");
  await click(chat().getByRole("button", { name: "Narrow panel" }), 1000);
  await caption("09 · YOUR WORKSPACE", "Collapse it to focus on the data", "⌘I / Ctrl+I toggles · Esc collapses");
  await click(chat().getByRole("button", { name: /Collapse chat/ }), 1600);
  await shot("collapsed");
  await click(page.getByRole("button", { name: "Open Copilot chat" }), 1200);

  /* 10 — DPDP */
  await caption("10 · DPDP", "Identities are masked by default", "Unmasking declares a safety inquiry, and is audited");
  await click(page.locator('button[title="Toggle DPDP PII masking"]'), 1800);
  await click(chat().getByRole("button", { name: "New chat" }), 600);
  await ask("Investigate safety events for Train 12414 near Suratgarh on 2026-11-18.");
  await scrollThread(4000);
  await moveTo(chat().locator("p.font-mono").last());
  await caption("10 · DPDP", "Names visible · purpose recorded in the audit log");
  await pause(2600);
  await shot("unmasked");
  await click(page.locator('button[title="Toggle DPDP PII masking"]'), 1200);

  /* 11 — reports */
  await caption("11 · REPORTS", "Statutory inquiry and crew briefing, ready to sign");
  await click(page.getByRole("tab", { name: "Reports" }), 1800);
  await shot("reports");
  await pause(1500);
  await click(page.getByRole("tab", { name: "Overview" }), 800);

  /* 12 — role scope: Crew Controller */
  await caption("12 · ROLE SCOPE", "Crew Controller · radio and cabin only", "Wagon data isn't in this role's scope");
  await switchRole("Crew Controller");
  await pause(1500);
  await moveTo(page.getByText("Not in your scope:"));
  await pause(1800);
  await shot("crew-dashboard");
  await ask("Audit entry-versus-exit wagon damage for freight rake BOXN-542.");
  await caption("12 · ROLE SCOPE", "Out-of-scope questions are refused, not answered from cache", "The refusal is logged too");
  await pause(3000);
  await shot("crew-refused");
  await ask("Show driver alertness and fatigue trends between 02:00 and 05:00 AM on Bikaner Division.");
  await lastAnswerToTop();
  await caption("12 · ROLE SCOPE", "In-scope questions get full answers");
  await pause(2600);

  /* 13 — role scope: DME */
  await caption("13 · ROLE SCOPE", "Sr. DME · wagons only");
  await switchRole("Sr. DME");
  await pause(1800);
  await shot("dme-dashboard");
  await click(chat().getByRole("button", { name: /Entry vs exit damage/ }), 300);
  await waitAnswer();
  await lastAnswerToTop();
  await pause(2600);
  await shot("dme-answer");

  await caption("RAILKAVACH COPILOT", "Ask once. Get the evidence. Stay within the law.", "Railcomm Analytics · Locate · Wagon Damage Detection");
  await pause(3500);
} catch (e) {
  errors.push("DEMO STEP FAILED: " + (e?.message || e));
  await page.screenshot({ path: join(OUT, "shots", "zz-failure.png") }).catch(() => {});
} finally {
  const video = page.video();
  await ctx.close();
  await browser.close();
  const raw = await video?.path();
  if (raw) renameSync(raw, join(OUT, "railkavach-copilot-demo.webm"));
  rmSync(join(OUT, "raw"), { recursive: true, force: true });
  writeFileSync(
    join(OUT, "chapters.md"),
    `# RailKavach Copilot demo — chapters\n\nSource: ${BASE}\nLength: ${mmss(Date.now() - t0)}\n\n\`\`\`\n${chapters.join("\n")}\n\`\`\`\n`
  );
  console.log(`video:    ${join(OUT, "railkavach-copilot-demo.webm")}`);
  console.log(`shots:    ${readdirSync(join(OUT, "shots")).length} in ${join(OUT, "shots")}`);
  console.log(`length:   ${mmss(Date.now() - t0)}`);
  console.log(errors.length ? "ISSUES:\n" + errors.join("\n") : "no errors");
}
