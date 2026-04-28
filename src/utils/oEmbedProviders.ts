import providers from 'oembed-providers/providers.json';

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

type CompiledOEmbedEndpoint = OEmbedEndpointMatch & {
  schemePattern: RegExp;
};

const oEmbedProviders: OEmbedProvider[] = providers;

const compiledEndpoints = oEmbedProviders.flatMap((provider) =>
  (provider.endpoints ?? []).flatMap((endpoint) =>
    createEndpointMatchers(provider, endpoint),
  ),
);

export function isOEmbedUrl(url: string) {
  return Boolean(resolveOEmbedEndpoint(url));
}

export function resolveOEmbedEndpoint(url: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return undefined;
  }

  const match = compiledEndpoints.find(({ schemePattern }) =>
    schemePattern.test(parsedUrl.href),
  );

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
): CompiledOEmbedEndpoint[] {
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
      schemePattern: createSchemePattern(scheme),
    }));
}

function createSchemePattern(scheme: string) {
  const escapedParts = scheme.split('*').map(escapeRegExp);
  return new RegExp(`^${escapedParts.join('.*')}$`, 'i');
}

function escapeRegExp(value: string) {
  return value.replace(/[\\^$+?.()|[\]{}]/g, '\\$&');
}
