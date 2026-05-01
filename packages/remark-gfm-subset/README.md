# @kamatte-syndrome/remark-gfm-subset

[`remark-gfm`](https://github.com/remarkjs/remark-gfm)のうち、このリポジトリで必要な機能だけをピックアップしたremark pluginです。

このpackageは次のGFM syntaxを追加します。

- Footnote
- Strikethrough
- Table

一方で、次のsyntaxは意図的に追加しません。

- Autolink literal
- Task list item

## Why

`remark-gfm`をそのまま使うと、Markdown中のURL単独行がGFM autolink literalとして`link` nodeに変換されます。

このサイトでは、URL単独行を`@kamatte-syndrome/remark-mdx-url-embed`が`LinkCard` / `OEmbed`に変換します。`remark-mdx-url-embed`はURL単独行が`text` nodeのまま残っていることを前提にしているため、autolink literalは有効化しません。

## Usage

```ts
import { remarkGfmSubset } from '@kamatte-syndrome/remark-gfm-subset';
import { remarkMdxUrlEmbed } from '@kamatte-syndrome/remark-mdx-url-embed';

export default {
  remarkPlugins: [remarkGfmSubset, remarkMdxUrlEmbed],
};
```

`remark-mdx-url-embed`と併用する場合は、`remarkGfmSubset`を`remarkMdxUrlEmbed`より前に指定します。

## Enabled Syntax

### Footnote

```md
本文です[^note]。

[^note]: 注釈です。
```

### Strikethrough

```md
~~取り消し線~~
```

`singleTilde`はデフォルトで`false`です。そのため、`~text~`は取り消し線として扱いません。

### Table

```md
| A | B |
| - | - |
| 1 | 2 |
```

## Options

```ts
type RemarkGfmSubsetOptions = {
  singleTilde?: boolean;
  firstLineBlank?: boolean;
  stringLength?: (value: string) => number;
  tableCellPadding?: boolean;
  tablePipeAlign?: boolean;
};
```

- `singleTilde`: `~text~`をstrikethroughとして扱うか。デフォルトは`false`です。
- `firstLineBlank`: footnoteをMarkdownに戻すとき、definitionの先頭行を空けるか。
- `stringLength`: tableをMarkdownに戻すときの文字幅計算。
- `tableCellPadding`: table cellのpaddingを出力するか。
- `tablePipeAlign`: tableのpipeを揃えるか。

## Development

```sh
pnpm --filter @kamatte-syndrome/remark-gfm-subset test
pnpm --filter @kamatte-syndrome/remark-gfm-subset typecheck
```
