# Find latest artifact

指定した名前のprefixに一致する、期限切れではないGitHub Actions Artifactのうち最新のものを検索するActionです。

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| `artifact-prefix` | Yes | 検索するArtifact名のprefix |
| `github-token` | Yes | Artifactを読み取るtoken |
| `repository` | Yes | `owner/repository`形式の対象リポジトリ |

`github-token`には、Artifactを読むための`actions: read`権限が必要です。

## Outputs

| Output | Description |
| --- | --- |
| `found` | 一致するArtifactが見つかったかを表す文字列の真偽値 |
| `artifact-id` | Artifact ID。見つからない場合は空文字列 |
| `name` | Artifact名。見つからない場合は空文字列 |
| `run-id` | Artifactを作成したWorkflow run ID。見つからない場合は空文字列 |

## Usage

```yaml
- id: state
  uses: ./.github/actions/find-latest-artifact
  with:
    artifact-prefix: rss-read-state-
    github-token: ${{ github.token }}
    repository: ${{ github.repository }}

- if: steps.state.outputs.found == 'true'
  uses: actions/download-artifact@v8
  with:
    name: ${{ steps.state.outputs.name }}
    run-id: ${{ steps.state.outputs.run-id }}
```
