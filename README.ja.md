<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS — Visual Stories. Structured. Implemented." width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center">Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>

---

インタラクティブな物語を作成するためのビジュアルストーリー構造作成プラットフォーム。クエスト、分岐、シーン、遭遇、結果、そしてそれらを繋ぐゲームの状態ロジックが含まれます。

**rpg-storyboard** は、最初のバージョンです。これは、RPGビデオゲームのクエストとシーンのデザインを行うためのツールです。デモやプロトタイプではありません。このプラットフォーム上で動作するように開発された製品そのものです。

---

## Storyboard OSとは

**実装可能な物語**をデザインするための構造化されたボードです。キャンバス上の各要素は、以下の情報を持つ「ビート」（区切り）を表します。
- エントリー条件とエグジット条件
- 状態変化（フラグ、変数、ゲームの状態）
- 制作に必要なアセット
- テスト基準（合格/不合格チェック）
- 実装チェックリスト

このボードは、単なる物語のシーケンスだけでなく、ゲームの状態の流れを視覚化します。接続は意味を持ちます。選択肢の分岐、結果の連鎖、シーケンスの構造、代替ルートなどを示します。デザイナーは、このボードを見ることで、ゲームが実際にどのように動作するかを理解できます。

## Storyboard OSではないもの

- 一般的な図表作成ツールやホワイトボードツール
- セッションランナーやゲームマスターの支援ツール
- 世界観構築ウィキやロアデータベース
- 会話ツリーエディターのみ
- キャンペーン準備アプリ

もし、この製品が上記のいずれかに誤解される場合、開発の方向性がずれている可能性があります。

---

## rpg-storyboardの機能（フェーズ2）

フェーズ2以降、デザイナーはブラウザから離れることなく、プロジェクトの開始から納品までを完結できます。

| 機能 | ユーザーが得られるもの |
|---|---|
| **Project creation** | テンプレートから名前付きプロジェクトを作成。ボードの位置と編集内容はlocalStorageに保持されます。 |
| **Visual board** | Konvaキャンバス上で、クエストの流れとゲームの状態の分岐ロジックを並べて表示。 |
| **Beat editing** | ボード上の任意のビートのタイトル、概要、およびすべての実装仕様フィールドを直接編集可能。 |
| **Progress tracking** | 各ビートのチェックリスト項目とテスト基準をチェック。状態はリロード後も保持されます。 |
| **Game-state signal** | 各フレームに、状態を示すバッジ（STATE、SPEC/PARTIAL/DRAFT）を表示（ボードから離れる必要なし）。 |
| **Implementation readiness** | 各ビートの状態（READY/PARTIAL/DRAFT/BLOCKED）と、不足している情報が表示されます。 |
| **Project handoff** | ライブプロジェクトの状態から再生成。編集されたコンテンツ、各ビートの進捗状況、変更履歴などが含まれます。 |
| **Quest handoff** | テンプレートプレビューボード用の静的なMarkdown + JSONエクスポート機能。 |
| **Templates** | ビートタイプシーケンスと理由が記載された、RPG制作の開始点となる3つのサンプル。 |
| **Board operations** | ズーム、パン、ボード全体表示、リセット、キーボードショートカットなど、ノートPCでも使いやすいナビゲーション機能。 |

ボードは、コンテンツを作成するためのインターフェースです。ビートインスペクタは、編集可能な実装仕様です。納品物は、実際のプロジェクトの状態から生成されたドキュメントであり、静的なスナップショットではありません。

### フェーズ1の機能（現在も利用可能）

フェーズ1では、読み取り専用のプレビュー機能が提供されました。具体的には、キャンバスのレンダリング、ゲームの状態の表示、実装の準備状況モデル、クエストの納品機能、テンプレートギャラリー、およびボードのナビゲーションが含まれます。フェーズ1のすべての機能は、フェーズ2によって拡張されています。

---

## パッケージ

| パッケージ | 含まれるもの |
|---|---|
| `@storyboard-os/core` | 一般的なストーリーボードの基本要素：フレーム、接続、注釈、テンプレート、構造検証ツール。特定の用語は含まれません。 |
| `@storyboard-os/rpg-domain` | RPGゲーム作成のための契約：フレームタイプ、コンテンツフィールド、テンプレート、準備状況モデル、納品物生成ツール、Tollhouse Ledgerデモクエスト。 |
| `@storyboard-os/canvas` | Konvaキャンバスレンダラー：フレーム、接続、選択、ドラッグ、状態バッジ、接続ラベル、ズーム/パンビューポート。ドメイン設定が渡されます。 |
| `@storyboard-os/routing` | 設定可能なURLヘルパー：ボードとフレームのルート生成。依存関係はありません。 |

## アプリケーション

| アプリケーション | 内容 |
|---|---|
| `rpg-storyboard` | Astro RPGゲーム作成製品。以下の機能が含まれます：RPGキャンバス設定、フレームインスペクタ、納品物ページ、テンプレートギャラリー、ルート設定、ページレイアウト。 |

---

## アーキテクチャ

パッケージは、クリーンな依存関係のチェーンを形成します。

