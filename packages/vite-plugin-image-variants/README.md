# vite-plugin-image-variants

アプリケーションから静的importした画像、または画像ディレクトリから、利用箇所ごとに指定された幅のAVIF/WebPを生成するViteプラグインです。

## Setup

Vite設定ではvite-imagetools用のcacheディレクトリだけを指定します。

```ts
import { imageVariants } from '@kamatte-syndrome/vite-plugin-image-variants';

imageVariants({
  cacheDirectory,
})
```

## Single image

単一画像を使う場合は、画像パスと必要な幅をquery付きvirtual moduleとして静的importします。`src`はimport元ファイルからの相対パスのほか、Viteに設定されたaliasも解決できます。画像パスにはquery区切りと衝突する`?`または`#`を使用できません。

```tsx
import image from 'virtual:image-variant?src=../assets/image.jpg&widths=160;320';

<ContentImage image={image} sizes="160px" alt="サンプル画像" />
```

元形式・元解像度のfallbackと、指定幅のAVIF/WebPがVite assetとして出力されます。指定幅は重複除去・昇順化され、元画像より大きな幅には拡大されません。

QRコードやピクセルアートなど可逆圧縮が必要な画像では、`lossless=true`を指定できます。この場合は可逆WebPと元形式のfallbackを出力し、容量が大きくなりやすいlossless AVIFは生成しません。

```ts
import qrCode from 'virtual:image-variant?src=../assets/qr.png&widths=140;280&lossless=true';
```

## Image collection

MarkdownやFrontmatterのように実行時のURLから画像を引く場合は、画像ディレクトリ、公開URLのbase、必要な幅をquery付きvirtual moduleとして静的importします。

```ts
import imageVariantManifest from 'virtual:image-variants?src=@@/content/media&base=/media&widths=160;320';
```

- `src`はViteに設定されたalias、Vite rootからの`/`始まりのパス、またはimport元からの相対パスです。
- `base`はmanifestのキーとfallbackに使う公開URLです。
- `widths`は正の整数を`;`区切りで指定します。
- 画像ファイル名にURL区切り文字の`?`または`#`は使用できません。

例えば`/content/media/nested/image.jpg`は、次のentryになります。

```ts
{
  '/media/nested/image.jpg': {
    src: '/assets/image-[hash].jpg',
    width: 800,
    height: 600,
    avif: [/* Vite assets */],
    webp: [/* Vite assets */],
  },
}
```

```tsx
<ContentImage
  src="/media/nested/image.jpg"
  manifest={imageVariantManifest}
  sizes="160px"
  alt="サンプル画像"
/>
```

manifestのキーはMarkdownやFrontmatterに記録された論理URLのままですが、entryの`src`はViteが出力するhash付きの元画像URLになります。AVIF/WebPだけでなく元画像もVite asset graphに含まれ、`ContentImage`のfallbackとして使われます。元画像は変更・再encodeされず、EXIFを含むメタデータもそのまま保持されます。

プラグインは`base`以下へファイルを書き込まないため、RSS、Open Graph、JSON-LDなどで論理URLを使う場合は、アプリケーションのpublicディレクトリや`vite-plugin-static-copy`などで元画像を別途配信してください。

```ts
viteStaticCopy({
  targets: [
    {
      src: 'content/media/**/*',
      dest: 'media',
      rename: { stripBase: 2 },
    },
  ],
})
```

この構成では元画像がhash付きVite assetと安定URLの`base`以下にそれぞれ1つずつ含まれます。派生画像のメタデータ除去と圧縮はvite-imagetoolsが担当します。Viteのasset inline上限より小さい元画像はdata URLになる場合があります。

queryの順序や幅の指定順が異なっても、同じ解決済みディレクトリ、base、幅なら同じvirtual module IDへ正規化されます。派生幅はEXIF orientation適用後の自然幅までに制限され、拡大されません。dev中はsymlinkの実体を含む対象ディレクトリの追加・変更・削除を監視し、manifestを更新します。

## TypeScript

virtual moduleの型宣言はパッケージに含まれ、通常はプラグインAPIのimportと一緒に読み込まれます。Vite設定とアプリケーションでTypeScript projectが完全に分かれている場合は、アプリ側の`vite-env.d.ts`などから明示的に参照できます。

```ts
/// <reference types="@kamatte-syndrome/vite-plugin-image-variants/virtual" />
```

TypeScript上はquery全体をwildcardとして宣言しているため、画像パス、base、幅の誤りはViteの変換時に検証されます。
