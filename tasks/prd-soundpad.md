# Product Requirements Document (PRD): SoundPad – Paint-Style Music App (2D WebGL)

## 1) Introduction / Overview
SoundPad is a paint-style, browser-based music playground where drawing creates sound. Users paint with different brushes and colors, and the system maps visual stroke features to instruments and sonic parameters. A simple track view with a bars/beats grid enables routing painted material to tracks and exporting quantized audio clips or full mixes. The experience prioritizes immediacy (draw → hear → iterate), smooth performance, and deterministic playback.

Scope for MVP:
- 2D WebGL rendering (fallback to Canvas2D) with a single primary canvas and the ability to route selections to tracks that display a tempo grid.
- Lightweight, musical "stroke physics" (not heavy rigid-body). Thickness, curvature, and brush type impact dynamics and modulation.
- WebAudio-based synth engine with ADSR envelopes, filters, LFOs; minimal subtractive, FM, and sampler voices.
- Transport with play/pause/loop/metronome and tempo changes (no seek or count-in).
- Offline audio export (full mix and stems) with time-range selection.

## 2) Goals
1. Deliver a fun, responsive draw-to-sound loop at ≥55–60 FPS on mid-range laptops and modern mobile devices.
2. Low-latency audio with glitch-free playback under the defined polyphony limits.
3. Deterministic, replayable results from a versioned project JSON model.
4. Quantize-on-export so clips align to bars/beats without altering the creative drawing flow.
5. Monorepo-friendly packaging that drops into a Next.js/React project with minimal setup.

## 3) User Stories
- As a casual creator, I want to paint with a few brush types and immediately hear sound so I can explore ideas quickly.
- As a musician, I want to route a painted selection to a track with a bars/beats grid so I can export a clip that starts on-beat.
- As a user, I want color to change the instrument, and thickness/shape to affect loudness, sustain, and character.
- As a user, I want to loop playback and tweak tempo to audition variations.
- As a user, I want to export a segment (time range) as a WAV file, either the full mix or individual stems.

## 4) Functional Requirements
1. Canvas & Drawing
   - WebGL2 renderer with Canvas2D fallback; grid overlay; zoom/pan.
   - Tools: select, erase, paint; brushes: mallet, pluck, bow, granular (MVP set).
   - Color palette; thickness and opacity controls.
   - Optional snap-to-grid while drawing.
2. Mapping (Art → Sound)
   - Color → instrument/patch selection.
   - Brush type → articulation/FX preset (mallet/pluck/bow/granular behaviors).
   - Thickness/alpha → velocity and sustain length (thicker = louder/longer; thinner = shorter/decay).
   - Curvature/roughness/length → vibrato or FM depth and sustain (length increases sustain, not tempo scaling).
3. Stroke Physics (lightweight)
   - Deterministic fixed-step updates in a Worker; seeded RNG for any stochastic variation.
   - No per-layer fields in MVP.
4. Tracks & Timeline
   - Route selection(s) from canvas to a track; tracks display bars/beats grid and color label.
   - Transport: play/pause/loop, metronome, tempo changes. No seek or count-in.
   - Quantize-on-export (grid-based alignment) without overwriting original stroke timing.
5. Audio Engine
   - WebAudio + AudioWorklet for timing-sensitive logic.
   - Minimal synths: subtractive (2–3 waveforms, biquad filter), FM (2-op basic), sampler (one-shots/short textures).
   - Envelopes (ADSR), LFOs (rate/sync), basic FX sends (gain, optional simple delay/reverb).
   - Polyphony caps: 12 voices per track/canvas; 24 global. Voice stealing: oldest in release → oldest quietest → oldest active.
6. Persistence & Export
   - Versioned project JSON: strokes, brushes, mappings, tempo/transport, tracks, physics config.
   - OfflineAudioContext export: full mix and per-track stems; selectable time range (e.g., 0:00–1:00).
7. Performance & Stability
   - Target ≥55–60 FPS; throttle pointer events; batch state updates; reuse buffers/typed arrays.
   - OffscreenCanvas where supported; keep heavy work (physics, scheduling) off main thread.
   - No memory leaks: explicit disposal for GPU buffers/textures; lifecycle tests for create/destroy.
