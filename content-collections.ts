import { defineCollection, defineConfig } from '@content-collections/core';
import { z } from 'zod';

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.md',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    content: z.string(),
    draft: z.boolean().optional(),
  }),
  transform: (doc, { skip }) => {
    if (doc.draft) {
      return skip('document is a draft');
    }
    return doc;
  },
});

export default defineConfig({
  content: [posts],
});
