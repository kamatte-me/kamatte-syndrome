import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMDX } from '@content-collections/mdx';
import { z } from 'zod';

const contentDirectory = 'kamatte-syndrome-content/content';

const posts = defineCollection({
  name: 'posts',
  directory: `${contentDirectory}/posts`,
  include: '**/*.md',
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
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    return {
      ...document,
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

const portfolio = defineCollection({
  name: 'portfolio',
  directory: contentDirectory,
  include: 'portfolio.json',
  parser: 'json',
  schema: z.object({
    portfolio: z.array(
      z.object({
        year: z.number(),
        name: z.string(),
        link: z.string().optional(),
        image: z.string().optional(),
        category: z.string(),
        description: z.string(),
        technologies: z.array(z.string()),
      }),
    ),
    revisedAt: z.string().transform((str) => new Date(str)),
  }),
});

const cultures = defineCollection({
  name: 'cultures',
  directory: contentDirectory,
  include: 'cultures.json',
  parser: 'json',
  schema: z.object({
    cultures: z.array(
      z.object({
        name: z.string(),
        youtubeVideoId: z.string(),
        description: z.string(),
      }),
    ),
    revisedAt: z.string().transform((str) => new Date(str)),
  }),
});

export default defineConfig({
  content: [posts, biography, skills, portfolio, cultures],
});
