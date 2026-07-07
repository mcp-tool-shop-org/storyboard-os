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


---

インタラクティブな物語（クエスト、キャンペーン、シネマティックなど）のためのビジュアルストーリー構造作成プラットフォーム。これらは相互に接続され、そのつながりを実現する制作ロジックを含みます。

**3つの分野、1つのプラットフォーム：**

| 分野 | ドメイン |
|---|---|
| `rpg-storyboard` | RPGクエスト／ゲームの物語 — 実装可能な形式での作成 |
| `marketing-storyboard` | キャンペーン開始 — 準備完了状態＋クリティカルパス |
| `cinematic-storyboard` | 予告編／カットシーン／解説動画 — 制作段階のストーリーボード |

これら3つは製品であり、デモではありません。互いにインポートすることはありません。

---

## Storyboard OSとは何か

**実装可能な物語**を設計するための構造化されたボード。キャンバス上のすべてのフレームは、以下の要素を持つシーンです。
- 開始条件と終了条件
- 状態の変化（フラグ、変数、ゲーム世界の状況）
- 制作段階に必要なアセット
- 合否判定を含むテスト基準
- 実装チェックリスト

このボードは、単なるストーリーのシーケンスだけでなく、ゲームの状態の流れを視覚化します。接続には意味があります。選択肢による分岐、結果につながる展開、物語の主要な流れ、代替経路などです。デザイナーはこのボードを見て、ゲームが実際にどのように機能するかを理解できます。

## Storyboard OSではないもの

- 汎用的な図表作成ツールやホワイトボードツール
- セッションランナーまたはGM（ゲームマスター）支援ツール
- 世界観構築のためのWikiやデータベース
- 対話ツリーのみを編集するエディター
- キャンペーン準備アプリ

読者がこれを上記のいずれかと混同してしまう場合、製品の方向性がずれていることになります。

---

## rpg-storyboardが実現すること（フェーズ2）

フェーズ2の後、デザイナーはブラウザを離れることなく、プロジェクトの開始から最終的な引き渡しまで、すべての作業を行うことができます。

| 機能 | 得られるもの |
|---|---|
| **Project creation** | テンプレートから名前付きのプロジェクトを作成します。ボードの位置と編集内容はlocalStorageに保存されます。 |
| **Visual board** | クエストの流れとゲームの状態の変化を、Konvaキャンバス上で並べて表示します。 |
| **Beat editing** | 任意のシーンのタイトル、概要、およびすべての実装仕様フィールドを、ボード上で直接編集できます。 |
| **Progress tracking** | 各シーンの実装チェックリスト項目とテスト基準を確認し、状態を保存します（リロード後も保持されます）。 |
| **Game-state signal** | 各フレームにバッジを表示します（STATE、SPEC／PARTIAL／DRAFT）。ボードから離れる必要はありません。 |
| **Implementation readiness** | 各シーンは、READY／PARTIAL／DRAFT／BLOCKEDの状態と、不足している要素を表示します。 |
| **Project handoff** | ライブプロジェクトの状態から再生成されます。編集されたコンテンツ、シーンごとの進捗状況、および情報源が含まれます。 |
| **Quest handoff** | テンプレートプレビューボード用の静的なMarkdown + JSONエクスポート機能。 |
| **Templates** | 3つのRPG制作の開始点（シーンタイプのシーケンスと根拠を含む）。 |
| **Board operations** | ズーム、パン、ボード全体への表示、リセット、キーボードショートカット — ラップトップで使いやすいナビゲーション。 |

このボードは作成のための表面です。シーンインスペクターは編集可能な実装仕様です。引き渡しは、実際のプロジェクトの状態から生成されたドキュメントであり、静的なスナップショットではありません。

### フェーズ1の機能（引き続き利用可能）

フェーズ1では、読み取り専用のプレビュー機能を確立しました。これには、キャンバスレンダリング、ゲームの状態シグナル、実装準備モデル、クエスト引き渡しエクスポート、テンプレートギャラリー、およびボードナビゲーションが含まれます。フェーズ1のすべての機能は保持され、フェーズ2で拡張されます。

---

## パッケージ

