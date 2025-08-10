## Relevant Files

- `pnpm-workspace.yaml` - Workspace config for monorepo packages and examples.
- `package.json` - Root scripts for lint/test/build and shared tooling.
- `.github/workflows/ci.yml` - CI pipeline for lint/test/build with pnpm.

- `packages/soundpad-core/package.json` - Core package metadata and exports.
- `packages/soundpad-core/tsconfig.json` - TS config for the core package.
- `packages/soundpad-core/src/index.ts` - Entry point exports.
- `packages/soundpad-core/src/render/Renderer.ts` - PixiJS app setup and lifecycle.
- `packages/soundpad-core/src/render/GridOverlay.ts` - Bars/beats grid and zoom/pan.
- `packages/soundpad-core/src/drawing/Brush.ts` - Brush interface and base behavior.
- `packages/soundpad-core/src/drawing/BrushRegistry.ts` - Register/lookup brush types.
- `packages/soundpad-core/src/drawing/Stroke.ts` - Stroke model + feature extraction.
- `packages/soundpad-core/src/drawing/StrokeBuffer.ts` - Buffered stroke building/pooling.
- `packages/soundpad-core/src/physics/StrokePhysics.worker.ts` - Fixed-step deterministic physics (Worker).
- `packages/soundpad-core/src/mapping/MappingEngine.ts` - Feature→parameter/event mapping.
- `packages/soundpad-core/src/audio/AudioEngine.ts` - WebAudio context, scheduler bridge, metronome.
- `packages/soundpad-core/src/audio/VoiceManager.ts` - Polyphony limits and voice stealing.
- `packages/soundpad-core/src/audio/voices/SubtractiveVoice.ts` - Subtractive synth voice.
- `packages/soundpad-core/src/audio/voices/FmVoice.ts` - Basic 2‑op FM voice.
- `packages/soundpad-core/src/audio/voices/SamplerVoice.ts` - Simple sampler voice.
- `packages/soundpad-core/src/audio/processors/Envelope.worklet.ts` - AudioWorklet for ADSR/LFO.
- `packages/soundpad-core/src/timeline/Transport.ts` - Play/pause/loop/tempo changes; timebase.
- `packages/soundpad-core/src/timeline/Quantize.ts` - Quantize-on-export utilities.
- `packages/soundpad-core/src/timeline/Track.ts` - Track model and routing.
- `packages/soundpad-core/src/persistence/ProjectModel.ts` - Versioned JSON model + validators.
- `packages/soundpad-core/src/export/Exporter.ts` - OfflineAudioContext export (mix/stems, time range).
- `packages/soundpad-core/src/**/*.test.ts` - Unit tests for core modules.

- `packages/soundpad-react/package.json` - React wrapper package metadata.
- `packages/soundpad-react/tsconfig.json` - TS config for React package.
- `packages/soundpad-react/src/components/SoundPadCanvas.tsx` - Canvas component wiring renderer and inputs.
- `packages/soundpad-react/src/components/Transport.tsx` - Transport UI.
- `packages/soundpad-react/src/components/TrackList.tsx` - Track routing UI.
- `packages/soundpad-react/src/components/ExportDialog.tsx` - Export time range/stems UI.
- `packages/soundpad-react/src/components/MappingMatrix.tsx` - Simple mapping matrix UI.
- `packages/soundpad-react/src/hooks/useAudioEngine.ts` - Hook for engine lifecycle.
- `packages/soundpad-react/src/**/*.test.tsx` - Component tests.

- `examples/next-app/pages/soundpad.tsx` - Example Next.js integration page (demo only).

### Notes

- Unit tests should typically be placed alongside the code files they test (e.g., `Renderer.ts` and `Renderer.test.ts`).
- Use `pnpm test` (Vitest) to run tests. Lint with `pnpm lint`. Build with `pnpm -w build`.
- Keep `soundpad-core` framework‑agnostic (no React/Node‑only APIs).

## Tasks

- [ ] 1.0 Workspace and Packaging Setup (Monorepo-ready)
  - [ ] 1.1 Create `pnpm-workspace.yaml` with `packages/*` and `examples/*`.
  - [ ] 1.2 Scaffold `packages/soundpad-core` and `packages/soundpad-react` with `package.json`, `tsconfig.json`, and folders.
  - [ ] 1.3 Configure TypeScript (strict) and `tsup` builds for ESM + `.d.ts` outputs.
  - [ ] 1.4 Add ESLint + Prettier configs; root scripts: `lint`, `format`, `build`, `test`.
  - [ ] 1.5 Set up Vitest in both packages; add a trivial passing test.
  - [ ] 1.6 Add GitHub Actions CI (pnpm install, lint, test, build on Node LTS).
  - [ ] 1.7 Ensure `LICENSE` and `NOTICE` are included in package publishes; add README stubs.
  - [ ] 1.8 Add `examples/next-app/pages/soundpad.tsx` placeholder page (mount plan only).

- [ ] 2.0 Rendering & Canvas (PixiJS WebGL2)
  - [ ] 2.1 Initialize PixiJS with WebGL2 preference and Canvas2D fallback; handle device pixel ratio.
  - [ ] 2.2 Implement `GridOverlay` for bars/beats; zoom and pan; performance counters (FPS/draw calls).
  - [ ] 2.3 Pointer handling: down/move/up; throttled sampling; stroke capture pipeline.
  - [ ] 2.4 Brush system: `Brush` interface, `BrushRegistry`, default brushes (mallet, pluck, bow, granular).
  - [ ] 2.5 Stroke model: `Stroke` + `StrokeBuffer` with pooling to reduce GC.
  - [ ] 2.6 Tools: paint, erase, select; coarse bucketed hit-testing for selection/erase.
  - [ ] 2.7 Explicit disposal of GPU resources; teardown lifecycle tests.

