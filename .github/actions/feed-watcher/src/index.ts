import { resolve } from 'node:path';
import { parseAtomFeed } from './atom.ts';
import { isMainModule } from './entrypoint.ts';
import { findPendingItems } from './monitor.ts';
import {
  advanceLatestPublishedAt,
  createInitializedFeedState,
  readFeedState,
  writeFeedState,
} from './state.ts';
import { getBooleanInput, getInput, setOutput } from './workflow.ts';

async function main(): Promise<void> {
  const feedUrl = getInput('feed-url');
  const stateFile = resolve(getInput('state-file', '.feed-watcher/state.json'));
  const initialize = getBooleanInput('initialize');
  const response = await fetch(feedUrl, {
    headers: { Accept: 'application/atom+xml, application/xml;q=0.9' },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch ${feedUrl}: HTTP ${response.status}`);
  }

  const items = parseAtomFeed(await response.text());

  if (initialize) {
    await writeFeedState(stateFile, createInitializedFeedState(items));
    await setNewItemsOutput([]);
    return;
  }

  const state = await readStateOrExplainInitialization(stateFile);
  const pendingItems = findPendingItems(items, state);
  await writeFeedState(
    stateFile,
    advanceLatestPublishedAt(state, pendingItems),
  );
  await setNewItemsOutput(pendingItems);
}

export async function readStateOrExplainInitialization(stateFile: string) {
  try {
    return await readFeedState(stateFile);
  } catch (error) {
    if (isMissingFileError(error)) {
      throw new Error(
        'The feed watcher state is missing. Run this workflow manually with mode=initialize before publishing.',
      );
    }

    throw error;
  }
}

export async function setNewItemsOutput(
  items: readonly unknown[],
): Promise<void> {
  await setOutput('new-items', JSON.stringify(items));
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  );
}

if (isMainModule(import.meta.url)) {
  void main();
}
