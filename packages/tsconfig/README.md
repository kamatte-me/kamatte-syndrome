# @kamatte-syndrome/tsconfig

このmonorepo内で共有するTypeScript compiler presetです。

各package/appは、このpackageの`tsconfig.*.json`を`extends`して、実行環境ごとの差分だけをlocalの`tsconfig.json`で指定します。

## Why

このリポジトリには、React app、ViteやContent CollectionsのNode.js設定ファイル、browser-safeなshared packageが混在しています。

すべてを1つのroot `tsconfig.json`に寄せると、DOM APIが不要なpackageにDOM型が入ったり、browser向けpackageにNode.js型が混ざったりします。

このpackageは、共通のstrict設定を`tsconfig.base.json`に集めたうえで、利用場所ごとに小さなpresetを分けます。

## Presets

| Preset | 用途 |
| --- | --- |
| `tsconfig.base.json` | strictnessやmodule resolutionなど、全環境で共有する基本設定 |
| `tsconfig.browser.json` | DOMを使えるbrowser向けコード、またはNode.js APIに依存しないshared package |
| `tsconfig.react.json` | React/TSXを含むbrowser向けコード |
| `tsconfig.node.json` | Vite configなど、Node.js上で実行されるtooling/config code |

`tsconfig.react.json`は`tsconfig.browser.json`を継承し、`jsx: "react-jsx"`だけを追加します。

## Usage

React app側のTypeScript codeでは`tsconfig.react.json`を使います。

```json
{
  "extends": "@kamatte-syndrome/tsconfig/tsconfig.react.json",
  "compilerOptions": {
    "types": ["vite/client"]
  },
  "include": ["src/"]
}
```

Vite configやContent Collections configなど、Node.js上で動くファイルでは`tsconfig.node.json`を使います。

```json
{
  "extends": "@kamatte-syndrome/tsconfig/tsconfig.node.json",
  "include": ["vite.config.ts", "content-collections.ts"]
}
```

remark pluginやresolverのようなshared packageは、Node.js APIに依存しない限り`tsconfig.browser.json`を使います。

```json
{
  "extends": "@kamatte-syndrome/tsconfig/tsconfig.browser.json",
  "include": ["src/**/*.ts"]
}
```

## Local Overrides

各consumerの`tsconfig.json`では、package/app固有の設定だけを追加してください。

- `include`
- `exclude`
- `paths`
- `types`
- `tsBuildInfoFile`

runtime環境を変えるような`lib`や`types`の追加は、そのcodeが実際に依存するAPIに合わせて行います。たとえば、pure parser packageではNode.js APIを使っていない限り`tsconfig.node.json`ではなく`tsconfig.browser.json`を選びます。

## Exports

`package.json`では次のsubpath patternだけを公開しています。

```json
{
  "exports": {
    "./tsconfig.*.json": "./tsconfig.*.json"
  }
}
```

そのため、consumerからは次の形で参照します。

```json
{
  "extends": "@kamatte-syndrome/tsconfig/tsconfig.browser.json"
}
```

## Non-Goals

このpackageは次のことを行いません。

- TypeScript project referencesの管理
- `tsc --build`用のcomposite設定
- build成果物のemit
- app/package固有のpath aliasやambient typeの定義

typecheckの実行方法は各package/appのscriptに置き、このpackageはcompiler optionsの共有だけを担当します。
