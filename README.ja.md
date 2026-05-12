<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS — Visual Stories. Structured. Implemented." width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>


---

インタラクティブな物語の作成プラットフォーム。クエスト、キャンペーン、 cinematics（映画のような演出）、そしてそれらを繋ぐ制作ロジックを視覚的に構築できます。

**3つの分野、1つのプラットフォーム:**

| 分野 | 領域 |
|---|---|
| `rpg-storyboard` | RPGのクエスト/ゲームの物語 — 実装可能なコンテンツ作成 |
| `marketing-storyboard` | キャンペーンの開始 — 開始準備完了 + クリティカルパス |
| `cinematic-storyboard` | 予告編/カットシーン/解説動画 — 制作のためのストーリーボード |

これらはすべて製品であり、デモではありません。互いにデータを取り込むことはできません。

---

## Storyboard OSとは

**実装可能な物語**を設計するための構造化されたボードです。キャンバス上の各フレームは、以下の要素を持つ「ビート」（物語の構成要素）です。
- 開始条件と終了条件
- 状態変化（フラグ、変数、ゲームの世界の状態）
- 制作に必要なアセット
- テスト基準（合格/不合格チェック）
- 実装チェックリスト

このボードは、単なる物語の順番だけでなく、ゲームの状態の流れを視覚化します。接続には意味があり、選択肢の分岐、結果の連鎖、物語の骨格、代替ルートなどを表現できます。デザイナーはボードを見ることで、ゲームが実際に何をするのかを理解できます。

## Storyboard OSではないもの

- 一般的な図表作成ツールまたはホワイトボードツール
- セッションランナーまたはゲームマスター支援ツール
- 世界観構築ウィキまたはロアデータベース
- 会話ツリーのみを編集するツール
- キャンペーン準備アプリ

もし、このツールが上記のいずれかに誤解される場合、製品の方向性が間違っている可能性があります。

---

## rpg-storyboardの機能（フェーズ2）

フェーズ2以降、デザイナーはブラウザから離れることなく、プロジェクト全体を最初から最後まで作成し、他のチームに引き継ぐことができます。

| 機能 | 得られるもの |
|---|---|
| **Project creation** | テンプレートから名前付きプロジェクトを作成。ボードの位置と編集内容はlocalStorageに保存されます。 |
| **Visual board** | Konvaキャンバス上で、クエストの流れとゲームの状態の分岐ロジックを並べて表示。 |
| **Beat editing** | ボード上で、各ビートのタイトル、概要、およびすべての実装仕様項目を直接編集可能。 |
| **Progress tracking** | 各ビートのチェックリスト項目とテスト基準をチェック。状態はリロード後も保持されます。 |
| **Game-state signal** | 各フレームに、状態を示すバッジ（STATE、SPEC/PARTIAL/DRAFT）を表示（ボードから離れる必要なし）。 |
| **Implementation readiness** | 各ビートの状態（READY/PARTIAL/DRAFT/BLOCKED）と、不足している要素を表示。 |
| **Project handoff** | ライブプロジェクトの状態から再生成。編集されたコンテンツ、各ビートの進捗状況、変更履歴などが含まれます。 |
| **Quest handoff** | テンプレートのプレビューボード用の静的なMarkdown + JSONエクスポート。 |
| **Templates** | ビートの種類と理由が設定された、RPG制作の開始点となる3つのサンプル。 |
| **Board operations** | ズーム、パン、ボード全体表示、リセット、キーボードショートカット — ノートパソコンでも使いやすいナビゲーション。 |

ボードはコンテンツを作成するためのインターフェースです。ビートインスペクタは、編集可能な実装仕様です。引き継ぎは、実際のプロジェクトの状態から生成されたドキュメントであり、静的なスナップショットではありません。

### フェーズ1の機能（現在も利用可能）

フェーズ1では、読み取り専用のプレビュー機能が確立されました。具体的には、キャンバスのレンダリング、ゲームの状態の表示、実装の準備状況モデル、クエストの引き継ぎエクスポート、テンプレートギャラリー、およびボードのナビゲーションが含まれます。フェーズ1のすべての機能は、フェーズ2によって拡張されています。

---

## パッケージ

| パッケージ | 含まれるもの |
|---|---|
| `@storyboard-os/core` | 一般的なストーリーボードの基本要素：フレーム、接続（型を汎用的に指定）、注釈、テンプレート、構造検証ツール。各領域は、独自の接続語彙を定義します。 |
| `@storyboard-os/rpg-domain` | RPGゲーム作成用契約：フレームの種類、コンテンツ項目、テンプレート、実装準備状況モデル、引き継ぎ生成ツール、Tollhouse Ledgerのデモクエスト。 |
| `@storyboard-os/marketing-domain` | マーケティングキャンペーンの実装用契約：フレームの種類（オーディエンス、メッセージ、タッチポイント、アセット、承認、キャンペーン開始イベント、効果測定）、キャンペーンの準備状況モデル、クリティカルパス、承認ゲート、効果測定ループ、キャンペーン概要エクスポート、デモキャンペーン。 |
| `@storyboard-os/cinematic-domain` | Cinematic制作契約：9種類のフレーム、カメラワーク、VFX/オーディオ/連続性に関する要件、制作状況（健全性、負荷、複雑さ、未撮影シーン）、制作概要の引き継ぎ、3つのテンプレート、デモトレーラーのシーケンス。 |
| `@storyboard-os/canvas` | Konvaキャンバスレンダラー：フレーム、接続、選択、ドラッグ、タイプバッジ、接続ラベル、ズーム/パンビューポート。ドメイン設定が渡されます。 |
| `@storyboard-os/routing` | 設定可能なURLヘルパー：ボードとフレームのルート生成。依存関係はありません。 |

