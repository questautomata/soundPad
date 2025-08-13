export class SeededRng {
  private state: number;
  constructor(seed: number) {
    // xorshift32 seed must be non-zero
    this.state = seed >>> 0 || 0xdeadbeef;
  }
  next(): number {
    // xorshift32
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return (this.state & 0xffffffff) / 0x100000000;
  }
}

