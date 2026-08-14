# @kamatte-syndrome/remark-mdx-url-embed

Markdown中のURL単独段落を、MDX JSXの`LinkCard`または`OEmbed` componentに変換するremark pluginです。

このpackageはplain Markdown向けではなく、MDXとしてrenderされるcontentを対象にしています。出力するnodeは`mdxJsxFlowElement`です。

## Why

このリポジトリでは、記事本文にURLだけの行を書くとlink cardまたはoEmbedとして表示したいです。

```md
https://example.com/posts/1
```

このpluginは、そのようなtop-level paragraphをMDX componentに変換します。

```mdx
<LinkCard url="https://example.com/posts/1" />
```

oEmbed providerに一致するURLの場合は`OEmbed`に変換します。

```mdx
<OEmbed url="https://video.example/watch/1" />
```

このpackageが行うのは、Markdown ASTからMDX componentへの変換だけです。OG metadataやoEmbed metadataの取得、fallback表示、provider HTMLのrenderingは、app側の`LinkCard` / `OEmbed` componentが担当します。

## Usage

```ts
import { remarkGfmSubset } from '@kamatte-syndrome/remark-gfm-subset';
import { remarkMdxUrlEmbed } from '@kamatte-syndrome/remark-mdx-url-embed';
import mdx from '@mdx-js/rollup';
import remarkCjkFriendly from 'remark-cjk-friendly';

export default {
  plugins: [
    mdx({
      remarkPlugins: [
        remarkGfmSubset,
        remarkCjkFriendly,
        remarkMdxUrlEmbed,
      ],
    }),
  ],
};
```

MDXをrenderする側では、`LinkCard`と`OEmbed`をcomponentsとして渡してください。

```tsx
<MDXContent components={{ LinkCard, OEmbed }} />
```

## Transform Rules

変換対象になるのは、次の条件を満たすnodeだけです。

- top-levelの`paragraph`
- paragraphの子nodeが単一の`text`
- trim後のtextが`http:`または`https:` URL
- URLに空白、`<`、`>`、`"`、`'`を含まない

次のようなMarkdownは変換しません。

- 通常のMarkdown link
- URLを含む文章
- `ftp:`などHTTP以外のURL
- invalid URL
- blockquoteやlist itemの中にあるURL単独段落

## Component Selection

URLが`@kamatte-syndrome/oembed-endpoint-resolver`の`resolveOEmbedEndpoint(...)`に一致する場合は`OEmbed`に変換します。

一致しない場合は`LinkCard`に変換します。

## With GFM

`remark-gfm`のautolink literalを有効にすると、URL単独行が`text` nodeではなく`link` nodeになります。その場合、このpluginはURL単独段落として検出できません。

このrepoでは、必要なGFM syntaxだけを有効にする`@kamatte-syndrome/remark-gfm-subset`を使います。併用する場合は、`remarkGfmSubset`を`remarkMdxUrlEmbed`より前に指定します。

## Options

現在optionsはありません。

## Development

```sh
pnpm --filter @kamatte-syndrome/remark-mdx-url-embed test
pnpm --filter @kamatte-syndrome/remark-mdx-url-embed typecheck
```
