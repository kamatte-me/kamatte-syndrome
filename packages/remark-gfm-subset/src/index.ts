import {
  type ToMarkdownOptions as GfmFootnoteToMarkdownOptions,
  gfmFootnoteFromMarkdown,
  gfmFootnoteToMarkdown,
} from 'mdast-util-gfm-footnote';
import {
  gfmStrikethroughFromMarkdown,
  gfmStrikethroughToMarkdown,
} from 'mdast-util-gfm-strikethrough';
import {
  type Options as GfmTableToMarkdownOptions,
  gfmTableFromMarkdown,
  gfmTableToMarkdown,
} from 'mdast-util-gfm-table';
import { gfmFootnote } from 'micromark-extension-gfm-footnote';
import {
  type Options as GfmStrikethroughOptions,
  gfmStrikethrough,
} from 'micromark-extension-gfm-strikethrough';
import { gfmTable } from 'micromark-extension-gfm-table';
import type { Processor } from 'unified';

export type RemarkGfmSubsetOptions = GfmFootnoteToMarkdownOptions &
  GfmTableToMarkdownOptions & {
    /**
     * Whether a single tilde pair parses as strikethrough.
     *
     * Defaults to `false`, so only `~~text~~` is strikethrough.
     */
    singleTilde?: GfmStrikethroughOptions['singleTilde'];
  };

type MarkdownExtensionData = {
  micromarkExtensions?: unknown[];
  fromMarkdownExtensions?: unknown[];
  toMarkdownExtensions?: unknown[];
};

function getExtensionList(
  data: MarkdownExtensionData,
  key: keyof MarkdownExtensionData,
): unknown[] {
  const existingList = data[key];

  if (existingList) {
    return existingList;
  }

  const nextList: unknown[] = [];
  data[key] = nextList;

  return nextList;
}

export function remarkGfmSubset(
  this: Processor,
  options: RemarkGfmSubsetOptions = {},
): undefined {
  const data = this.data() as MarkdownExtensionData;

  const micromarkExtensions = getExtensionList(data, 'micromarkExtensions');
  const fromMarkdownExtensions = getExtensionList(
    data,
    'fromMarkdownExtensions',
  );
  const toMarkdownExtensions = getExtensionList(data, 'toMarkdownExtensions');

  micromarkExtensions.push(
    gfmFootnote(),
    gfmStrikethrough({ singleTilde: options.singleTilde ?? false }),
    gfmTable(),
  );
  fromMarkdownExtensions.push(
    gfmFootnoteFromMarkdown(),
    gfmStrikethroughFromMarkdown(),
    gfmTableFromMarkdown(),
  );
  toMarkdownExtensions.push(
    gfmFootnoteToMarkdown({
      firstLineBlank: options.firstLineBlank,
    }),
    gfmStrikethroughToMarkdown(),
    gfmTableToMarkdown({
      stringLength: options.stringLength,
      tableCellPadding: options.tableCellPadding,
      tablePipeAlign: options.tablePipeAlign,
    }),
  );
}
