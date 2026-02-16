# Hookah Heat Management

シーシャ店向けの台メンテナンス管理PWAアプリケーション

## 概要

このアプリケーションは、シーシャ店のスタッフが各台のメンテナンス状況を簡単に記録・追跡できるように設計されています。すす捨て、炭交換、調整などの作業を素早く記録し、経過時間を視覚的に確認できます。

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS (ネオンサイバーパンクテーマ)
- **データベース**: IndexedDB (Dexie.js)
- **PWA**: Next.js PWA機能、動的アイコン生成
- **アイコン**: lucide-react

## 主要機能

### セッション管理
- 1-9番台の選択
- フレーバー名の記録（履歴からの選択機能付き）
- セッションの追加・終了

### メンテナンス記録
- すす捨て（シアン）
- 炭交換（ピンク）
- 調整（パープル）
- 各操作のタイムスタンプ記録

### 経過時間の視覚化
- 自動更新（1分間隔）
- 10分超過: 黄色表示
- 15分超過: 赤色表示

### 詳細画面
- フレーバー・メモのインライン編集
- 履歴表示（最新10件）
- アイコン付きイベント表示

## アーキテクチャ設計

### ディレクトリ構造

```
app/
├── page.tsx                    # メイン画面（セッション一覧）
├── stands/[id]/page.tsx        # 詳細画面
├── layout.tsx                  # ルートレイアウト
├── globals.css                 # グローバルスタイル（ネオンカラー定義）
├── icon.tsx                    # PWAアイコン（動的生成）
├── apple-icon.tsx              # Appleアイコン（動的生成）
└── manifest.ts                 # PWAマニフェスト

lib/
├── db.ts                       # IndexedDB スキーマ定義
└── domain.ts                   # ビジネスロジック層
```

### データモデル

#### Stand（セッション）
```typescript
interface Stand {
  id: string;                   // UUID
  number: number;                // 台番号（1-9）
  flavor?: string;               // フレーバー名
  note?: string;                 // メモ
  status: 'active' | 'ended';    // セッション状態
  lastActionType?: 'create' | 'ash' | 'coal' | 'adjust';
  lastActionAt?: number;         // 最終操作時刻（Unix timestamp）
  endedAt?: number;              // 終了時刻
}
```

#### Event（履歴）
```typescript
interface Event {
  id: string;                    // UUID
  standId: string;               // 関連するStandのID
  type: 'create' | 'ash' | 'coal' | 'adjust' | 'note' | 'end';
  at: number;                    // 発生時刻（Unix timestamp）
  memo?: string;                 // メモ（オプション）
}
```

### レイヤー構造

1. **UIレイヤー** (`app/`)
   - React Serverコンポーネントとクライアントコンポーネント
   - すべてのページは `'use client'` ディレクティブを使用
   - リアルタイム更新のための `useState` + `useEffect`

2. **ドメイン層** (`lib/domain.ts`)
   - ビジネスロジックの集約
   - データベース操作の抽象化
   - 主要関数:
     - `createStand()`: セッション作成 + 初期イベント記録
     - `recordAction()`: メンテナンス操作記録
     - `endSession()`: セッション終了
     - `updateStandFlavor()`, `updateStandNote()`: インライン編集
     - `getAllFlavors()`: フレーバー履歴取得

3. **データアクセス層** (`lib/db.ts`)
   - Dexieによるスキーマ定義
   - IndexedDB操作

## デザインシステム

### ネオンカラーパレット

```css
.neon-cyan { color: #22d3ee; }         /* すす捨て */
.neon-pink { color: #ec4899; }         /* 炭交換 */
.neon-purple { color: #a855f7; }       /* 調整 */
.neon-green { color: #22c55e; }        /* フレーバー名 */

.neon-border-cyan { border-color: #22d3ee; }
.neon-border-pink { border-color: #ec4899; }
.neon-border-purple { border-color: #a855f7; }
```

### UI原則

1. **一貫性**: すべてのボタンとアイコンに同じネオンカラーを使用
2. **視認性**: 経過時間の色分けで緊急度を一目で把握
3. **効率性**: クイックアクションボタンで1タップでメンテナンス記録
4. **モバイルファースト**: PWAとしてホーム画面に追加可能

## 実装の重要ポイント

### 1. リアルタイム更新

```typescript
// 1分ごとに経過時間を自動更新
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(Date.now());
  }, 60000);
  return () => clearInterval(timer);
}, []);
```

### 2. 経過時間の色分け

```typescript
const elapsed = stand.lastActionAt
  ? Math.floor((currentTime - stand.lastActionAt) / 60000)
  : null;
const colorClass = elapsed === null ? ''
  : elapsed > 15 ? 'text-red-400 font-semibold'
  : elapsed > 10 ? 'text-yellow-400 font-semibold'
  : '';
```

### 3. トランザクション整合性

セッション作成時に Stand と Event を同時に作成:

```typescript
await db.stands.add(stand);
await db.events.add(event);
```

### 4. ソート

台番号順にソート（アクティブセッションのみ）:

```typescript
stands.sort((a, b) => a.number - b.number);
```

## PWA設定

### マニフェスト (`app/manifest.ts`)

- **name**: Hookah Heat Management
- **short_name**: HeatMemo
- **display**: standalone
- **theme_color**: #0f172a（ダークブルー）
- **orientation**: portrait-primary

### アイコン生成

動的に生成されるアイコン:
- `/icon?size=192`: 192x192 PWAアイコン
- `/apple-icon?size=180`: 180x180 Appleアイコン

## 開発ガイドライン

### コミット規約

- feat: 新機能追加
- fix: バグ修正
- style: スタイリング変更
- refactor: リファクタリング
- Co-Authored-By: Claude <noreply@anthropic.com> を含める

### スタイリング原則

1. 既存のネオンカラーパレットを使用
2. hover状態には `transition-colors` または `transition-all` を適用
3. ボタンには `neon-border-*` クラスを使用
4. アイコンサイズ: 大ボタン24px、インライン14px、ナビゲーション18px

### データ操作原則

1. すべてのデータベース操作は `lib/domain.ts` を経由
2. UIコンポーネントで直接 `db` をインポートしない
3. エラーハンドリングは console.error で記録

## ビルド & デプロイ

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクション起動
npm start
```

## ブラウザ対応

- Chrome/Edge (推奨)
- Safari (iOS PWA対応)
- Firefox

IndexedDB対応ブラウザが必要です。

## 今後の拡張可能性

- [ ] データエクスポート機能（CSV/JSON）
- [ ] 統計ダッシュボード
- [ ] 通知機能（15分超過時）
- [ ] マルチ店舗対応
- [ ] クラウド同期

## ライセンス

MIT

## 開発者向けメモ

### Next.js 15 注意点

- `viewport` は `metadata` から分離して export する
- `maximumScale: 1` でズーム無効化（モバイルUX向上）

### IndexedDB デバッグ

Chrome DevTools > Application > IndexedDB > HookahHeatManagement

### PWA テスト

1. localhost:3000 でアクセス
2. Chrome: 「アプリをインストール」
3. iOS Safari: 「ホーム画面に追加」
