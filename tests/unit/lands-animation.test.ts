import { describe, expect, it } from "vitest";

import { filterNewLandingIds, mergeSeenIds } from "@/lib/appointments/lands-animation";

describe("lands animation seen ids", () => {
  it("filters only unseen ids", () => {
    const seen = new Set(["a"]);
    expect(filterNewLandingIds(seen, ["a", "b", "c"])).toEqual(["b", "c"]);
  });

  it("merges without dropping prior ids", () => {
    const merged = mergeSeenIds(new Set(["a"]), ["b"]);
    expect([...merged]).toEqual(["a", "b"]);
  });

  it("never re-animates after merge", () => {
    let seen = new Set<string>();
    seen = mergeSeenIds(seen, filterNewLandingIds(seen, ["x"]));
    expect(filterNewLandingIds(seen, ["x"])).toEqual([]);
  });
});
