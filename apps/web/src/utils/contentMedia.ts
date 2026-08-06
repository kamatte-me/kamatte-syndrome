import { manifest as contentMediaManifest } from 'virtual:react-optimized-responsive-image/collection?src=@@/kamatte-syndrome-content/media&base=/media&widths=original';

export function resolveContentMediaUrl(value: string): string;
export function resolveContentMediaUrl(value: undefined): undefined;
export function resolveContentMediaUrl(
  value: string | undefined,
): string | undefined;
export function resolveContentMediaUrl(value: string | undefined) {
  return value ? (contentMediaManifest[value]?.src ?? value) : value;
}
