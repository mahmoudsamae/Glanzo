#!/usr/bin/env node
/**
 * Service-role client must only be imported from src/server/** and must use server-only.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const serviceFile = path.join(srcRoot, "lib", "supabase", "service.ts");

const serviceContents = fs.readFileSync(serviceFile, "utf8");
if (!serviceContents.includes('import "server-only"')) {
  console.error("lib/supabase/service.ts must import 'server-only'.");
  process.exit(1);
}

const offenders = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx|mts|js|mjs)$/.test(entry.name)) continue;

    const relative = path.relative(srcRoot, full).replaceAll("\\", "/");
    const contents = fs.readFileSync(full, "utf8");
    if (!contents.includes("supabase/service")) continue;

    const allowed = relative.startsWith("server/");
    if (!allowed) {
      offenders.push(relative);
    }
  }
}

walk(srcRoot);

if (offenders.length > 0) {
  console.error("service.ts imported outside src/server/:");
  for (const file of offenders) {
    console.error(`  - src/${file}`);
  }
  process.exit(1);
}

console.log("Service-role import isolation check passed.");
