import { execFileSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

const node = process.execPath;
const script = path.join(process.cwd(), "scripts/run-guard-check.mjs");

function runGuardCheck(
  overrides: { url: string; serviceKey: string },
): { status: number; output: string } {
  try {
    const stdout = execFileSync(node, [script, JSON.stringify(overrides)], {
      encoding: "utf8",
    });
    return { status: 0, output: stdout };
  } catch (error) {
    const err = error as { status?: number; stderr?: string; stdout?: string; message?: string };
    return {
      status: err.status ?? 1,
      output: [err.stderr, err.stdout, err.message].filter(Boolean).join("\n"),
    };
  }
}

describe("linked project safety guards", () => {
  it("aborts when URL is not a hosted Supabase project", () => {
    const result = runGuardCheck({
      url: "http://127.0.0.1:54321",
      serviceKey: "test-service-key",
    });
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/not a hosted Supabase URL/i);
  });

  it("passes when URL and service key are present", () => {
    const result = runGuardCheck({
      url: "https://my-dev-ref.supabase.co",
      serviceKey: "test-service-key",
    });
    expect(result.status).toBe(0);
    expect(result.output).toContain("guard-ok");
  });
});
