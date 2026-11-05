// Dale, Chef — audio generation (adapted from learn-farsi's pipeline).
//
//   node tools/generate-audio.mjs            # synth new phrases
//   node tools/generate-audio.mjs --normalize # then EBU R128 loudnorm pass
//
// Reads tools/audio-phrases.json  [{ t: "phrase", who: "you"|"them"|null }],
// synthesizes each phrase once with OpenAI gpt-4o-mini-tts (voices: sage for
// the learner's lines + vocabulary, onyx for manager/coworker lines), writes
// demos/audio/<sha1-12>.mp3 and demos/audio/manifest.json (text -> file).
// Existing files are skipped, so re-running after adding content only costs
// the new lines. Keys stay on this machine; the site ships static MP3s.
//
// API key: OPENAI_API_KEY from env, ./.env, or ../learn-farsi/.env.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = join(root, "demos", "audio");
const PHRASES = join(root, "tools", "audio-phrases.json");
const MANIFEST = join(AUDIO_DIR, "manifest.json");
const FFMPEG = "/Users/sammy/Documents/learn-farsi/node_modules/ffmpeg-static/ffmpeg";

function env(name) {
  if (process.env[name]) return process.env[name].trim();
  for (const p of [join(root, ".env"), "/Users/sammy/Documents/learn-farsi/.env"]) {
    if (!existsSync(p)) continue;
    const m = readFileSync(p, "utf8").match(new RegExp(`^\\s*${name}\\s*=\\s*(.+?)\\s*$`, "m"));
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  return null;
}

const idFor = s => createHash("sha1").update(s.normalize("NFC")).digest("hex").slice(0, 12);

const BASE = "You are a friendly American English speaker who works in a busy restaurant. ";
const INSTRUCTIONS = {
  vocab: BASE + "Say this single word or phrase clearly and at a calm, even pace, as if teaching a beginner. Keep your volume steady and consistent.",
  them:  BASE + "This is one line you say to a coworker during a shift. Say it naturally and warmly at a normal conversational pace — real, not like a narrator reading aloud. Keep your volume steady and consistent.",
  you:   BASE + "This is one line you say to a coworker during a shift. Say it naturally, clearly and a touch unhurried, like someone still getting comfortable in English. Keep your volume steady and consistent.",
};
const VOICES = { vocab: "sage", you: "sage", them: "onyx" };

async function synth(key, voice, text, instructions) {
  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice, input: text, instructions, response_format: "mp3" }),
  });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
  return Buffer.from(await r.arrayBuffer());
}

// EBU R128 two-pass loudnorm (same targets as learn-farsi): speech-standard loudness.
const TARGET_I = -16, TARGET_TP = -1.5, TARGET_LRA = 11;
async function normalize(file) {
  const probe = await run(FFMPEG, ["-hide_banner", "-i", file, "-af",
    `loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=${TARGET_LRA}:print_format=json`, "-f", "null", "-"], { maxBuffer: 8e6 })
    .catch(e => e); // ffmpeg writes the json to stderr and "fails" with -f null on some builds
  const txt = (probe.stderr || "") + (probe.stdout || "");
  const m = txt.match(/\{[^{}]*"input_i"[\s\S]*?\}/);
  if (!m) return false;
  const s = JSON.parse(m[0]);
  if (s.input_i === "-inf") { console.warn("SILENT CLIP:", file); return false; }
  const tmp = file + ".norm.mp3";
  await run(FFMPEG, ["-hide_banner", "-y", "-i", file, "-af",
    `loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=${TARGET_LRA}:measured_I=${s.input_i}:measured_TP=${s.input_tp}:measured_LRA=${s.input_lra}:measured_thresh=${s.input_thresh}`,
    "-ar", "44100", "-b:a", "96k", tmp]);
  renameSync(tmp, file);
  return true;
}

const key = env("OPENAI_API_KEY");
if (!key) { console.error("No OPENAI_API_KEY found."); process.exit(1); }
mkdirSync(AUDIO_DIR, { recursive: true });
const jobs = JSON.parse(readFileSync(PHRASES, "utf8"));
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};

if (process.argv.includes("--normalize")) {
  const files = readdirSync(AUDIO_DIR).filter(f => f.endsWith(".mp3"));
  let n = 0;
  for (const f of files) { if (await normalize(join(AUDIO_DIR, f))) n++; }
  console.log(`normalized ${n}/${files.length}`);
  process.exit(0);
}

let made = 0, skipped = 0;
for (const [i, job] of jobs.entries()) {
  const kind = job.who || "vocab";
  const file = idFor(job.t) + ".mp3";
  manifest[job.t] = file;
  const dst = join(AUDIO_DIR, file);
  if (existsSync(dst)) { skipped++; continue; }
  for (let attempt = 1; ; attempt++) {
    try {
      const buf = await synth(key, VOICES[kind], job.t, INSTRUCTIONS[kind]);
      writeFileSync(dst, buf);
      break;
    } catch (e) {
      if (attempt >= 3) throw e;
      console.warn(`retry ${attempt} for "${job.t}": ${e.message}`);
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
  made++;
  if (i % 20 === 0) console.log(`${i + 1}/${jobs.length}`);
}
writeFileSync(MANIFEST, JSON.stringify(manifest));
console.log(`DONE: ${made} synthesized, ${skipped} already existed, manifest ${Object.keys(manifest).length} entries`);
