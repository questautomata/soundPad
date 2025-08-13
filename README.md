# SoundPad

Paint-style app where art drives sound. This repo contains the framework‑agnostic core library.

## Quick start

Prereqs: Node 18+ and pnpm 9+

```bash
pnpm install
pnpm -r build
pnpm -r test
```

Common tasks:

- Build: `pnpm -r build`
- Run tests: `pnpm -r test`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`

## Package

- `packages/soundpad-core`: framework-agnostic core

## Plain HTML example

Open `examples/basic-html/index.html` via a local server, or run:

```bash
pnpm build
pnpm preview
# then visit http://localhost:5173/examples/basic-html/
```

## License

Apache-2.0. See `LICENSE` and `NOTICE`.

