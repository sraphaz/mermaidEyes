#!/usr/bin/env node
/**
 * Prepares extension folder for vsce package (monorepo).
 * Copies only extension deps from root node_modules, then @mermaidlens/core from packages/core.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const extNodeModules = path.join(root, "extension", "node_modules");
const rootNodeModules = path.join(root, "node_modules");
const corePackage = path.join(root, "packages", "core");
const coreDest = path.join(extNodeModules, "@mermaidlens", "core");

const EXT_DEPS = ["@mermaidlens", "markdown-it", "mdurl", "uc.micro", "entities", "linkify-it", "punycode.js"];
const SKIP_COPY = new Set(["@mermaidlens", "mermaidlens", "mermaidlens-extension"]);

function copyRecursive(src, dest, skipDir) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (skipDir && name === skipDir) continue;
    const s = path.join(src, name);
    const d = path.join(dest, name);
    const stat = fs.statSync(s);
    if (stat.isDirectory() && !stat.isSymbolicLink()) copyRecursive(s, d, null);
    else if (!stat.isDirectory()) fs.copyFileSync(s, d);
  }
}

function rmRecursive(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.lstatSync(p);
    if (stat.isDirectory() && !stat.isSymbolicLink()) rmRecursive(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
}

fs.mkdirSync(extNodeModules, { recursive: true });

console.log("[prepack] Copying extension deps (skip @mermaidlens, mermaidlens-extension)...");
for (const dep of EXT_DEPS) {
  if (SKIP_COPY.has(dep)) continue;
  const src = path.join(rootNodeModules, dep);
  if (!fs.existsSync(src)) continue;
  const dest = path.join(extNodeModules, dep);
  copyRecursive(src, dest, null);
  console.log("[prepack]   ", dep);
}

console.log("[prepack] Adding @mermaidlens/core from packages/core...");
fs.mkdirSync(path.join(extNodeModules, "@mermaidlens"), { recursive: true });
copyRecursive(corePackage, coreDest, null);

console.log("[prepack] Done.");
