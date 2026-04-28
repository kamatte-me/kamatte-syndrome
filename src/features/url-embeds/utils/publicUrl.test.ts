import { describe, expect, it } from 'vitest';
import { normalizePublicHttpUrl } from './publicUrl';

describe('normalizePublicHttpUrl', () => {
  it('accepts public http and https URLs and removes hashes', () => {
    expect(normalizePublicHttpUrl('https://example.com/post#section')).toBe(
      'https://example.com/post',
    );
  });

  it('rejects unsupported, credentialed, and local URLs', () => {
    expect(() => normalizePublicHttpUrl('ftp://example.com')).toThrow();
    expect(() => normalizePublicHttpUrl('https://user@example.com')).toThrow();
    expect(() => normalizePublicHttpUrl('http://localhost:3000')).toThrow();
    expect(() => normalizePublicHttpUrl('http://192.168.0.1')).toThrow();
  });
});
