#!/usr/bin/env node
import { execSync } from "node:child_process";

import { loadEnvFiles } from "./lib/load-env.mjs";
import { assertLinkedProjectTarget } from "./lib/test-project-guards.mjs";

loadEnvFiles();

const { projectRef } = assertLinkedProjectTarget();

console.log(`Linking Supabase project ref: ${projectRef}`);
execSync(`pnpm exec supabase link --project-ref ${projectRef}`, { stdio: "inherit" });

console.log("Pushing migrations…");
execSync("pnpm exec supabase db push", { stdio: "inherit" });

console.log("Migrations applied. Run `pnpm db:reset:test` to reset + seed if needed.");
