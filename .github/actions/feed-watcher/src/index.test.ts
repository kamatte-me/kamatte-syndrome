import { randomUUID } from 'node:crypto';
import { readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  readStateOrExplainInitialization,
  setNewItemsOutput,
} from './index.ts';

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

  it('writes the new-items output without a duplicate boolean output', async () => {
    const outputFile = join(tmpdir(), `feed-watcher-output-${randomUUID()}`);
    const originalOutputPath = process.env.GITHUB_OUTPUT;
    process.env.GITHUB_OUTPUT = outputFile;

    try {
      await setNewItemsOutput([{ title: 'Example' }]);

      const output = await readFile(outputFile, 'utf8');
      expect(output).toContain('new-items<<');
      expect(output).toContain('[{"title":"Example"}]');
      expect(output).not.toContain('has-new-items');
    } finally {
      if (originalOutputPath === undefined) {
        delete process.env.GITHUB_OUTPUT;
      } else {
        process.env.GITHUB_OUTPUT = originalOutputPath;
      }

      await rm(outputFile, { force: true });
    }
  });
});
