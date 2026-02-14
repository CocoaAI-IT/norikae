"use client";

import { useMemo, useState } from "react";
import type { ComparisonResult, Direction, FareMaster, RouteOption } from "@/types/fare";
import { compareFare, validateFareMaster } from "@/lib/compareFare";
import { findNextRouteOptions, validateTimetable } from "@/lib/routePlanner";

type FareComparisonProps = {
  master: FareMaster;
};

function formatYen(value: number): string {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function getResultLabel(result: ComparisonResult): string {
  if (result.cheaper === "equal") {
    return "同額です";
  }
  if (result.cheaper === "direct") {
    return `直通が ${formatYen(result.diffYen)} 円安いです`;
  }
  return `京都で途中下車が ${formatYen(result.diffYen)} 円安いです`;
}

function getDirectionLabel(direction: Direction): string {
  return direction === "yasu_to_osaka" ? "野洲 → 大阪" : "大阪 → 野洲";
}

function getLegLabels(direction: Direction): { leg1: string; leg2: string } {
  if (direction === "yasu_to_osaka") {
    return { leg1: "野洲→京都", leg2: "京都→大阪" };
  }
  return { leg1: "大阪→京都", leg2: "京都→野洲" };
}

function formatRouteSummary(option: RouteOption): string {
  return `${option.departAt} 発 → ${option.arriveAt} 着`;
}

export function FareComparison({ master }: FareComparisonProps) {
  const [direction, setDirection] = useState<Direction>("yasu_to_osaka");
  const [departureTime, setDepartureTime] = useState("09:00");

  const validation = validateFareMaster(master);
  const timetableValidation = validateTimetable(master);

  if (!validation.isValid) {
    return (
      <section className="panel">
        <h2 className="panelTitle">比較結果</h2>
        <p className="errorText">運賃データ確認中: {validation.reason}</p>
      </section>
    );
  }

  const result = compareFare(master);
  const legs = getLegLabels(direction);
  const resultToneClass =
    result.cheaper === "equal"
      ? "resultNeutral"
      : result.cheaper === "direct"
        ? "resultDirect"
        : "resultStopover";

  const routeOptions = useMemo(() => {
    if (!timetableValidation.isValid) {
      return { direct: [], stopover: [] };
    }

    try {
      return findNextRouteOptions(master, direction, departureTime, 3);
    } catch {
      return { direct: [], stopover: [] };
    }
  }, [departureTime, direction, master, timetableValidation]);

  return (
    <section className="panel">
      <h2 className="panelTitle">{getDirectionLabel(direction)}（大人IC）</h2>

      <div className="routeFilters">
        <div>
          <p className="filterLabel">出発駅</p>
          <div className="directionTabs">
            <button
              type="button"
              className={`tabButton ${direction === "yasu_to_osaka" ? "tabActive" : ""}`}
              onClick={() => setDirection("yasu_to_osaka")}
            >
              野洲発
            </button>
            <button
              type="button"
              className={`tabButton ${direction === "osaka_to_yasu" ? "tabActive" : ""}`}
              onClick={() => setDirection("osaka_to_yasu")}
            >
              大阪発
            </button>
          </div>
        </div>

        <div className="timePickerWrap">
          <label className="filterLabel" htmlFor="departure-time">
            出発時刻
          </label>
          <input
            id="departure-time"
            className="timeInput"
            type="time"
            value={departureTime}
            onChange={(event) => setDepartureTime(event.target.value)}
          />
        </div>
      </div>

      <div className="cardGrid">
        <article className="fareCard">
          <h3>そのまま直通</h3>
          <p className="fareValue">¥{formatYen(result.directFare)}</p>
        </article>
        <article className="fareCard">
          <h3>京都で一度改札を出る</h3>
          <p className="fareValue">¥{formatYen(result.stopoverTotalFare)}</p>
          <p className="fareBreakdown">
            {legs.leg1} ¥{formatYen(master.stopover.leg1Fare)} + {legs.leg2} ¥
            {formatYen(master.stopover.leg2Fare)}
          </p>
        </article>
      </div>

      <p className={`resultBanner ${resultToneClass}`}>{getResultLabel(result)}</p>
      <section className="timeSection">
        <h3 className="timeSectionTitle">時刻比較（平日・次の3本）</h3>
        {!timetableValidation.isValid ? (
          <p className="errorText">時刻表データ確認中: {timetableValidation.reason}</p>
        ) : (
          <div className="timeColumns">
            <article className="timeCard">
              <h4>そのまま直通</h4>
              {routeOptions.direct.length === 0 ? (
                <p className="emptyRow">該当する列車がありません（出発時刻を早めてください）</p>
              ) : (
                <ul className="timeList">
                  {routeOptions.direct.map((option, idx) => (
                    <li key={`direct-${option.departAt}-${option.arriveAt}-${idx}`} className="timeRow">
                      <p className="routeSummary">{formatRouteSummary(option)}</p>
                      <p className="routeMeta">所要 {option.durationMin}分</p>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="timeCard">
              <h4>京都で途中下車</h4>
              {routeOptions.stopover.length === 0 ? (
                <p className="emptyRow">該当する列車がありません（出発時刻を早めてください）</p>
              ) : (
                <ul className="timeList">
                  {routeOptions.stopover.map((option, idx) => (
                    <li key={`stopover-${option.departAt}-${option.arriveAt}-${idx}`} className="timeRow">
                      <p className="routeSummary">{formatRouteSummary(option)}</p>
                      <p className="routeMeta">
                        所要 {option.durationMin}分 / 京都で乗換 {option.transferWaitMin ?? 0}分
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        )}
      </section>
      <p className="metaLine">最終更新: {new Date(master.updatedAt).toLocaleString("ja-JP")}</p>
    </section>
  );
}
