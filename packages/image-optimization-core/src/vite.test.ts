import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createViteAssetUrl,
  normalizeSourcePath,
  normalizeViteBasePath,
} from './vite.ts';

describe('Vite path helpers', () => {
  it('creates Rollup asset placeholders', () => {
    expect(createViteAssetUrl('asset-123')).toBe('__VITE_ASSET__asset-123__');
  });

  it('normalizes source paths to Vite separators', () => {
    expect(
      normalizeSourcePath(path.join('images', 'nested', 'photo.jpg')),
    ).toBe('images/nested/photo.jpg');
  });

  it.each([
    { base: '', expected: './' },
    { base: './', expected: './' },
    { base: 'assets', expected: '/assets/' },
    { base: '/assets//', expected: '/assets/' },
    { base: '/', expected: '/' },
    {
      base: 'https://cdn.example/assets//',
      expected: 'https://cdn.example/assets/',
    },
  ])('normalizes Vite base $base', ({ base, expected }) => {
    expect(normalizeViteBasePath(base)).toBe(expected);
  });
});
