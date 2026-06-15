# X Web Intent 移行 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Twitter API 投稿を廃止し、X Web Intent (`https://x.com/intent/tweet`) をブラウザで開く方式に切り替える。Bluesky API 投稿は維持する。

**Architecture:** `TwitterClient.postLink()` を `electron.shell.openExternal()` で X Intent URL を開く実装に変更。`tweet-truncator` での本文整形は維持。Twitter API 認証情報を設定/依存から削除。

**Tech Stack:** Electron, React (CodeMirror), `tweet-truncator`, `@atproto/api` (Bluesky のみ)

---

## File Structure

- Modify: `src/renderer/services/twitter/TwitterClient.js` — Web Intent 実装に置換
- Modify: `src/renderer/service.example.js` — twitter `options` を空に
- Modify: `src/renderer/service.js` — twitter `options` を空に (gitignore 対象だがローカル更新する)
- Modify: `package.json` — `twitter-api-v2` を依存から削除
- Modify: `pnpm-lock.yaml` — lockfile 更新
- Modify: `README.md` — Twitter セクションを Web Intent 説明に書き換え
- 残存: `src/renderer/services/twitter/TwitterSecrets.example.js` / `TwitterSecrets.js` (現状未参照だが、残してもよいなら触らない。Task 6 で確認)

## このプロジェクトのテスト事情

このリポジトリには自動テスト・lint・typecheck がない (`package.json` に `test` スクリプトなし)。各タスクは「変更内容」「動作確認手順」で進める。最終確認は `pnpm dev` を起動して挙動を目視する Task 7 で行う。

---

## Task 1: TwitterClient を Web Intent 実装に置換

**Files:**
- Modify: `src/renderer/services/twitter/TwitterClient.js` (全体置換)

- [ ] **Step 1: TwitterClient.js を以下の内容に置換**

```js
// LICENSE : MIT
"use strict";
import { truncate } from "tweet-truncator";
import { shell } from "electron";

export default class TwitterClient {
    constructor(serviceOptions) {
        this.serviceOptions = serviceOptions || {};
    }

    isLogin() {
        return true;
    }

    loginAsync(callback) {
        callback();
    }

    /**
     * Open X Web Intent in the default browser.
     * @param {{title?: string, url?: string, comment?: string, tags?: string[], quote?: string}} options
     * @returns {Promise<void>}
     */
    postLink(options = {}) {
        const { title, url, comment, tags, quote } = options;
        const contents = { title, url, desc: comment, tags, quote: quote || "" };
        const status = truncate(contents, {
            template: `%desc% %quote% "%title%" %url% %tags%`
        });
        const intentURL = `https://x.com/intent/tweet?text=${encodeURIComponent(status)}`;
        return shell.openExternal(intentURL);
    }
}
```

- [ ] **Step 2: 動作確認 (構文)**

Run: `node --check src/renderer/services/twitter/TwitterClient.js` は ESM のため失敗するので、代わりに `pnpm build` がエラーなく通ることで構文を確認する。
Run: `pnpm build`
Expected: エラーなく `lib/renderer/services/twitter/TwitterClient.js` が生成される

- [ ] **Step 3: コミット**

```bash
git add src/renderer/services/twitter/TwitterClient.js
git commit -m "refactor(twitter): X Web Intent でブラウザを開く実装に置換"
```

---

## Task 2: service.example.js から Twitter API 設定を削除

**Files:**
- Modify: `src/renderer/service.example.js`

- [ ] **Step 1: service.example.js を以下に置換**

```js
const path = require("path");
module.exports = [
    {
        enabled: true,
        name: "twitter",
        indexPath: path.join(__dirname, "services/twitter/index.js"),
        options: {}
    },
    {
        enabled: false,
        name: "bluesky",
        indexPath: path.join(__dirname, "services/bluesky/index.js"),
        options: {
            identifier: "<identifier>.bsky.social",
            appPassword: "<app password>"
        }
    }
];
```

- [ ] **Step 2: コミット**

```bash
git add src/renderer/service.example.js
git commit -m "chore: service.example.js から Twitter API 設定を削除"
```

---

## Task 3: service.js (ローカル設定) から Twitter API 設定を削除

**Files:**
- Modify: `src/renderer/service.js` (gitignore 対象)

- [ ] **Step 1: 現状の service.js を読み、twitter エントリの options を `{}` に書き換える**

twitter の `options` 内の `appKey` / `appSecret` / `accessToken` / `accessSecret` / `reply_settings` を削除し、`options: {}` のみにする。Bluesky 設定はそのまま残す。

- [ ] **Step 2: 動作確認**

Run: `pnpm build`
Expected: エラーなく完了

- [ ] **Step 3: コミット不要**

`service.js` は `.gitignore` 対象。コミットしない。

---

## Task 4: package.json から twitter-api-v2 を削除

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml` (自動更新)

