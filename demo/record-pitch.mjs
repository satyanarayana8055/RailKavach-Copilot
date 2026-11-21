// RailKavach Copilot — 2-minute narrated pitch video (jury cut).
//
//   FFMPEG=/path/to/ffmpeg node record-pitch.mjs          (macOS: uses `say` for narration)
//   BASE_URL=https://… NARRATOR=Aman OFFICER=Rishi node record-pitch.mjs
//
// Story: the problem → what AiSPRY already captures → one Copilot over all of it → proof (cited, verifiable,
// spoken in Hinglish) → privacy by design → value. Narration in Indian English; captions burned in and as .srt.
// Output (demo/output-pitch/): railkavach-pitch.mp4, railkavach-pitch.srt, transcript.md, shots/

import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const OUT = new URL("./output-pitch/", import.meta.url).pathname;
const AUD = join(OUT, "audio");
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const NARRATOR = process.env.NARRATOR || "Aman"; // macOS en_IN voice
const OFFICER = process.env.OFFICER || "Rishi"; // a second en_IN voice for the officer's question
const RATE = process.env.RATE || "172";
const W = 1440, H = 900, MAX_S = 120;

rmSync(OUT, { recursive: true, force: true });
for (const d of ["shots", "raw", "audio"]) mkdirSync(join(OUT, d), { recursive: true });

/* ------------------------------------------------------------------ the script */
const LINES = {
  problem: ["THE PROBLEM", "Every night, Indian Railways runs thousands of trains. When something goes wrong, the evidence is scattered across radio recordings, cab videos and wagon scans. An inquiry costs officers days of manual work."],
  capture: ["WHAT AISPRY ALREADY CAPTURES", "AiSPRY already captures that evidence. Railcomm cleans noisy loco radio. Locate spots phone use and fatigue in the cab. Wagon Damage Detection compares every wagon at entry and exit."],
  signin: ["ONE COPILOT · ROLE-BASED", "RailKavach Copilot brings all three together. Each officer signs in by role, and sees only what that role is allowed to see."],
  shift: ["THE WHOLE SHIFT, ONE SCREEN", "The safety officer sees the whole night shift on one screen, and every number traces back to a record."],
  ask: ["ASK ONCE", "Now, one question about train 12414 near Suratgarh."],
  answer: ["ASK ONCE", "In seconds, it lines up the station master's call, the assistant pilot's warning and the emergency brake, and gives a clear verdict. The signal was not passed."],
  evidence: ["EVIDENCE YOU CAN SIGN", "Every claim is tied to its original file. One click re-checks the file's digital fingerprint, so the evidence holds up under Section 63 of the new Evidence Act."],
  speak: ["JUST SPEAK", "Officers can also just speak. Hindi, English, or Hinglish."],
  spoke: ["JUST SPEAK", "It replies in the same language, with exact counts, and reads the answer aloud in Indian English."],
  privacy: ["PRIVACY BY DESIGN", "Privacy is enforced on the server. A crew controller asking about wagons is refused. Identities stay masked under the DPDP Act, and every request lands in a tamper-proof audit log."],
  value: ["THE VALUE", "The result. Inquiries that took days now take minutes. Decisions rest on verifiable evidence. And it runs on Google Cloud with Gemini, or fully on railway premises with Gemma."],
  close: ["RAILKAVACH COPILOT", "RailKavach Copilot, by AiSPRY. Ask once. Get the evidence."],
};
const QUESTION = "Rake BOXN 542 mein kitne wagons damaged hain, aur kaun sa wagon critical hai?";

