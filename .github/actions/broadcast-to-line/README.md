# Broadcast to LINE

LINE Messaging APIのbroadcastを使い、公式LINEの友だち全員へテキストを一斉配信するActionです。

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| `text` | Yes | 配信する本文 |
| `channel-access-token` | Yes | LINE Messaging APIのchannel access token |

## Usage

channel access tokenはGitHub Actions Secretsから渡します。

```yaml
- uses: ./.github/actions/broadcast-to-line
  with:
    channel-access-token: ${{ secrets.LINE_CHANNEL_ACCESS_TOKEN }}
    text: |
      新着記事
      ${{ matrix.item.url }}
```

本文から決定的に生成したLINEのretry keyを送信します。同じ本文を再送してLINEが受理済みと返した場合は、成功として扱います。
