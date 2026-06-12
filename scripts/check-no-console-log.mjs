#!/usr/bin/env node
/**
 * No console.log in application source — structured logging lands in Phase 3.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanRoots = [path.join(root, "src"), path.join(root, "middleware.ts")];
const offenders = [];

function scanFile(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  lines.forEach((line, index) => {
    if (/console\.log\s*\(/.test(line)) {
      offenders.push(`${path.relative(root, filePath)}:${index + 1}`);
    }
  });
}

for (const scanRoot of scanRoots) {
  if (!fs.existsSync(scanRoot)) continue;

  if (fs.statSync(scanRoot).isFile()) {
    scanFile(scanRoot);
    continue;
  }

  const stack = [scanRoot];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        stack.push(full);
      } else if (/\.(ts|tsx|mts)$/.test(entry.name)) {
        scanFile(full);
      }
    }
  }
}

if (offenders.length > 0) {
  console.error("console.log found outside scripts/:");
  for (const entry of offenders) {
    console.error(`  - ${entry}`);
  }
  process.exit(1);
}

console.log("Logging hygiene check passed.");
