<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS — Visual Stories. Structured. Implemented." width="550" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/storyboard-os/"><img src="https://img.shields.io/badge/landing-Pages-0ea5e9.svg" alt="Landing page" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/core"><img src="https://img.shields.io/npm/v/@storyboard-os/core.svg" alt="npm @storyboard-os/core" /></a>
</p>


---

インタラクティブな物語（クエスト、キャンペーン、シネマティックなど）のための、視覚的なストーリー構造作成プラットフォーム。これらは相互に接続され、その接続を管理する制作ロジックを含みます。

**3つの分野、1つのプラットフォーム：**

| 分野 | 領域 |
|---|---|
| `rpg-storyboard` | RPGクエスト／ゲームの物語 — 実装可能な形式での作成 |
| `marketing-storyboard` | キャンペーンの開始 — 開始準備 + 重要な経路 |
| `cinematic-storyboard` | 予告編／カットシーン／解説 — 制作段階のストーリーボード |

これら3つは製品であり、デモではありません。また、互いにデータをインポートすることはありません。

---

## Storyboard OSとは

**実装可能な物語**を設計するための構造化されたボード。キャンバス上のすべてのフレームは、以下の要素を持つシーンです。
- 開始条件と終了条件
- 状態の変化（フラグ、変数、ゲーム世界の状況）
- 制作段階に必要なアセット
- 合否判定を含むテスト基準
- 実装チェックリスト

このボードは、ストーリーのシーケンスだけでなく、ゲームの状態の流れを視覚化します。接続には意味があり、選択肢の分岐、結果の展開、シーケンスの骨格、代替経路などを表現します。デザイナーはボードを見るだけで、ゲームが実際にどのように機能するかを理解できます。

## Storyboard OSではないもの

- 汎用的な図表作成ツールやホワイトボードツール
- セッションの進行やゲームマスターの支援ツール
- 世界観の構築や伝承のデータベース
- 対話ツリーのみを編集するツール
- キャンペーンの準備アプリ

もし読者がこれを上記のいずれかと混同してしまうようなら、製品の方向性がずれていることになります。

---

## rpg-storyboardが実現すること（フェーズ2）

フェーズ2の後、デザイナーはブラウザから離れることなく、プロジェクトの開始から最終的な引き渡しまで、すべての作業を行うことができます。

| 機能 | 得られるもの |
|---|---|
| **Project creation** | テンプレートから名前付きのプロジェクトを作成。ボードの位置と編集内容はlocalStorageに保存されます。 |
| **Visual board** | クエストの流れとゲームの状態の分岐ロジックを、Konvaキャンバス上で並べて表示します。 |
| **Beat editing** | ボード上で、各シーンのタイトル、概要、およびすべての実装仕様フィールドを直接編集できます。 |
| **Progress tracking** | 実装チェックリストの項目と、各シーンのテスト基準をチェック。状態はリロード後も保持されます。 |
| **Game-state signal** | 各フレームにバッジ（STATE、SPEC/PARTIAL/DRAFT）を表示。ボードから離れる必要はありません。 |
| **Implementation readiness** | 各シーンには、READY/PARTIAL/DRAFT/BLOCKEDの状態と、不足しているものが表示されます。 |
| **Project handoff** | ライブプロジェクトの状態から再生成されます。編集されたコンテンツ、各シーンの進捗状況、およびソース情報が含まれます。 |
| **Quest handoff** | テンプレートプレビューボード用の、静的なMarkdown + JSONエクスポート。 |
| **Templates** | シーンタイプのシーケンスと根拠を含む、3つのRPG制作の開始点。 |
| **Board operations** | ズーム、パン、ボード全体への表示、リセット、キーボードショートカット — ラップトップで使いやすいナビゲーション。 |

ボードは作成のための表面です。シーンインスペクターは、編集可能な実装仕様です。引き渡しは、実際のプロジェクトの状態から生成されたドキュメントであり、静的なスナップショットではありません。