```
apps/rpg-storyboard
  → @storyboard-os/rpg-domain  (RPG game-authoring contract)
  → @storyboard-os/canvas      (Konva renderer, domain-configurable)
  → @storyboard-os/routing     (URL helpers)

@storyboard-os/rpg-domain
  → @storyboard-os/core        (generic primitives)

@storyboard-os/canvas
  → (no platform deps — pure Konva + React)

@storyboard-os/routing
  → (no deps — pure string helpers)

@storyboard-os/core
  → (no deps)
```

A second vertical (例: `apps/screenplay-storyboard`) は、独自のドメインパッケージを作成し、`@storyboard-os/core`、`@storyboard-os/canvas`、および `@storyboard-os/routing` を再利用しますが、`@storyboard-os/rpg-domain` には影響を与えません。

詳細については、[`docs/architecture.md`](docs/architecture.md) を参照してください。

---

## クイックスタート

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (368 tests)
pnpm build      # builds rpg-storyboard (42 pages)
pnpm verify     # test + build in one command (ship gate)
```

要件: Node ≥ 20, pnpm ≥ 9。

テストの範囲は、自動的に `@storyboard-os/*` パッケージと `rpg-storyboard` に限定されます。親ディレクトリにある関連するワークスペースは含まれません。

---

## 信頼モデル

Storyboard OS は、**ローカルでのみ動作するブラウザアプリケーション**です。サーバー、アカウント、ネットワーク接続は不要です。

- **アクセスするデータ:** プロジェクトデータ（ビート仕様、ボードの位置、チェックリストの進捗状況）は、ユーザーのコンピューター上のブラウザの `localStorage` にのみ保存されます。
- **アクセスしないデータ:** 認証情報、支払い情報、ビート仕様のフィールドに入力された個人データ以外の情報は一切アクセスしません。
- **実行時にネットワークリクエストは行われません。** このアプリケーションは静的なウェブサイトです。初期ページ読み込み後、ネットワークへのアクセスは一切ありません。
- **テレメトリーは一切収集または送信されません。**

完全な信頼モデルと脆弱性報告については、[`SECURITY.md`](SECURITY.md) を参照してください。

---

## ステータス

```
Phase 2 complete
368/368 tests passing
42/42 pages built
```

| フェーズ | 説明 | ステータス |
|---|---|---|
| 0A–0F | RPG 制作の検証：キャンバス、ビートページ、テンプレート、デモクエスト | ✅ |
| 0R | 修正と再アンカー：すべてのフレームがゲームの状態仕様を保持 | ✅ |
| 0M | モノレポへの移行：コア、ドメイン、キャンバス、ルーティングを分離 | ✅ |
| 1A | キャンバス上でのブランチと状態の可視化 | ✅ |
| 1B | 各ビートの実現可能性 | ✅ |
| 1C | クエストの引き継ぎエクスポート | ✅ |
| 1D | テンプレートギャラリー | ✅ |
| 1E | ボード操作：ズーム、パン、全体表示、ビューポートコントロール | ✅ |
| 1F | リリースの最終調整：ドキュメント、変更履歴、アーキテクチャに関するメモ | ✅ |
| 2A | テンプレートからのプロジェクト作成：localStorage による永続化 | ✅ |
| 2B | プロジェクトごとのボード位置の永続化 | ✅ |
| 2C | 編集可能なビートコンテンツ：仕様フィールドがリロード後も保持される | ✅ |
| 2D | チェックリスト/進捗状況の永続化：仕様テキストとは別に保存 | ✅ |
| 2E | プロジェクトの引き継ぎ：保存されたプロジェクトの状態から再生成 | ✅ |
| 2F | リリースの最終調整：ドキュメント、変更履歴、アーキテクチャに関するメモ | ✅ |

---

## デモ

**The Tollhouse Ledger**：3つの派閥が同じ隠された記録を求めています。プレイヤーは、誰が勝利し、誰が敗北し、そして地域がどのような姿になるかを決定します。完全なゲームの状態仕様を持つ8つのビート：フラグ名、アセット要件、合格/不合格のテスト基準、実装チェックリスト。

デモのすべてのフレームは、追加のドキュメントなしで、RPG エンジンでクエストとして実装可能です。

ルート: `/storyboards/quest-01`

---

## ドキュメント

- [`docs/architecture.md`](docs/architecture.md) — パッケージの分離、依存関係ルール、キャンバスのビューポートモデル、プロジェクトのストレージ境界、拡張性
- [`docs/product-brief.md`](docs/product-brief.md) — rpg-storyboard とは何か、対象ユーザー、注意点、受け入れ基準
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — RPG ゲーム制作契約、完全な制作ループ (フェーズ 2)、実現可能性モデル、引き継ぎエクスポート
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — フェーズ 2 の主要なストーリー、アーキテクチャの整合性記録、意図的な除外事項
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — フェーズ 1 の主要なストーリーとアーキテクチャの整合性記録
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — フェーズ 0 の検証結果と、当初のフェーズ 1 のバックログ
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — モノレポ移行ログ：何が移動し、なぜ移動したのか、そしてその結果得られたアーキテクチャ
- [`CHANGELOG.md`](CHANGELOG.md) — リリース履歴
