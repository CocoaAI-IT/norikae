import fareMaster from "@/data/fareMaster.json";
import { describe, expect, it } from "vitest";
import { compareFare, validateFareMaster } from "@/lib/compareFare";
import type { FareMaster } from "@/types/fare";

const baseMaster = fareMaster as FareMaster;

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
