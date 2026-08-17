import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readStateOrExplainInitialization } from './index.ts';

describe('readStateOrExplainInitialization', () => {
  it('stops publishing when no persisted state exists', async () => {
    const missingStateFile = join(
      tmpdir(),
      `feed-watcher-${randomUUID()}.json`,
    );

    await expect(
      readStateOrExplainInitialization(missingStateFile),
    ).rejects.toThrow(
      'Run this workflow manually with mode=initialize before publishing.',
    );
  });
});
