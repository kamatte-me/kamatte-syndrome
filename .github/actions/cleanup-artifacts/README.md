# Cleanup artifacts

指定した名前のprefixに一致する、期限切れではないGitHub Actions Artifactを新しいものから指定世代だけ残して削除するActionです。

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| `artifact-prefix` | Yes | 削除対象を特定するArtifact名のprefix |
| `github-token` | Yes | Artifactを削除するtoken |
| `keep` | No | 保持する最新Artifactの世代数。既定値は`1` |
| `repository` | Yes | `owner/repository`形式の対象リポジトリ |

`github-token`には、Artifactを削除するための`actions: write`権限が必要です。`keep`には1以上の整数を指定します。

## Usage

新しいArtifactの保存に成功した後で実行します。

```yaml
- uses: ./.github/actions/cleanup-artifacts
  with:
    artifact-prefix: rss-read-state-
    github-token: ${{ github.token }}
    keep: 2
    repository: ${{ github.repository }}
```
