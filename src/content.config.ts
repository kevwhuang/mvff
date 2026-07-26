import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const gallery = defineCollection({
    loader: glob({ base: './src/content/gallery', pattern: '**/*.json' }),
    schema: z.object({
        alt: z.string(),
        label: z.string(),
    }),
});

export const collections = { gallery };
