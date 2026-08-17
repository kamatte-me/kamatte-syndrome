import { describe, expect, it } from 'vitest';
import { getInput } from './workflow.ts';

describe('getInput', () => {
  it('reads a hyphenated GitHub Actions input', () => {
    const key = 'INPUT_FEED-URL';
    const original = process.env[key];
    process.env[key] = 'https://kamatte.me/feed.xml';

    try {
      expect(getInput('feed-url')).toBe('https://kamatte.me/feed.xml');
    } finally {
      if (original === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original;
      }
    }
  });
});
