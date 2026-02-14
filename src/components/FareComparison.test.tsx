import fareMaster from "@/data/fareMaster.json";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FareComparison } from "@/components/FareComparison";
import type { FareMaster } from "@/types/fare";

const master = fareMaster as FareMaster;

describe("FareComparison", () => {
  it("renders fare cards and initial timetable rows", () => {
    render(<FareComparison master={master} />);

    expect(screen.getAllByText("そのまま直通")).toHaveLength(2);
    expect(screen.getByText("京都で一度改札を出る")).toBeInTheDocument();
    expect(screen.getByText("時刻比較（平日・次の3本）")).toBeInTheDocument();
    expect(screen.getByText("09:12 発 → 10:08 着")).toBeInTheDocument();
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

  it("switches direction when Osaka button is selected", async () => {
    const user = userEvent.setup();
    render(<FareComparison master={master} />);

    await user.click(screen.getByRole("button", { name: "大阪発" }));

    expect(screen.getByText("大阪 → 野洲（大人IC）")).toBeInTheDocument();
    expect(screen.getByText(/大阪→京都/)).toBeInTheDocument();
    expect(screen.getByText("09:07 発 → 10:03 着")).toBeInTheDocument();
  });

  it("shows empty message when departure time is too late", () => {
    render(<FareComparison master={master} />);

    fireEvent.change(screen.getByLabelText("出発時刻"), {
      target: { value: "23:59" }
    });

    expect(
      screen.getAllByText("該当する列車がありません（出発時刻を早めてください）")
    ).toHaveLength(2);
  });
});
