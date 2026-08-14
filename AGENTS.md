# AGENTS.md

このファイルは、このリポジトリで作業する AI エージェント向けの作業メモです。ユーザーから別途指示がある場合は、そちらを優先してください。

## プロジェクト概要

- `kamatte-syndrome` は TanStack Start / React 19 / Vite ベースのサイトです。
- pnpm workspace 構成です。Vite アプリ本体は `apps/web/`、共有パッケージは `packages/` にあります。
- ルーティングは TanStack Router の file-based routing です。ルートは `apps/web/src/routes/` に置きます。
- 記事などのコンテンツは `@content-collections/*` で収集され、設定は `apps/web/content-collections.ts` にあります。
- スタイルは Tailwind CSS v4 を基本に、Tailwind だけでは表現しにくい場合に CSS Modules を使います。グローバル CSS は `apps/web/src/styles.css` です。
- デプロイ対象は Vercel です。Vercel の Root Directory は `apps/web` を想定し、TanStack Start は Nitro 経由で Vercel にデプロイします。

## セットアップとコマンド

- パッケージマネージャーは `pnpm` です。`npm` や `yarn` の lockfile を追加しないでください。
- Node.js は `package.json` の `engines.node` に合わせて `24.x` を想定します。
- よく使うコマンド:
  - `pnpm dev`: `apps/web` の開発サーバー
  - `pnpm build`: `apps/web` の本番ビルド
  - `pnpm start`: `apps/web/.output` の Node サーバー起動
  - `pnpm lint`: Biome によるチェック
  - `pnpm lint:fix`: Biome の自動修正
  - `pnpm typecheck`: workspace 各 package/app の TypeScript 型チェック
  - `pnpm test`: workspace 各 package/app の Vitest

変更後は、影響範囲に応じて `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` のうち必要なものを実行してください。

## コーディング規約

- TypeScript は `strict` 前提です。`any` や不要な型緩和は避けてください。
- 共有 TypeScript 設定は `packages/tsconfig/` で管理します。`apps/web` は React 用、`apps/web/tsconfig.node.json` は `vite.config.ts` などの Node.js 用、共有 package は Browser 用の設定を継承します。
- `apps/web` 内の import は `@/*` で `apps/web/src/*`、`@@/*` で `apps/web/*` を参照できます。
- Biome が整形と lint を担当します。基本は既存ファイルのスタイルに合わせてください。
- 文字列は Biome 設定に従い、TypeScript/TSX では single quote を使います。
- React コンポーネントは既存ルートと同じく関数コンポーネントで書いてください。
- テストは対象ファイルと同じディレクトリに配置し、実装を変更した場合は対応するテストを追加または更新してください。

## `apps/web/src` のディレクトリ構成

- `routes/` はルーティング、loader、head、ページ全体の構成を担当します。機能固有の大きな UI や純粋な処理は置かず、ルートファイルを薄く保ってください。
- `components/` には複数の機能から使う共通 UI を置き、レイアウトは `components/layouts/`、汎用 UI は `components/ui/` に分類します。
- `utils/` には複数の機能から使う汎用関数を置きます。
- `constants/` にはアプリ全体で共有する値だけを置き、フォーマット関数や生成関数などの処理は置かないでください。
- `assets/` には複数の機能から使う静的アセットを置き、共通アイコンは `assets/icons/` に分類します。
- `features/<feature>/components/` には、その機能だけで使う UI コンポーネントを置きます。
- `features/<feature>/utils/` には、その機能だけで使う純粋関数を置きます。
- `features/<feature>/constants/` には、その機能だけで使う定数を置きます。
- `features/<feature>/assets/` には、その機能だけで使う画像や SVG などの静的アセットを置きます。
- 新しい実装はまず該当する機能内へ置き、複数の機能から利用されることが明確になった時点で `components/`、`utils/`、`constants/`、`assets/` へ移動してください。

## ルーティング

- `apps/web/src/routes/` 配下のファイル構成が URL に対応します。
- ルートファイルでは `createFileRoute` を使います。
- ルートツリーの生成物である `apps/web/src/routeTree.gen.ts` は直接編集しないでください。
- 共通の document shell や head 設定は `apps/web/src/routes/__root.tsx` にあります。
- ルーター本体の設定は `apps/web/src/router.tsx` にあります。

## コンテンツ

