#!/usr/bin/env node
import { execSync } from "node:child_process";

import { loadEnvFiles } from "./lib/load-env.mjs";
import { assertLinkedProjectTarget, assertSafeToSeed } from "./lib/test-project-guards.mjs";

loadEnvFiles();

const { url, projectRef, serviceKey } = assertLinkedProjectTarget();

console.log(`Safety check passed for project ref: ${projectRef}`);

await assertSafeToSeed(url, serviceKey);

console.log("Pre-reset seed safety check passed.");

console.log("Resetting linked database (migrations only)…");
execSync("pnpm exec supabase db reset --linked --yes", { stdio: "inherit" });

await assertSafeToSeed(url, serviceKey);

console.log("Applying supabase/seed.sql…");
execSync("pnpm exec supabase db execute --linked --file supabase/seed.sql", { stdio: "inherit" });

console.log("Database reset + seed complete.");
