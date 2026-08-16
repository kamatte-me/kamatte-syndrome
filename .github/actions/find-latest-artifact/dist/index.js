// src/index.ts
import { randomUUID } from "node:crypto";
import { appendFile } from "node:fs/promises";

// ../../../packages/github-actions-artifacts/src/index.ts
function selectArtifactsByPrefix(artifacts, prefix) {
  return [...artifacts].filter((artifact) => !artifact.expired && artifact.name.startsWith(prefix)).sort((left, right) => right.created_at.localeCompare(left.created_at));
}
async function listRepositoryArtifacts(fetchFn, options) {
  const artifacts = [];
  const perPage = 100;
  let page = 1;
  let totalCount = Number.POSITIVE_INFINITY;
  while (artifacts.length < totalCount) {
    const response = await fetchFn(
      `${options.apiUrl}/repos/${options.repository}/actions/artifacts?per_page=${perPage}&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${options.token}`,
          "X-GitHub-Api-Version": "2026-03-10"
        }
      }
    );
    if (!response.ok) {
      throw new Error(
        `Unable to list workflow artifacts: HTTP ${response.status}`
      );
    }
    const body = await response.json();
    artifacts.push(...body.artifacts);
    totalCount = body.total_count;
    if (body.artifacts.length === 0) {
      break;
    }
    page += 1;
  }
  return artifacts;
}

// src/index.ts
async function findLatestArtifact(fetchFn, options) {
  const artifacts = await listRepositoryArtifacts(fetchFn, options);
  return selectArtifactsByPrefix(artifacts, options.prefix)[0];
}
async function main() {
  const latest = await findLatestArtifact(fetch, {
    apiUrl: process.env.GITHUB_API_URL ?? "https://api.github.com",
    prefix: getInput("artifact-prefix"),
    repository: getInput("repository"),
    token: getInput("github-token")
  });
  await Promise.all([
    setOutput("artifact-id", latest ? String(latest.id) : ""),
    setOutput("found", String(latest !== void 0)),
    setOutput("name", latest?.name ?? ""),
    setOutput("run-id", latest ? String(latest.workflow_run.id) : "")
  ]);
}
function getInput(name) {
  const value = process.env[`INPUT_${name.toUpperCase().replaceAll("-", "_")}`];
  if (value === void 0 || value.trim() === "") {
    throw new Error(`Missing required input: ${name}`);
  }
  return value.trim();
}
async function setOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    return;
  }
  const delimiter = `find-latest-artifact-${randomUUID()}`;
  await appendFile(
    outputPath,
    `${name}<<${delimiter}
${value}
${delimiter}
`
  );
}
if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
export {
  findLatestArtifact
};
