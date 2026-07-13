# vite-plugin-content-images

`kamatte-syndrome-content/media` の公開用原寸画像を同期し、利用箇所ごとに指定された幅のAVIF/WebPを生成するViteプラグインです。

## Usage

Vite設定では、入力・出力ディレクトリだけを指定します。

```ts
contentImages({
  cacheDirectory,
  outputDirectory,
  publicPath: '/media',
  sourceDirectory,
})
```

アプリケーションコードでは、必要な幅をquery付きvirtual moduleとして静的importします。

```ts
import contentImages from 'virtual:content-images?widths=160;320';
```

default exportは`ContentImageManifest`です。指定幅は重複除去・昇順化され、元画像より大きな幅には拡大されません。

幅は正の整数を`;`区切りで静的に指定します。同じ幅の重複や指定順の違いは、同じvirtual module IDへ正規化されます。

virtual moduleは内部でvite-imagetools用の静的importを生成します。画像パスや幅を実行時に組み立てることはできません。
