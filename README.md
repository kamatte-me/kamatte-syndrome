# かまって☆しんどろ〜む

> https://kamatte.me

plz kamatte me!!!

## 技術

- Jamstack
- [Next.js](https://nextjs.org/)

## インフラ

- Build / Hosting: [Vercel](https://vercel.com/)
- Headless CMS: [microCMS](https://microcms.io/)
- SNS連携
  ```
  Atom Feed -> IFTTT -> LINE Messaging API
                     -> Twitter
  ```

# 開発

みんなからのプルリク待ってるぜ！！！

## 必要なもの

- Node.js v14
- npm v6
- [microCMS](https://microcms.io/) のアカウント
  - と [型定義](./lib/microcms/model.ts) を見てデータ構造を完全再現するガッツ
- (Optional) [Vercel CLI](https://vercel.com/cli)

## 手順

1. 依存パッケージのインストール
   ```shell
   npm install
   ```
1. 環境変数定義
   - [型定義](./@types/globals.d.ts) を見て設定
   - or Vercel CLI をインストールしている場合は
     ```shell
     npm run vercel:env:pull
     ```
1. 開発サーバー起動
   ```shell
   npm run dev
   # or
   npm run vercel:dev
   ```

## デプロイ
- Push or Forkした場合はプルリクエスト でPreview環境にデプロイ
- `main`ブランチにマージされるとProduction環境にデプロイ
