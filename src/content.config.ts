import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const products = defineCollection({
	loader: glob({ pattern: ['*.md', '!_*'], base: 'src/content/products' }),
	// type: 'content',
	// Type-check frontmatter using a schema
	 schema: ({ image })  => z.object({
		rendered: z.boolean().optional(),
		_rendered: z.boolean().optional(),
	 	title: z.string(),
	 	handle: z.string(),
		status: z.string(),
		product_type: z.string(),
		dimensions: z.string().optional(),
		dimensions_array: z.array(
			z.string(),
		).optional(),
		materials: z.string().optional(),
		materials_array: z.array(
			z.string(),
		).optional(),
		provenance: z.string().optional(),
		images: z.array(z.object({
			src: image(),
			thumb: image(),
			monored: image().optional(),
			alt: z.string(),
		  })).optional(),
	 }),
});

const pages = defineCollection({
	loader: glob({ pattern: ['*.md', '!_*'], base: 'src/content/pages' }),
	// type: 'content',
	// Type-check frontmatter using a schema
	 schema: ({ image })  => z.object({
		rendered: z.boolean().optional(),
		body_html: z.string().nullish(),
	 	title: z.string(),
	 	handle: z.string(),
	 }),
});
const intermissions = defineCollection({
	loader: glob({ pattern: ['*.md', '!_*'], base: 'src/content/intermissions' }),
	// type: 'content',
	// Type-check frontmatter using a schema
	 schema: ({ image })  => z.object({
		image: image().optional(),
	 	title: z.string(),
		draft: z.boolean().optional(),
	 	product: z.string(),
	 }),
});


export const collections = {products, pages, intermissions };