8. Accessibility & UX
   - Adjustable contrast/theme; colorblind-friendly palettes.
   - Responsive layout; mobile defaults reduce polyphony (e.g., 6 local, 12 global) and simplify FX.
9. Security & Privacy
   - Fully local client operation; no network calls in MVP.
   - Validate/sanitize any imported data (when added); safe error messages; no secrets in client.
10. Integration (Monorepo-friendly)
   - Packages:
     - `soundpad-core`: rendering, mapping, scheduler, audio engine (framework-agnostic).
     - `soundpad-react`: React components (`SoundPadCanvas`, `Transport`, `TrackList`, `ExportDialog`).
   - Next.js page mounts the React components; ESM outputs; zero Node-only deps in core.
11. Attribution & Licensing (see section 7)
   - Default UI credit: About modal and footer show: “Made by Chris – questautomations.org”.

## 5) Non-Goals (Out of Scope for MVP)
- 3D or 2.5D scene authoring; heavy rigid-body physics; per-layer attractor fields.
- MPE/MIDI input; importing audio; granular/spectral heavy DSP beyond the minimal set.
- Seek and count-in transport controls.
- Cloud collaboration or back-end processing.

## 6) Design Considerations (Optional)
- Layout: left toolbar (brush/color/thickness), top transport + tempo, main canvas center with grid overlay, right panel for tracks and export.
- Mapping UI: simple per-instrument matrix (rows = stroke features; cols = synth params) with amount knobs.
- Visual feedback: hover tips for mapping, level meters per track, subtle animation on active strokes.

## 7) Technical Considerations (Optional)
- Rendering: WebGL2 (PixiJS) with explicit resource disposal; OffscreenCanvas when available; Canvas2D fallback.
- Scheduler: Worker-based, small look-ahead (~100ms) to schedule WebAudio events; deterministic from project model.
- Audio: WebAudio nodes + AudioWorklet processors for envelopes/LFO; room to add WASM DSP later if profiling demands.
- Export: OfflineAudioContext for deterministic bounces; stems rendered by solo/mute routing.
- Persistence: JSON schema versioning; stable IDs for strokes/tracks.
- Mobile: PWA baseline; perf caps and simplified defaults; later option to wrap with Capacitor.
- Testing: unit tests for mapping/scheduler determinism; performance smoke tests (FPS, polyphony); export golden tests (same hash).
- Tooling: pnpm workspaces; TypeScript; tsup builds (ESM + d.ts); ESLint/Prettier; Vitest; GitHub Actions for lint/test/build.

## 8) Success Metrics
- Rendering: ≥55 FPS during active painting with up to N strokes on mid-range laptop (N to be set after profiling) and ≥45 FPS on modern mobile.
- Audio: glitch-free playback under 12 voices per track and 24 global; scheduling drift < 3 ms.
- Export: full mix and per-track stems complete within 2× realtime or faster.
- Stability: zero unbounded memory growth in 5-minute stress test; no GPU resource leaks in create/destroy cycles.

## 9) Open Questions
1. Exact initial brush set and their envelopes/FX presets (names and parameters).
2. Default palette size and whether to expose HSV/HSB editor in MVP.
3. Max canvas size and stroke count limits for stable mobile performance.
4. Minimal sample set for the sampler (if any) and asset licensing.
5. Thresholds for introducing WASM DSP (which profiles trigger it?).
6. Whether to include a simple delay/reverb send in MVP or defer to v1.1.
7. UI: do we surface a compact “mapping matrix” in MVP or defer to v1.1?
8. Attribution: keep Apache-2.0 (OSI) with NOTICE + default UI credit, or choose an OSI attribution license (e.g., AAL) if mandatory in-app attribution for redistributors is desired.

---

### Licensing Note (Attribution)
- Recommended: Apache-2.0 for code (OSI-approved) with a `NOTICE` file including: “Made by Chris – https://questautomations.org”. The app will display this credit in an About modal and footer by default. Redistributors must keep NOTICE, but Apache-2.0 does not force an in-app credit.
- If mandatory in-app attribution for all redistributors is required, consider an OSI attribution license such as the Attribution Assurance License (AAL). Adoption is rarer and may reduce ecosystem compatibility compared to Apache-2.0.


