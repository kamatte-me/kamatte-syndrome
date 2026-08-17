import { describe, expect, it } from 'vitest';
import { cleanupArtifacts, getInput } from './index.ts';

describe('cleanupArtifacts', () => {
  it('reads a hyphenated GitHub Actions input', () => {
    const key = 'INPUT_ARTIFACT-PREFIX';
    const original = process.env[key];
    process.env[key] = 'state-';

    try {
      expect(getInput('artifact-prefix')).toBe('state-');
    } finally {
      if (original === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original;
      }
    }
  });

  it('deletes matching artifacts beyond the configured generations', async () => {
    const requests: Request[] = [];

    await cleanupArtifacts(
      async (input, init) => {
        requests.push(new Request(input, init));

        return init?.method === 'DELETE'
          ? new Response(null, { status: 204 })
          : Response.json({
              artifacts: [
                {
                  created_at: '2026-08-15T01:00:00.000Z',
                  expired: false,
                  id: 1,
                  name: 'state-1',
                  workflow_run: { id: 1 },
                },
                {
                  created_at: '2026-08-15T02:00:00.000Z',
                  expired: false,
                  id: 2,
                  name: 'state-2',
                  workflow_run: { id: 2 },
                },
              ],
              total_count: 2,
            });
      },
      {
        apiUrl: 'https://api.github.com',
        keep: 1,
        prefix: 'state-',
        repository: 'kamatte/kamatte-syndrome',
        token: 'token',
      },
    );

    expect(requests.map((request) => request.method)).toEqual([
      'GET',
      'DELETE',
    ]);
    expect(requests[1]?.url).toBe(
      'https://api.github.com/repos/kamatte/kamatte-syndrome/actions/artifacts/1',
    );
  });
});
