import { pathToFileURL } from 'node:url';
import { type MdxCompileOptions, mdxToJs } from 'satteri';
import type { Plugin } from 'vite';

const markdownFilePattern = /\.(?:md|mdx)(?:\?.*)?$/;

export type SatteriMdxOptions = Omit<
  MdxCompileOptions,
  'data' | 'development' | 'fileURL'
>;

type CompileSatteriMdxOptions = SatteriMdxOptions & {
  development?: boolean;
};

export async function compileSatteriMdx(
  source: string,
  id: string,
  { development = false, ...options }: CompileSatteriMdxOptions = {},
) {
  const filePath = id.replace(/\?.*$/, '');
  const result = await mdxToJs(source, {
    ...options,
    fileURL: pathToFileURL(filePath),
    development,
  });

  return result.code;
}

export function satteriMdx(options: SatteriMdxOptions = {}): Plugin {
  let development = false;

  return {
    name: 'satteri-mdx',
    enforce: 'pre',
    configResolved(config) {
      development = config.command === 'serve';
    },
    async transform(source, id) {
      if (!markdownFilePattern.test(id)) {
        return null;
      }

      return {
        code: await compileSatteriMdx(source, id, {
          ...options,
          development,
        }),
        map: null,
      };
    },
  };
}
