import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    cli: "bin/cli.ts",
    generate: "scripts/generate.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  shims: true,
  splitting: false,
});