/* ------------------------------------------------------------------ audio prep (macOS say) */
const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"] }).toString();
const durationOf = (file) => parseFloat(/estimated duration: ([\d.]+)/.exec(sh("afinfo", [file]))[1]);
function tts(name, text, voice, extra = []) {
  const aiff = join(AUD, `${name}.aiff`), wav = join(AUD, `${name}.wav`);
  sh("say", ["-v", voice, "-r", RATE, "-o", aiff, ...extra, text]);
  sh("afconvert", ["-f", "WAVE", "-d", "LEI16@24000", aiff, wav]);
  return { wav, dur: durationOf(wav) };
}
const CLIPS = Object.fromEntries(Object.entries(LINES).map(([k, [, t]]) => [k, tts(k, t, NARRATOR)]));
// Officer's spoken question, padded with silence so the Copilot's end-of-speech detection triggers naturally.
const Q = tts("question", `[[slnc 900]] ${QUESTION} [[slnc 4500]]`, OFFICER);
const narrTotal = Object.values(CLIPS).reduce((s, c) => s + c.dur, 0);
console.log(`narration: ${narrTotal.toFixed(1)} s in ${Object.keys(CLIPS).length} lines · voice ${NARRATOR}`);

/* ------------------------------------------------------------------ overlays */
const OVERLAY = () => {
  const css = `
    #demo-cursor{position:fixed;z-index:2147483647;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;
      background:rgba(244,130,32,.35);border:2px solid #f48220;pointer-events:none;transition:transform .12s ease}
    #demo-cursor.down{transform:scale(.7);background:rgba(244,130,32,.6)}
    .demo-ripple{position:fixed;z-index:2147483646;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
      border:2px solid #f48220;pointer-events:none;animation:demo-rip .55s ease-out forwards}
    @keyframes demo-rip{from{opacity:.9;transform:scale(.3)}to{opacity:0;transform:scale(1.6)}}
    #demo-chap{display:none}
    #demo-cc b{display:block;margin-bottom:6px;color:#f59e0b;font:600 11.5px "JetBrains Mono",ui-monospace,monospace;letter-spacing:.16em}
    #demo-cc.q b{color:#fff}
    #demo-cc{position:fixed;z-index:2147483645;left:24px;bottom:26px;max-width:min(860px,calc(100% - 500px));padding:12px 18px;border-radius:10px;
      background:rgba(10,13,18,.9);color:#fff;font:600 21px/1.38 Geist,system-ui,sans-serif;box-shadow:0 12px 32px -12px rgba(0,0,0,.55);
      opacity:0;transform:translateY(6px);transition:opacity .25s ease,transform .25s ease;pointer-events:none}
    #demo-cc.on{opacity:1;transform:none}
    #demo-cc.q{background:rgba(229,72,77,.94)}
    #demo-end{position:fixed;inset:0;z-index:2147483640;display:grid;place-items:center;background:#03061a;opacity:0;transition:opacity .8s ease;pointer-events:none}
    #demo-end.on{opacity:1}
    #demo-end h1{font:600 76px/1.02 Fraunces,Georgia,serif;letter-spacing:-.025em;color:#fff;text-align:center;margin:0}
    #demo-end h1 em{color:#f48220}
    #demo-end p{margin:22px 0 0;text-align:center;font:500 15px "JetBrains Mono",monospace;letter-spacing:.14em;color:#b6bfcd;text-transform:uppercase}
    #demo-end .bar{height:3px;width:260px;margin:30px auto 0;background:linear-gradient(90deg,#f48220,#009fce);border-radius:3px}`;
  const boot = () => {
    if (document.getElementById("demo-cursor")) return;
    const s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);
    for (const id of ["demo-cursor", "demo-chap", "demo-cc"]) { const d = document.createElement("div"); d.id = id; document.body.appendChild(d); }
    const c = document.getElementById("demo-cursor");
    addEventListener("mousemove", (e) => { c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; }, true);
    addEventListener("mousedown", (e) => {
      c.classList.add("down");
      const r = document.createElement("div"); r.className = "demo-ripple"; r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px";
      document.body.appendChild(r); setTimeout(() => r.remove(), 600);
    }, true);
    addEventListener("mouseup", () => c.classList.remove("down"), true);
  };
  let chap = "";
  window.__chap = (t) => { boot(); chap = t || ""; };
  let timers = [];
  window.__cc = (parts, q) => {
    boot(); timers.forEach(clearTimeout); timers = [];
    const el = document.getElementById("demo-cc"); el.classList.toggle("q", !!q);
    let at = 0;
    for (const [text, ms] of parts) {
      timers.push(setTimeout(() => {
        el.textContent = "";
        if (chap) { const b = document.createElement("b"); b.textContent = chap; el.appendChild(b); }
        el.appendChild(document.createTextNode(text));
        el.classList.add("on");
      }, at));
      at += ms;
    }
    timers.push(setTimeout(() => el.classList.remove("on"), at));
  };
  window.__end = (html) => {
    boot(); let e = document.getElementById("demo-end");
    if (!e) { e = document.createElement("div"); e.id = "demo-end"; document.body.appendChild(e); }
    e.innerHTML = html; requestAnimationFrame(() => e.classList.add("on"));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
};