### フェーズ1の機能（引き続き利用可能）

フェーズ1では、読み取り専用のプレビュー機能が確立されました。これには、キャンバスのレンダリング、ゲームの状態のシグナル、実装の準備モデル、クエストの引き渡しエクスポート、テンプレートギャラリー、およびボードのナビゲーションが含まれます。フェーズ1のすべての機能は保持され、フェーズ2で拡張されています。

---

## パッケージ

| パッケージ | 所有するもの |
|---|---|
| `@storyboard-os/core` | 汎用的なストーリーボードのプリミティブ：フレーム、接続（タイプに依存しない）、注釈、テンプレート、構造検証ツール。各領域は、独自の接続語彙を所有します。 |
| `@storyboard-os/rpg-domain` | RPGゲーム作成の契約：フレームタイプ、コンテンツフィールド、テンプレート、準備モデル、引き渡しジェネレーター、Tollhouse Ledgerデモクエスト。 |
| `@storyboard-os/marketing-domain` | マーケティングキャンペーンの実装契約：フレームタイプ（オーディエンス、メッセージ、タッチポイント、アセット、承認、開始イベント、測定）、開始準備モデル、重要な経路、承認ゲート、測定ループ、キャンペーン概要のエクスポート、デモキャンペーン。 |
| `@storyboard-os/cinematic-domain` | シネマティック制作契約：9つのフレームタイプ、カメラの表現、VFX／オーディオ／連続性の要件、制作シグナル（健全性、負担、複雑さ、問題のあるショット）、制作概要の引き渡し、3つのテンプレート、デモ予告編シーケンス。 |
| `@storyboard-os/canvas` | Konvaキャンバスレンダラー：フレーム、接続、選択、ドラッグ、タイプバッジ、接続ラベル、ズーム／パンビューポート。ドメイン構成が渡されます。 |
| `@storyboard-os/routing` | 設定可能なURLヘルパー：ボードとフレームのルート生成。依存関係はありません。 |

## アプリケーション

| アプリケーション | その内容 |
|---|---|
| `rpg-storyboard` | Astro RPGゲーム作成製品。所有するもの：RPGキャンバス構成、フレームインスペクター、引き渡しページ、テンプレートギャラリー、ルート設定、ページレイアウト。 |
| `marketing-storyboard` | Astroキャンペーン実装ストーリーボード。所有するもの：マーケティングキャンバス構成、キャンペーンボード、フレームインスペクター、開始準備バッジ、重要な経路の強調表示、開始の障害パネル、キャンペーン概要の引き渡し。 |
| `cinematic-storyboard` | Astroシネマティック制作ストーリーボード。所有するもの：シネマティックキャンバス構成、シーケンスボード、フレームインスペクター（カメラ／VFX／オーディオ／連続性）、制作シグナルパネル（健全性／負担／複雑さ）、制作概要の引き渡し。 |

---

## アーキテクチャ

パッケージは、明確な依存関係チェーンを形成します。

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

4番目の分野を作成すると、独自のドメインパッケージを作成し、既存のドメインパッケージに触れることなく、`@storyboard-os/core`、`@storyboard-os/canvas`、および`@storyboard-os/routing`を再利用できます。3つの分野でこのパターンが証明されました。キャンバス、コア、またはルーティングに変更はありません。

詳細は、[`docs/architecture.md`](docs/architecture.md)を参照してください。

---

## クイックスタート

<!-- AUTOGEN-NOTE: Snapshot values (1413 tests, 63 pages) below are manually updated.
     Verify with: pnpm test (test count), pnpm -r build (page count).
     See docs/snapshot-checklist.md for every location that holds these snapshots. -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (1413 tests)
