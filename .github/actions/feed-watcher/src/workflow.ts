import { randomUUID } from 'node:crypto';
import { appendFile } from 'node:fs/promises';

export function getInput(name: string, defaultValue?: string): string {
  const value = process.env[`INPUT_${name.toUpperCase().replaceAll(' ', '_')}`];

  if (value === undefined || value.trim() === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`Missing required input: ${name}`);
  }

  return value.trim();
}

export function getBooleanInput(name: string, defaultValue = false): boolean {
  const raw = getInput(name, String(defaultValue)).toLowerCase();

  if (raw === 'true') {
    return true;
  }

  if (raw === 'false') {
    return false;
  }

  throw new Error(`Input ${name} must be true or false.`);
}

export async function setOutput(name: string, value: string): Promise<void> {
  const outputPath = process.env.GITHUB_OUTPUT;

  if (!outputPath) {
    return;
  }

  const delimiter = `feed-watcher-${randomUUID()}`;
  await appendFile(
    outputPath,
    `${name}<<${delimiter}\n${value}\n${delimiter}\n`,
  );
}
