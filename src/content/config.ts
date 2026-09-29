import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		series: z.string().optional().default(""),
		seriesOrder: z.number().optional(),
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	schema: z.object({}),
});

const dynamicCollection = defineCollection({
	schema: z.object({
		published: z.date(),
		pinned: z.boolean().optional().default(false),
		location: z.string().optional().default(""),
		gallery: z.array(z.object({
			src: z.string(),
			alt: z.string().optional().default(""),
		})).optional().default([]),
	}),
});

// Adapted from Firefly's project content model (MIT License).
const projectsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		order: z.number().optional(),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		link: z.array(z.object({
			label: z.string(),
			icon: z.string().optional().default(""),
			value: z.string(),
		})).optional().default([]),
		status: z.string().optional().default(""),
		lang: z.string().optional().default(""),
	}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
	dynamic: dynamicCollection,
	projects: projectsCollection,
};
