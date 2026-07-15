export function assertKnownQueryParameters(
  parameters: URLSearchParams,
  knownParameters: readonly string[],
  moduleId: string,
) {
  const knownParameterSet = new Set(knownParameters);

  for (const parameter of parameters.keys()) {
    if (!knownParameterSet.has(parameter)) {
      throw new Error(
        `${moduleId} does not support the ${parameter} query parameter`,
      );
    }
  }
}

export function getSingleQueryParameter(
  parameters: URLSearchParams,
  name: string,
  moduleId: string,
) {
  const values = parameters.getAll(name);
  if (values.length > 1) {
    throw new Error(`${moduleId} requires exactly one ${name} query parameter`);
  }
  return values[0] || null;
}
