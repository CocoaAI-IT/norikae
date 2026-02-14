import type { ComparisonResult, FareMaster } from "@/types/fare";
import { compareFare, validateFareMaster } from "@/lib/compareFare";

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

export function FareComparison({ master }: FareComparisonProps) {
  const validation = validateFareMaster(master);

  if (!validation.isValid) {
    return (
      <section className="panel">
        <h2 className="panelTitle">比較結果</h2>
        <p className="errorText">運賃データ確認中: {validation.reason}</p>
      </section>
    );
  }

  const result = compareFare(master);
  const resultToneClass =
    result.cheaper === "equal"
      ? "resultNeutral"
      : result.cheaper === "direct"
        ? "resultDirect"
        : "resultStopover";

  return (
    <section className="panel">
      <h2 className="panelTitle">野洲 → 大阪（大人IC）</h2>

      <div className="cardGrid">
        <article className="fareCard">
          <h3>そのまま直通</h3>
          <p className="fareValue">¥{formatYen(result.directFare)}</p>
        </article>
        <article className="fareCard">
          <h3>京都で一度改札を出る</h3>
          <p className="fareValue">¥{formatYen(result.stopoverTotalFare)}</p>
          <p className="fareBreakdown">
            野洲→京都 ¥{formatYen(master.stopover.leg1Fare)} + 京都→大阪 ¥
            {formatYen(master.stopover.leg2Fare)}
          </p>
        </article>
      </div>

      <p className={`resultBanner ${resultToneClass}`}>{getResultLabel(result)}</p>
      <p className="metaLine">最終更新: {new Date(master.updatedAt).toLocaleString("ja-JP")}</p>
    </section>
  );
}

