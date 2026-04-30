import providers from 'oembed-providers/providers.json' with { type: 'json' };

type OEmbedProviderEndpoint = {
  schemes?: string[];
  url: string;
  discovery?: boolean;
  formats?: string[];
};

type OEmbedProvider = {
  provider_name: string;
  provider_url: string;
  endpoints?: OEmbedProviderEndpoint[];
};

export type OEmbedEndpointMatch = {
  providerName: string;
  providerUrl: string;
  endpointUrl: string;
};

type EndpointMatcher = OEmbedEndpointMatch & {
  literalHostname?: string;
  schemePattern: RegExp;
};

type OrderedEndpointMatcher = EndpointMatcher & {
  order: number;
};

type OEmbedEndpointIndex = {
  candidatesByHost: Map<string, OrderedEndpointMatcher[]>;
  fallbackCandidates: OrderedEndpointMatcher[];
};

const oEmbedProviders: OEmbedProvider[] = providers;

const compiledEndpoints = oEmbedProviders
  .flatMap((provider) =>
    (provider.endpoints ?? []).flatMap((endpoint) =>
      createEndpointMatchers(provider, endpoint),
    ),
  )
  .map((endpoint, order) => ({ ...endpoint, order }));

const endpointIndex = createEndpointIndex(compiledEndpoints);

export function resolveOEmbedEndpoint(
  url: string,
): OEmbedEndpointMatch | undefined {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return undefined;
  }

  const match = findEndpointMatch(parsedUrl);

  if (!match) {
    return undefined;
  }

  return {
    providerName: match.providerName,
    providerUrl: match.providerUrl,
    endpointUrl: match.endpointUrl,
  };
}

function createEndpointMatchers(
  provider: OEmbedProvider,
  endpoint: OEmbedProviderEndpoint,
): EndpointMatcher[] {
  if (endpoint.formats && !endpoint.formats.includes('json')) {
    return [];
  }

  return (endpoint.schemes ?? [])
    .filter(
      (scheme) => scheme.startsWith('http://') || scheme.startsWith('https://'),
    )
    .map((scheme) => ({
      providerName: provider.provider_name,
      providerUrl: provider.provider_url,
      endpointUrl: endpoint.url,
      literalHostname: getLiteralHostname(scheme),
      schemePattern: createSchemePattern(scheme),
    }));
}

function createEndpointIndex(
  endpoints: OrderedEndpointMatcher[],
): OEmbedEndpointIndex {
  const candidatesByHost = new Map<string, OrderedEndpointMatcher[]>();
  const fallbackCandidates: OrderedEndpointMatcher[] = [];

  for (const endpoint of endpoints) {
    if (!endpoint.literalHostname) {
      fallbackCandidates.push(endpoint);
      continue;
    }

    const hostCandidates = candidatesByHost.get(endpoint.literalHostname);
    if (hostCandidates) {
      hostCandidates.push(endpoint);
    } else {
      candidatesByHost.set(endpoint.literalHostname, [endpoint]);
    }
  }

  // Wildcard-host schemes can match any literal host, so preserve registry order
  // by merging them into each host-specific candidate list up front.
  for (const [hostname, hostCandidates] of candidatesByHost) {
    candidatesByHost.set(
      hostname,
      mergeCandidates(hostCandidates, fallbackCandidates),
    );
  }

  return {
    candidatesByHost,
    fallbackCandidates,
  };
}

function findEndpointMatch(parsedUrl: URL) {
  const candidates =
    endpointIndex.candidatesByHost.get(parsedUrl.hostname.toLowerCase()) ??
    endpointIndex.fallbackCandidates;

  return candidates.find(({ schemePattern }) =>
    schemePattern.test(parsedUrl.href),
  );
}

function mergeCandidates(
  hostCandidates: OrderedEndpointMatcher[],
  fallbackCandidates: OrderedEndpointMatcher[],
) {
  return [...hostCandidates, ...fallbackCandidates].sort(
    (a, b) => a.order - b.order,
  );
}

function getLiteralHostname(scheme: string) {
  try {
    const hostname = new URL(scheme).hostname.toLowerCase();
    return hostname.includes('*') ? undefined : hostname;
  } catch {
    return undefined;
  }
}

function createSchemePattern(scheme: string) {
  const escapedParts = scheme.split('*').map(escapeRegExp);
  return new RegExp(`^${escapedParts.join('.*')}$`, 'i');
}

function escapeRegExp(value: string) {
  return value.replace(/[\\^$+?.()|[\]{}]/g, '\\$&');
}