- Content Collections の設定は `apps/web/content-collections.ts` です。
- サイトコンテンツとメディアはすべて Private リポジトリ `kamatte-syndrome-content` で管理しています。公開済み・公開前を問わず、このリポジトリには含めないでください。
- `apps/web/kamatte-syndrome-content/` は Git 管理対象外です。管理用 checkout では外部コンテンツリポジトリへの symlink になっていますが、このリポジトリの作業では参照だけにし、リンク先の content repo は編集しないでください。
- `apps/web/kamatte-syndrome-content/content` には Markdown / MDX または JSON のコンテンツが、`media` には画像などのメディアが格納されています。コンテンツ管理には Sveltia CMS を使用しています。
- 記事は `apps/web/kamatte-syndrome-content/content/posts` から読み込まれます。
- 生成された `content-collections` 型や出力は手で編集しません。このリポジトリでは設定を変更し、元コンテンツの修正は別作業としてコンテンツリポジトリ側で扱ってください。
- 投稿の slug は現在 `apps/web/src/utils/posts.ts` の `toPostSlug` で `_meta.path` をそのまま使います。URL 互換性に影響するため、変更する場合は既存リンクへの影響を確認してください。
- 未来の `publishedAt` を持つブログ記事の公開制御は `apps/web/src/features/blog/server/getPosts.server.ts` が担います。`VITE_SHOW_UNPUBLISHED_CONTENT=1` は明示的な公開前コンテンツ表示用のため、公開環境では意図した場合だけ設定してください。

## CI とデプロイ

- Vercel の Root Directory は `apps/web` です。[`apps/web/vercel.json`](apps/web/vercel.json) は `pnpm install --frozen-lockfile` の後、`pnpm sync:content && pnpm build` を実行します。
- Vercel は非公開の `CONTENT_REPOSITORY_TOKEN` で `sync:content` を実行し、Private コンテンツリポジトリを shallow clone します。このトークンを `VITE_` 接頭辞の環境変数やクライアントコードに置かないでください。
- CI は `sync:content` を使いません。GitHub App の短期トークンを発行し、`actions/checkout` で `apps/web/kamatte-syndrome-content` へコンテンツを checkout します。認証経路を Vercel と統一・置換しないでください。
- `sync:content` は既存のコンテンツディレクトリを置き換えないよう、ディレクトリが存在すると停止します。ローカルの symlink や checkout を削除して実行しないでください。

## スタイルと UI

- スタイリングは Tailwind CSS のユーティリティを基本にしてください。Tailwind だけでは表現しにくい演出や複雑なスタイルが必要な場合は CSS Modules を使い、グローバル CSS は必要最小限にしてください。
- `apps/web/src/styles.css` は全体スタイルに影響します。編集後はブラウザ表示やビルドで確認してください。
- 既存の見た目は黒背景、白文字、半透明パネル、レトロ風エフェクトが基調です。新規 UI もこの雰囲気に合わせてください。
- `apps/web/src/components/RetroEffects.tsx` と `RetroEffects.module.css` は全体演出に関わります。変更時はトップページと記事ページの両方を確認してください。

### 透過ステンシル演出

#### 見た目の要求

- `PsychedelicBackground` はサイト最背面に常時表示し、黒いレイアウト面の外側や透過部分から見える状態を維持してください。
- テキスト、border、白背景風の面、SVGアイコンなどは、黒い面をくり抜いたように背景が見える表現を基本にします。
- 本文や説明文など、読みやすさが必要な長めのテキストは、背景透過を維持したまま半透明白を重ねる表現を使います。現在の可読用テキスト色は `rgb(234 234 234 / 0.75)` です。
- 画像、動画、iframeなどのメディアは透過させず、通常の見た目で表示してください。
- ヘッダーのアクティブリンクは例外として、背景を透過穴にしつつ実操作レイヤーの黒文字で読める状態を維持してください。
- モーダルも通常コンテンツと同じ透過ポリシーを適用しつつ、本文スクロール、閉じるボタン、埋め込みメディアが操作できることを優先してください。
- 透過演出よりも可読性、操作性、SEO、アクセシビリティを優先してください。演出のために実コンテンツDOMを検索不能・操作不能にしないでください。

#### 実装上の注意

