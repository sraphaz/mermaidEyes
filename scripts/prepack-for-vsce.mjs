#!/usr/bin/env node
/**
 * Prepares extension folder for vsce package (monorepo).
 * Extension host code is bundled (extension/dist/extension.js includes @mermaideyes/core).
 * Copies only markdown-it etc. from root node_modules if needed for vsce; extension runtime uses the bundle only.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const extNodeModules = path.join(root, "extension", "node_modules");
const rootNodeModules = path.join(root, "node_modules");

const EXT_DEPS = ["markdown-it", "mdurl", "uc.micro", "entities", "linkify-it", "punycode.js"];

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

fs.mkdirSync(extNodeModules, { recursive: true });

console.log("[prepack] Copying optional deps (extension runtime uses bundle only)...");
for (const dep of EXT_DEPS) {
  const src = path.join(rootNodeModules, dep);
  if (!fs.existsSync(src)) continue;
  const dest = path.join(extNodeModules, dep);
  copyRecursive(src, dest, null);
  console.log("[prepack]   ", dep);
}

console.log("[prepack] Done.");
