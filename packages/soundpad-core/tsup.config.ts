import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/physics/StrokePhysics.worker.ts', 'src/audio/processors/Envelope.worklet.ts'],
  format: ['esm', 'iife'],
  globalName: 'SoundPad',
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  target: 'es2021',
  outExtension: (ctx) => ({ js: ctx.format === 'iife' ? '.global.js' : '.js' }),
  banner: {
    js: `/*@__PURE__*/`,
  },
  esbuildOptions(options) {
    // Make sure workers are emitted alongside esm output
    options.loader = { ...(options.loader || {}), '.ts': 'ts' };
  },
});

