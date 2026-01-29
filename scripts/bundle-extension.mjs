#!/usr/bin/env node
/**
 * Bundle extension + @mermaideyes/core into a single extension.js so the VSIX
 * does not depend on node_modules/@mermaideyes/core at runtime.
 */
import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const extDist = path.join(root, "extension", "dist");
const entry = path.join(root, "extension", "src", "extension.ts");
const outfile = path.join(extDist, "extension.js");

if (fs.existsSync(extDist)) fs.rmSync(extDist, { recursive: true });
fs.mkdirSync(extDist, { recursive: true });

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile,
  external: ["vscode"],
  sourcemap: true,
  minify: false,
  target: "node18",
});

console.log("[bundle] extension/dist/extension.js (with @mermaideyes/core)");
