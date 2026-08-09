import { normalizePath } from 'vite';

export function createViteAssetUrl(referenceId: string) {
  return `__VITE_ASSET__${referenceId}__`;
}

export function normalizeSourcePath(sourcePath: string) {
  return normalizePath(sourcePath);
}

export function normalizeViteBasePath(base: string) {
  if (base === '' || base === './') {
    return './';
  }
  if (isAbsoluteUrl(base)) {
    return `${base.replace(/\/+$/, '')}/`;
  }
  const normalizedBase = `/${base.replace(/^\/+|\/+$/g, '')}`;
  return normalizedBase === '/' ? '/' : `${normalizedBase}/`;
}

function isAbsoluteUrl(value: string) {
  return /^[a-z][a-z\d+.-]*:\/\//i.test(value);
}
