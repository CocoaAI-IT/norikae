import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FareComparison } from "@/components/FareComparison";
import type { FareMaster } from "@/types/fare";

const master: FareMaster = {
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

describe("FareComparison", () => {
  it("renders two comparison cards", () => {
    render(<FareComparison master={master} />);

    expect(screen.getByText("そのまま直通")).toBeInTheDocument();
    expect(screen.getByText("京都で一度改札を出る")).toBeInTheDocument();
  });

  it("renders equal message when fares are the same", () => {
    render(
      <FareComparison
        master={{
          ...master,
          directFare: 1090
        }}
      />
    );

    expect(screen.getByText("同額です")).toBeInTheDocument();
  });

  it("renders data warning when fares are invalid", () => {
    render(
      <FareComparison
        master={{
          ...master,
          directFare: -1
        }}
      />
    );

    expect(screen.getByText(/運賃データ確認中/)).toBeInTheDocument();
  });
});

