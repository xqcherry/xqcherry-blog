import type { CollectionEntry } from "astro:content";

export type DynamicEntry = CollectionEntry<"dynamic">;

export function sortDynamics(entries: DynamicEntry[]): DynamicEntry[] {
	return [...entries].sort((a, b) => {
		if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
		return b.data.published.getTime() - a.data.published.getTime();
	});
}

export function dynamicAnchor(id: string): string {
	return `dynamic-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function dynamicPlainText(entry: DynamicEntry): string {
	return (entry.body || "")
		.replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/<[^>]+>/g, " ")
		.replace(/[#>*_`~[\]()-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function dynamicSearchText(entry: DynamicEntry): string {
	return [dynamicPlainText(entry), entry.data.location]
		.filter(Boolean)
		.join(" ")
		.toLocaleLowerCase();
}
