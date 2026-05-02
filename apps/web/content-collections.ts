import {
  createDefaultImport,
  defineCollection,
  defineConfig,
} from '@content-collections/core';
import type { MDXContent } from 'mdx/types';
import { z } from 'zod';

const contentDirectory = 'kamatte-syndrome-content/content';

const posts = defineCollection({
  name: 'posts',
  directory: `${contentDirectory}/posts`,
  include: ['**/*.md', '**/*.mdx'],
  schema: z.object({
    title: z.string(),
    publishedAt: z
      .string()
      .optional()
      .transform((str) => (str ? new Date(str) : undefined)),
    revisedAt: z
      .string()
      .optional()
      .transform((str) => (str ? new Date(str) : undefined)),
    featuredImage: z.string().optional(),
    content: z.string(),
  }),
  transform: async ({ _meta, ...post }) => {
    const mdx = createDefaultImport<MDXContent>(
      `@@/${contentDirectory}/posts/${_meta.filePath}`,
    );
    return {
      ...post,
      slug: _meta.path,
      mdx,
    };
  },
});

const biography = defineCollection({
  name: 'biography',
  directory: contentDirectory,
  include: 'biography.json',
  parser: 'json',
  schema: z.object({
    history: z.array(
      z.object({
        year: z.number(),
        description: z.string(),
      }),
    ),
    revisedAt: z.string().transform((str) => new Date(str)),
  }),
});

const skills = defineCollection({
  name: 'skills',
  directory: contentDirectory,
  include: 'skills.json',
  parser: 'json',
  schema: z.object({
    skills: z.array(
      z.object({
        name: z.string(),
        level: z.number(),
      }),
    ),
    revisedAt: z.string().transform((str) => new Date(str)),
  }),
});

const terms = defineCollection({
  name: 'terms',
  directory: contentDirectory,
  include: 'terms.md',
  schema: z.object({
    revisedAt: z.string().transform((str) => new Date(str)),
    content: z.string(),
  }),
  transform: async ({ _meta, ...terms }) => {
    const mdx = createDefaultImport<MDXContent>(
      `@@/${contentDirectory}/${_meta.filePath}`,
    );
    return {
      ...terms,
      slug: _meta.path,
      mdx,
    };
  },
});

const privacyPolicy = defineCollection({
  name: 'privacyPolicy',
  directory: contentDirectory,
  include: 'privacy_policy.md',
  schema: z.object({
    revisedAt: z.string().transform((str) => new Date(str)),
    content: z.string(),
  }),
  transform: async ({ _meta, ...privacyPolicy }) => {
    const mdx = createDefaultImport<MDXContent>(
      `@@/${contentDirectory}/${_meta.filePath}`,
    );
    return {
      ...privacyPolicy,
      slug: _meta.path,
      mdx,
    };
  },
});

const portfolio = defineCollection({
  name: 'portfolio',
  directory: `${contentDirectory}/portfolio`,
  include: ['**/*.md', '**/*.mdx'],
  schema: z.object({
    order: z.number(),
    year: z.number(),
    name: z.string(),
    link: z.string().optional(),
    image: z.string().optional(),
    category: z.string(),
    technologies: z.array(z.string()),
    revisedAt: z.string().transform((str) => new Date(str)),
    content: z.string(),
  }),
  transform: async ({ _meta, ...portfolioItem }) => {
    const mdx = createDefaultImport<MDXContent>(
      `@@/${contentDirectory}/portfolio/${_meta.filePath}`,
    );
    return {
      ...portfolioItem,
      slug: _meta.path,
      mdx,
    };
  },
});

const culture = defineCollection({
  name: 'culture',
  directory: `${contentDirectory}/culture`,
  include: ['**/*.md', '**/*.mdx'],
  schema: z.object({
    order: z.number(),
    name: z.string(),
    youtubeVideoId: z.string(),
    revisedAt: z.string().transform((str) => new Date(str)),
    content: z.string(),
  }),
  transform: async ({ _meta, ...culture }) => {
    const mdx = createDefaultImport<MDXContent>(
      `@@/${contentDirectory}/culture/${_meta.filePath}`,
    );
    return {
      ...culture,
      slug: _meta.path,
      mdx,
    };
  },
});

export default defineConfig({
  content: [posts, biography, skills, terms, privacyPolicy, portfolio, culture],
});
