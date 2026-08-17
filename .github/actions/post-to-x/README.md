# Post to X

OAuth 1.0aでX APIの投稿エンドポイントへテキストを1件投稿するActionです。

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| `text` | Yes | 投稿する本文 |
| `consumer-key` | Yes | X OAuth 1.0a consumer key |
| `consumer-secret` | Yes | X OAuth 1.0a consumer secret |
| `access-token` | Yes | 投稿アカウントのaccess token |
| `access-token-secret` | Yes | 投稿アカウントのaccess token secret |

## Usage

認証情報はGitHub Actions Secretsから渡します。

```yaml
- uses: ./.github/actions/post-to-x
  with:
    consumer-key: ${{ secrets.X_CONSUMER_KEY }}
    consumer-secret: ${{ secrets.X_CONSUMER_SECRET }}
    access-token: ${{ secrets.X_ACCESS_TOKEN }}
    access-token-secret: ${{ secrets.X_ACCESS_TOKEN_SECRET }}
    text: |
      新着記事
      ${{ matrix.item.url }}
```

空の本文とX APIからのエラーはWorkflowを失敗させます。通信断など投稿の成否を確認できない場合も失敗として扱い、このAction自体は再送しません。
