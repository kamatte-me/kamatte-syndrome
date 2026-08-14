import { describe, expect, it } from 'vitest';
import {
  assertKnownQueryParameters,
  getSingleQueryParameter,
} from './queryParameters.ts';

describe('virtual module query parameter helpers', () => {
  it('accepts only declared query parameter names', () => {
    expect(() =>
      assertKnownQueryParameters(
        new URLSearchParams('src=./image.jpg&widths=320'),
        ['src', 'widths'],
        'virtual:image',
      ),
    ).not.toThrow();
    expect(() =>
      assertKnownQueryParameters(
        new URLSearchParams('src=./image.jpg&quality=90'),
        ['src'],
        'virtual:image',
      ),
    ).toThrow('virtual:image does not support the quality query parameter');
  });

  it('reads absent and single values while rejecting duplicate values', () => {
    expect(
      getSingleQueryParameter(new URLSearchParams(), 'src', 'virtual:image'),
    ).toBeNull();
    expect(
      getSingleQueryParameter(
        new URLSearchParams('src=./image.jpg'),
        'src',
        'virtual:image',
      ),
    ).toBe('./image.jpg');
    expect(() =>
      getSingleQueryParameter(
        new URLSearchParams('src=one&src=two'),
        'src',
        'virtual:image',
      ),
    ).toThrow('virtual:image requires exactly one src query parameter');
  });
});
