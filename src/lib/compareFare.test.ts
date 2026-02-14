import { describe, expect, it } from "vitest";
import { compareFare, validateFareMaster } from "@/lib/compareFare";
import type { FareMaster } from "@/types/fare";

const baseMaster: FareMaster = {
  odId: "yasu_osaka",
  fareType: "ic_adult",
  directFare: 1170,
  stopover: {
    via: "kyoto",
    leg1Fare: 510,
    leg2Fare: 580
  },
  updatedAt: "2026-02-14T00:00:00+09:00"
};

describe("compareFare", () => {
  it("returns stopover as cheaper", () => {
    const result = compareFare(baseMaster);
    expect(result.cheaper).toBe("stopover");
    expect(result.diffYen).toBe(80);
  });

  it("returns direct as cheaper", () => {
    const result = compareFare({
      ...baseMaster,
      directFare: 1000
    });
    expect(result.cheaper).toBe("direct");
    expect(result.diffYen).toBe(90);
  });

  it("returns equal when same fare", () => {
    const result = compareFare({
      ...baseMaster,
      directFare: 1090
    });
    expect(result.cheaper).toBe("equal");
    expect(result.diffYen).toBe(0);
  });

  it("throws on invalid negative fares", () => {
    expect(() =>
      compareFare({
        ...baseMaster,
        directFare: -10
      })
    ).toThrow();
  });
});

describe("validateFareMaster", () => {
  it("returns invalid when updatedAt is invalid date", () => {
    const result = validateFareMaster({
      ...baseMaster,
      updatedAt: "invalid-date"
    });
    expect(result.isValid).toBe(false);
  });
});
