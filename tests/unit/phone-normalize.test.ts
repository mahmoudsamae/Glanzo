import { describe, expect, it } from "vitest";

import { isValidE164Phone, normalizePhoneToE164 } from "@/lib/phone/normalize-e164";

describe("normalizePhoneToE164", () => {
  it("normalizes German local numbers with leading 0", () => {
    expect(normalizePhoneToE164("0170 1234567")).toBe("+491701234567");
  });

  it("keeps valid +49 numbers", () => {
    expect(normalizePhoneToE164("+491701234567")).toBe("+491701234567");
  });

  it("converts 00 international prefix", () => {
    expect(normalizePhoneToE164("00491701234567")).toBe("+491701234567");
  });

  it("strips formatting characters", () => {
    expect(normalizePhoneToE164("+49 (170) 123-4567")).toBe("+491701234567");
  });

  it("returns null for too-short numbers", () => {
    expect(normalizePhoneToE164("+491")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(normalizePhoneToE164("   ")).toBeNull();
  });
});

describe("isValidE164Phone", () => {
  it("accepts canonical E.164", () => {
    expect(isValidE164Phone("+491701234567")).toBe(true);
  });

  it("rejects missing plus", () => {
    expect(isValidE164Phone("491701234567")).toBe(false);
  });
});
