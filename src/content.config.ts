import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: docsSchema({
    extend: z.object({
      // Campo de negocio: módulo al que pertenece el endpoint.
      module: z.string().optional(),
    }),
  }),
});

export const collections = { docs };
