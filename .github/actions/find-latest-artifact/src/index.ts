import { randomUUID } from 'node:crypto';
import { appendFile } from 'node:fs/promises';
import {
  listRepositoryArtifacts,
  selectArtifactsByPrefix,
  type WorkflowArtifact,
} from '@kamatte-syndrome/github-actions-artifacts';

export async function findLatestArtifact(
  fetchFn: typeof fetch,
  options: Readonly<{
    apiUrl: string;
    prefix: string;
    repository: string;
    token: string;
  }>,
): Promise<WorkflowArtifact | undefined> {
  const artifacts = await listRepositoryArtifacts(fetchFn, options);
  return selectArtifactsByPrefix(artifacts, options.prefix)[0];
}

async function main(): Promise<void> {
  const latest = await findLatestArtifact(fetch, {
    apiUrl: process.env.GITHUB_API_URL ?? 'https://api.github.com',
    prefix: getInput('artifact-prefix'),
    repository: getInput('repository'),
    token: getInput('github-token'),
  });

  await Promise.all([
    setOutput('artifact-id', latest ? String(latest.id) : ''),
    setOutput('found', String(latest !== undefined)),
    setOutput('name', latest?.name ?? ''),
    setOutput('run-id', latest ? String(latest.workflow_run.id) : ''),
  ]);
}

function getInput(name: string): string {
  const value = process.env[`INPUT_${name.toUpperCase().replaceAll('-', '_')}`];

  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required input: ${name}`);
  }

  return value.trim();
}

async function setOutput(name: string, value: string): Promise<void> {
  const outputPath = process.env.GITHUB_OUTPUT;

  if (!outputPath) {
    return;
  }

  const delimiter = `find-latest-artifact-${randomUUID()}`;
  await appendFile(
    outputPath,
    `${name}<<${delimiter}\n${value}\n${delimiter}\n`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
