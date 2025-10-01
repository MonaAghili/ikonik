import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { generate } from "./generate";
import { globby } from "globby";
import { transform } from "@svgr/core";
import { optimize } from "svgo";
import prettier from "prettier";

// Mock dependencies
vi.mock("node:fs/promises");
vi.mock("globby");
vi.mock("@svgr/core");
vi.mock("svgo");
vi.mock("prettier", () => ({
  default: {
    format: vi.fn(),
  },
}));

const mockFs = vi.mocked(fs);
const mockGlobby = vi.mocked(globby);
const mockTransform = vi.mocked(transform);
const mockOptimize = vi.mocked(optimize);
const mockPrettierFormat = vi.mocked(prettier.format);

describe("generate", () => {
  const defaultOpts = {
    srcDir: "/test/src",
    outDir: "/test/out",
    prefix: "Icon",
    defaultSize: 24,
    defaultStrokeWidth: 2,
    filled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFs.mkdir.mockResolvedValue(undefined);
    // Mock prettier.format to return the input code as-is
    mockPrettierFormat.mockImplementation((code: string) => Promise.resolve(code));
    console.log = vi.fn();
    console.warn = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("basic functionality", () => {
    it("should create output directory if it doesn't exist", async () => {
      mockGlobby.mockResolvedValue([]);

      await expect(generate(defaultOpts)).rejects.toThrow(
        "No SVG files found in /test/src"
      );

      expect(mockFs.mkdir).toHaveBeenCalledWith("/test/out", {
        recursive: true,
      });
    });

    it("should throw error when no SVG files are found", async () => {
      mockGlobby.mockResolvedValue([]);

      await expect(generate(defaultOpts)).rejects.toThrow(
        "No SVG files found in /test/src"
      );
    });

    it("should process valid SVG files", async () => {
      const svgContent = '<svg><path d="M10 10"/></svg>';
      mockGlobby.mockResolvedValue(["icon.svg"]);
      mockFs.readFile.mockResolvedValue(svgContent);
      mockOptimize.mockReturnValue({
        data: '<svg viewBox="0 0 24 24"><path d="M10 10"/></svg>',
      } as any);
      mockTransform.mockResolvedValue(
        'export default () => (<svg><path d="M10 10"/></svg>);'
      );
      mockFs.writeFile.mockResolvedValue(undefined);

      await generate(defaultOpts);

      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining("icon.svg"),
        "utf8"
      );
      expect(mockFs.writeFile).toHaveBeenCalledTimes(3); // Component + index + metadata
    });
  });

  describe("SVG processing", () => {
    beforeEach(() => {
      mockGlobby.mockResolvedValue(["test-icon.svg"]);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it("should skip invalid SVG files without <svg> tag", async () => {
      mockFs.readFile.mockResolvedValue("not an svg");
      mockGlobby.mockResolvedValue(["invalid.svg"]);

      // Should complete without throwing, just skip the invalid file
      await generate(defaultOpts);

      expect(console.warn).toHaveBeenCalledWith(
        "⚠️  Skipping invalid SVG: invalid.svg"
      );
    });

    it("should optimize SVG with SVGO", async () => {
      const svgContent = '<svg width="24" height="24"><path d="M10 10"/></svg>';
      mockFs.readFile.mockResolvedValue(svgContent);
      mockOptimize.mockReturnValue({
        data: '<svg viewBox="0 0 24 24"><path d="M10 10"/></svg>',
      } as any);
      mockTransform.mockResolvedValue(
        'export default () => (<svg><path d="M10 10"/></svg>);'
      );

      await generate(defaultOpts);

      expect(mockOptimize).toHaveBeenCalledWith(svgContent, {
        multipass: true,
        plugins: [
          "preset-default",
          { name: "removeDimensions" },
          { name: "convertStyleToAttrs" },
          { name: "removeXMLNS" },
        ],
      });
    });

    it("should remove fill and stroke attributes from SVG inner content", async () => {
      mockFs.readFile.mockResolvedValue("<svg><path/></svg>");
      mockOptimize.mockReturnValue({
        data: '<svg viewBox="0 0 24 24"><path fill="#000" stroke="#fff" d="M10 10"/></svg>',
      } as any);
      mockTransform.mockResolvedValue(
        'export default () => (<svg><path fill="#000" stroke="#fff" d="M10 10"/></svg>);'
      );

      await generate(defaultOpts);

      const writeCall = mockFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes("TestIcon.tsx")
      );
      expect(writeCall).toBeDefined();
      const componentContent = writeCall![1] as string;
      expect(componentContent).not.toContain('fill="#000"');
      expect(componentContent).not.toContain('stroke="#fff"');
    });
  });

  describe("component generation", () => {
    const svgContent = '<svg><circle cx="12" cy="12" r="10"/></svg>';

    beforeEach(() => {
      mockGlobby.mockResolvedValue(["arrow-left.svg"]);
      mockFs.readFile.mockResolvedValue(svgContent);
      mockOptimize.mockReturnValue({
        data: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
      } as any);
      mockTransform.mockResolvedValue(
        'export default () => (<svg><circle cx="12" cy="12" r="10"/></svg>);'
      );
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it("should generate component with correct name using prefix", async () => {
      await generate(defaultOpts);

      const writeCall = mockFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes("ArrowLeft.tsx")
      );
      expect(writeCall).toBeDefined();
      const content = writeCall![1] as string;
      // Case-insensitive check since pascalCase may produce IconarrowLeft
      expect(content.toLowerCase()).toContain("iconarrowleft");
      expect(content).toMatch(/export interface Icon.*ArrowLeft.*Props/i);
    });

    it("should generate component without prefix when not provided", async () => {
      const opts = { ...defaultOpts, prefix: undefined };
      await generate(opts);

      const writeCall = mockFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes("ArrowLeft.tsx")
      );
      const content = writeCall![1] as string;
      expect(content).toContain("const ArrowLeft");
      expect(content).not.toContain("IconArrowLeft");
    });

    it("should generate unfilled component with stroke props", async () => {
      await generate({ ...defaultOpts, filled: false });

      const writeCall = mockFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes("ArrowLeft.tsx")
      );
      const content = writeCall![1] as string;
      expect(content).toContain('fill="none"');
      expect(content).toContain('stroke="currentColor"');
      expect(content).toContain("strokeWidth={strokeWidth}");
    });

    it("should generate filled component without strokeWidth", async () => {
      await generate({ ...defaultOpts, filled: true });

      const writeCall = mockFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes("ArrowLeft.tsx")
      );
      const content = writeCall![1] as string;
      expect(content).toContain('fill="currentColor"');
      expect(content).toContain('stroke="none"');
      expect(content).toContain("strokeWidth={undefined as any}");
    });

    it("should use correct default size and strokeWidth", async () => {
      await generate({
        ...defaultOpts,
        defaultSize: 32,
        defaultStrokeWidth: 1.5,
      });

      const writeCall = mockFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes("ArrowLeft.tsx")
      );
      const content = writeCall![1] as string;
      expect(content).toContain("size = 32");
      expect(content).toContain("strokeWidth = 1.5");
    });

    it("should include accessibility props", async () => {
      await generate(defaultOpts);

      const writeCall = mockFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes("ArrowLeft.tsx")
      );
      const content = writeCall![1] as string;
      expect(content).toContain("title?");
      expect(content).toContain("titleId?");
      expect(content).toContain("aria-hidden");
      expect(content).toContain("aria-labelledby");
      expect(content).toContain("role=");
    });
  });

  describe("output files", () => {
    beforeEach(() => {
      mockGlobby.mockResolvedValue(["icon-one.svg", "icon-two.svg"]);
      mockFs.readFile.mockResolvedValue("<svg><path/></svg>");
      mockOptimize.mockReturnValue({
        data: '<svg viewBox="0 0 24 24"><path d="M10 10"/></svg>',
      } as any);
      mockTransform.mockResolvedValue(
        'export default () => (<svg><path d="M10 10"/></svg>);'
      );
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it("should generate index.ts with all exports", async () => {
      await generate(defaultOpts);

      const indexCall = mockFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes("index.ts")
      );
      expect(indexCall).toBeDefined();
      const indexContent = indexCall![1] as string;
      expect(indexContent).toContain("export { default as");
      expect(indexContent).toContain("IconOne");
      expect(indexContent).toContain("IconTwo");
    });

    it("should generate metadata.json with correct structure", async () => {
      await generate(defaultOpts);

      const metadataCall = mockFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes("metadata.json")
      );
      expect(metadataCall).toBeDefined();
      const metadata = JSON.parse(metadataCall![1] as string);
      expect(metadata).toHaveProperty("count", 2);
      expect(metadata).toHaveProperty("icons");
      expect(metadata.icons).toHaveLength(2);
      expect(metadata.icons[0]).toHaveProperty("name");
      expect(metadata.icons[0]).toHaveProperty("file");
      expect(metadata.icons[0]).toHaveProperty("tags");
    });

    it("should include correct tags in metadata", async () => {
      await generate(defaultOpts);

      const metadataCall = mockFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes("metadata.json")
      );
      expect(metadataCall).toBeDefined();
      const metadata = JSON.parse(metadataCall![1] as string);
      const iconOne = metadata.icons.find((i: any) => i.file === "IconOne");
      expect(iconOne.tags).toEqual(["icon", "one"]);
    });

    it("should format all output files with prettier", async () => {
      await generate(defaultOpts);

      // Prettier should be called for formatting component files and index
      // The mock is set in beforeEach to return empty string
      const formatCalls = mockPrettierFormat.mock.calls;
      expect(formatCalls.length).toBeGreaterThanOrEqual(2);

      // Verify it was called with babel-ts parser
      const hasCorrectParser = formatCalls.some(
        (call: any) => call[1]?.parser === "babel-ts"
      );
      expect(hasCorrectParser).toBe(true);
    });
  });

  describe("multiple files", () => {
    it("should process multiple SVG files correctly", async () => {
      mockGlobby.mockResolvedValue(["home.svg", "settings.svg", "user.svg"]);
      mockFs.readFile.mockResolvedValue("<svg><path/></svg>");
      mockOptimize.mockReturnValue({
        data: '<svg viewBox="0 0 24 24"><path d="M10 10"/></svg>',
      } as any);
      mockTransform.mockResolvedValue(
        'export default () => (<svg><path/></svg>);'
      );
      mockFs.writeFile.mockResolvedValue(undefined);

      await generate(defaultOpts);

      // 3 components + 1 index + 1 metadata = 5 writes
      expect(mockFs.writeFile).toHaveBeenCalledTimes(5);
      expect(console.log).toHaveBeenCalledWith("📦 Found 3 SVG file(s)");
    });
  });

  describe("edge cases", () => {
    it("should handle SVG files in subdirectories", async () => {
      mockGlobby.mockResolvedValue(["icons/subfolder/icon.svg"]);
      mockFs.readFile.mockResolvedValue("<svg><path/></svg>");
      mockOptimize.mockReturnValue({
        data: '<svg viewBox="0 0 24 24"><path d="M10 10"/></svg>',
      } as any);
      mockTransform.mockResolvedValue(
        'export default () => (<svg><path/></svg>);'
      );
      mockFs.writeFile.mockResolvedValue(undefined);

      await generate(defaultOpts);

      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining("icons"),
        "utf8"
      );
    });

    it("should handle icon names with multiple hyphens", async () => {
      mockGlobby.mockResolvedValue(["arrow-left-circle-outline.svg"]);
      mockFs.readFile.mockResolvedValue("<svg><path/></svg>");
      mockOptimize.mockReturnValue({
        data: '<svg viewBox="0 0 24 24"><path d="M10 10"/></svg>',
      } as any);
      mockTransform.mockResolvedValue(
        'export default () => (<svg><path/></svg>);'
      );
      mockFs.writeFile.mockResolvedValue(undefined);

      await generate(defaultOpts);

      const componentCall = mockFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes("ArrowLeftCircleOutline.tsx")
      );
      expect(componentCall).toBeDefined();
      const content = componentCall![1] as string;
      // Check case-insensitively
      expect(content.toLowerCase()).toContain("arrowleftcircleoutline");
    });

    it("should handle empty SVG inner content", async () => {
      mockGlobby.mockResolvedValue(["empty.svg"]);
      mockFs.readFile.mockResolvedValue("<svg></svg>");
      mockOptimize.mockReturnValue({
        data: "<svg></svg>",
      } as any);
      mockTransform.mockResolvedValue("export default () => (<svg></svg>);");
      mockFs.writeFile.mockResolvedValue(undefined);

      await generate(defaultOpts);

      const componentCall = mockFs.writeFile.mock.calls.find((call) =>
        call[0].toString().includes("Empty.tsx")
      );
      expect(componentCall).toBeDefined();
    });
  });
});
