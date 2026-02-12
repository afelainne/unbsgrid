import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock HTMLCanvasElement and its 2D context for paper.js and vector processing
class MockCanvasRenderingContext2D {
  canvas: HTMLCanvasElement;
  fillStyle: string | CanvasGradient | CanvasPattern = '#000';
  strokeStyle: string | CanvasGradient | CanvasPattern = '#000';
  lineWidth = 1;
  lineCap: CanvasLineCap = 'butt';
  lineJoin: CanvasLineJoin = 'miter';
  miterLimit = 10;
  lineDashOffset = 0;
  shadowOffsetX = 0;
  shadowOffsetY = 0;
  shadowBlur = 0;
  shadowColor = 'rgba(0, 0, 0, 0)';
  globalAlpha = 1;
  globalCompositeOperation: GlobalCompositeOperation = 'source-over';
  font = '10px sans-serif';
  textAlign: CanvasTextAlign = 'start';
  textBaseline: CanvasTextBaseline = 'alphabetic';
  direction: CanvasDirection = 'inherit';
  imageSmoothingEnabled = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  // Drawing methods
  clearRect() {}
  fillRect() {}
  strokeRect() {}
  fillText() {}
  strokeText() {}
  measureText(text: string) {
    return { width: text.length * 7 };
  }

  // Path methods
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  bezierCurveTo() {}
  quadraticCurveTo() {}
  arc() {}
  arcTo() {}
  ellipse() {}
  rect() {}

  // Path drawing
  fill() {}
  stroke() {}
  clip() {}
  isPointInPath() {
    return false;
  }
  isPointInStroke() {
    return false;
  }

  // Transformations
  scale() {}
  rotate() {}
  translate() {}
  transform() {}
  setTransform() {}
  resetTransform() {}

  // Image methods
  drawImage() {}
  createImageData(width: number, height: number) {
    return {
      width,
      height,
      data: new Uint8ClampedArray(width * height * 4),
    };
  }
  getImageData(x: number, y: number, width: number, height: number) {
    return this.createImageData(width, height);
  }
  putImageData() {}

  // State
  save() {}
  restore() {}

  // Gradients and patterns
  createLinearGradient() {
    return {
      addColorStop() {},
    } as CanvasGradient;
  }
  createRadialGradient() {
    return {
      addColorStop() {},
    } as CanvasGradient;
  }
  createPattern() {
    return null;
  }

  // Line styles
  setLineDash() {}
  getLineDash() {
    return [];
  }
}

// Override HTMLCanvasElement.prototype.getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (
  contextId: string,
  options?: any
): any {
  if (contextId === '2d') {
    return new MockCanvasRenderingContext2D(this);
  }
  return originalGetContext.call(this, contextId, options);
};
