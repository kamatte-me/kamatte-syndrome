# @kamatte-syndrome/remark-image-loading-lazy

Markdown画像とMDXの`<img />`に`loading="lazy"`を追加するremark pluginです。

既に`loading`が指定されている画像は、その値を維持します。

## Usage

```ts
import { remarkImageLoadingLazy } from '@kamatte-syndrome/remark-image-loading-lazy';

export default {
  remarkPlugins: [remarkImageLoadingLazy],
};
```

## Development

```sh
pnpm --filter @kamatte-syndrome/remark-image-loading-lazy test
pnpm --filter @kamatte-syndrome/remark-image-loading-lazy typecheck
```
