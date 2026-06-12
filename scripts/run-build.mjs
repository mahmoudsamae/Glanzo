#!/usr/bin/env node
/**
 * Runs `next build` and persists stdout/stderr for route-budget checks.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

const result = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: root,
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
const nextDir = path.join(root, ".next");
if (fs.existsSync(nextDir)) {
  fs.writeFileSync(path.join(nextDir, "build-routes.txt"), output, "utf8");
}

process.exit(result.status ?? 1);
