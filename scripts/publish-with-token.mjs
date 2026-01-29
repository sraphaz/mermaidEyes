#!/usr/bin/env node
/**
 * Publica a extensão no VS Code Marketplace usando o token em VS_MARKETPLACE_TOKEN.
 * Lê VS_MARKETPLACE_TOKEN do ambiente ou de .env na raiz do projeto.
 * Faz build + prepack + publish.
 * Uso: set VS_MARKETPLACE_TOKEN=seu_token && npm run publish:marketplace
 * Ou crie .env com VS_MARKETPLACE_TOKEN=seu_token e rode npm run publish:marketplace
 */
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const extensionDir = path.join(rootDir, "extension");

// Carregar .env se existir (sem dependência de dotenv)
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}

const token = process.env.VS_MARKETPLACE_TOKEN;
if (!token || token.trim() === "") {
  console.error("Erro: defina a variável VS_MARKETPLACE_TOKEN com o PAT do Marketplace.");
  process.exit(1);
}

const env = { ...process.env, VSCE_PAT: token };

function run(cmd, args, cwd = rootDir) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, shell: true, stdio: "inherit", env });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
}

async function main() {
  await run("npm", ["run", "package:vsix"]);
  await run("npx", ["@vscode/vsce", "publish", "--no-dependencies"], extensionDir);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