pnpm build      # builds all 3 apps (63 pages)
pnpm verify     # typecheck + test + build in one command (ship gate)
```

要件：Node ≥ 22.13、pnpm ≥ 11。

テストの範囲は、自動的に`@storyboard-os/*`パッケージと`rpg-storyboard`にフィルタリングされます。親ディレクトリ内の他のワークスペースは対象外です。

---

## 信頼モデル

Storyboard OSは、**ローカルのみのブラウザアプリケーション**（3つの分野）です。サーバー、アカウント、ネットワークへのデータ送信はありません。

- **アクセスされたデータ:** **RPGのみ** — ユーザーのデバイス上のブラウザ `localStorage` 内のプロジェクトデータ（ビートの仕様、ボードの位置、チェックリストの進捗）。マーケティングおよびシネマティック部門は、ハンドオフのエクスポート機能付きの静的なデモボードを使用しますが、本日は `localStorage` は使用しません。
- **アクセスされないデータ:** 認証情報、支払い情報、オペレーターが仕様フィールド（RPG）に入力する情報や、静的なデモコンテンツに作成された情報以外の個人データは一切使用しません。
- **実行時のネットワークリクエストはありません。** 各アプリケーションは静的なサイトです。最初のページ読み込み後、ネットワークへのアクセスは一切行われません。
- **テレメトリーは行いません。** データの収集や送信は行いません。

完全な信頼モデルと脆弱性報告については、[`SECURITY.md`](SECURITY.md) を参照してください。

---

## ステータス

<!-- AUTOGEN-NOTE: Snapshot values below (1413 tests, 63 pages, 6 packages, 3 apps) are
     manually updated. Verify with:
       pnpm test                       # tests passing
       pnpm -r build                   # pages built (count from Astro output)
       ls packages/ | wc -l            # package count
       ls apps/ | wc -l                # app count
     See docs/snapshot-checklist.md for every doc location that holds these. -->

```
v1.3.0 Feature Pass — gold templates, playlist, nest, engine adapters
1413/1413 tests passing
63/63 pages built
6 packages · 3 apps
```

| フェーズ | 説明 | ステータス |
|---|---|---|
| 0A–0F | RPGの作成の検証 — キャンバス、ビートページ、テンプレート、デモクエスト | ✅ |
| 0R | 修正と再アンカー — すべてのフレームにゲームの状態仕様が含まれる | ✅ |
| 0M | モノリポジトリへの移行 — コア、ドメイン、キャンバス、ルーティングを抽出 | ✅ |
| 1A | ブランチとキャンバス上の状態の可視化 | ✅ |
| 1B | ビートごとの実装の準備状況 | ✅ |
| 1C | クエストのハンドオフエクスポート | ✅ |
| 1D | テンプレートギャラリー | ✅ |
| 1E | ボード操作 — ズーム、パン、フィット、ビューポートコントロール | ✅ |
| 1F | リリース完了 — ドキュメント、変更履歴、アーキテクチャに関する注記 | ✅ |
| 2A | テンプレートからのプロジェクトの作成 — localStorageによる永続化 | ✅ |
| 2B | プロジェクトごとの永続的なボードの位置 | ✅ |
| 2C | 編集可能なビートコンテンツ — 仕様フィールドは再読み込み後も保持される | ✅ |
| 2D | チェックリスト/進捗の永続化 — 仕様テキストとは別に保存 | ✅ |
| 2E | プロジェクトのハンドオフ — 保存されたプロジェクトの状態から再生成 | ✅ |
| 2F | リリース完了 — ドキュメント、変更履歴、アーキテクチャに関する注記 | ✅ |
| M-0A | マーケティングドメインパッケージ — スキーマ、シグナル、テンプレート、検証、デモキャンペーン | ✅ |
| M-0B | マーケティングアプリの垂直方向 — Astroキャンペーンボード、フレームインスペクター、ハンドオフ | ✅ |
| M-0C | ローンチの準備状況シグナルレイヤー — 重要なパス、承認ゲート、測定ループ | ✅ |
| M-0D | マーケティング完了 — ドキュメント、変更履歴、アーキテクチャの検証 | ✅ |
| C-0A | シネマティックドメインパッケージ — スキーマ、カメラ言語、VFX/オーディオ、テンプレート、検証、デモ | ✅ |
| C-0B | シネマティックアプリの垂直方向 — Astroシーケンスボード、フレームインスペクター、制作概要 | ✅ |
| C-0C | 制作シグナルレイヤー — 健全性、VFX/オーディオの負担、カメラの複雑さ、問題のあるショット | ✅ |
| C-0D | シネマティック完了 — ドキュメント、変更履歴、アーキテクチャの検証 | ✅ |
| H-1A | コアの強化 — ジェネリックな接続タイプ、ドメインは独自の語彙を持つ | ✅ |
| v1.2.0 | 健全性の強化 — バリデーターは例外をスローしない、ストアの回復力 + localStorageのスキーマバージョン管理、デザイン トークンレイヤー、キーボード/スクリーンリーダーによるキャンバスへのアクセス、Astro 5 + CI依存関係監査ゲート | ✅ |
| v1.3.0 | 機能パス — 9つのゴールドテンプレート + SSGカタログ、シネマティックシーケンスプレイリスト `/reels/demo-launch-reel`、ネスト（`parentFrameId` + `collapsedIds`）、一方通行のエンジンアダプター、JSONスキーマのハンドオフ | ✅ |

---

## デモ

**「The Tollhouse Ledger」** — 3つの派閥が同じ隠された台帳を求めています。プレイヤーは、誰が勝つか、誰が負けるか、そしてこの地域が今後どのように見えるかを決定します。完全なゲームの状態仕様を持つ8つのビート：フラグの名前、アセットの要件、パス/フェイルのテスト基準、実装のチェックリスト。

デモ内のすべてのフレームは、追加のドキュメントなしで、RPGエンジンのクエストとして実装できます。

ルート：`/storyboards/quest-01`

**公開されたカタログ（SSG）：**

| 分野 | デモ | テンプレート |
|---|---|---|
| RPG | `/storyboards/quest-01` | `/storyboards/template-quest-flow`, `template-quest-branch`, `template-cutscene-beat` |
| マーケティング | `/campaigns/campaign-01` | `/campaigns/template-product_launch`, `template-campaign_funnel`, `template-content_to_conversion` |
| シネマティック | `/sequences/demo-launch-trailer` · リール `/reels/demo-launch-reel` | `/sequences/template-trailer-flow`, `template-cutscene-sequence`, `template-explainer-video` |

---

## ドキュメント

- [`docs/architecture.md`](docs/architecture.md) — パッケージの分離、依存関係ルール、キャンバスビューポートモデル、プロジェクトストレージ境界、拡張性
- [`docs/product-brief.md`](docs/product-brief.md) — rpg-storyboardとは何か、ターゲットユーザー、ドリフト警告、受け入れゲート
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — RPGゲーム作成の契約、完全な作成ループ（フェーズ2）、準備モデル、ハンドオフエクスポート
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — マーケティングキャンペーンの実装契約、ローンチの準備モデル、重要なパス、除外
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — シネマティック制作のストーリーボード、制作シグナル、カメラ言語、意図的な除外
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — シネマティックフェーズ0の主要なナラティブ、受け入れゲート、検証
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — マーケティングフェーズ0の主要なナラティブ、受け入れゲート、検証
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — フェーズ2の主要なナラティブ、アーキテクチャの整合性記録、意図的な除外
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — フェーズ1の主要なナラティブとアーキテクチャの整合性記録
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — フェーズ0のドッグフードの評価と、元のフェーズ1のバックログ
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — 0M移行ログ：何が移行されたか、その理由、およびその結果のアーキテクチャ
- [`CHANGELOG.md`](CHANGELOG.md) — リリース履歴
- [ランディングページ](https://mcp-tool-shop-org.github.io/storyboard-os/) · [ハンドブック](https://mcp-tool-shop-org.github.io/storyboard-os/handbook/)

---

<p align="center">Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
