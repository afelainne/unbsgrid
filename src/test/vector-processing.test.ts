import { describe, it, expect, beforeEach } from "vitest";
import { parseSVG, extractBezierHandles, getLogomarkSize, invertComponents } from "@/lib/svg-engine";

describe("Vector Processing", () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    // Create a canvas element for each test
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
  });

  describe("parseSVG", () => {
    it("should parse a simple SVG rectangle", () => {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" fill="black"/>
        </svg>
      `;

      const result = parseSVG(svgString, canvas);

      expect(result).toBeDefined();
      expect(result.components).toBeDefined();
      expect(result.components.length).toBeGreaterThan(0);
      expect(result.fullBounds).toBeDefined();
      expect(result.originalSVG).toBe(svgString);
      expect(result.paperProject).toBeDefined();
      expect(result.segments).toBeDefined();
    });

    it("should parse an SVG with multiple paths", () => {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect x="10" y="10" width="30" height="30" fill="black"/>
          <circle cx="75" cy="75" r="15" fill="black"/>
        </svg>
      `;

      const result = parseSVG(svgString, canvas);

      expect(result.components).toBeDefined();
      expect(result.components.length).toBeGreaterThanOrEqual(1);
      expect(result.fullBounds.width).toBeGreaterThan(0);
      expect(result.fullBounds.height).toBeGreaterThan(0);
    });

    it("should identify logomark (icon) in SVG components", () => {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect x="10" y="10" width="30" height="30" fill="black"/>
          <rect x="50" y="10" width="40" height="80" fill="black"/>
        </svg>
      `;

      const result = parseSVG(svgString, canvas);

      const hasIcon = result.components.some((c) => c.isIcon);
      expect(hasIcon).toBe(true);
    });

    it("should handle SVG with paths and curves", () => {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path d="M 10 10 Q 50 50 90 10" stroke="black" fill="none"/>
        </svg>
      `;

      const result = parseSVG(svgString, canvas);

      expect(result.components).toBeDefined();
      expect(result.segments).toBeDefined();
      expect(result.segments.length).toBeGreaterThan(0);
    });

    it("should extract component bounds correctly", () => {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect x="20" y="30" width="40" height="50" fill="black"/>
        </svg>
      `;

      const result = parseSVG(svgString, canvas);

      expect(result.components.length).toBeGreaterThan(0);
      const component = result.components[0];
      expect(component.bounds).toBeDefined();
      expect(component.bounds.width).toBeGreaterThan(0);
      expect(component.bounds.height).toBeGreaterThan(0);
    });
  });

  describe("extractBezierHandles", () => {
    it("should extract bezier segments from parsed SVG", () => {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path d="M 10 10 C 30 30 70 30 90 10" fill="black"/>
        </svg>
      `;

      const result = parseSVG(svgString, canvas);

      expect(result.segments).toBeDefined();
      expect(result.segments.length).toBeGreaterThan(0);

      result.segments.forEach((segment) => {
        expect(segment.anchor).toBeDefined();
        expect(segment.anchor.x).toBeDefined();
        expect(segment.anchor.y).toBeDefined();
        expect(segment.handleIn).toBeDefined();
        expect(segment.handleOut).toBeDefined();
        expect(typeof segment.hasHandleIn).toBe("boolean");
        expect(typeof segment.hasHandleOut).toBe("boolean");
      });
    });
  });

  describe("getLogomarkSize", () => {
    it("should return logomark size from icon component", () => {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect x="10" y="10" width="40" height="40" fill="black"/>
        </svg>
      `;

      const result = parseSVG(svgString, canvas);
      const size = getLogomarkSize(result.components);

      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe("number");
    });

    it("should return default size when no icon found", () => {
      const size = getLogomarkSize([]);

      expect(size).toBe(50);
    });
  });

  describe("invertComponents", () => {
    it("should invert isIcon flag for all components", () => {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect x="10" y="10" width="30" height="30" fill="black"/>
          <rect x="50" y="50" width="30" height="30" fill="black"/>
        </svg>
      `;

      const result = parseSVG(svgString, canvas);
      const original = result.components;
      const inverted = invertComponents(original);

      expect(inverted.length).toBe(original.length);
      inverted.forEach((comp, i) => {
        expect(comp.isIcon).toBe(!original[i].isIcon);
      });
    });
  });

  describe("Canvas Context Integration", () => {
    it("should successfully get 2D context from canvas", () => {
      const ctx = canvas.getContext("2d");

      expect(ctx).not.toBeNull();
      expect(ctx).toBeDefined();
    });

    it("should work with paper.js setup", () => {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" fill="black"/>
        </svg>
      `;

      // This should not throw an error about missing canvas context
      expect(() => {
        parseSVG(svgString, canvas);
      }).not.toThrow();
    });

    it("should handle complex SVG with multiple elements", () => {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          <g>
            <rect x="10" y="10" width="50" height="50" fill="red"/>
            <circle cx="150" cy="150" r="30" fill="blue"/>
            <path d="M 100 100 L 150 100 L 125 150 Z" fill="green"/>
          </g>
        </svg>
      `;

      const result = parseSVG(svgString, canvas);

      expect(result.components.length).toBeGreaterThan(0);
      expect(result.fullBounds).toBeDefined();
      expect(result.paperProject).toBeDefined();
    });
  });
});
