import fs from "node:fs/promises";
import path from "node:path";
import { transform } from "@svgr/core";
import { optimize } from "svgo";
import { globby } from "globby";
import Handlebars from "handlebars";
import { pascalCase } from "change-case";
import prettier from "prettier";

type Opts = {
  srcDir: string;
  outDir: string;
  prefix?: string;
  defaultSize: number;
  defaultStrokeWidth: number;
  filled: boolean;
};

// DON'T use Handlebars for the strokeWidth - build it manually
const buildComponent = (data: {
  componentName: string;
  svgBody: string;
  defaultSize: number;
  defaultStrokeWidth: number;
  fill: string;
  stroke: string;
  filled: boolean;
}) => {
  const strokeWidthValue = data.filled ? "undefined as any" : "strokeWidth";
  
  return `import * as React from "react";

export interface ${data.componentName}Props extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
  size?: number;
  strokeWidth?: number;
}

const ${data.componentName} = React.memo(React.forwardRef<SVGSVGElement, ${data.componentName}Props>(
  ({ title, titleId, size = ${data.defaultSize}, strokeWidth = ${data.defaultStrokeWidth}, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        aria-hidden={title ? undefined : "true"}
        aria-labelledby={title ? titleId : undefined}
        role={title ? "img" : "presentation"}
        viewBox="0 0 24 24"
        fill="${data.fill}"
        stroke="${data.stroke}"
        strokeWidth={${strokeWidthValue}}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {title ? <title id={titleId}>{title}</title> : null}
        ${data.svgBody}
      </svg>
    );
  }
));

${data.componentName}.displayName = "${data.componentName}";
export default ${data.componentName};
`;
};

const INDEX_TEMPLATE = `{{#each entries}}export { default as {{this.name}} } from "./{{this.file}}";
{{/each}}`;

export async function generate(opts: Opts) {
  await fs.mkdir(opts.outDir, { recursive: true });

  const files = await globby("**/*.svg", { cwd: opts.srcDir });
  
  if (files.length === 0) {
    throw new Error(`No SVG files found in ${opts.srcDir}`);
  }

  console.log(`📦 Found ${files.length} SVG file(s)`);

  const entries: { name: string; file: string; tags: string[] }[] = [];

  for (const rel of files) {
    const abs = path.join(opts.srcDir, rel);
    const svgRaw = await fs.readFile(abs, "utf8");

    if (!svgRaw.includes("<svg")) {
      console.warn(`⚠️  Skipping invalid SVG: ${rel}`);
      continue;
    }

    // SVGO optimize
    const { data: svgOptimized } = optimize(svgRaw, {
      multipass: true,
      plugins: [
        "preset-default",
        { name: "removeDimensions" },
        { name: "convertStyleToAttrs" },
        { name: "removeXMLNS" }
      ]
    });

    // SVGR to extract inner content
    const jsx = await transform(
      svgOptimized,
      {
        plugins: [],
        jsxRuntime: "classic",
        expandProps: false,
        template: (variables, { tpl }) => {
          return tpl`export default () => (${variables.jsx});`;
        }
      },
      { componentName: "Temp" }
    );

    // Extract inner of <svg>...</svg>
    const inner = (jsx.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1] ?? "")
      .replaceAll(/fill="[^"]*"/g, "")
      .replaceAll(/stroke="[^"]*"/g, "");

    const base = path.basename(rel, ".svg");
    const compName = pascalCase(`${opts.prefix ?? ""}${base}`);
    const fileName = pascalCase(base);

    // Build component using template strings instead of Handlebars
    const tsx = buildComponent({
      componentName: compName,
      svgBody: inner.trim(),
      defaultSize: opts.defaultSize,
      defaultStrokeWidth: opts.defaultStrokeWidth,
      fill: opts.filled ? "currentColor" : "none",
      stroke: opts.filled ? "none" : "currentColor",
      filled: opts.filled,
    });

    const pretty = await prettier.format(tsx, { parser: "babel-ts" });

    const outPath = path.join(opts.outDir, `${fileName}.tsx`);
    await fs.writeFile(outPath, pretty, "utf8");

    entries.push({
      name: compName,
      file: fileName,
      tags: base.split("-")
    });

    console.log(`  ✓ ${base} → ${compName}`);
  }

  // index.ts
  const indexTpl = Handlebars.compile(INDEX_TEMPLATE);
  const indexCode = await prettier.format(indexTpl({ entries }), { parser: "babel-ts" });
  await fs.writeFile(path.join(opts.outDir, "index.ts"), indexCode, "utf8");

  // metadata.json
  await fs.writeFile(
    path.join(opts.outDir, "metadata.json"),
    JSON.stringify({ count: entries.length, icons: entries }, null, 2),
    "utf8"
  );

  console.log(`\n📄 Generated index.ts with ${entries.length} exports`);
}