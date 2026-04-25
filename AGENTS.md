# AGENTS.md

このファイルは、このリポジトリで作業する AI エージェント向けの作業メモです。ユーザーから別途指示がある場合は、そちらを優先してください。

## プロジェクト概要

- `kamatte-syndrome` は TanStack Start / React 19 / Vite ベースのサイトです。
- ルーティングは TanStack Router の file-based routing です。ルートは `src/routes/` に置きます。
- 記事などのコンテンツは `@content-collections/*` で収集され、設定は `content-collections.ts` にあります。
- スタイルは Tailwind CSS v4 を基本に、Tailwind だけでは表現しにくい場合に CSS Modules を使います。グローバル CSS は `src/styles.css` です。
- デプロイ対象は Cloudflare Workers/Vite 構成です。`wrangler.jsonc` に Workers 設定があります。

## セットアップとコマンド

- パッケージマネージャーは `pnpm` です。`npm` や `yarn` の lockfile を追加しないでください。
- Node.js は `package.json` の `engines.node` に合わせて `24.x` を想定します。
- よく使うコマンド:
  - `pnpm dev`: 開発サーバー
  - `pnpm build`: 本番ビルド
  - `pnpm preview`: ビルド結果のプレビュー
  - `pnpm lint`: Biome によるチェック
  - `pnpm lint:fix`: Biome の自動修正
  - `pnpm typecheck`: TypeScript 型チェック
  - `pnpm test`: Vitest

変更後は、影響範囲に応じて `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` のうち必要なものを実行してください。

## コーディング規約

- TypeScript は `strict` 前提です。`any` や不要な型緩和は避けてください。
- import は `@/*` で `src/*`、`@@/*` でリポジトリルートを参照できます。
- Biome が整形と lint を担当します。基本は既存ファイルのスタイルに合わせてください。
- 文字列は Biome 設定に従い、TypeScript/TSX では single quote を使います。
- React コンポーネントは既存ルートと同じく関数コンポーネントで書いてください。
- ユーティリティ関数を変更した場合は、近いテストとして `src/utils/*.test.ts` を追加または更新してください。

## ルーティング

- `src/routes/` 配下のファイル構成が URL に対応します。
- ルートファイルでは `createFileRoute` を使います。
- ルートツリーの生成物である `src/routeTree.gen.ts` は直接編集しないでください。
- 共通の document shell や head 設定は `src/routes/__root.tsx` にあります。
- ルーター本体の設定は `src/router.tsx` にあります。

## コンテンツ

- Content Collections の設定は `content-collections.ts` です。
- `kamatte-syndrome-content/content` には Markdown または JSON のコンテンツが格納されています。
- `kamatte-syndrome-content/media` には画像などのメディアファイルが格納されています。
- `kamatte-syndrome-content/` は外部コンテンツ管理用のディレクトリです。このリポジトリの作業では編集しないでください。
- 記事は `kamatte-syndrome-content/content/posts` から読み込まれます。このパスはリポジトリ内では symlink になっている場合があります。
- 生成された `content-collections` 型や出力は手で編集せず、設定や元コンテンツを変更してください。
- 投稿の slug は現在 `src/utils/posts.ts` の `toPostSlug` で `_meta.path` をそのまま使います。URL 互換性に影響するため、変更する場合は既存リンクへの影響を確認してください。

## スタイルと UI

- スタイリングは Tailwind CSS のユーティリティを基本にしてください。Tailwind だけでは表現しにくい演出や複雑なスタイルが必要な場合は CSS Modules を使い、グローバル CSS は必要最小限にしてください。
- `src/styles.css` は Biome の includes から除外されています。編集後はブラウザ表示やビルドで確認してください。
- 既存の見た目は黒背景、白文字、半透明パネル、レトロ風エフェクトが基調です。新規 UI もこの雰囲気に合わせてください。
- `src/components/RetroEffects.tsx` と `RetroEffects.module.css` は全体演出に関わります。変更時はトップページと記事ページの両方を確認してください。

## 生成物と依存関係

- `dist/`、`.content-collections/`、`src/routeTree.gen.ts`、lockfile などの生成物は、必要がある場合だけ更新してください。
- 依存関係を追加する前に、既存の React / TanStack / Tailwind / lucide-react で解決できるか確認してください。
- lockfile を更新する場合は `pnpm install` を使ってください。

## 作業時の注意

- 既存の未コミット変更がある場合は、ユーザーの作業として扱い、勝手に戻さないでください。
- 外部サービスや現在の仕様に依存する変更では、必要に応じて公式ドキュメントを確認してください。
- 最終報告では、変更したファイル、実行した検証、未実行の検証があればその理由を簡潔に伝えてください。
