# @kamatte-syndrome/oembed-endpoint-resolver

URLがoEmbed providerのschemeに一致するかを判定し、対応するoEmbed endpoint情報を返す小さなresolverです。

provider registryには`oembed-providers/providers.json`を使います。このpackageはmetadataのfetchやresponseの正規化は行わず、URLからendpointを解決するところだけを担当します。

## Why

このリポジトリでは、記事本文のURL単独段落を`LinkCard`または`OEmbed`として表示します。

`@kamatte-syndrome/satteri-mdast-url-embed`はMarkdown ASTをMDX componentに変換する時点で、そのURLがoEmbed providerに対応しているかを判定する必要があります。また、app側のserver codeは、実際にoEmbed metadataを取得するためのendpoint URLを知る必要があります。

このpackageは、その両方で使う共通のprovider判定を提供します。

## Usage

```ts
import { resolveOEmbedEndpoint } from '@kamatte-syndrome/oembed-endpoint-resolver';

const match = resolveOEmbedEndpoint('https://video.example/watch/1');

if (match) {
  console.log(match.providerName);
  console.log(match.endpointUrl);
}
```

`resolveOEmbedEndpoint(...)`は、providerに一致する場合だけendpoint情報を返します。一致しないURLやinvalid URLの場合は`undefined`を返します。

```ts
const componentName = resolveOEmbedEndpoint(url) ? 'OEmbed' : 'LinkCard';
```

## API

```ts
function resolveOEmbedEndpoint(url: string): OEmbedEndpointMatch | undefined;

type OEmbedEndpointMatch = {
  providerName: string;
  providerUrl: string;
  endpointUrl: string;
};
```

- `providerName`: provider registry上のprovider名。
- `providerUrl`: provider registry上のprovider URL。
- `endpointUrl`: oEmbed request先のendpoint URL。`{format}` placeholderを含む場合があります。

`endpointUrl`から実際のrequest URLを作る処理は呼び出し側の責務です。このrepoのapp側では、`url`、`maxwidth`、`format=json`を付けてserver-sideでfetchします。

## Matching Rules

resolverはpackage import時にprovider registryを読み込み、endpoint matcherを一度だけcompileします。

対象になるendpointは次の条件を満たすものです。

- `schemes`を持つendpoint
- schemeが`http://`または`https://`で始まる
- `formats`が未指定、または`json`を含む

scheme内の`*` wildcardも扱います。

```ts
resolveOEmbedEndpoint('https://video.example/watch/1');
resolveOEmbedEndpoint('https://player.embed.example/videos/1');
```

literal hostnameを持つschemeはhostnameごとにindexし、wildcard hostnameを持つschemeはfallback candidatesとして保持します。外部network requestは行いません。

## Non-Goals

このpackageは次の処理を行いません。

- oEmbed discovery
- oEmbed metadataのfetch
- oEmbed responseのvalidationやnormalization
- provider HTMLのrendering
- URLのSSRF対策やpublic URL validation

runtimeでprovider endpointへfetchする場合は、呼び出し側でHTTP method、timeout、redirect、content-type、public URL validationなどを扱ってください。

## Development

```sh
pnpm --filter @kamatte-syndrome/oembed-endpoint-resolver test
pnpm --filter @kamatte-syndrome/oembed-endpoint-resolver typecheck
```
