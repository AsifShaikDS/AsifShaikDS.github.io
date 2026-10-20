import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Adding a case study is one file: drop a .md into src/content/work/.
 * The filename becomes the URL slug (permit-workflow.md -> /work/permit-workflow).
 * Only `title`, `summary`, `role`, `period`, `access` and `stack` are required.
 *
 * Rules that are not negotiable, encoded here so they are hard to forget:
 *  - Never name a client. Use "a U.S. state department of transportation".
 *  - Never name an internal system, repo or product.
 *  - Every number on the page has to be one you can defend out loud.
 */
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    /** One sentence. Shows on the home page card and in the page <meta description>. */
    summary: z.string(),
    role: z.string(),
    period: z.string(),
    /** Honest badge on the card. Keep it short. */
    access: z.enum([
      'Client work · code confidential',
      'Internal product · code confidential',
      'Internal R&D · code confidential',
      'Open source · code + demo',
    ]),
    stack: z.array(z.string()).default([]),
    /** The one-line confidentiality note rendered above the body. Say it once. */
    note: z.string().optional(),
    /** Featured case studies appear on the home page, in `order`. */
    featured: z.boolean().default(false),
    order: z.number().default(99),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work };
