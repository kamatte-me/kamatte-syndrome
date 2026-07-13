# vite-plugin-content-images

任意の画像ディレクトリを公開用に同期し、利用箇所ごとに指定された幅のAVIF/WebPを生成するViteプラグインです。複数の入力元を名前付きsourceとして同時に扱えます。

## Usage

Vite設定では共通のcacheディレクトリと、1つ以上のsourceを指定します。`sourceDirectory`は`src/assets`などViteのpublicディレクトリ外でも構いません。原寸fallbackをURLで配信するため、`outputDirectory`はViteのpublicディレクトリ配下に置きます。

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

アプリケーションコードでは、sourceと必要な幅をquery付きvirtual moduleとして静的importします。

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

指定幅は重複除去・昇順化され、元画像より大きな幅には拡大されません。幅は正の整数を`;`区切りで静的に指定します。queryの順序や幅の指定順が異なっても、同じsourceと幅なら同じvirtual module IDへ正規化されます。

virtual moduleは内部でvite-imagetools用の静的importを生成します。virtual moduleの`source`と`widths`は静的に指定する必要がありますが、`ContentImage`へ渡す`src`はmanifestのキーに一致すれば実行時に決まる文字列でも構いません。

virtual moduleの型宣言はパッケージに含まれ、通常はプラグインAPIのimportと一緒に読み込まれます。Vite設定とアプリケーションでTypeScript projectが完全に分かれている場合は、アプリ側の`vite-env.d.ts`などから明示的に参照できます。

```ts
/// <reference types="@kamatte-syndrome/vite-plugin-content-images/virtual" />
```

TypeScript上はquery全体をwildcardとして宣言しているため、source名や幅の誤りはViteの変換時に検証されます。
