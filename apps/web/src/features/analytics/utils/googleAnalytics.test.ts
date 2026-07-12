import { describe, expect, it } from 'vitest';
import { createGoogleAnalyticsScripts } from './googleAnalytics';

describe('createGoogleAnalyticsScripts', () => {
  it('creates an async Google tag and initialization script', () => {
    const scripts = createGoogleAnalyticsScripts('G-TEST123');

    expect(scripts).toHaveLength(2);
    expect(scripts[0]).toEqual({
      async: true,
      src: 'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
    });
    expect(scripts[1]?.children).toContain('gtag(\'config\', "G-TEST123");');
  });

  it.each([
    undefined,
    '',
    'invalid-id',
    'G-TEST<script>',
  ])('omits scripts for an invalid measurement ID: %s', (measurementId) => {
    expect(createGoogleAnalyticsScripts(measurementId)).toEqual([]);
  });
});
