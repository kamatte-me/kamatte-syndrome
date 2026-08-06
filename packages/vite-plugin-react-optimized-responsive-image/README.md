# vite-plugin-react-optimized-responsive-image

アプリケーションから静的importした画像、または画像ディレクトリから、利用箇所ごとに指定された幅のAVIF/WebPと、それらを描画するReactコンポーネントを生成するViteプラグインです。対応する変換元はAVIF、GIF、HEIF、JPEG、PNG、TIFF、WebPです。

## Setup

Vite設定では追加オプションなしで利用できます。

```ts
import { optimizedResponsiveImage } from '@kamatte-syndrome/vite-plugin-react-optimized-responsive-image';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [optimizedResponsiveImage()],
});
```

変換cacheはデフォルトで、Vite起動時のカレントディレクトリから見た`node_modules/.cache/vite-plugin-react-optimized-responsive-image/`に保存されます。`imagetools`には生成画像、`variant-sizes`には候補画像の容量判定が保存されます。`variant-sizes`はSharpと各コーデックの更新時に自動で無効化されます。保存先を変える場合は`cacheDirectory`を指定してください。

AVIFとWebPは`quality`と`effort`を個別に設定できます。`quality`は1から100で、デフォルトはAVIFが60、WebPが80です。`effort`は未指定の場合、Sharpのデフォルト値を使用します。AVIFの`effort`は0から9、WebPは0から6を指定できます。

```ts
optimizedResponsiveImage({
  avif: { quality: 55, effort: 6 },
  webp: { quality: 75, effort: 5 },
});
```

すべての単一画像と画像コレクションをlossless変換する場合は、`lossless: true`を指定します。デフォルトは`false`です。このモードではlossless WebPと元形式のfallbackを出力し、容量が大きくなりやすいlossless AVIFは生成しません。`webp.quality`は使用せず、`webp.effort`だけを適用します。

```ts
optimizedResponsiveImage({
  lossless: true,
  webp: { effort: 6 },
});
```

グローバルな`lossless: true`はすべての画像に適用されるため、単一画像queryの`lossless=false`では解除されません。JPG写真などでは容量が大きく増えるため、QRコードやピクセルアートなどに限定する場合は画像ごとのqueryを使用します。

`enabled: false`では単一画像を元画像だけのentry、画像コレクションを空のmanifestとしてReactコンポーネントへ束縛します。Vitestなど、画像変換を行わない環境で使用できます。

## Single image

単一画像を使う場合は、画像パスと必要な幅をquery付きvirtual moduleとして静的importします。`src`はimport元ファイルからの相対パスのほか、Viteに設定されたaliasも解決できます。画像パスにはquery区切りと衝突する`?`または`#`を使用できません。

```tsx
import Image from 'virtual:react-optimized-responsive-image?src=../assets/image.jpg&widths=160;320';

<Image sizes="160px" alt="サンプル画像" />
```

default exportは生成した画像entryがあらかじめ束縛されたReactコンポーネントです。`className`、`loading`、`sizes`などの標準的な`img` propsと、`picture`へ渡す`pictureProps`を指定できます。`sizes`には文字列のほか、自然寸法の`{ width, height }`から文字列を返す関数も指定できます。`srcSet`を明示した場合は、空文字を含めて呼び出し側の指定を優先し、生成した`picture`のsourceは使用しません。

```tsx
<Image
  sizes={({ width, height }) =>
    `min(760px, ${Math.ceil(Math.min(width, (width / height) * 400))}px)`
  }
  alt="サンプル画像"
/>
```

元形式・元解像度のfallbackと、指定幅のAVIF/WebPがVite assetとして出力されます。ファイル名は元画像が`<元ファイル名>.<hash>.<ext>`、派生画像が`<元ファイル名>.<幅>x<高さ>.<hash>.<ext>`です。fallbackは再エンコードせず元ファイルのバイト列とメタデータを維持します。指定幅は重複除去・昇順化され、EXIF orientation適用後の自然幅より大きく拡大されません。変換後もfallback以上の容量になる候補は出力しません。アニメーションを持つAVIF/WebPは静止画化を避けるため、元画像だけをfallbackとして使用します。

QRコードやピクセルアートなど可逆圧縮が必要な画像では、`lossless=true`を指定できます。この場合は可逆WebPと元形式のfallbackを出力し、容量が大きくなりやすいlossless AVIFは生成しません。
WebPの`quality`設定はlossless変換では使用せず、`effort`だけを適用します。

