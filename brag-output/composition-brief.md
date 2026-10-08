# Hyperframes Composition Brief: Soro

## Objective
Create a short launch-style brag video for Soro — a captured banking call, not an advertisement.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 25 seconds

## Source Material
- Project root: /home/emerald/Desktop/Soro
- Primary files read: apps/web/index.html, packages/ui/styles/soro.css, apps/web/src/pages/Landing.tsx, apps/web/src/pages/Call.tsx, README.md
- Product name: Soro (product surface: SoroAI)
- Tagline / strongest claim: "Banking shouldn't require you to know how to bank."
- Key UI moment to recreate: split phone-call UI + Command Center event timeline; masked 4-dot authorization keypad; balance count ₦84,250 → ₦83,750
- Copy that must appear verbatim:
  - "Banking shouldn't require you to know how to bank."
  - "Ayo, abeg buy me five hundred naira data."
  - "Ayo never sees your PIN."
  - "AI understands. The backend decides."
  - "How much dey my account now?"
  - "Simple for the customer. Serious underneath."

## Creative Direction
- Tone preset: polished
- Creative direction: live banking interaction, captured — not advertised
- Interpretation: restraint everywhere; long holds on money moments; motion serves the transaction
- Angle: One customer sentence becomes a visible financial workflow. The viewer watches money move because someone talked.
- Hook: near-black screen, single held line, then a phone-call shimmer into the call UI
- Outro / punchline: full event timeline, then wordmark + "AI understands. The backend decides."
- Avoid: generic SaaS language, abstract filler visuals, unrelated visual redesign, purple/neon/cyberpunk, AI sparkles, stock photography, fake metrics or partnerships

## Visual Identity
- Background: #fafaf8 (off-white); dark scenes #101312
- Text: #131513
- Accent: #1f4fd6 (restrained blue); success green #15803d; danger red #b42318; amber #b45309
- Display font: Inter 800 tight; fallback system sans (no webfont fetch in render)
- Body font: Inter 400/500
- Visual references: Ayo poses in apps/web/public/ayo/ (welcome, listening, speaking, security, success); soro.css component language (cards, badges, timeline, chat bubbles, keypad)

## Storyboard
Use brag-plan.md as the creative contract. Scene summary:
1. Problem — 2.5s — held tagline on near-black
2. The call starts — 3.5s — split phone UI + command center rows arriving; Ayo greeting (voice)
3. The request — 3.5s — customer line emphasized; INTENT BUY_DATA lands
4. Understanding — 3.5s — plan card builds field by field; Ayo recommendation (voice)
5. Confirm + authorize — 4.5s — masked dots fill; AUTHORIZATION SUCCESS; PIN caption
6. Money moves + proof — 3.5s — TRANSACTION SUCCESS; balance counts; re-query exchange (voice)
7. Reveal + outro — 4s — full timeline cascade; wordmark + tagline

## Audio
- Audio role: warm bed under dialogue
- Audio arc: low bed throughout, duck under every voice line, lift at transaction success, fade from 23s
- Music: happy-beats-business-moves-vol-1-by-ende-dot-app.mp3 (bundled)
- Music treatment: low bed from 0s; lift ~17.5s; fade out 23-25s
- Music cue guidance: bundled preset cues/happy-beats-business-moves-vol-1...music-cues.json; strong cues 17.02s (TRANSACTION SUCCESS), 20.02s (balance proof), 23.02s (outro); beat grid ~0.5s for sequential event arrivals
- Audio-reactive treatment: subtle; event rows pulse softly on arrival
- Audio-coupled moments: transcript appears as spoken; balance count ticks; dots fill with taps; timeline cascades on beat grid
- SFX selection guidance: call-connect blip, muted keypad taps, soft success chime; sparse and motion-matched
- Exact SFX choice: Hyperframes decides filenames/timestamps/density
- Audio files: music copied to composition/assets/music/; dialogue WAVs generated via hyperframes tts (two Kokoro voices: customer + Ayo)

## Hyperframes Instructions
/brag is its own workflow: do not enter the hyperframes entry-point intent interview or route into generic promo workflows. Prefer native Hyperframes conventions. Requirements: show real UI/copy from the project; keep text readable; 25s total; include music/SFX layer; run hyperframes check before render.
