import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'zod'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tags: z.array(z.string()).optional(),
    description: z.string().optional(),
    heroImage: z.string().optional(),
    datetime: z.string().optional(),
    instagram: z.boolean().optional(),
    instagramCaption: z.string().optional(),
    instagramStatus: z.enum(['draft', 'queued', 'posted', 'failed']).optional(),
    instagramAlt: z.string().optional(),
  }),
})

export const collections = { blog }
