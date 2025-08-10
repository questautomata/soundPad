export const CORE_PACKAGE_NAME = 'soundpad-core' as const;

export type SoundPadOptions = {
  antialias?: boolean;
};

export type SoundPadApp = {
  play(): void;
  pause(): void;
  seek(seconds: number): void;
  dispose(): void;
};

export function createSoundPad(root: HTMLElement, options: SoundPadOptions = {}): SoundPadApp {
  // Placeholder minimal implementation; real rendering/audio added in later steps
  void options;
  let isPlaying = false;
  let positionSec = 0;

  const app: SoundPadApp = {
    play() {
      isPlaying = true;
    },
    pause() {
      isPlaying = false;
    },
    seek(seconds: number) {
      positionSec = Math.max(0, seconds);
    },
    dispose() {
      isPlaying = false;
      positionSec = 0;
      // detach any listeners/resources when they exist
      void root;
    },
  };

  // Attach a minimal marker element for now
  const marker = document.createElement('div');
  marker.textContent = 'SoundPad initialized';
  marker.style.fontFamily = 'system-ui, sans-serif';
  marker.style.fontSize = '12px';
  root.appendChild(marker);

  return app;
}

