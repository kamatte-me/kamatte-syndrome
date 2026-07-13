# vite-plugin-content-images

アプリケーションから静的importした画像、または任意の画像ディレクトリから、利用箇所ごとに指定された幅のAVIF/WebPを生成するViteプラグインです。

## Usage

Vite設定ではcacheディレクトリを指定します。

```ts
contentImages({
  cacheDirectory,
})
```

アプリケーションコードから単一画像を使う場合は、画像パスと必要な幅をquery付きvirtual moduleとして静的importします。`src`はimport元ファイルからの相対パスのほか、Viteに設定されたaliasも解決できます。

```tsx
import image from 'virtual:content-image?src=../assets/image.jpg&widths=160;320';

<ContentImage
  image={image}
  sizes="160px"
  alt="サンプル画像"
/>
```

元形式・元解像度のfallbackと、指定幅のAVIF/WebPがVite assetとして出力されます。指定幅は重複除去・昇順化され、元画像より大きな幅には拡大されません。

QRコードやピクセルアートなど可逆圧縮が必要な画像では、`lossless=true`を指定できます。この場合は可逆WebPと元形式のfallbackを出力し、容量が大きくなりやすいlossless AVIFは生成しません。

```ts
import qrCode from 'virtual:content-image?src=../assets/qr.png&widths=140;280&lossless=true';
```

MarkdownやFrontmatterのように実行時のURLから画像を引く場合は、Vite設定へ名前付きsourceを追加します。`sourceDirectory`は`src/assets`などViteのpublicディレクトリ外でも構いません。原寸fallbackをURLで配信するため、`outputDirectory`はViteのpublicディレクトリ配下に置きます。

```ts
contentImages({
  cacheDirectory,
  sources: [
    {
      id: 'content',
      outputDirectory: publicMediaDirectory,
      publicPath: '/media',
      sourceDirectory: contentMediaDirectory,
    },
    {
      id: 'assets',
      outputDirectory: publicAppImagesDirectory,
      publicPath: '/app-images',
      sourceDirectory: sourceAssetsDirectory,
    },
  ],
})
```

sourceの`id`は`[a-z0-9][a-z0-9_-]*`に一致する一意な値にします。source・output・cacheディレクトリは互いに重ねられず、複数sourceで同じoutputディレクトリやpublic pathを共有することもできません。

sourceと必要な幅をquery付きvirtual moduleとして静的importします。

```ts
import contentImages from 'virtual:content-images?source=content&widths=160;320';
import assetImages from 'virtual:content-images?source=assets&widths=48;96';
```

default exportはsource単位の`ContentImageManifest`です。manifestのキーはsourceの`publicPath`から始まるURLになります。

```tsx
<ContentImage
  src="/app-images/hoge.jpg"
  manifest={assetImages}
  sizes="48px"
  alt="サンプル画像"
/>
```

幅は正の整数を`;`区切りで静的に指定します。`virtual:content-images`ではqueryの順序や幅の指定順が異なっても、同じsourceと幅なら同じvirtual module IDへ正規化されます。

virtual moduleは内部でvite-imagetools用の静的importを生成します。単一画像の`src`、manifestの`source`、`widths`は静的に指定する必要がありますが、`ContentImage`へ渡すmanifestモードの`src`はmanifestのキーに一致すれば実行時に決まる文字列でも構いません。

virtual moduleの型宣言はパッケージに含まれ、通常はプラグインAPIのimportと一緒に読み込まれます。Vite設定とアプリケーションでTypeScript projectが完全に分かれている場合は、アプリ側の`vite-env.d.ts`などから明示的に参照できます。

```ts
/// <reference types="@kamatte-syndrome/vite-plugin-content-images/virtual" />
```

TypeScript上はquery全体をwildcardとして宣言しているため、画像パス、source名、幅の誤りはViteの変換時に検証されます。
