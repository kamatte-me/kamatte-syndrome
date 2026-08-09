import { spawnSync } from 'node:child_process';
import { access, lstat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const contentRepository =
  'https://github.com/kamatte-me/kamatte-syndrome-content.git';
const appDirectory = fileURLToPath(new URL('../', import.meta.url));
const contentDirectory = fileURLToPath(
  new URL('../kamatte-syndrome-content/', import.meta.url),
);
const token = process.env.CONTENT_REPOSITORY_TOKEN;

if (!token) {
  throw new Error(
    'CONTENT_REPOSITORY_TOKEN is required to fetch kamatte-syndrome-content.',
  );
}

try {
  await lstat(contentDirectory);
  throw new Error(
    `${contentDirectory} already exists. Refusing to replace the local content checkout.`,
  );
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
    throw error;
  }

  // The Vercel and CI checkouts do not contain this gitignored directory.
}

const authorization = `AUTHORIZATION: Basic ${Buffer.from(
  `x-access-token:${token}`,
).toString('base64')}`;

function runGit(args) {
  const result = spawnSync('git', args, {
    cwd: appDirectory,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader',
      GIT_CONFIG_VALUE_0: authorization,
      GIT_TERMINAL_PROMPT: '0',
    },
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${args[0]} failed.`);
  }

  return result.stdout.trim();
}

runGit([
  'clone',
  '--branch',
  'main',
  '--depth',
  '1',
  '--single-branch',
  contentRepository,
  contentDirectory,
]);

await Promise.all([
  access(resolve(contentDirectory, 'content')),
  access(resolve(contentDirectory, 'media')),
]);

const contentCommit = runGit(['-C', contentDirectory, 'rev-parse', 'HEAD']);
console.log(`Fetched kamatte-syndrome-content at ${contentCommit}.`);
