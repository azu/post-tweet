# X Web Intent 移行設計

## 背景

現状 post-tweet の Twitter 投稿は `twitter-api-v2` を用いた API 経由で実装されている。Twitter API のレート制限・認証コストを回避するため、X 投稿を [Web Intent](https://x.com/intent/tweet) 方式に切り替える。Bluesky は引き続き API 投稿を維持する。

## ゴール

- X への投稿を API 経由から Web Intent (`https://x.com/intent/tweet?text=...`) に切り替える
- Cmd+Shift+Enter で投稿実行時に、Bluesky は API、X はブラウザで Intent URL を開く
- Twitter API 関連の認証情報 (appKey/appSecret/accessToken/accessSecret/reply_settings) を設定から削除する

## 非ゴール

- Bluesky の動作変更
- 投稿テンプレート (`%desc% %quote% "%title%" %url% %tags%`) の変更
- URL Scheme (`post-tweet://`) の挙動変更

## 変更内容

### 1. TwitterClient (`src/renderer/services/twitter/TwitterClient.js`)

- `twitter-api-v2` の `import` と `_getClient()` を削除
- `serviceOptions` の認証情報チェックを削除し、`isLogin()` は常に `true` を返す
- `loginAsync(callback)` は `callback()` (エラーなし) を呼ぶ no-op に変更
- `postLink(options)`:
  - `tweet-truncator` で本文を整形(現状維持)
  - `https://x.com/intent/tweet?text=<encodeURIComponent(status)>` を構築
  - `electron` の `shell.openExternal(url)` でデフォルトブラウザを開く
  - 戻り値は `Promise.resolve()`(既存呼び出し側の `Promise.all` に対応)

### 2. 設定ファイル

- `src/renderer/service.example.js`:
  - twitter の `options` を `{}` (もしくは丸ごと削除) に変更
  - コメントから API キー取得手順を削除
- `src/renderer/service.js`:
  - 同様に twitter `options` を空に
  - コミットされている既存値があれば API キー記述を削除

### 3. 依存関係 (`package.json`)

- `dependencies` から `twitter-api-v2` を削除
- `pnpm-lock.yaml` も連動して更新

### 4. README

- Twitter のセクションを書き換え:
  - API キー取得手順を削除
  - 「X 投稿は Web Intent でブラウザを開く方式」と説明
  - 設定例を `{ enabled: true, name: "twitter", indexPath: ... }` のみに

### 5. ビルド成果物 (`lib/`)

- `pnpm build` で再生成される。リポジトリにコミット済みなら再ビルド後に同梱する。

## アーキテクチャ

```
[App.postLink()]
    └─ ServiceAction.postLink(services, postData)
         ├─ TwitterClient.postLink()  →  shell.openExternal(intentURL)  [browser]
         └─ BlueskyClient.postLink()  →  AT Protocol API call           [network]
```

両 Client の `postLink` は Promise を返す。`Promise.all` で完了を待ち、ウィンドウを hide する既存挙動は維持する。

## エラーハンドリング

- `shell.openExternal` が拒否される (極めて稀) 場合は Promise reject。`ServiceAction.postLink` 既存の `.catch(console.error)` で握りつぶす(現状維持)。
- 認証エラー系のロジックは Twitter 側に存在しなくなるため削除。

## テスト

このリポジトリには自動テストがないため、手動検証のみ:

1. `pnpm dev` で起動し、テキストを入力 → Cmd+Shift+Enter
2. デフォルトブラウザで `https://x.com/intent/tweet?text=...` が開くことを確認
3. Bluesky を `enabled: true` にした場合、API 投稿が実行されることを確認
4. テキストが `tweet-truncator` で整形されていることを確認(URL/タイトル/タグが含まれる)

## ロールバック

`twitter-api-v2` を再度依存に追加し、`TwitterClient.js` を従来版に戻すことで戻せる。Git の履歴から復元可能。
