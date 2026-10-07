# La Línea — bilingual kitchen language course

Free web platform that teaches **English to Spanish-speaking kitchen staff** and **Spanish to English-speaking kitchen staff**. Same course, both directions. Built by Sammi (instructional designer, manages a restaurant) for her coworkers. "La Línea" is a placeholder name; it's one string.

## What exists

- `demos/course.html` — the reference build. Landing page → course dashboard → **all 9 drafted lessons playable** (1.1–1.4, 2.1, 3.1, 4.1, 5.1, 6.1), using all 15 exercise types. Single file, no build step, no dependencies except Google Fonts (Inter). This is the exercise-library merge, completed and verified 2026-10-06.
- `demos/exercise-library.html` — the nine extra exercise types standalone, same design system. Catalogue in `const EX`, renderers in `const R`. Kept as a playground; the course now contains all of it.
- `wip/` — merge artifacts (kept for reference): `merge.py`, `course-merged-BROKEN.html` (superseded), `curriculum-data.js` (now embedded in course.html), and `course-v1-single-lesson.html` (backup of the pre-merge demo).

Both demos are the design source of truth. Match them exactly; do not restyle.

## Product rules (non-negotiable)

1. **Adult, professional, modern.** Think Babbel or a university LMS, not Duolingo. No mascots, no confetti, no cartoon plates, no emoji in UI. Sammi rejected three rounds of "cute" before landing here.
2. **Structured like a real language course.** Units → lessons → exercise sequence. Fundamentals first (greetings, numbers, verbs), kitchen vocabulary as the *examples*, not as the whole syllabus.
3. **Both directions, always.** Every piece of content has an `en` variant (learner studies English, UI speaks Spanish) and an `es` variant (learner studies Spanish, UI speaks English). The header toggle flips the entire platform. Nothing ships in one direction only.
4. **Free, no account** for v1. Progress can live in `localStorage`.
5. **Mobile first.** Coworkers use it on phones. 390px is the primary viewport; desktop is secondary.

## Design system — sammi-ui "floating pills" (restyled 2026-10-06)

`demos/course.html` was restyled to Sammi's dashboard look (`~/Desktop/sammi-ui/` — SKILL.md there is the source of truth for the style), **mapped to La Línea's green/white/black**: deep green `#0f5c4a` takes both the blue-accent role and the orange-gradient role; nothing blue or orange ships.

```
font: Inter · bg/card #fff · fg #0a0a0a · muted #737373
ink #111110 (primary pills; variant-dependent) · bsoft #e7e5e4 (2px borders)
accent #0f5c4a · accent-soft #e7f1ee · ok #1f7a4d/#e6f4ec · err #b23a3a/#fbecec
radii: pill 999 · card 20 · tile 18/16 · field 12 · shadows: --pill-shadow / --tile-shadow (no card borders)
```

Patterns: floating frosted pill topbar (green orb + segmented direction toggle, selected = ink); cards float on shadows, hairlines between rows; section labels 11px/700/.12em uppercase; options = 16px-radius cards w/ 2px bsoft border, selected = solid ink; inputs = 56px/12px-radius field style; bottom action bar = floating 26px-radius frosted pill, tints green/red on feedback; word tiles = pills; progress 5px rounded.

**RESOLVED: Sammi picked C · Gradient (2026-10-06).** Hard-coded: `--grad:linear-gradient(135deg,#0f5c4a,#2fa06a)` on orb, progress fill and hero CTA; primaries stay ink black; switcher removed. `demos/exercise-library.html` and `wip/*` still have the old flat style; restyle the library only if it stays in use.
`.band` gotcha: it must only set vertical padding (`padding-top/bottom`), or it wipes `.wrap`'s 16px gutter (same-specificity shorthand clash — this bug shipped in the original demo).

## Pedagogy (restructured 2026-10-06 from Sammi's research notes)

Task-based, situation-first, listening/speaking-weighted. The rules that drive everything: teach **situations, not grammar chapters**; teach **phrase chunks before words**; **audio everywhere** with Slow + Natural speeds (spoken English ≠ textbook English); **Spanish is scaffolding, not the destination** (heavy in Level 1, fades later); **rescue English first** ("Can you say that again?" unlocks hundreds of interactions); repetition of the same chunks across lessons; 5–10 min per lesson; **never feel like school**. Both directions always.