## アプリケーション

| アプリケーション | 概要 |
|---|---|
| `rpg-storyboard` | Astro RPGゲーム制作ツール。以下の機能を提供：RPGキャンバス設定、フレームインスペクター、引き継ぎページ、テンプレートギャラリー、ルート設定、ページレイアウト。 |
| `marketing-storyboard` | Astroキャンペーン実装ストーリーボード。以下の機能を提供：マーケティングキャンバス設定、キャンペーンボード、フレームインスペクター、ローンチ準備バッジ、クリティカルパスの強調表示、ローンチの障害パネル、キャンペーン概要の引き継ぎ。 |
| `cinematic-storyboard` | Astro cinematic制作ストーリーボード。以下の機能を提供：cinematicキャンバス設定、シーケンスボード、フレームインスペクター（カメラ/VFX/オーディオ/連続性）、制作状況パネル（健全性/負荷/複雑さ）、制作概要の引き継ぎ。 |

---

## アーキテクチャ

パッケージは、クリーンな依存関係のチェーンを形成します。

```
apps/rpg-storyboard
  → @storyboard-os/rpg-domain       (RPG game-authoring contract)
  → @storyboard-os/canvas           (Konva renderer, domain-configurable)
  → @storyboard-os/routing          (URL helpers)

apps/marketing-storyboard
  → @storyboard-os/marketing-domain  (marketing campaign-implementation contract)
  → @storyboard-os/canvas            (same canvas, different config)
  → @storyboard-os/routing           (URL helpers)

apps/cinematic-storyboard
  → @storyboard-os/cinematic-domain  (cinematic production contract)
  → @storyboard-os/canvas            (same canvas, different config)
  → @storyboard-os/routing           (URL helpers)

@storyboard-os/rpg-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/marketing-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/cinematic-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/canvas
  → (no platform deps — pure Konva + React)

@storyboard-os/routing
  → (no deps — pure string helpers)

@storyboard-os/core
  → (no deps)
```

4つ目のモジュールは、独自のドメインパッケージを作成し、`@storyboard-os/core`、`@storyboard-os/canvas`、および`@storyboard-os/routing`を再利用します。既存のドメインパッケージには一切触れません。現在、3つのモジュールがこのパターンを実証しています。キャンバス、コア、またはルーティングに対する変更はゼロです。

詳細については、[`docs/architecture.md`](docs/architecture.md) を参照してください。

---

## クイックスタート

