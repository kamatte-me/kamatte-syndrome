import { describe, expect, it } from 'vitest';
import { findLatestArtifact, getInput } from './index.ts';

describe('findLatestArtifact', () => {
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

  it('returns the newest matching non-expired artifact', async () => {
    const artifact = await findLatestArtifact(
      async () =>
        Response.json({
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
        }),
      {
        apiUrl: 'https://api.github.com',
        prefix: 'state-',
        repository: 'kamatte/kamatte-syndrome',
        token: 'token',
      },
    );

    expect(artifact).toMatchObject({
      id: 2,
      name: 'state-2',
      workflow_run: { id: 2 },
    });
  });
});
