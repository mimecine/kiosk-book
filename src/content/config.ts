import { defineCollection, z } from 'astro:content';

const products = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	 schema: ({ image })  => z.object({
		rendered: z.boolean().optional(),
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
	type: 'content',
	// Type-check frontmatter using a schema
	 schema: ({ image })  => z.object({
		rendered: z.boolean().optional(),
		body_html: z.string().optional(),
	 	title: z.string(),
	 	handle: z.string(),
	 }),
});


export const collections = {products };
