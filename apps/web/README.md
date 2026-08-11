# Webアプリケーション

[かまって☆しんどろ〜む](https://kamatte.me/)のWebアプリケーションです。TanStack Start / React / Viteを基盤に、Markdown・MDX・JSONで管理されるコンテンツをサイトとして配信します。

リポジトリ全体のセットアップと共通コマンドは、[ルートREADME](../../README.md)を参照してください。

## 主な構成

- TanStack StartによるSSR / React Server Components対応アプリケーション
- TanStack Routerのfile-based routing
- Tailwind CSS v4とCSS Modulesによるスタイリング
- Content CollectionsによるMarkdown / MDX / JSONコンテンツの型付き読み込み
- ビルド時のレスポンシブ画像・SNS用画像の最適化
- Vercel（Nitro経由）へのデプロイ

## ディレクトリ

```text
apps/web/
├── content-collections.ts           # コンテンツのスキーマと収集設定
├── kamatte-syndrome-content/        # ローカルで再現するコンテンツディレクトリ（Git管理外）
├── public/                          # そのまま配信する静的ファイル
├── scripts/sync-content.mjs         # Vercel用コンテンツ取得スクリプト
├── src/
│   ├── routes/                      # URL、loader、head、ページ構成
│   ├── features/                    # 機能ごとのUIとロジック
│   ├── components/                  # 複数機能で共有するUI
│   ├── assets/                      # 共有アセット
│   ├── constants/                   # アプリ全体の定数
│   ├── utils/                       # 汎用ユーティリティ
│   ├── router.tsx                   # ルーター設定
│   └── styles.css                   # グローバルスタイルとTailwind theme
├── vite.config.ts                   # Vite・TanStack Start・画像処理の設定
└── vercel.json                      # Vercelのインストール・ビルド設定
```

`src/routeTree.gen.ts`、`.content-collections/`、`.tanstack/`、`.output/` は生成物です。直接編集しないでください。

## ローカル開発

サイトコンテンツはPrivateリポジトリ`kamatte-syndrome-content`で管理しており、外部向けには提供していません。サイト全体を動かすには、[content-collections.ts](content-collections.ts)のFrontmatter・JSONのスキーマとファイル構成から、`kamatte-syndrome-content/`以下のファイルとメディア構成を完全に再現するガッツが必要です。

コンテンツディレクトリには、少なくとも`content/`と`media/`が必要です。必要なファイル構成とデータ形式は`content-collections.ts`を正とし、実コンテンツのcloneや`sync:content`は行えません。

ローカル用コンテンツを用意した後、リポジトリルートで次を実行します。

```sh
pnpm dev
```

開発サーバーは起動時に表示するローカルURLで確認できます。

## アプリ用コマンド

すべてリポジトリルートで実行します。

| コマンド | 内容 |
| --- | --- |
| `pnpm dev` | Vite開発サーバーを起動 |
| `pnpm --filter web build` | 本番用にビルド |
| `pnpm --filter web start` | `.output/server/index.mjs` を起動 |
| `pnpm --filter web build:analyze` | バンドル分析を有効にしてビルド |
| `pnpm --filter web typecheck` | アプリのTypeScript型チェック |
| `pnpm --filter web test` | Vitestテストを実行 |
| `pnpm --filter web sync:content` | Vercelのビルド環境でコンテンツをclone |
| `pnpm --filter web vercel:env:pull` | Vercelの環境変数を`.env.local`に取得 |

`sync:content`には非公開の`CONTENT_REPOSITORY_TOKEN`が必要で、外部のローカル環境では使用できません。既存の`kamatte-syndrome-content`ディレクトリを保護するため、ディレクトリがある状態では失敗します。

## コンテンツ

Content Collectionsの設定は[content-collections.ts](content-collections.ts)にあります。Privateリポジトリ内で管理される次のデータを読み込みます。ローカルでサイト全体を動かす場合は、この構造を再現してください。

| 種類 | 場所 |
| --- | --- |
| ブログ記事 | `content/posts/`のMarkdown / MDX |
| プロフィール | `content/biography.json` |
| スキル | `content/skills.json` |
| 利用規約・プライバシーポリシー | `content/terms.md`、`content/privacy_policy.md` |
| ポートフォリオ | `content/portfolio/`のMarkdown / MDX |
| Culture | `content/culture/`のMarkdown / MDX |
| メディア | `media/` |

`media/`の画像はViteプラグインで最適化され、サイトでは`/media/`を基準に参照します。

## 環境変数

`.env.local`はGit管理しません。必要な値だけを設定してください。

| 変数 | 用途 |
| --- | --- |
| `VITE_SHOW_UNPUBLISHED_CONTENT=1` | `publishedAt` が未来のブログ記事も表示する。`1` 以外または未設定では非表示 |
| `VITE_FACEBOOK_APP_ID` | Facebook App IDをページのメタデータに設定する（任意） |
| `VITE_GOOGLE_ANALYTICS_ID` | Google Analyticsの測定IDを設定する（任意） |
| `CONTENT_REPOSITORY_TOKEN` | Vercelが`sync:content`でコンテンツを取得するための非公開トークン |

`VITE_`接頭辞の変数はクライアントに公開されるため、秘密情報を設定しないでください。`CONTENT_REPOSITORY_TOKEN`はVercelの`sync:content`専用であり、クライアントコードからは参照しません。

## ルーティングとスタイル

- ページを追加する場合は`src/routes/`にroute fileを置き、`createFileRoute`を使います。`routeTree.gen.ts`は自動生成されます。
- 大きなUIは`src/features/<feature>/components/`に置き、route fileはページ構成・loader・headを担う薄い層に保ちます。
- まずTailwindのユーティリティを使い、複雑な見た目だけCSS Modulesに分離します。
- サイト全体の透過ステンシル演出は `src/components/layouts/GlobalLayout.tsx` と `GlobalLayout.module.css` が担います。変更時はアクセシビリティ、本文の可読性、メディア表示を確認してください。

## テストと品質チェック

アプリを変更したら、影響範囲に応じて次を実行します。

```sh
pnpm lint
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter web build
```

UIやルーティングを変更した場合は、必要に応じてブラウザでの直接アクセスとクライアント遷移の両方を確認します。

## デプロイ

VercelプロジェクトのRoot Directoryは`apps/web`です。[vercel.json](vercel.json)により、次の手順でデプロイされます。

1. `pnpm install --frozen-lockfile`
2. `pnpm sync:content`
3. `pnpm build`

Vercelにはコンテンツリポジトリを読める`CONTENT_REPOSITORY_TOKEN`を設定してください。CIではGitHub Appの短期トークンで同じコンテンツリポジトリをcheckoutしています。
