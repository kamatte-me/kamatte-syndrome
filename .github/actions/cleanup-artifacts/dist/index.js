//#region ../../../packages/github-actions-artifacts/src/index.ts
function selectArtifactsByPrefix(artifacts, prefix) {
	return [...artifacts].filter((artifact) => !artifact.expired && artifact.name.startsWith(prefix)).sort((left, right) => right.created_at.localeCompare(left.created_at));
}
async function listRepositoryArtifacts(fetchFn, options) {
	const artifacts = [];
	const perPage = 100;
	let page = 1;
	let totalCount = Number.POSITIVE_INFINITY;
	while (artifacts.length < totalCount) {
		const response = await fetchFn(`${options.apiUrl}/repos/${options.repository}/actions/artifacts?per_page=${perPage}&page=${page}`, { headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${options.token}`,
			"X-GitHub-Api-Version": "2026-03-10"
		} });
		if (!response.ok) throw new Error(`Unable to list workflow artifacts: HTTP ${response.status}`);
		const body = await response.json();
		artifacts.push(...body.artifacts);
		totalCount = body.total_count;
		if (body.artifacts.length === 0) break;
		page += 1;
	}
	return artifacts;
}
async function deleteArtifact(fetchFn, options) {
	const response = await fetchFn(`${options.apiUrl}/repos/${options.repository}/actions/artifacts/${options.artifactId}`, {
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${options.token}`,
			"X-GitHub-Api-Version": "2026-03-10"
		},
		method: "DELETE"
	});
	if (!response.ok) throw new Error(`Unable to delete workflow artifact: HTTP ${response.status}`);
}

//#endregion
//#region src/index.ts
async function cleanupArtifacts(fetchFn, options) {
	const artifacts = await listRepositoryArtifacts(fetchFn, options);
	const supersededArtifacts = selectArtifactsByPrefix(artifacts, options.prefix).slice(options.keep);
	await Promise.all(supersededArtifacts.map((artifact) => deleteArtifact(fetchFn, {
		apiUrl: options.apiUrl,
		artifactId: artifact.id,
		repository: options.repository,
		token: options.token
	})));
}
async function main() {
	const keep = Number.parseInt(getInput("keep", "1"), 10);
	if (!Number.isInteger(keep) || keep < 1) throw new Error("Input keep must be a positive integer.");
	await cleanupArtifacts(fetch, {
		apiUrl: process.env.GITHUB_API_URL ?? "https://api.github.com",
		keep,
		prefix: getInput("artifact-prefix"),
		repository: getInput("repository"),
		token: getInput("github-token")
	});
}
function getInput(name, defaultValue) {
	const value = process.env[`INPUT_${name.toUpperCase().replaceAll(" ", "_")}`];
	if (value === void 0 || value.trim() === "") {
		if (defaultValue !== void 0) return defaultValue;
		throw new Error(`Missing required input: ${name}`);
	}
	return value.trim();
}
if (import.meta.url === `file://${process.argv[1]}`) main();

//#endregion
export { cleanupArtifacts, getInput };
//# sourceMappingURL=index.js.map