/* ------------------------------------------------------------------ browser */
const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || "chrome",
  headless: !process.env.HEADED,
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${Q.wav}`],
});
const ctx = await browser.newContext({
  viewport: { width: W, height: H }, deviceScaleFactor: 1, locale: "en-IN", permissions: ["microphone"],
  recordVideo: { dir: join(OUT, "raw"), size: { width: W, height: H } },
});
await ctx.addInitScript(OVERLAY);
const page = await ctx.newPage();
const vt0 = Date.now(); // video clock starts with the page
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

const at = () => (Date.now() - vt0) / 1000;
const pause = (ms) => page.waitForTimeout(ms);
const placed = []; // [{wav, t}]
const subs = []; // [{from, to, text}]
let mouse = { x: W / 2, y: H / 2 };
let shotN = 0;

const sentences = (t) => t.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g).map((s) => s.trim());
async function captions(parts, q = false) {
  await page.evaluate(([p, qq]) => window.__cc?.(p, qq), [parts, q]);
}
/** Play one narration line: chapter chip + timed captions + audio placement. Returns when the line has finished. */
async function say(key, actions = async () => {}) {
  const [chap, text] = LINES[key];
  const { wav, dur } = CLIPS[key];
  const start = at();
  const ss = sentences(text);
  const total = ss.reduce((n, s) => n + s.length, 0);
  const parts = ss.map((s) => [s, Math.round((s.length / total) * dur * 1000)]);
  let t = start;
  for (const [s, ms] of parts) { subs.push({ from: t, to: t + ms / 1000, text: s }); t += ms / 1000; }
  placed.push({ wav, t: start });
  await page.evaluate((c) => window.__chap?.(c), chap);
  await captions(parts);
  await actions();
  const left = start + dur + 0.35 - at();
  if (left > 0) await pause(left * 1000);
}
async function shot(name) {
  shotN++;
  await page.screenshot({ path: join(OUT, "shots", `${String(shotN).padStart(2, "0")}-${name}.png`) });
}
async function moveTo(loc) {
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  if (!b) return;
  const x = b.x + b.width / 2, y = b.y + b.height / 2;
  await page.mouse.move(x, y, { steps: Math.max(10, Math.round(Math.hypot(x - mouse.x, y - mouse.y) / 22)) });
  mouse = { x, y };
}
async function click(loc, wait = 500) {
  await moveTo(loc); await pause(180);
  await page.mouse.down(); await pause(60); await page.mouse.up();
  await pause(wait);
}
async function smoothScroll(sel, block = "start") {
  await page.locator(sel).first().evaluate((el, b) => el.scrollIntoView({ behavior: "smooth", block: b }), block);
}
const chat = () => page.locator('aside[aria-label="Copilot chat"]');
async function waitAnswer(timeout = 90_000) {
  await pause(400);
  await page.waitForFunction(() => {
    const a = [...document.querySelectorAll('aside[aria-label="Copilot chat"] li[data-msg=assistant]')].pop();
    return a && !/Correlating radio/.test(a.textContent || "") && (a.textContent || "").length > 40;
  }, null, { timeout });
}
async function lastAnswerToTop() {
  await chat().locator("li[data-msg=assistant]").last().evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "start" }));
  await pause(700);
}

/* ------------------------------------------------------------------ scenes */
try {
  // 1 · problem — landing hero, then the problem section
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await pause(500);
  await say("problem", async () => {
    await pause(4200);
    await smoothScroll("#problem-h", "center");
  });
  await shot("problem");

  // 2 · what AiSPRY captures — the three product animations
  await say("capture", async () => {
    const per = (CLIPS.capture.dur * 1000 - 600) / 3;
    for (const id of ["#p-01", "#p-02", "#p-03"]) {
      await page.locator(`article[aria-labelledby="${id.slice(1)}"]`).evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
      await pause(per);
    }
  });
  await shot("products");

  // 3 · sign in by role
  await page.goto(`${BASE}/copilot/`, { waitUntil: "networkidle" });
  await say("signin", async () => {
    await pause(1800);
    await moveTo(page.getByRole("radio", { name: /Crew Controller/ }));
    await pause(700);
    await moveTo(page.getByRole("radio", { name: /Commissioner/ }));
    await pause(500);
    await click(page.getByRole("button", { name: /Continue as Sr\. Divisional Safety Officer/ }), 300);
  });
  await shot("dashboard");

  // 4 · the whole shift
  await say("shift", async () => {
    await pause(600);
    await moveTo(page.getByText("WDD · wagons").first());
    await pause(1400);
    const bars = page.locator('ul[aria-label^="Cabin violations"] li');
    if (await bars.count()) await moveTo(bars.nth(8));
  });

  // 5 · ask once
  const open = page.getByRole("button", { name: "Open Copilot chat" });
  if (await open.count()) await click(open, 600);
  await say("ask", async () => {
    await pause(700);
    await click(chat().getByRole("button", { name: /Investigate the 12414/ }), 200);
  });
  await say("answer", async () => {
    await waitAnswer();
    await lastAnswerToTop();
  });
  await shot("answer");

  // 5c · evidence + verify
  await say("evidence", async () => {
    const ev = chat().getByRole("button", { name: /Evidence ·/ }).last();
    await ev.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
    await pause(700);
    await click(ev, 700);
    const verify = chat().getByRole("button", { name: /^Verify evidence/ }).first();
    if (await verify.count()) {
      await verify.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
      await pause(600);
      await click(verify, 300);
      await chat().getByText(/Verified · unchanged since ingest/).first().waitFor({ timeout: 15000 }).catch(() => {});
      await moveTo(chat().getByText(/Verified · unchanged since ingest/).first());
    }
  });
  await shot("verified");

  // 6 · just speak (Hinglish, via the simulated microphone)
  await chat().getByRole("button", { name: "New chat" }).click().catch(() => {});
  await say("speak", async () => {
    await pause(400);
    await moveTo(chat().getByRole("button", { name: /Ask by voice/ }));
  });
  const qStart = at();
  await click(chat().getByRole("button", { name: /Ask by voice/ }), 0);
  placed.push({ wav: Q.wav, t: qStart });
  const qText = `🎙  “${QUESTION.replace("BOXN 542", "BOXN-542")}”`;
  subs.push({ from: qStart + 0.9, to: qStart + Q.dur - 4.2, text: qText.replace("🎙  ", "[Officer] ") });
  await page.evaluate(() => window.__chap?.("JUST SPEAK · HINGLISH"));
  await pause(900);
  await captions([[qText, Math.round((Q.dur - 5.1) * 1000)]], true);
  await shot("listening");
  await page.locator('li[data-msg="user"]').last().waitFor({ timeout: 45000 });
  await say("spoke", async () => {
    await waitAnswer();
    await lastAnswerToTop();
    await pause(800);
    const stopBtn = chat().getByRole("button", { name: "Pause reading" });
    if (await stopBtn.count()) await moveTo(stopBtn);
  });
  await shot("hinglish-answer");
  await chat().getByRole("button", { name: "Stop reading", exact: true }).click().catch(() => {});

  // 7 · privacy by design: Crew Controller asks about wagons → refused
  await say("privacy", async () => {
    await click(page.locator('button[aria-haspopup="listbox"]'), 500);
    await click(page.getByRole("option", { name: /Crew Controller/ }), 900);
    const box = page.locator("#copilot-input");
    await click(box, 150);
    await box.pressSequentially("Show wagon damage on rake BOXN-542", { delay: 18 });
    await page.keyboard.press("Enter");
    await waitAnswer(30_000).catch(() => {});
    await lastAnswerToTop();
  });
  await shot("refused");

  // 8 · the value — architecture view
  await page.goto(`${BASE}/architecture/`, { waitUntil: "networkidle" });
  await say("value", async () => {
    await pause(CLIPS.value.dur * 1000 * 0.55);
    await click(page.getByRole("radio", { name: "Out of scope" }), 200);
  });
  await shot("architecture");

  // 9 · close
  await page.evaluate(() => window.__end?.(`<div><h1>RailKavach <em>Copilot</em></h1><p>Ask once · Get the evidence · Stay within the law</p><div class="bar"></div><p style="margin-top:18px;letter-spacing:.08em">AiSPRY · Railcomm Analytics · Locate · Wagon Damage Detection</p></div>`));
  await page.evaluate(() => window.__chap?.(""));
  await say("close", async () => {});
  await pause(900);
  await shot("end");
} catch (e) {
  errors.push("STEP FAILED: " + (e?.message || e));
  await page.screenshot({ path: join(OUT, "shots", "zz-failure.png") }).catch(() => {});
} finally {
  const video = page.video();
  const length = at();
  await ctx.close();
  await browser.close();
  const raw = await video?.path();
  const webm = join(OUT, "railkavach-pitch.webm");
  if (raw) renameSync(raw, webm);
  rmSync(join(OUT, "raw"), { recursive: true, force: true });

  // subtitles + transcript
  const ts = (s) => {
    const ms = Math.max(0, Math.round(s * 1000));
    const p = (n, w = 2) => String(n).padStart(w, "0");
    return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
  };
  subs.sort((a, b) => a.from - b.from);
  writeFileSync(join(OUT, "railkavach-pitch.srt"), subs.map((s, i) => `${i + 1}\n${ts(s.from)} --> ${ts(s.to)}\n${s.text}\n`).join("\n"));
  writeFileSync(
    join(OUT, "transcript.md"),
    `# RailKavach Copilot — 2-minute pitch · transcript\n\nNarrator: ${NARRATOR} (Indian English) · Officer: ${OFFICER}\n\n` +
      Object.entries(LINES).map(([k, [chap, text]]) => `**${chap}**  \n${text}` + (k === "speak" ? `\n\n> *Officer (Hinglish, spoken):* “${QUESTION.replace("BOXN 542", "BOXN-542")}”` : "")).join("\n\n") + "\n"
  );

  // mix narration + officer audio onto the video → mp4
  if (raw) {
    const inputs = ["-y", "-i", webm];
    const f = [];
    placed.forEach((p, i) => {
      inputs.push("-i", p.wav);
      const d = Math.max(0, Math.round(p.t * 1000));
      f.push(`[${i + 1}:a]aresample=48000,adelay=${d}|${d}[a${i}]`);
    });
    f.push(`${placed.map((_, i) => `[a${i}]`).join("")}amix=inputs=${placed.length}:normalize=0:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11,alimiter=limit=0.89[aout]`);
    const mp4 = join(OUT, "railkavach-pitch.mp4");
    try {
      execFileSync(FFMPEG, [...inputs, "-filter_complex", f.join(";"), "-map", "0:v", "-map", "[aout]",
        "-t", String(Math.min(MAX_S, length + 0.5)), "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
        "-r", "30", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", mp4], { stdio: ["ignore", "ignore", "pipe"] });
      console.log(`video:    ${mp4}`);
    } catch (e) {
      errors.push("ffmpeg failed: " + String(e.stderr || e).slice(-400));
    }
  }
  console.log(`length:   ${length.toFixed(1)} s (limit ${MAX_S})`);
  console.log(`shots:    ${readdirSync(join(OUT, "shots")).length}`);
  console.log(errors.length ? "ISSUES:\n" + errors.join("\n") : "no errors");
}
