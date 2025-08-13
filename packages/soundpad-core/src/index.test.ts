import { expect, test } from 'vitest';
import { CORE_PACKAGE_NAME, createSoundPad } from './index';

test('exports and basic API exist', async () => {
  expect(CORE_PACKAGE_NAME).toBe('soundpad-core');
  const root = globalThis.document?.createElement?.('div');
  if (root) {
    const app = await createSoundPad(root);
    app.play();
    app.pause();
    app.seek(1.23);
    app.clear();
    app.dispose();
  } else {
    expect(typeof createSoundPad).toBe('function');
  }
});

