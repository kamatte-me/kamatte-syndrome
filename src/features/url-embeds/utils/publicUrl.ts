const blockedIpv4Ranges = [
  /^0\./,
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^192\.168\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
];

export function normalizePublicHttpUrl(value: string) {
  const url = new URL(value.trim());

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http and https URLs are supported.');
  }

  if (url.username || url.password) {
    throw new Error('URLs with credentials are not supported.');
  }

  if (isBlockedHostname(url.hostname)) {
    throw new Error('This URL host is not allowed.');
  }

  url.hash = '';
  return url.href;
}

function isBlockedHostname(hostname: string) {
  const normalized = hostname.toLowerCase();

  if (
    normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    normalized.includes(':')
  ) {
    return true;
  }

  return blockedIpv4Ranges.some((pattern) => pattern.test(normalized));
}
