import fareMaster from "@/data/fareMaster.json";
import { FareComparison } from "@/components/FareComparison";
import type { FareMaster } from "@/types/fare";

export default function Home() {
  return (
    <main className="pageWrap">
      <header className="hero">
        <p className="badge">MVP</p>
        <h1>途中下車すると安い？</h1>
        <p>
          野洲発/大阪発の両方向で、京都で一回降りるパターンと直通を運賃・時刻で比較します。
        </p>
      </header>

      <FareComparison master={fareMaster as FareMaster} />

      <footer className="footerNote">
        <p>判定ルール: 同額の場合は「同額」と表示します。</p>
      </footer>
    </main>
  );
}