- 現在のグローバル透過演出は `apps/web/src/components/layouts/GlobalLayout.tsx` と `apps/web/src/components/layouts/GlobalLayout.module.css` にあります。`PsychedelicBackground` の上に、ステンシル用レイヤーと実操作用レイヤーを重ねる方式です。
- ステンシルレイヤーは見た目用の複製レイヤーで、`aria-hidden`、`inert`、`data-nosnippet`、`data-cutout-layer="stencil"` を付けています。SEOやアクセシビリティ上の実体は `data-cutout-layer="content"` 側のDOMです。テキストやリンクを増やすためだけに追加の複製DOMを作らないでください。
- 実操作レイヤー側ではテキスト、border、SVGなどを透明化し、画像、動画、iframe、canvasなどのメディアは通常表示します。透過対象と通常表示対象の切り分けを変える場合は、`GlobalLayout.module.css` の透過ルールを確認してください。
- `GlobalLayout.module.css` は透過レイヤー基盤だけを持ちます。ヘッダーのアクティブ表示は `SiteHeader.module.css`、Cultureモーダルやカード画像maskは `culture.module.css` のように、コンポーネント固有・ページ固有のCSS Moduleへ置いてください。
- 見た目の透過指定に独自 `data-*` 属性は使わず、Tailwind theme color と CSS Modules を使ってください。透過穴は `text-cutout-hole`、`border-cutout-hole`、`bg-cutout-hole`、`decoration-cutout-hole`、`outline-cutout-hole` を使い、可読テキストは `text-cutout-readable`、弱いメタ情報は `text-cutout-muted` を使います。透過穴の意味で `text-white`、`border-white`、`bg-white` は使わないでください。
- readable/muted の見た目は Tailwind utility で明示してください。`GlobalLayout.module.css` では `text-cutout-readable` / `text-cutout-muted` に対する包括的な `border-color` や `color` の補正は行わず、border や underline の色が必要な場合は `border-cutout-*` / `decoration-cutout-*` を個別に付けてください。
- 透過演出内では `bg-black` を黒面目的で使わないでください。黒いレイアウト面はステンシルレイヤーが作ります。背景自体を穴として描きたい場合だけ `bg-cutout-hole` を使い、`body` と `PsychedelicBackground` の黒背景は例外として維持してください。
- 透過用の色は `apps/web/src/styles.css` の Tailwind theme token で管理します。レイヤーごとの実体は `GlobalLayout.module.css` のステンシルレイヤーと実操作レイヤーで切り替えます。
- ステンシル側の白黒は `--cutout-stencil-hole-source` / `--cutout-stencil-surface-source` を使ってください。CSS mask の `linear-gradient(#000 0 0)` のような不透明mask用の黒は、色トークンではなく技術的なmask値として直書きで構いません。
- `MarkdownContent` の本文、見出し、リンク、code、blockquote などのMarkdown固有スタイルは `apps/web/src/components/ui/MarkdownContent.module.css` で管理します。Markdown本文は背景透過を維持しつつ半透明白で読みやすくし、見出しとリンクは従来どおり強い透過表現に寄せる方針です。
- `filter: url("#global-cutout-filter")` を使うステンシル方式が前提です。`@supports` による通常白文字フォールバックは置かず、このフィルターに対応するブラウザを前提にします。フォールバックやCanvasマスク、`mix-blend-mode`、白色ピクセル除去などの別方式へ戻す場合は、チラつき、アンチエイリアス、SEO、メディア表示の副作用を実機確認してから判断してください。
- モーダルなど `position: fixed` を使うUIは、ステンシル側ではCSS Modules内の透過ルールにより `absolute` に置き換わります。GlobalLayout配下のモーダルはページ側のCSS Module classで扱い、JS連携は `data-cutout-layer` と `--modal-scroll-y` など既存の位置合わせを使ってください。
- `data-*` は `data-cutout-layer`、`data-culture-*`、`data-nosnippet` のようなJS連携やSEO目的に限定してください。
- スクロール可能なモーダル内コンテンツは、実操作レイヤーとステンシルレイヤーの `scrollTop` を同期する必要があります。Cultureモーダルでは `data-culture-modal-body` を同期対象にしているため、スクロール領域を移動する場合は同期処理も一緒に更新してください。
- Cultureページのカード画像は実DOM側の画像として表示し、モーダルと重なる部分だけ `data-culture-modal-obscured` / `data-culture-modal-cutout` とCSS maskで調整しています。モーダルやカード画像の寸法、配置、z-indexを変える場合は、モバイル縦、モバイル横、デスクトップで画像の消え方を確認してください。