- [ ] 3.0 Mapping & Stroke Physics (Deterministic)
  - [ ] 3.1 Feature extraction: thickness, length, curvature/roughness, alpha, draw speed.
  - [ ] 3.2 Implement `StrokePhysics.worker.ts` with fixed-step loop, typed arrays, seeded RNG.
  - [ ] 3.3 Default mappings: color→instrument; brush→articulation; thickness/alpha→velocity+sustain; curvature/length→vibrato/FM+sustain.
  - [ ] 3.4 Event bridge from physics to audio scheduler (note on/off, param mods).
  - [ ] 3.5 Determinism tests: identical input → identical event stream.

- [ ] 4.0 Audio Engine (WebAudio + AudioWorklet)
  - [ ] 4.1 Initialize/resume AudioContext on user gesture; tempo/timebase glue.
  - [ ] 4.2 Implement `Envelope.worklet.ts` for ADSR/LFO timing-critical ops; parameter automation helpers.
  - [ ] 4.3 Implement voices: `SubtractiveVoice`, `FmVoice`, `SamplerVoice`; gain staging; simple FX sends optional.
  - [ ] 4.4 `VoiceManager` with 12 voices per track and 24 global; voice stealing policy implementation.
  - [ ] 4.5 Scheduler with ~100ms look-ahead; verify timing drift < 3 ms under load.
  - [ ] 4.6 Metronome tick; tempo change handling; unit tests for scheduling.

- [ ] 5.0 Tracks, Timeline & Transport
  - [ ] 5.1 `Track` model; assignment of canvas selections to tracks.
  - [ ] 5.2 React UI: `TrackList`, `Transport` (play/pause/loop/tempo; no seek/count-in).
  - [ ] 5.3 Snap-to-grid while drawing (optional); preview respects grid when enabled.
  - [ ] 5.4 Quantize-on-export (grid-aligned bounce) while preserving original project timing.
  - [ ] 5.5 Tests for grid math, loop regions, and routing.

- [ ] 6.0 Persistence & Export
  - [ ] 6.1 Define versioned `ProjectModel` JSON schema and validators; stable IDs.
  - [ ] 6.2 Serialize/deserialize full project; backward-compat scaffolding.
  - [ ] 6.3 Implement `Exporter` with OfflineAudioContext: full mix and stems; time-range selection.
  - [ ] 6.4 React export UI (`ExportDialog`); streaming/download; memory safety checks.
  - [ ] 6.5 Golden tests to ensure deterministic exports (byte-stable where feasible).

- [ ] 7.0 Performance, Testing & Accessibility
  - [ ] 7.1 FPS/memory smoke tests: auto-draw stress harness; ≥55–60 FPS desktop; ≥45 FPS mobile.
  - [ ] 7.2 Leak checks: dispose Pixi resources; monitor heap/GPU objects across create/destroy cycles.
  - [ ] 7.3 Polyphony and scheduling under load: enforce 12/24 cap; drift tests.
  - [ ] 7.4 Accessibility: themes and colorblind palettes; responsive layout; mobile caps.
  - [ ] 7.5 Security baseline: no eval/dynamic untrusted code; local-only operation; dependency audit.

---

## Post‑MVP (Phase 2+)

- [ ] 8.0 Advanced Brushes & FX
  - [ ] 8.1 Add additional brush behaviors (spray/texture/ink) with efficient GPU filters.
  - [ ] 8.2 Expand FX sends (tempo‑sync delay, convolution reverb with small IR set).
  - [ ] 8.3 Preset system for brushes/instruments; save/load user presets.

- [ ] 9.0 Mapping Matrix v2
  - [ ] 9.1 Full visual matrix with per‑cell curves and polarity; copy/paste rows/cols.
  - [ ] 9.2 Mapping presets and import/export; per‑track overrides.

- [ ] 10.0 Physics Enhancements
  - [ ] 10.1 Optional per‑layer attractor/flow fields (disabled by default for perf).
  - [ ] 10.2 GPU experiment: lightweight GPGPU stroke simulation (ping‑pong textures) behind a flag.
  - [ ] 10.3 Performance gates and determinism checks for new physics modes.

- [ ] 11.0 WASM DSP Option
  - [ ] 11.1 Spike: port one voice to WASM (e.g., FM or filter) and benchmark.
  - [ ] 11.2 Abstraction for switching WebAudio node vs WASM implementation.

- [ ] 12.0 Mobile Packaging
  - [ ] 12.1 PWA install prompts, offline caching, storage quotas.
  - [ ] 12.2 Optional Capacitor wrapper; audio focus/interrupt handling.
  - [ ] 12.3 Optional WASM DSP option for mobile.

- [ ] 13.0 Performance Tooling
  - [ ] 13.1 Built‑in profiler overlay (FPS, GPU draws, audio xruns, voice count).
  - [ ] 13.2 Automated regression benchmarks for FPS and export speed.

- [ ] 14.0 Theming & UX Polish
  - [ ] 15.1 Theme editor; export/import themes.
  - [ ] 15.2 Enhanced colorblind palettes and contrast checks.

- [ ] 15.0 Content & Demos
  - [ ] 15.1 Ship example projects and presets demonstrating capabilities.
  - [ ] 15.2 Tutorial/onboarding walkthrough.