```tsx
import QrCode from 'virtual:react-optimized-responsive-image?src=../assets/qr.png&widths=140;280&lossless=true';

<QrCode sizes="140px" alt="QRコード" />
```

## Image collection

MarkdownやFrontmatterのように実行時のURLから画像を引く場合は、画像ディレクトリ、公開URLのbase、必要な幅をquery付きvirtual moduleとして静的importします。

```tsx
import ContentImage from 'virtual:react-optimized-responsive-image/collection?src=@@/content/media&base=/media&widths=160;320';
```

- `src`はViteに設定されたalias、Vite rootからの`/`始まりのパス、またはimport元からの相対パスです。
- `base`はmanifestのキーとfallbackに使う公開URLです。
- `widths`は正の整数または`original`を`;`または`,`区切りで指定します。`original`は画像ごとの自然幅に解決されます。
- 画像ファイル名にURL区切り文字の`?`または`#`は使用できません。
- 未知のquery parameterや同じparameterの重複指定はエラーになります。

例えば`/content/media/nested/image.jpg`は、次のentryになります。

```ts
{
  '/media/nested/image.jpg': {
    src: '/assets/image.[hash].jpg',
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
  sizes="160px"
  alt="サンプル画像"
/>
```

default exportはmanifestがあらかじめ束縛されたReactコンポーネントです。必須の`src`にmanifestの論理URLを文字列で渡します。

named exportの`manifest`からは、論理URLごとの元画像URL、自然寸法、AVIF/WebPバリアントを取得できます。Reactコンポーネント以外の画像ビューアーへ同じ生成物を渡す場合に使用します。

```ts
import { manifest } from 'virtual:react-optimized-responsive-image/collection?src=@@/content/media&base=/media&widths=original';

const image = manifest['/media/nested/image.jpg'];
```

manifestのキーはMarkdownやFrontmatterに記録された論理URLのままですが、entryの`src`はViteが出力するhash付きの元画像URLになります。AVIF/WebPだけでなく元画像もVite asset graphに含まれ、Reactコンポーネントのfallbackとして使われます。元画像は変更・再encodeされず、EXIFを含むメタデータもそのまま保持されます。アニメーションを持つ画像もmanifestには含まれますが、派生画像は生成しません。SVGなどの対応外形式はmanifestに含まれないため、通常の`img`として論理URLへfallbackします。

RSS、Open Graph、JSON-LDなどで元画像を使う場合も、named exportの`manifest`から論理URLに対応する`src`を取得してください。元画像をpublicディレクトリへコピーせず、同じhash付きVite asset URLを利用できます。

```ts
const imageUrl = manifest['/media/nested/image.jpg']?.src;
```

派生画像のメタデータ除去と圧縮はvite-imagetoolsが担当し、デフォルトではAVIFをquality 60、WebPをquality 80で出力します。Viteのasset inline上限より小さい元画像はdata URLになる場合があります。

queryの順序や幅の指定順が異なっても、同じ解決済みディレクトリ、base、幅なら同じvirtual module IDへ正規化されます。派生幅はEXIF orientation適用後の自然幅までに制限され、拡大されません。dev中はsymlinkの実体を含む対象ディレクトリの追加・変更・削除を監視し、manifestを更新します。

`vite build --watch`では、保存途中などでコレクション内の画像を一時的に読めない場合、そのbuildだけ警告と空のmanifestへfallbackします。対象画像が変更されると再走査して通常のmanifestへ戻ります。watchではないbuildは従来どおりエラーで停止します。

コレクションimportは対象ディレクトリ内の全対応画像について指定幅を事前変換し、fallbackより小さくなる候補だけをvite-imagetoolsへ渡します。大きなディレクトリや多くの幅セットを使うと事前判定の時間と成果物数が増えるため、利用箇所に必要な幅だけを指定してください。同じ画像内容・形式・品質・幅の容量判定は`cacheDirectory`配下に永続cacheされ、同じ生成物はViteによって共有されます。

## TypeScript

virtual moduleの型宣言はパッケージに含まれています。アプリ側の`compilerOptions.types`へ追加するか、`vite-env.d.ts`などから明示的に参照してください。

```ts
/// <reference types="@kamatte-syndrome/vite-plugin-react-optimized-responsive-image/react/virtual" />
```

TypeScript上はquery全体をwildcardとして宣言しているため、画像パス、base、幅の誤りはViteの変換時に検証されます。