<!-- AUTOGEN-NOTE: スナップショット値（649テスト、54ページ）は手動で更新されます。
以下のコマンドで確認してください：pnpm test (テスト数)、pnpm -r build (ページ数)。
これらのスナップショットが保存されている場所については、docs/snapshot-checklist.md を参照してください。 -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (649 tests)
pnpm build      # builds all 3 apps (54 pages)
pnpm verify     # test + build in one command (ship gate)
```

要件：Node ≥ 20, pnpm ≥ 9。

テストの範囲は、自動的に `@storyboard-os/*` パッケージと `rpg-storyboard` に限定されます。親ディレクトリにある他のワークスペースは含まれません。

---

## 信頼モデル

Storyboard OSは、**ローカルブラウザアプリケーション**です。サーバー、アカウント、ネットワーク接続は不要です。

- **アクセスするデータ:** プロジェクトデータ（ビート仕様、ボードの位置、チェックリストの進捗状況）は、ユーザーのローカルマシン上のブラウザの `localStorage` にのみ保存されます。
- **アクセスしないデータ:** 認証情報、支払い情報、ビート仕様のフィールドに入力された個人データ以外の情報は一切アクセスしません。
- **実行時にネットワークリクエストは行われません。** このアプリケーションは静的なサイトです。初期ページ読み込み後、ネットワーク接続は一切行われません。
- **テレメトリーは一切収集または送信されません。**

詳細については、[`SECURITY.md`](SECURITY.md) を参照してください。

---

## ステータス

<!-- AUTOGEN-NOTE: 以下のスナップショット値（649テスト、54ページ、6パッケージ、3アプリケーション）は
手動で更新されます。以下のコマンドで確認してください：
pnpm test                       # テストが成功
pnpm -r build                   # ページがビルドされる（Astroの出力からページ数を取得）
ls packages/ | wc -l            # パッケージ数
ls apps/ | wc -l                # アプリケーション数
これらのスナップショットが保存されているドキュメントの場所については、docs/snapshot-checklist.md を参照してください。 -->

```
Phase 2 complete + Marketing Phase 0 complete + Cinematic Phase 0 complete + Core Hardening 1A
649/649 tests passing
54/54 pages built
6 packages · 3 apps
```

| フェーズ | 説明 | ステータス |
|---|---|---|
| 0A–0F | RPG制作の検証：キャンバス、ビートページ、テンプレート、デモクエスト | ✅ |
| 0R | 修正と再アンカー：すべてのフレームがゲームの状態仕様を保持 | ✅ |
| 0M | モノレポへの移行：コア、ドメイン、キャンバス、ルーティングを分離 | ✅ |
| 1A | キャンバス上のブランチと状態の可視化 | ✅ |
| 1B | 各ビートの実装準備 | ✅ |
| 1C | クエストの引き継ぎエクスポート | ✅ |
| 1D | テンプレートギャラリー | ✅ |
| 1E | ボード操作：ズーム、パン、全体表示、ビューポートコントロール | ✅ |
| 1F | リリース完了時の対応：ドキュメント、変更履歴、アーキテクチャに関する記述 | ✅ |
| 2A | テンプレートからのプロジェクト作成：localStorageによる永続化 | ✅ |
| 2B | プロジェクトごとのボードの状態の永続化 | ✅ |
| 2C | 編集可能なビートの内容：仕様フィールドはリロード後も保持される | ✅ |
| 2D | チェックリスト/進捗状況の永続化：仕様テキストとは別に管理 | ✅ |
| 2E | プロジェクトの引き継ぎ：保存されたプロジェクトの状態から再生成 | ✅ |
| 2F | リリース完了時の対応：ドキュメント、変更履歴、アーキテクチャに関する記述 | ✅ |
| M-0A | マーケティング関連パッケージ：スキーマ、シグナル、テンプレート、検証、デモキャンペーン | ✅ |
| M-0B | マーケティングアプリケーション：Astroキャンペーンボード、フレームインスペクタ、引き継ぎ機能 | ✅ |
| M-0C | ローンチ準備シグナルレイヤー：クリティカルパス、承認プロセス、測定ループ | ✅ |
| M-0D | マーケティング関連の完了処理：ドキュメント、変更履歴、アーキテクチャの検証 | ✅ |
| C-0A | 映画制作関連パッケージ：スキーマ、カメラ言語、VFX/オーディオ、テンプレート、検証、デモ | ✅ |
| C-0B | 映画制作アプリケーション：Astroシーケンスボード、フレームインスペクタ、制作概要 | ✅ |
| C-0C | 制作シグナルレイヤー：状態、VFX/オーディオの負荷、カメラの複雑さ、撮影不能なシーン | ✅ |
| C-0D | 映画制作関連の完了処理：ドキュメント、変更履歴、アーキテクチャの検証 | ✅ |
| H-1A | セキュリティ強化：汎用的な接続タイプ、各ドメインが独自の語彙を使用 | ✅ |

---

## デモ

**The Tollhouse Ledger（トールハウスの記録）**：3つの派閥が同じ隠された記録を求めている。プレイヤーは、誰が勝利し、誰が敗北し、そして地域がどのように変化するかを決定する。完全なゲームの状態仕様を持つ8つのビート：フラグ名、アセット要件、合格/不合格のテスト基準、実装チェックリスト。

デモ内のすべてのフレームは、追加のドキュメントなしで、RPGエンジンのクエストとして実装可能。

パス：`/storyboards/quest-01`

---

## ドキュメント

- [`docs/architecture.md`](docs/architecture.md) — パッケージの分離、依存関係ルール、キャンバスビューポートモデル、プロジェクトストレージの境界、拡張性
- [`docs/product-brief.md`](docs/product-brief.md) — RPGストーリーボードとは何か、ターゲットユーザー、警告、許容基準
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — RPGゲーム作成契約、完全な作成ループ（フェーズ2）、準備状況モデル、引き継ぎエクスポート
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — マーケティングキャンペーン実装契約、ローンチ準備モデル、クリティカルパス、除外事項
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — 映画制作ストーリーボード、制作シグナル、カメラ言語、意図的な除外事項
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — 映画制作フェーズ0の主要なストーリー、許容基準、検証
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — マーケティングフェーズ0の主要なストーリー、許容基準、検証
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — フェーズ2の主要なストーリー、アーキテクチャの整合性記録、意図的な除外事項
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — フェーズ1の主要なストーリーとアーキテクチャの整合性記録
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — フェーズ0の評価と、オリジナルのフェーズ1のバックログ
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — 0Mへの移行ログ：何が移動したか、なぜ移動したか、そしてその結果として得られたアーキテクチャ
- [`CHANGELOG.md`](CHANGELOG.md) — リリース履歴
