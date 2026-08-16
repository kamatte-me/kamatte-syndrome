import { describe, expect, it } from 'vitest';
import {
  listRepositoryArtifacts,
  selectArtifactsByPrefix,
  type WorkflowArtifact,
} from './index.ts';

const artifacts: readonly WorkflowArtifact[] = [
  {
    created_at: '2026-08-15T01:00:00.000Z',
    expired: false,
    id: 1,
    name: 'rss-state-1-1',
    workflow_run: { id: 1 },
  },
  {
    created_at: '2026-08-15T03:00:00.000Z',
    expired: false,
    id: 2,
    name: 'rss-state-2-1',
    workflow_run: { id: 2 },
  },
  {
    created_at: '2026-08-15T04:00:00.000Z',
    expired: true,
    id: 3,
    name: 'rss-state-3-1',
    workflow_run: { id: 3 },
  },
  {
    created_at: '2026-08-15T05:00:00.000Z',
    expired: false,
    id: 4,
    name: 'other-state-1-1',
    workflow_run: { id: 4 },
  },
];

describe('selectArtifactsByPrefix', () => {
  it('returns newest non-expired artifacts matching the prefix', () => {
    expect(selectArtifactsByPrefix(artifacts, 'rss-state-')).toEqual([
      artifacts[1],
      artifacts[0],
    ]);
  });
});

describe('listRepositoryArtifacts', () => {
  it('retrieves every page of artifacts', async () => {
    const allArtifacts = Array.from({ length: 101 }, (_, index) => ({
      created_at: '2026-08-15T01:00:00.000Z',
      expired: false,
      id: index + 1,
      name: `state-${index + 1}`,
      workflow_run: { id: index + 1 },
    }));
    const requests: Request[] = [];

    const result = await listRepositoryArtifacts(
      async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        const page = Number.parseInt(
          new URL(request.url).searchParams.get('page') ?? '1',
          10,
        );

        return Response.json({
          artifacts:
            page === 1 ? allArtifacts.slice(0, 100) : allArtifacts.slice(100),
          total_count: allArtifacts.length,
        });
      },
      {
        apiUrl: 'https://api.github.com',
        repository: 'kamatte/kamatte-syndrome',
        token: 'token',
      },
    );

    expect(result).toHaveLength(101);
    expect(requests.map((request) => request.url)).toEqual([
      'https://api.github.com/repos/kamatte/kamatte-syndrome/actions/artifacts?per_page=100&page=1',
      'https://api.github.com/repos/kamatte/kamatte-syndrome/actions/artifacts?per_page=100&page=2',
    ]);
  });
});