| パッケージ | 含まれるもの |
|---|---|
| `@storyboard-os/core` | 汎用的なストーリーボードプリミティブ：フレーム、接続（タイプに依存しない）、注釈、テンプレート、構造検証ツール。各ドメインは独自の接続語彙を持ちます。 |
| `@storyboard-os/rpg-domain` | RPGゲーム作成契約：フレームのタイプ、コンテンツフィールド、テンプレート、準備モデル、引き渡しジェネレーター、Tollhouse Ledgerデモクエスト。 |
| `@storyboard-os/marketing-domain` | マーケティングキャンペーン実装契約：フレームのタイプ（ターゲットオーディエンス、メッセージ、タッチポイント、アセット、承認、ローンチイベント、測定）、ローンチ準備モデル、クリティカルパス、承認ゲート、測定ループ、キャンペーン概要エクスポート、デモキャンペーン。 |
| `@storyboard-os/cinematic-domain` | シネマティック制作契約：9つのフレームタイプ、カメラの表現方法、VFX／オーディオ／連続性の要件、制作シグナル（健全性、負担、複雑さ、問題のあるショット）、制作概要引き渡し、3つのテンプレート、デモ予告編シーケンス。 |
| `@storyboard-os/canvas` | Konvaキャンバスレンダラー：フレーム、接続、選択、ドラッグ、タイプバッジ、接続ラベル、ズーム／パンビューポート。ドメイン設定が渡されます。 |
| `@storyboard-os/routing` | 構成可能なURLヘルパー：ボードとフレームのルート生成。依存関係はありません。 |

## アプリケーション

| アプリ | 概要 |
|---|---|
| `rpg-storyboard` | Astro RPGゲーム作成製品。含まれるもの：RPGキャンバス設定、フレームインスペクター、引き渡しページ、テンプレートギャラリー、ルート設定、ページレイアウト。 |
| `marketing-storyboard` | Astroキャンペーン実装ストーリーボード。含まれるもの：マーケティングキャンバス設定、キャンペーンボード、フレームインスペクター、ローンチ準備バッジ、クリティカルパスの強調表示、ローンチブロックパネル、キャンペーン概要引き渡し。 |
| `cinematic-storyboard` | Astroシネマティック制作ストーリーボード。含まれるもの：シネマティックキャンバス設定、シーケンスボード、フレームインスペクター（カメラ／VFX／オーディオ／連続性）、制作シグナルパネル（健全性／負担／複雑さ）、制作概要引き渡し。 |

---

## アーキテクチャ

これらのパッケージは、明確な依存関係チェーンを形成します。

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

4番目の分野を作成すると、独自のドメインパッケージが作成され、既存のドメインパッケージに触れることなく、`@storyboard-os/core`、`@storyboard-os/canvas`、および`@storyboard-os/routing`を再利用します。3つの分野でこのパターンが証明されています：キャンバス、コア、またはルーティングに変更はありません。

詳細については、[`docs/architecture.md`](docs/architecture.md)を参照してください。

---

## クイックスタート

