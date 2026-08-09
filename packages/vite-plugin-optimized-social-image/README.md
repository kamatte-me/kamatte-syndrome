# vite-plugin-optimized-social-image

OGP、JSON-LD、feed向けに、画像コレクションの各画像から互換性のある派生画像を1つ生成するViteプラグインです。変換元はAVIF、GIF、HEIF、JPEG、PNG、TIFF、WebPに対応します。

```ts
import { optimizedSocialImage } from '@kamatte-syndrome/vite-plugin-optimized-social-image';

export default defineConfig({
  plugins: [optimizedSocialImage()],
});
```

```ts
import { manifest } from 'virtual:optimized-social-image/collection?src=@@/content/media&base=/media&width=1200';

const image = manifest['/media/example.webp'];
```

`src`はVite alias、Vite rootからの`/`始まりのパス、またはimport元からの相対パスです。`base`はmanifestのキーとなる公開URL、`width`は正の整数の最大幅です。画像は拡大されませんが、元画像より大きい変換結果でも必ず出力されます。

- GIF入力はアニメーションを維持したGIFとして出力します。
- GIF以外は、アルファチャンネルがあればPNG、なければJPEGとして出力します。
- GIF以外のアニメーション画像は先頭フレームを静止JPEGまたはPNGとして出力します。

manifestのentryは`src`、実出力の`width`と`height`、`format`を持ちます。出力ファイル名は`<元ファイル名>.<width>x<height>.<hash>.<ext>`で、自然寸法のままならサイズ部分を省略します。

変換結果はVite root配下の`node_modules/.cache/vite-plugin-optimized-social-image`に永続キャッシュされます。`cacheDirectory`で保存先を変更できます。
