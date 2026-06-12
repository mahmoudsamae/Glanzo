#!/usr/bin/env node
/**
 * Ensures src/types/database.types.ts matches the live schema.
 * CI: compares against `supabase start` (--local).
 * Local: compares against linked hosted project (--linked).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { loadEnvFiles } from "./lib/load-env.mjs";
import { extractProjectRefFromSupabaseUrl } from "./lib/test-project-guards.mjs";

loadEnvFiles();

const root = process.cwd();
const typesPath = path.join(root, "src/types/database.types.ts");
const tmpPath = `${typesPath}.tmp`;

function resolveTypesSourceFlag() {
  if (process.env.CI === "true") {
    return "--local";
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  if (extractProjectRefFromSupabaseUrl(url)) {
    return "--linked";
  }

  return "--local";
}

const sourceFlag = resolveTypesSourceFlag();

try {
  const generated = execSync(
    `pnpm exec supabase gen types typescript ${sourceFlag} --schema public`,
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
    },
  );
  fs.writeFileSync(tmpPath, generated, "utf8");

  const normalize = (source) => source.replace(/\r\n/g, "\n").trimEnd() + "\n";

  const current = normalize(fs.readFileSync(typesPath, "utf8"));
  const fresh = normalize(generated);
  if (current !== fresh) {
    fs.unlinkSync(tmpPath);
    console.error(
      `database.types.ts is out of date (source: ${sourceFlag}). Run \`pnpm db:types\` and commit.`,
    );
    process.exit(1);
  }

  fs.unlinkSync(tmpPath);
  console.log(`database.types.ts is current (source: ${sourceFlag}).`);
} catch (error) {
  if (fs.existsSync(tmpPath)) {
    fs.unlinkSync(tmpPath);
  }
  console.error(`Could not verify database types (source: ${sourceFlag}).`);
  if (sourceFlag === "--linked") {
    console.error("Run `supabase login` then `pnpm db:push:test` to link your project.");
  }
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
