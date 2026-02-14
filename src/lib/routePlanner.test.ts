import fareMaster from "@/data/fareMaster.json";
import { describe, expect, it } from "vitest";
import { findNextRouteOptions, validateTimetable } from "@/lib/routePlanner";
import type { FareMaster } from "@/types/fare";

const master = fareMaster as FareMaster;

describe("validateTimetable", () => {
  it("returns valid for sample timetable", () => {
    expect(validateTimetable(master)).toEqual({ isValid: true });
  });

  it("returns invalid for malformed time", () => {
    const invalidMaster: FareMaster = {
      ...master,
      timetable: {
        ...master.timetable,
        weekday: {
          ...master.timetable.weekday,
          yasu_to_osaka: {
            ...master.timetable.weekday.yasu_to_osaka,
            direct: [
              {
                ...master.timetable.weekday.yasu_to_osaka.direct[0],
                departAt: "9:10"
              }
            ]
          }
        }
      }
    };

    const result = validateTimetable(invalidMaster);
    expect(result.isValid).toBe(false);
  });
});

describe("findNextRouteOptions", () => {
  it("returns next three direct and stopover options", () => {
    const result = findNextRouteOptions(master, "yasu_to_osaka", "09:00");

    expect(result.direct).toHaveLength(3);
    expect(result.stopover).toHaveLength(3);
    expect(result.direct[0]).toMatchObject({
      routeType: "direct",
      departAt: "09:12",
      arriveAt: "10:08",
      durationMin: 56
    });
    expect(result.stopover[0]).toMatchObject({
      routeType: "stopover",
      departAt: "09:13",
      arriveAt: "10:20",
      durationMin: 67,
      transferWaitMin: 7
    });
  });

  it("supports reverse direction", () => {
    const result = findNextRouteOptions(master, "osaka_to_yasu", "09:00");
    expect(result.direct[0].departAt).toBe("09:07");
    expect(result.stopover[0].departAt).toBe("09:08");
  });

  it("returns empty list when no departures are available", () => {
    const result = findNextRouteOptions(master, "yasu_to_osaka", "23:59");
    expect(result.direct).toHaveLength(0);
    expect(result.stopover).toHaveLength(0);
  });
});
