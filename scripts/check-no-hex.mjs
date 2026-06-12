#!/usr/bin/env node
/**
 * No hard-coded hex colors outside token definitions in globals.css.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const allowHexFiles = new Set([
  path.join(srcRoot, "styles", "globals.css").replaceAll("\\", "/"),
]);

const hexPattern = /#[0-9a-fA-F]{3,8}\b/g;
const offenders = [];

function scanFile(filePath) {
  const normalized = filePath.replaceAll("\\", "/");
  if (allowHexFiles.has(normalized)) return;

  const content = fs.readFileSync(filePath, "utf8");
  const matches = content.match(hexPattern);
  if (matches?.length) {
    offenders.push(`${path.relative(root, filePath)} (${matches.join(", ")})`);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "fonts") continue;
      walk(full);
    } else if (/\.(css|tsx?|jsx?)$/.test(entry.name)) {
      scanFile(full);
    }
  }
}

walk(srcRoot);

if (offenders.length > 0) {
  console.error("Hard-coded hex colors found outside globals.css:");
  for (const entry of offenders) {
    console.error(`  - ${entry}`);
  }
  process.exit(1);
}

console.log("Hex color discipline check passed.");
