# vite-plugin-satteri-mdx

`.md`と`.mdx`を[Sätteri](https://satteri.bruits.org/)でReact向けのMDXコンポーネントへ変換するViteプラグインです。

## Setup

Vite設定からSatteriのMDX変換オプションを指定できます。`fileURL`と`development`はViteの変換対象と実行モードから自動的に設定されます。変換ごとに独立した値が必要な`data`は指定できません。

```ts
import { satteriNewlineToBreak } from '@kamatte-syndrome/satteri-mdast-newline-to-break';
import { satteriMdxUrlEmbed } from '@kamatte-syndrome/satteri-mdast-url-embed';
import { satteriMdx } from '@kamatte-syndrome/vite-plugin-satteri-mdx';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    satteriMdx({
      features: { gfm: true, frontmatter: true },
      mdastPlugins: [satteriNewlineToBreak, satteriMdxUrlEmbed],
      jsxImportSource: 'react',
    }),
  ],
});
```

公式の`vite-plugin-satteri`とは異なり、`.md`もHTML文字列ではなくMDXコンポーネントへ変換します。これにより、Content CollectionsからimportしたMarkdownでもReactコンポーネントの差し替えを利用できます。
