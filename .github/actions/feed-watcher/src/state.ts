import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import {
  type FeedItem,
  type FeedState,
  getPublishedAtTimestamp,
} from './model.ts';

export function createFeedState(
  latestPublishedAt: string | null = null,
): FeedState {
  return {
    latestPublishedAt:
      latestPublishedAt === null
        ? null
        : new Date(Date.parse(latestPublishedAt)).toISOString(),
    version: 1,
  };
}

export function createInitializedFeedState(
  items: readonly FeedItem[],
): FeedState {
  return createFeedState(findLatestPublishedAt(items));
}

export function advanceLatestPublishedAt(
  state: FeedState,
  items: readonly FeedItem[],
): FeedState {
  return createFeedState(findLatestPublishedAt(items, state.latestPublishedAt));
}

export async function readFeedState(filePath: string): Promise<FeedState> {
  const source = await readFile(filePath, 'utf8');
  return parseFeedState(JSON.parse(source) as unknown);
}

export async function writeJsonFile(
  filePath: string,
  value: unknown,
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });

  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporaryPath, filePath);
}

export async function writeFeedState(
  filePath: string,
  state: FeedState,
): Promise<void> {
  await writeJsonFile(filePath, state);
}

function parseFeedState(value: unknown): FeedState {
  const record = asRecord(value);

  if (
    record?.version !== 1 ||
    (record.latestPublishedAt !== null &&
      typeof record.latestPublishedAt !== 'string')
  ) {
    throw new Error('The RSS read state file is invalid.');
  }

  return createFeedState(record.latestPublishedAt);
}

function findLatestPublishedAt(
  items: readonly FeedItem[],
  currentLatestPublishedAt: string | null = null,
): string | null {
  let latestTimestamp =
    currentLatestPublishedAt === null
      ? Number.NEGATIVE_INFINITY
      : Date.parse(currentLatestPublishedAt);
  let latestPublishedAt = currentLatestPublishedAt;

  for (const item of items) {
    const timestamp = getPublishedAtTimestamp(item);

    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
      latestPublishedAt = new Date(timestamp).toISOString();
    }
  }

  return latestPublishedAt;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}