## Content model

```js
// direction: "en" = learning English (UI Spanish), "es" = mirrored
UI = { es: {...}, en: {...} };  T() = UI[native()]

SIT[id] = { en:{scene,chunks,hp,say,rp}, es:{...} }   // lesson-loop content
// scene:[[who("M"|"C"|"Y"),line,translation],…]  chunks:[[target,native],…]
// hp:{a:audio phrase, q, opts, ans, fast?}  say:{p:[prompt,tr], r:[reply,tr], ok:[accepted], fast?}
// rp:[{w?, m:[line,tr], o:[[text,tr,"ok"|"r",next?],…]},…]  — "r" with no next = repeat slower, same node

LEVELS = [ {t:{es,en}, units:[ {n, total, t:{es:[title,desc],en:[…]}, lessons:[{id},…]} ]} ]
LESSON_STEPS[id] = "numbers" | [step,…]   // legacy + review lessons; Unit-1 ids use LOOP_STEPS()
```

**The lesson loop** (every new lesson, 9 interactions — "see it → figure it out → use it → get challenged → use it in a realistic situation"): `hp i:0` (COLD OPEN — choose the meaning, no teaching first) → `scene` (audio dialogue + translation toggle) → `chunks` (5–8 phrases, Slow/Natural buttons) → `fillx` (fill the blank, `SD.fill`) → `bld` (build the sentence from word pills, `SD.bld`, reuses `R.order`) → `hp i:1` (understand; `fast:true` = real speed) → `tf` (true/false, `SD.tf`) → `say` (respond out loud, SR check, skippable) → `rp` (branching role play; rescue options always continue) → `summary`.

**Game layer** (2026-10-06, from Sammi's second research note): `EXTRA` merges fill/bld/tf (+ lesson 21's tapimg/missing) into `SIT`; **XP** — +10 per correct (grade/libFinish/advance), +15 say, +20 role play, mission rounds carry their own; shown in the feedback bar ("Correcto · +10 XP"), summed on the summary, total persisted in localStorage `ll_xp` and shown on the dashboard hero. **Skills** — summaries say "Habilidad desbloqueada" + `SKILLS[nativeLang][id]`. **Object games** — `tapimg` (tap the icon) and `missing` (table setup with dashed empty slots) use the `OBJ` inline SVG icon set (fork/spoon/knife/plate/glass/water/napkin/tray/towel/table, Lucide-style 1.75 stroke); lesson 21 is the showcase. **Mission** (`{type:"mission", d:{en,es}}`) — boss battle with 3 lives + live XP counter: round kinds `pick` (audio→options), `first` (which first?), `tap` (tap board tiles in sequence); fail = retry (re-render resets); end panel "Turno completado" + accuracy; lesson 10 ends in "La hora pico". Still pending from that note: adaptive repetition of missed items, translation fading by level, more missions ("Viernes por la noche", "Alerta de alergia"…), memory/sort/spot-the-mistake types.

Legacy types still available: `vocab`/`pick` (VOCAB sets), `learn/plates/listen/match/type/sentence` (numbers), `lib` (order/ticket/dialogue/map/seq/rapid/dict/speak/conj), `hpx`/`rpx` (hp/rp with inline per-direction `d`). Audio: `speak(text, lang, rate)`, `RATE={slow:.55,nat:1,fast:1.12}`, `speakSeq(lines)` for scenes.

## Curriculum (Levels → units → numbered lessons, from Sammi's notes)

- **Nivel 1 Supervivencia**: U1 Sobrevivir (lessons 1–10, **ALL BUILT** — rescue English + review "first shift") · U2 Números (11 built) · U3 Tu restaurante (21 built: chunks+map) · U4 Instrucciones (40 built)
- **Nivel 2 El equipo**: U5 Lenguaje de cocina (41, 50) · U6 Conversaciones (51, 55) · U7 Trabajo y horarios (62)
- **Nivel 3 Clientes**: U8–U10 all "próximamente"
- **Rutas**: Servidor (locked) · Cocina (126 built: ticket+dialogue)

