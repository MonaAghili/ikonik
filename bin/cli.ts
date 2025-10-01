#!/usr/bin/env node
import { Command } from "commander";
import path from "node:path";
import { generate } from "../scripts/generate.js";

const program = new Command();

program
  .name("ikonik")
  .version("1.0.0")
  .description("Generate tree-shakeable React icon components from SVG files")
  .option("-s, --src <dir>", "Source SVG directory", "icons-src")
  .option("-o, --out <dir>", "Output directory", "icons")
  .option("--prefix <name>", "Component name prefix", "")
  .option("--size <num>", "Default size (px)", "24")
  .option("--stroke <num>", "Default strokeWidth", "1.5")
  .option("--fill", "Treat icons as filled (no stroke)", false)
  .action(async (opts) => {
    try {
      const cwd = process.cwd();
      const src = path.resolve(cwd, opts.src);
      const out = path.resolve(cwd, opts.out);

      console.log("Generating icons...");
      console.log(`   Source: ${src}`);
      console.log(`   Output: ${out}\n`);

      await generate({
        srcDir: src,
        outDir: out,
        prefix: opts.prefix,
        defaultSize: Number(opts.size),
        defaultStrokeWidth: Number(opts.stroke),
        filled: Boolean(opts.fill),
      });

      console.log(`\nGenerated icons from ${src} → ${out}`);
    } catch (error) {
      console.error("\nError:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse(process.argv);