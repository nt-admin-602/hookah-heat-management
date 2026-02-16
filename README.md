# 熾火守（オキビモリ） - Hookah Heat Management

シーシャ店向けの台メンテナンス管理PWAアプリケーション

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 📖 ドキュメント

- **[コンセプト](docs/CONCEPT.md)** - プロジェクトの背景、ユースケース、デザインフィロソフィー
- **[仕様書](docs/SPECIFICATION.md)** - 機能仕様、データモデル、デザイン仕様
- **[テスト仕様](e2e/TEST_SPEC.md)** - E2Eテストシナリオと検証項目

## ✨ 主要機能

- 🎯 **ワンタップ記録**: すす捨て・炭交換・調整を素早く記録
- ⏱️ **経過時間の視覚化**: 10分超過で黄色、15分超過で赤色表示
- 📱 **PWA対応**: ホーム画面に追加してオフラインで利用可能
- 📊 **履歴管理**: 各台のメンテナンス履歴を自動保存
- 🎨 **ネオンUI**: 暗い店内でも見やすいサイバーパンクデザイン

## 🚀 クイックスタート

### 前提条件

- Node.js 20以上
- npm または yarn

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/hookah-heat-management.git
cd hookah-heat-management

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開いて確認してください。

### プロダクションビルド

```bash
# ビルド
npm run build

# 起動
npm start
```

## 🧪 テスト

### 単体テスト

```bash
# すべてのテストを実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジレポート
npm run test:coverage
```

**テスト対象:**
- ユーティリティ関数（時間計算、フォーマット）
- 再利用可能コンポーネント（ActionTypeDisplay、ElapsedTimeDisplay、ConfirmationModal）
- 100%の関数カバレッジを達成

### E2Eテスト

```bash
# Playwrightをセットアップ（初回のみ）
npx playwright install

# E2Eテストを実行
npm run test:e2e

# UIモード（デバッグ用）
npm run test:e2e:ui

# ヘッド付きモード
npm run test:e2e:headed
```

**テストカバレッジ:**
21テスト（初期表示、セッション管理、クイックアクション、詳細画面、PWA機能など）

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| データベース | IndexedDB (Dexie.js) |
| テスト | Jest, React Testing Library, Playwright |
| アイコン | lucide-react |

## 📁 プロジェクト構造

```
hookah-heat-management/
├── app/                      # Next.js App Router
│   ├── page.tsx             # メイン画面（セッション一覧）
│   ├── stands/[id]/         # 詳細画面
│   ├── layout.tsx           # ルートレイアウト
│   ├── globals.css          # グローバルスタイル
│   └── manifest.ts          # PWAマニフェスト
├── components/              # 再利用可能コンポーネント
│   ├── stand/              # セッション関連コンポーネント
│   └── ui/                 # UIコンポーネント
├── lib/                     # ビジネスロジック
│   ├── db.ts               # IndexedDB スキーマ
│   ├── domain.ts           # ドメインロジック
│   └── utils/              # ユーティリティ
├── docs/                    # ドキュメント
│   ├── CONCEPT.md          # コンセプト
│   └── SPECIFICATION.md    # 仕様書
└── e2e/                     # E2Eテスト
```

## 🎨 デザインシステム

### ネオンカラーパレット

| 用途 | カラー | コード |
|-----|-------|--------|
| すす捨て | シアン | `#22d3ee` |
| 炭交換 | ピンク | `#ec4899` |
| 調整 | パープル | `#a855f7` |
| フレーバー | グリーン | `#22c55e` |
| 追加 | イエロー | `#fbbf24` |
| 警告 | レッド | `#ef4444` |

詳細は [仕様書](docs/SPECIFICATION.md#デザイン仕様) を参照してください。

## 🔧 開発ガイドライン

### コミット規約

```
<type>: <subject>

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Type:**
- `feat`: 新機能追加
- `fix`: バグ修正
- `style`: スタイリング変更
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `docs`: ドキュメント更新

### コーディング規約

1. **DRY原則**: 重複コードは共通化
2. **型安全**: TypeScriptの型を最大限活用
3. **コンポーネント分割**: 責務ごとに適切に分割
4. **アクセシビリティ**: セマンティックHTMLとARIAラベル
5. **テスト**: 新機能には必ずテストを追加

### データベース操作

- ✅ `lib/domain.ts` の関数を使用
- ❌ UIコンポーネントで直接 `db` をインポートしない

### スタイリング

- 既存のネオンカラーパレットを使用
- hover状態には `transition-colors` を適用
- アイコンサイズ: 大ボタン24px、インライン14px

## 🌐 ブラウザ対応

- Chrome/Edge (推奨)
- Safari (iOS PWA対応)
- Firefox

**必須機能:**
- IndexedDB サポート
- ES2020+ サポート

## 🐛 デバッグ

### IndexedDB

Chrome DevTools > Application > IndexedDB > `HookahHeatManagement`

### PWAテスト

1. `localhost:3000` でアクセス
2. Chrome: 「アプリをインストール」をクリック
3. iOS Safari: 共有アイコン > 「ホーム画面に追加」

## 🗺️ ロードマップ

### 現在（フェーズ1）✅
- 基本的なセッション管理
- メンテナンス記録機能
- 経過時間の視覚化
- PWA対応
- 包括的なテストスイート

### 次期（フェーズ2）🔜
- 📊 統計ダッシュボード
- 📤 データエクスポート（CSV/JSON）
- 🔔 プッシュ通知
- 🎨 カスタムテーマ

### 将来（フェーズ3）💭
- ☁️ クラウド同期
- 🏢 マルチ店舗対応
- 📈 AI最適化提案
- 👥 スタッフ間コミュニケーション

詳細は [コンセプト](docs/CONCEPT.md#今後の展望) を参照してください。

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 🔗 リンク

- [GitHub Repository](#)
- [Issue Tracker](#)
- [Changelog](CHANGELOG.md)

---

Made with ❤️ for Hookah Lounges