Unbuilt lessons show as dashed "+N lecciones en camino" rows. Full 135-lesson outline is in Sammi's notes (pasted 2026-10-06 conversation); build the rest Unit-by-Unit with her as SME — **collect real phrases from her restaurant** before writing content.

## Immediate task

**DONE (2026-10-06): every lesson opens.** The library merge is live in `demos/course.html`. The merged script in `wip/course-merged-BROKEN.html` turned out structurally sound (the renames `finishBar→libFinish`, `goHub→nextStep`, `choose→libChoose` were all correct); the advertised render crash did not reproduce under a full automated sweep. Three real defects were found and fixed in the shipped file:

1. The course's `setBar()` ignored the library's 6th `disabled` argument, so every library exercise started with Check enabled — tapping it (or pressing Enter) with nothing selected instantly graded you wrong. `setBar` now takes `disabled`.
2. `R.map`: tapping a room after the 4th correct answer read `order[i][0]` past the end of the array (the one genuine `reading '0'` crash path). Guarded.
3. `goLanding()` (brand click) didn't clear the rapid-fire timer or cancel speech; exiting mid-rapid left the interval running forever. Fixed.

Verified in-browser at 390px, both directions: all 9 lessons open, every step renders and completes via real interaction, summaries show real percentages and missed items, exit returns to the dashboard, zero console errors.

**2026-10-06 (later): course restructured to the task-based curriculum** (see "Pedagogy" + "Curriculum" above). Unit 1 fully built with the new lesson loop in both directions; legacy lessons re-homed into the new structure; landing copy now "Un curso para compañeros de trabajo". Verified at 375px: all 19 built lessons render and complete end-to-end in both directions (including role-play rescue paths), zero console errors.

Next up: progress persistence in `localStorage` (completed lessons, accuracy, current lesson — `renderHome` currently shows every built lesson as "Empezar"), then build Unit 2 (numbers 1–100, hearing table numbers fast) with Sammi's content.

## Deployment (LIVE 2026-10-06)

- **Primary: Vercel — https://la-linea-course.vercel.app** (alias; project `supimsams-projects/la-linea`, id `prj_3TAv3RtMxHs3K7pHHJfLveJUzWyf`). GitHub repo `supimsam/la-linea` is connected: **push to `main` → Vercel auto-deploys**. `la-linea.vercel.app` was taken by someone else, hence the `-course` alias. Deployment Protection (Vercel Authentication) was ON by default and got disabled via API — same gotcha as OTSP; don't re-enable.
- Mirror: GitHub Pages at https://supimsam.github.io/la-linea/ (also auto-deploys from `main`). Repo is public (required for free Pages). If Sammi wants the repo private: flip it, Vercel keeps working, Pages dies — fine once Vercel is canonical.
- Vercel CLI 62 installed globally via nvm (`vercel`), logged in as supimsam (device-code flow). Commit identity per-command: `git -c user.name="supimsam" -c user.email="11872348+supimsam@users.noreply.github.com" …`; gh CLI at `~/.local/bin/gh`.
- Custom domain TBD — name candidates: Fuego Fluent, Sí Chef, La Línea (lalinea.com is taken). When bought: Vercel project → Settings → Domains (A record apex → 76.76.21.21, like ayatbushwick.menu).

## Roadmap after that

1. Lesson-completion persistence (`localStorage`): done/cur flags per lesson, accuracy history (XP total already persists as `ll_xp`).
2. Adaptive repetition: quietly re-serve missed items in later lessons (thirteen/thirty style); translation fading by level.
3. Build Unit 2 (numbers 1–100, hearing table numbers fast) and more missions ("Viernes por la noche", "Alerta de alergia", "Cliente difícil") — Sammi writes/approves content; collect real phrases from her restaurant first.
4. More game types from her note: sort (clean/dirty), spot-the-mistake (order vs. what came out), memory pairs.
5. Split the single file into `index.html` + `app.js` + `content/*.js` once content grows. Keep zero build step.
6. Later: streaks (subtle, adult), printable phrase sheet per lesson.

## Working with Sammi

Direct, casual, demo-first. Build the polished thing, then swap in real content. She has a strong visual standard and will say plainly when something falls short. Screenshot at 390px before showing her anything.