<!-- AUTOGEN-NOTE: Snapshot values (937 tests, 54 pages) below are manually updated.
Verify with: pnpm test (test count), pnpm -r build (page count).
See docs/snapshot-checklist.md for every location that holds these snapshots. -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (937 tests)
pnpm build      # builds all 3 apps (54 pages)
pnpm verify     # typecheck + test + build in one command (ship gate)
```

要件：Node ≥ 20、pnpm ≥ 10。

テストの範囲は、`@storyboard-os/*` パッケージと `rpg-storyboard` に自動的に絞り込まれます。親ディレクトリ内の関連ワークスペースは対象外となります。

---

## 信頼モデル

Storyboard OS は **ローカル専用のブラウザアプリケーション** です。サーバー、アカウント、ネットワークへのデータ送信はありません。

- **アクセスされるデータ:** ユーザーのデバイス上のブラウザの `localStorage` に保存されているプロジェクトデータ（ビート仕様、ボードの位置、チェックリストの進捗）。
- **アクセスされないデータ:** 認証情報、支払い情報、デザイナーがビート仕様フィールドに入力する以外の個人データ。
- **実行時のネットワークリクエストはありません。** アプリは静的なサイトです。最初のページ読み込み後、ネットワークへの接続は一切行われません。
- **テレメトリー機能はありません。** データの収集や送信は行いません。

完全な信頼モデルと脆弱性報告については、[`SECURITY.md`](SECURITY.md) を参照してください。

---

## ステータス

<!-- AUTOGEN-NOTE: 以下のスナップショット値（937テスト、54ページ、6パッケージ、3アプリ）は手動で更新されます。次のコマンドで確認してください。
pnpm test                       # テストの実行結果
pnpm -r build                   # ビルドされたページの数（Astroの出力からカウント）
ls packages/ | wc -l            # パッケージの数
ls apps/ | wc -l                # アプリの数
これらの値が保存されているすべてのドキュメントの場所については、docs/snapshot-checklist.md を参照してください。 -->

```
Phase 2 + Marketing Phase 0 + Cinematic Phase 0 + Core Hardening 1A + v1.2.0 Health Hardening
937/937 tests passing
54/54 pages built
6 packages · 3 apps
```

| フェーズ | 説明 | ステータス |
|---|---|---|
| 0A–0F | RPG 制作のプロトタイプ — キャンバス、ビートページ、テンプレート、デモクエスト | ✅ |
| 0R | 修正と再アンカー — すべてのフレームにゲームの状態仕様が含まれる | ✅ |
| 0M | モノリポジトリへの移行 — コア、ドメイン、キャンバス、ルーティングを分離 | ✅ |
| 1A | ブランチとキャンバス上の状態の可視化 | ✅ |
| 1B | ビートごとの実装準備状況 | ✅ |
| 1C | クエストハンドオフのエクスポート | ✅ |
| 1D | テンプレートギャラリー | ✅ |
| 1E | ボード操作 — ズーム、パン、フィット、ビューポートコントロール | ✅ |
| 1F | リリース完了 — ドキュメント、変更履歴、アーキテクチャに関する注記 | ✅ |
| 2A | テンプレートからのプロジェクト作成 — `localStorage` による永続化 | ✅ |
| 2B | プロジェクトごとのボード位置の永続化 | ✅ |
| 2C | 編集可能なビートコンテンツ — 仕様フィールドは再読み込み後も保持される | ✅ |
| 2D | チェックリスト/進捗状況の永続化 — 仕様テキストとは別に保存 | ✅ |
| 2E | プロジェクトハンドオフ — 保存されたプロジェクトの状態から再生成 | ✅ |
| 2F | リリース完了 — ドキュメント、変更履歴、アーキテクチャに関する注記 | ✅ |
| M-0A | マーケティングドメインパッケージ — スキーマ、シグナル、テンプレート、検証、デモキャンペーン | ✅ |
| M-0B | マーケティングアプリの垂直方向 — Astro キャンペーンボード、フレームインスペクター、ハンドオフ | ✅ |
| M-0C | ローンチ準備完了シグナルレイヤー — 重要なパス、承認ゲート、測定ループ | ✅ |
| M-0D | マーケティング完了 — ドキュメント、変更履歴、アーキテクチャの検証 | ✅ |
| C-0A | シネマティックドメインパッケージ — スキーマ、カメラ言語、VFX/オーディオ、テンプレート、検証、デモ | ✅ |
| C-0B | シネマティックアプリの垂直方向 — Astro シーケンスボード、フレームインスペクター、制作概要 | ✅ |
| C-0C | 制作シグナルレイヤー — 健全性、VFX/オーディオの負荷、カメラの複雑さ、問題のあるショット | ✅ |
| C-0D | シネマティック完了 — ドキュメント、変更履歴、アーキテクチャの検証 | ✅ |
| H-1A | コアの強化 — ジェネリックな接続タイプ、ドメインは独自の語彙を持つ | ✅ |
| v1.2.0 | 健全性の強化 — バリデーターによるエラー発生回避、ストアの堅牢性 + `localStorage` スキーマバージョニング、デザイン トークンレイヤー、キーボード/スクリーンリーダーによるキャンバスへのアクセス、Astro 5 + CI 依存関係監査ゲート | ✅ |

---

## デモ

**The Tollhouse Ledger** — 3つの派閥が同じ隠された台帳を狙っています。プレイヤーは誰が勝つか、誰が負けるか、そしてその地域の将来の姿を決定します。完全なゲーム状態仕様（フラグ名、アセット要件、パス/フェイルテスト基準、実装チェックリスト）を備えた8つのビートがあります。

デモ内のすべてのフレームは、追加のドキュメントなしで、RPGエンジンのクエストとして実装できます。

ルート: `/storyboards/quest-01`

---

## ドキュメント

- [`docs/architecture.md`](docs/architecture.md) — パッケージの分離、依存関係ルール、キャンバスビューポートモデル、プロジェクトストレージ境界、拡張性
- [`docs/product-brief.md`](docs/product-brief.md) — rpg-storyboardとは何か、ターゲットユーザー、ドリフト警告、受け入れゲート
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — RPGゲーム制作の契約、完全な制作ループ（フェーズ2）、準備完了モデル、ハンドオフのエクスポート
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — マーケティングキャンペーン実装の契約、ローンチ準備完了モデル、重要なパス、除外事項
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — シネマティック制作ストーリーボード、制作シグナル、カメラ言語、意図的な除外事項
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — シネマティックフェーズ0の主要なナラティブ、受け入れゲート、検証
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — マーケティングフェーズ0の主要なナラティブ、受け入れゲート、検証
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — フェーズ2の主要なナラティブ、アーキテクチャ整合性の記録、意図的な除外事項
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — フェーズ1の主要なナラティブとアーキテクチャ整合性の記録
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — フェーズ0の犬食いテストの結果と、元のフェーズ1のバックログ
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — 0M移行ログ：何が移動したか、その理由、および結果として得られたアーキテクチャ
- [`CHANGELOG.md`](CHANGELOG.md) — リリース履歴