#### ヘッダー・モーダル周辺の注意

- ヘッダーは `GlobalLayout` のステンシルレイヤーと実操作レイヤーの両方に描画されます。`SiteHeader` のDOM構造、`data-*` 属性、CSS custom property、z-index、maskを変える場合は、両レイヤーの位置と見た目が同期したままになることを確認してください。
- モバイルのヘッダーはsticky表示を維持します。PCのヘッダーは通常位置のヘッダーと、上スクロール量に応じて表示される固定ヘッダーの挙動があり、本来位置まで戻った時点で固定表示と透過 `border-bottom` が解除される必要があります。
- ヘッダー用の `PsychedelicBackground` は、本体背景と色・座標が揃って見えることが重要です。iOS/Android のオーバースクロールや高速スクロール時に、ヘッダー背景だけがずれたり黒く伸びたりしないようにしてください。
- ヘッダー下端の透過 `border-bottom` は、stickyまたはPC固定表示中の境界表現と、モバイル高速スクロール時の1px未満のチラつき対策を兼ねています。表示条件や疑似要素の重なりを整理する場合は、通常位置・sticky位置・PC固定表示の各状態を確認してください。
- ハンバーガーメニューはヘッダーの透過背景と同じ繊細な重なりに依存します。最下部までスクロールした状態で開閉しても、メニュー背景が黒化・白化せず、閉じるアイコンやナビリンクの色が崩れないことを確認してください。
- モーダルはコンテンツより上に表示しつつ、透過穴から `PsychedelicBackground` が見える状態を維持します。ヘッダーとヘッダー用背景はモーダルの下に残っていて構いませんが、モーダル上に視覚的に被らないようにしてください。
- Cultureモーダルの透過borderとカード画像の隠れ方は、`DOMRect` の重なり計算、`data-site-header-modal-cutout`、`--site-header-modal-mask-*`、`data-culture-modal-*`、モーダル本文のスクロール同期に依存しています。上部項目だけでなく、モバイル幅で下部項目のモーダルも確認してください。
- この周辺をリファクタリングする場合は、CSSのレイヤー構造やmaskを動かす前に、まず純粋関数化やfile-localコンポーネント分割のような小さい整理を優先してください。`GlobalLayout` の二重レイヤー構成と `SiteHeader.module.css` / `culture.module.css` の責務分担は維持してください。
- 透過演出を触った後は、最低限 `pnpm lint`、`pnpm typecheck`、`pnpm build` を実行し、可能なら Playwright で `/culture` のモーダル開閉、本文スクロール、背景画像表示を確認してください。

## 生成物と依存関係

- `apps/web/.output/`、`apps/web/.content-collections/`、`apps/web/.tanstack/`、`apps/web/src/routeTree.gen.ts`、lockfile などの生成物は、必要がある場合だけ更新してください。
- 依存関係を追加する前に、既存の React / TanStack / Tailwind や `apps/web/src/assets/icons/` の SVG アイコン、`Icon` コンポーネントで解決できるか確認してください。
- lockfile を更新する場合は `pnpm install` を使ってください。

## 作業時の注意

- 既存の未コミット変更がある場合は、ユーザーの作業として扱い、勝手に戻さないでください。
- 外部サービスや現在の仕様に依存する変更では、必要に応じて公式ドキュメントを確認してください。
- 最終報告では、変更したファイル、実行した検証、未実行の検証があればその理由を簡潔に伝えてください。

<!-- intent-skills:start -->
# Skill mappings - load `use` with `npx @tanstack/intent@latest load <use>`.
skills:
  - when: "TanStack Start / React 19 / Vite の設定、React Start API、useServerFn、StartClient、StartServer を変更する"
    use: "@tanstack/react-start#react-start"
  - when: "TanStack Start の React Server Components、@tanstack/react-start/rsc、Composite Components、React Flight stream を実装・修正する"
    use: "@tanstack/react-start#react-start/server-components"
  - when: "Next.js App Router から TanStack Start へ移行する、または移行差分をレビューする"
    use: "@tanstack/react-start#lifecycle/migrate-from-nextjs"
<!-- intent-skills:end -->
