#!/usr/bin/env node
import { assertLinkedProjectTarget } from "./lib/test-project-guards.mjs";

const overrides = JSON.parse(process.argv[2] ?? "{}");

try {
  assertLinkedProjectTarget(overrides);
  console.log("guard-ok");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
