import type { AstroIntegration } from "@swup/astro";
import type Artalk from "artalk";

declare global {
	interface Window {
		// type from '@swup/astro' is incorrect
		swup: AstroIntegration;
		pagefind: {
			search: (query: string) => Promise<{
				results: Array<{
					data: () => Promise<SearchResult>;
				}>;
			}>;
		};
		artalkComments?: {
			instance: Artalk | null;
			observer: IntersectionObserver | null;
			themeObserver: MutationObserver | null;
			target: HTMLElement | null;
			hooksRegistered: boolean;
			init: () => void;
			destroy: () => void;
			syncTheme: () => void;
		};
	}
}

interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: Array<{
		element: string;
		id: string;
		text: string;
		location: number;
	}>;
	weighted_locations?: Array<{
		weight: number;
		balanced_score: number;
		location: number;
	}>;
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: SearchResult[];
}