- [ ] **Step 1: package.json の `dependencies` から `twitter-api-v2` の行を削除**

削除対象 (現状の package.json 49 行目):
```json
"twitter-api-v2": "^1.24.0"
```

直前の `"tweet-truncator": "^3.0.2",` の末尾カンマも調整する。

- [ ] **Step 2: lockfile を更新**

Run: `ni` (= `pnpm install`)
Expected: `pnpm-lock.yaml` から `twitter-api-v2` への参照が消える

- [ ] **Step 3: ビルド確認**

Run: `pnpm build`
Expected: エラーなく完了 (TwitterClient は import を削除済みのため)

- [ ] **Step 4: コミット**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: twitter-api-v2 依存を削除"
```

---

## Task 5: README.md を更新

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Twitter セクション (33-60 行目あたり) を以下に置換**

```markdown
### Twitter (X)

Twitter (X) への投稿は [X Web Intent](https://help.x.com/en/using-x/x-web-intents) を使用します。投稿時にデフォルトブラウザで `https://x.com/intent/tweet` が開き、ブラウザ側で X にログインして投稿します。API キーや認証情報は不要です。

```json5
{
  enabled: true,
  name: "twitter",
  indexPath: path.join(__dirname, "services/twitter/index.js"),
  options: {}
}
```
```

- [ ] **Step 2: 上部の Feature 箇条書きを必要に応じて調整**

`Post to Twitter` を `Post to Twitter (X) via Web Intent` に変更する。

- [ ] **Step 3: コミット**

```bash
git add README.md
git commit -m "docs: README を X Web Intent 方式に合わせて更新"
```

---

## Task 6: TwitterSecrets ファイルの整理

**Files:**
- Delete (要確認): `src/renderer/services/twitter/TwitterSecrets.example.js`
- Delete (要確認): `src/renderer/services/twitter/TwitterSecrets.js`

- [ ] **Step 1: 参照を確認**

Run: `grep -rn "TwitterSecrets" src/`
Expected: 出力なし。出力がある場合は参照を読み、削除可否を判断する。

- [ ] **Step 2: 参照がなければ削除**

```bash
git rm -f src/renderer/services/twitter/TwitterSecrets.example.js
# TwitterSecrets.js は .gitignore 対象なので rm のみ
rm -f src/renderer/services/twitter/TwitterSecrets.js
```

- [ ] **Step 3: ビルド確認**

Run: `pnpm build`
Expected: エラーなく完了

- [ ] **Step 4: コミット**

```bash
git add -A src/renderer/services/twitter/
git commit -m "chore: 未使用の TwitterSecrets ファイルを削除"
```

---

## Task 7: 手動動作確認

- [ ] **Step 1: 開発起動**

Run: `pnpm dev`
Expected: アプリ起動、テキスト入力欄にフォーカス

- [ ] **Step 2: X 投稿フロー確認**

操作: テキストを入力 → Cmd+Shift+Enter
Expected:
- デフォルトブラウザで `https://x.com/intent/tweet?text=<整形済みテキスト>` が開く
- 開発者ツールのコンソールにエラーがない
- `tweet-truncator` で整形されたテキスト (本文/タイトル/URL/タグ) が `text` パラメータに含まれる

- [ ] **Step 3: Bluesky 投稿フロー確認 (Bluesky を有効化している場合)**

操作: `service.js` で Bluesky を `enabled: true` にして再起動 → 投稿
Expected: AT Protocol 経由で Bluesky に投稿される (既存挙動維持)

- [ ] **Step 4: ウィンドウ hide 動作確認**

操作: 投稿後
Expected: `Promise.all` 完了後にウィンドウが hide される (既存挙動維持)

- [ ] **Step 5: 問題なければ完了**

問題があれば該当タスクに戻って修正。
