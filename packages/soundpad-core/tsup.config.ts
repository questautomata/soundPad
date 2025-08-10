import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'iife'],
  globalName: 'SoundPad',
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  target: 'es2021',
  outExtension: (ctx) => ({ js: ctx.format === 'iife' ? '.global.js' : '.js' }),
});

