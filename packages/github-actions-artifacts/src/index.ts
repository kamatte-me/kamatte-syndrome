export type WorkflowArtifact = Readonly<{
  created_at: string;
  expired: boolean;
  id: number;
  name: string;
  workflow_run: Readonly<{
    id: number;
  }>;
}>;

type ArtifactResponse = Readonly<{
  artifacts: readonly WorkflowArtifact[];
  total_count: number;
}>;

export function selectArtifactsByPrefix(
  artifacts: readonly WorkflowArtifact[],
  prefix: string,
): readonly WorkflowArtifact[] {
  return [...artifacts]
    .filter((artifact) => !artifact.expired && artifact.name.startsWith(prefix))
    .sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export async function listRepositoryArtifacts(
  fetchFn: typeof fetch,
  options: Readonly<{
    apiUrl: string;
    repository: string;
    token: string;
  }>,
): Promise<readonly WorkflowArtifact[]> {
  const artifacts: WorkflowArtifact[] = [];
  const perPage = 100;
  let page = 1;
  let totalCount = Number.POSITIVE_INFINITY;

  while (artifacts.length < totalCount) {
    const response = await fetchFn(
      `${options.apiUrl}/repos/${options.repository}/actions/artifacts?per_page=${perPage}&page=${page}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${options.token}`,
          'X-GitHub-Api-Version': '2026-03-10',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Unable to list workflow artifacts: HTTP ${response.status}`,
      );
    }

    const body = (await response.json()) as ArtifactResponse;
    artifacts.push(...body.artifacts);
    totalCount = body.total_count;

    if (body.artifacts.length === 0) {
      break;
    }

    page += 1;
  }

  return artifacts;
}

export async function deleteArtifact(
  fetchFn: typeof fetch,
  options: Readonly<{
    apiUrl: string;
    artifactId: number;
    repository: string;
    token: string;
  }>,
): Promise<void> {
  const response = await fetchFn(
    `${options.apiUrl}/repos/${options.repository}/actions/artifacts/${options.artifactId}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${options.token}`,
        'X-GitHub-Api-Version': '2026-03-10',
      },
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    throw new Error(
      `Unable to delete workflow artifact: HTTP ${response.status}`,
    );
  }
}
