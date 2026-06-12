#!/usr/bin/env node
/**
 * Next.js "use server" files may export only async functions.
 * Blocks type/const/sync re-exports that break the App Router compiler.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const offenders = [];

function isUseServerFile(content) {
  const trimmed = content.trimStart();
  return trimmed.startsWith('"use server"') || trimmed.startsWith("'use server'");
}

function stripComments(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function checkExports(relativePath, content) {
  const lines = stripComments(content).split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim() ?? "";
    if (!line.startsWith("export ")) continue;

    if (/^export async function\b/.test(line)) continue;
    if (/^export default async function\b/.test(line)) continue;

    offenders.push(`${relativePath}:${index + 1} — ${line}`);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      walk(full);
      continue;
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) continue;

    const content = fs.readFileSync(full, "utf8");
    if (!isUseServerFile(content)) continue;

    checkExports(path.relative(root, full).replaceAll("\\", "/"), content);
  }
}

walk(srcRoot);

if (offenders.length > 0) {
  console.error('"use server" files must export only async functions:');
  for (const entry of offenders) {
    console.error(`  - ${entry}`);
  }
  process.exit(1);
}

console.log("use server export guard passed.");
