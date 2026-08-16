import {
  deleteArtifact,
  listRepositoryArtifacts,
  selectArtifactsByPrefix,
} from '@kamatte-syndrome/github-actions-artifacts';

export async function cleanupArtifacts(
  fetchFn: typeof fetch,
  options: Readonly<{
    apiUrl: string;
    keep: number;
    prefix: string;
    repository: string;
    token: string;
  }>,
): Promise<void> {
  const artifacts = await listRepositoryArtifacts(fetchFn, options);
  const supersededArtifacts = selectArtifactsByPrefix(
    artifacts,
    options.prefix,
  ).slice(options.keep);

  await Promise.all(
    supersededArtifacts.map((artifact) =>
      deleteArtifact(fetchFn, {
        apiUrl: options.apiUrl,
        artifactId: artifact.id,
        repository: options.repository,
        token: options.token,
      }),
    ),
  );
}

async function main(): Promise<void> {
  const keep = Number.parseInt(getInput('keep', '1'), 10);

  if (!Number.isInteger(keep) || keep < 1) {
    throw new Error('Input keep must be a positive integer.');
  }

  await cleanupArtifacts(fetch, {
    apiUrl: process.env.GITHUB_API_URL ?? 'https://api.github.com',
    keep,
    prefix: getInput('artifact-prefix'),
    repository: getInput('repository'),
    token: getInput('github-token'),
  });
}

function getInput(name: string, defaultValue?: string): string {
  const value = process.env[`INPUT_${name.toUpperCase().replaceAll('-', '_')}`];

  if (value === undefined || value.trim() === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`Missing required input: ${name}`);
  }

  return value.trim();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
