import { manifest as contentMediaManifest } from 'virtual:optimized-social-image/collection?src=@@/kamatte-syndrome-content/media&base=/media&width=1200';

export function resolveContentMediaUrl(value: string): string;
export function resolveContentMediaUrl(value: undefined): undefined;
export function resolveContentMediaUrl(
  value: string | undefined,
): string | undefined;
export function resolveContentMediaUrl(value: string | undefined) {
  return value ? (contentMediaManifest[value]?.src ?? value) : value;
}
