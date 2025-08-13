export class Transport {
  private _bpm: number;
  constructor(bpm = 120) {
    this._bpm = bpm;
  }
  get bpm(): number {
    return this._bpm;
  }
  set bpm(next: number) {
    this._bpm = Math.max(20, Math.min(300, next));
  }
  secondsPerBeat(): number {
    return 60 / this._bpm;
  }
}


