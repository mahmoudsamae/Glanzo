import { describe, expect, it } from "vitest";

import {
  formatGermanPhoneVisual,
  germanPhoneRawFromDigits,
} from "@/lib/booking/phone-display";
import { normalizePhoneToE164 } from "@/lib/phone/normalize-e164";

describe("phone display", () => {
  it("groups national digits visually", () => {
    expect(formatGermanPhoneVisual("1701234567")).toBe("170 123 4567");
  });

  it("normalizes to E.164 via +49 default", () => {
    const raw = germanPhoneRawFromDigits("01701234567");
    expect(normalizePhoneToE164(raw)).toBe("+491701234567");
  });
});
