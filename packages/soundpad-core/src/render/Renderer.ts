import { Application, Container, Renderer as PixiRenderer, Ticker } from 'pixi.js';

export type ViewTransform = {
  scale: number;
  translateX: number;
  translateY: number;
};

export type RendererOptions = {
  antialias?: boolean;
  background?: number;
};

export class Renderer {
  readonly app: Application;
  readonly rootContainer: Container;
  readonly gridLayer: Container;
  readonly strokeLayer: Container;
  readonly uiLayer: Container;
  readonly transform: ViewTransform = { scale: 1, translateX: 0, translateY: 0 };
  private readonly resizeObserver: ResizeObserver | null;
  private disposed = false;
  private readonly mountEl: HTMLElement;
  private readonly onResizeCb: () => void;

  private constructor(mount: HTMLElement, app: Application) {
    this.mountEl = mount;
    this.app = app;

    mount.appendChild((this.app as any).canvas ?? (this.app.view as HTMLCanvasElement));

    this.rootContainer = new Container();
    this.gridLayer = new Container();
    this.strokeLayer = new Container();
    this.uiLayer = new Container();
    this.rootContainer.addChild(this.gridLayer, this.strokeLayer, this.uiLayer);
    this.app.stage.addChild(this.rootContainer);

    this.onResizeCb = () => this.resizeTo(this.mountEl.clientWidth, this.mountEl.clientHeight);
    this.onResizeCb();
    window.addEventListener('resize', this.onResizeCb);
    this.resizeObserver = ('ResizeObserver' in window)
      ? new ResizeObserver(this.onResizeCb)
      : null;
    this.resizeObserver?.observe(this.mountEl);

    this.updateTransform();
  }

  static async create(mount: HTMLElement, options: RendererOptions = {}): Promise<Renderer> {
    const resolution = 1; // align world units to CSS pixels to avoid pointer drift
    const app = new Application();
    await app.init({
      antialias: options.antialias ?? true,
      background: 0xffffff, // canvas stays white
      backgroundAlpha: 1,
      resolution,
      powerPreference: 'high-performance',
      hello: false,
    });
    return new Renderer(mount, app);
  }

  get pixiRenderer(): PixiRenderer {
    return this.app.renderer as PixiRenderer;
  }

  get ticker(): Ticker {
    return this.app.ticker;
  }

  resizeTo(width: number, height: number): void {
    this.app.renderer.resize(Math.max(1, width), Math.max(1, height));
    const v = this.view;
    v.style.width = `${width}px`;
    v.style.height = `${height}px`;
    this.updateTransform();
  }

  get view(): HTMLCanvasElement {
    return ((this.app as any).canvas ?? (this.app.view as HTMLCanvasElement)) as HTMLCanvasElement;
  }

  get size(): { width: number; height: number } {
    const view = this.view;
    return { width: view.clientWidth, height: view.clientHeight };
  }

  setZoom(scale: number): void {
    this.transform.scale = Math.max(0.1, Math.min(16, scale));
    this.updateTransform();
  }

  setPan(x: number, y: number): void {
    this.transform.translateX = x;
    this.transform.translateY = y;
    this.updateTransform();
  }

  updateTransform(): void {
    this.rootContainer.scale.set(this.transform.scale);
    this.rootContainer.position.set(this.transform.translateX, this.transform.translateY);
  }

  clearLayers(): void {
    this.gridLayer.removeChildren();
    this.strokeLayer.removeChildren();
    this.uiLayer.removeChildren();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    try {
      this.resizeObserver?.disconnect();
    } catch {}
    window.removeEventListener('resize', this.onResizeCb);
    // Destroy app and all GPU resources
    try {
      this.mountEl.removeChild(this.view);
    } catch {}
    // Pixi v8 destroy signature
    this.app.destroy(true, { children: true, texture: true });
  }
}


