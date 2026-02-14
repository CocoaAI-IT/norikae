# Norikae App (MVP)

野洲→大阪の移動で、以下2ルートの大人IC運賃を比較するスマホ向けWebアプリです。

- そのまま直通
- 京都で一度改札を出る（野洲→京都 + 京都→大阪）

## Setup (`mise` + `pnpm`)

```bash
mise install
pnpm install
pnpm dev
```

`http://localhost:3000` で確認できます。

## Test / Build

```bash
pnpm test
pnpm build
```

## Deploy (GitHub Pages)

### 自動デプロイ（推奨）

- `main` ブランチに push すると `.github/workflows/deploy.yml` で自動デプロイされます。
- GitHub の `Settings > Pages` で `Source: GitHub Actions` を選択してください。

### 手動デプロイ

```bash
pnpm run deploy:pages
```

`gh-pages` ブランチへ `out/` の静的ファイルを push します。

## Fare Data Update

運賃データは `src/data/fareMaster.json` を編集して更新します。

- `directFare`: 野洲→大阪（直通）
- `stopover.leg1Fare`: 野洲→京都
- `stopover.leg2Fare`: 京都→大阪
- `updatedAt`: ISO 8601形式（例: `2026-02-14T00:00:00+09:00`）
