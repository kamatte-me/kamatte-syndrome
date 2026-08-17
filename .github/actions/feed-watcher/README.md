# Feed watcher

Atomフィードを読み取り、保存済みの最新公開日時より新しい記事を検知するActionです。読み取り位置の永続化は呼び出し側がArtifactなどで行います。

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| `feed-url` | Yes | 監視するAtomフィードのURL |
| `state-file` | No | 読み取り位置を保存するJSONファイル。既定値は`.feed-watcher/state.json` |
| `initialize` | No | `true`の場合、現在の最新公開日時だけを記録して通知対象を返さない。既定値は`false` |

## Outputs

| Output | Description |
| --- | --- |
| `new-items` | 新着記事のJSON配列。各要素は`id`、`title`、`url`、`publishedAt`を持つ |

## Usage

初回は`initialize`を有効にしてstateを作成します。通常実行でstateがない場合は、誤配信を防ぐため失敗します。

```yaml
- id: watcher
  uses: ./.github/actions/feed-watcher
  with:
    feed-url: https://example.com/feed.xml
    state-file: .feed-watcher/state.json
```

フィードには各entryの`title`、`published`、リンクと、`id`またはリンクが必要です。新着判定には`published`を使用します。

完全なstateの復元・保存と通知処理は、[Notify new feed items](../../workflows/notify-new-feed-items.yml)を参照してください。
