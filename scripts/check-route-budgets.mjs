#!/usr/bin/env node
/**
 * Enforces First Load JS budgets from the last production build output.
 * Dashboard /d/* and platform admin /admin/* routes: ≤150 kB. Public mini-site /s/*: ≤70 kB.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const logPath = path.join(root, ".next", "build-routes.txt");

const DASHBOARD_BUDGET_KB = 150;
const MINISITE_BUDGET_KB = 70;

if (!fs.existsSync(logPath)) {
  console.error("Route budget check requires .next/build-routes.txt — run pnpm build first.");
  process.exit(1);
}

const output = fs.readFileSync(logPath, "utf8");
// Page size column is `kB` or `B`; First Load JS is always `kB`.
const routeRe = /[├└┌]\s+[○ƒ]\s+(\/\S+)\s+[\d.]+\s+(?:kB|B)\s+([\d.]+)\s+kB/g;
const sharedRe = /First Load JS shared by all\s+([\d.]+)\s+kB/;

/** @type {Map<string, number>} */
const routes = new Map();
for (const match of output.matchAll(routeRe)) {
  routes.set(match[1], Number.parseFloat(match[2]));
}

if (routes.size === 0) {
  console.error("Could not parse route sizes from .next/build-routes.txt — rebuild required.");
  process.exit(1);
}

const sharedMatch = output.match(sharedRe);
const sharedKb = sharedMatch ? Number.parseFloat(sharedMatch[1]) : 0;

const violations = [];

for (const [route, firstLoadKb] of routes) {
  if (route.startsWith("/d") || route.startsWith("/admin")) {
    if (firstLoadKb > DASHBOARD_BUDGET_KB) {
      violations.push(
        `${route}: First Load JS ${firstLoadKb} kB exceeds budget ${DASHBOARD_BUDGET_KB} kB`,
      );
    }
    continue;
  }

  if (route.startsWith("/s/")) {
    const routeSpecificKb = Math.max(0, firstLoadKb - sharedKb);
    if (routeSpecificKb > MINISITE_BUDGET_KB) {
      violations.push(
        `${route}: route-specific JS ${routeSpecificKb} kB exceeds mini-site budget ${MINISITE_BUDGET_KB} kB`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error("Route budget violations:");
  for (const line of violations) {
    console.error(`  - ${line}`);
  }
  process.exit(1);
}

const servicesKb = routes.get("/d/services");
const staffKb = routes.get("/d/staff");
const editorKb = routes.get("/d/minisite");
const minisiteKb = routes.get("/s/[shopSlug]");
const adminKb = routes.get("/admin");
const adminShopsKb = routes.get("/admin/shops");

console.log("Route budget check passed.");
if (servicesKb !== undefined) {
  console.log(`  /d/services First Load JS: ${servicesKb} kB (budget ${DASHBOARD_BUDGET_KB} kB)`);
}
if (staffKb !== undefined) {
  console.log(`  /d/staff First Load JS: ${staffKb} kB (budget ${DASHBOARD_BUDGET_KB} kB)`);
}
if (editorKb !== undefined) {
  console.log(`  /d/minisite First Load JS: ${editorKb} kB (budget ${DASHBOARD_BUDGET_KB} kB)`);
}
if (minisiteKb !== undefined) {
  const minisiteSpecific = Math.max(0, minisiteKb - sharedKb);
  console.log(
    `  /s/[shopSlug] route-specific JS: ${minisiteSpecific} kB (budget ${MINISITE_BUDGET_KB} kB; shared ${sharedKb} kB)`,
  );
}
if (adminKb !== undefined) {
  console.log(`  /admin First Load JS: ${adminKb} kB (budget ${DASHBOARD_BUDGET_KB} kB)`);
}
if (adminShopsKb !== undefined) {
  console.log(`  /admin/shops First Load JS: ${adminShopsKb} kB (budget ${DASHBOARD_BUDGET_KB} kB)`);
}
