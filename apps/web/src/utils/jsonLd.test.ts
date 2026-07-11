import { describe, expect, it } from 'vitest';
import { createJsonLdScript } from './jsonLd';

describe('createJsonLdScript', () => {
  it('escapes characters that could break out of the JSON-LD script', () => {
    const name = "</script><script>alert('test') & more</script>";
    const script = createJsonLdScript({
      '@context': 'https://schema.org',
      '@type': 'Thing',
      name,
    });

    expect(script.type).toBe('application/ld+json');
    expect(script.children).not.toMatch(/[<>&']/);
    expect(JSON.parse(script.children)).toMatchObject({ name });
  });
});
