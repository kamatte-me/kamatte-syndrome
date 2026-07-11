import type { Thing, WithContext } from 'schema-dts';

export function createJsonLdScript(data: WithContext<Thing>) {
  return {
    type: 'application/ld+json',
    children: JSON.stringify(data)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(/'/g, '\\u0027'),
  };
}
