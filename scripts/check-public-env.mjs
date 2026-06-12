#!/usr/bin/env node
/**
 * Ensures only allowlisted NEXT_PUBLIC_* vars appear in env files and source.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ALLOWLIST = new Set([
  "NEXT_PUBLIC_ROOT_DOMAIN",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_AUTH_GOOGLE_ENABLED",
]);

const SCAN_FILES = [
  ".env.example",
  path.join("src", "lib", "env.ts"),
];

const PUBLIC_PATTERN = /NEXT_PUBLIC_[A-Z0-9_]+/g;

function scanFile(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return [];
  const content = fs.readFileSync(fullPath, "utf8");
  const matches = content.match(PUBLIC_PATTERN) ?? [];
  return [...new Set(matches)].filter((name) => !ALLOWLIST.has(name));
}

const violations = SCAN_FILES.flatMap(scanFile);

if (violations.length > 0) {
  console.error("Disallowed NEXT_PUBLIC_* variables found:");
  for (const name of violations) {
    console.error(`  - ${name}`);
  }
  console.error(`Allowlist: ${[...ALLOWLIST].join(", ")}`);
  process.exit(1);
}

console.log("NEXT_PUBLIC_* allowlist check passed.");
